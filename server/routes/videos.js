const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

const ALLOWED_VIDEO_TYPES = /mp4|mov|avi|mkv|webm/;
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, Date.now() + '-' + safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = ALLOWED_VIDEO_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mime = ALLOWED_VIDEO_TYPES.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('শুধু ভিডিও ফাইল (.mp4, .mov, .avi, .mkv, .webm) আপলোড করা যাবে'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

router.post('/upload', auth, upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'কোনো ফাইল আপলোড করা হয়নি' });

  const { title, description, platforms } = req.body;
  const platformsArray = platforms
    ? platforms.split(',').filter((p) => ['facebook', 'instagram', 'tiktok', 'youtube'].includes(p.trim()))
    : [];

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'ভিডিওয়ের শিরোনাম দরকার' });
  }

  try {
    const video = new Video({
      user: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      filePath: `/uploads/${req.file.filename}`,
      platforms: platformsArray,
      status: 'pending',
    });
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'ভিডিও সেভ করতে সমস্যা হচ্ছে' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, platform } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = { user: req.user.id };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }
    if (platform) {
      filter.platforms = platform;
    }

    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Video.countDocuments(filter);

    res.json({
      videos,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ message: 'ভিডিও লিস্ট লোড করতে সমস্যা হচ্ছে' });
  }
});

// Get single video
router.get('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, user: req.user.id });
    if (!video) return res.status(404).json({ message: 'ভিডিও পাওয়া যায়নি' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'ভিডিও লোড করতে সমস্যা হচ্ছে' });
  }
});

// Update video
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, platforms, scheduledAt } = req.body;
    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (description !== undefined) update.description = description.trim();
    if (platforms !== undefined) {
      const allowed = ['facebook', 'instagram', 'tiktok', 'youtube'];
      update.platforms = platforms.filter((p) => allowed.includes(p));
    }
    if (scheduledAt !== undefined) update.scheduledAt = new Date(scheduledAt);

    const video = await Video.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      update,
      { new: true }
    );
    if (!video) return res.status(404).json({ message: 'ভিডিও পাওয়া যায়নি' });

    // If scheduled, enqueue with delay
    if (scheduledAt && video.status === 'pending') {
      const { enqueuePost } = require('../worker/poster');
      const delay = new Date(scheduledAt).getTime() - Date.now();
      if (delay > 0) await enqueuePost(video._id, delay);
    }

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'ভিডিও আপডেট করতে সমস্যা হচ্ছে' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!video) return res.status(404).json({ message: 'ভিডিও পাওয়া যায়নি' });
    res.json({ message: 'ভিডিও ডিলিট করা হয়েছে' });
  } catch (err) {
    res.status(500).json({ message: 'ভিডিও ডিলিট করতে সমস্যা হচ্ছে' });
  }
});

// Re-post / retry a failed video
router.post('/:id/retry', auth, async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, user: req.user.id }).populate('user');
    if (!video) return res.status(404).json({ message: 'ভিডিও পাওয়া যায়নি' });

    video.status = 'pending';
    video.postedAt = null;
    await video.save();

    const { enqueuePost } = require('../worker/poster');
    await enqueuePost(video._id, 0);

    res.json({ message: 'পুনরায় পোস্ট করার জন্য কিউয়ে যোগ করা হয়েছে', video });
  } catch (err) {
    res.status(500).json({ message: 'রিট্রাই করতে সমস্যা হচ্ছে' });
  }
});

module.exports = router;
