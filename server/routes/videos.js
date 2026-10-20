const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const { Video, User } = require('../models');
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

// Stats summary endpoint
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const total = await Video.count({ where: { userId } });
    const posted = await Video.count({ where: { userId, status: 'posted' } });
    const pending = await Video.count({ where: { userId, status: 'pending' } });
    const failed = await Video.count({ where: { userId, status: 'failed' } });

    const videos = await Video.findAll({
      where: { userId, status: 'posted' },
      attributes: ['viewsCount', 'likesCount', 'sharesCount'],
    });

    const totalViews = videos.reduce((sum, v) => sum + (v.viewsCount || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.likesCount || 0), 0);
    const totalShares = videos.reduce((sum, v) => sum + (v.sharesCount || 0), 0);

    res.json({
      total,
      posted,
      pending,
      failed,
      totalViews,
      totalLikes,
      totalShares,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'স্ট্যাটস লোড করতে সমস্যা হচ্ছে' });
  }
});

router.post('/upload', auth, upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'কোনো ফাইল আপলোড করা হয়নি' });

  const { title, description, platforms, tags, aspectRatio, scheduledAt } = req.body;
  const platformsArray = platforms
    ? platforms.split(',').map((p) => p.trim()).filter((p) => ['facebook', 'instagram', 'tiktok', 'youtube'].includes(p))
    : [];

  let tagsArray = [];
  if (tags) {
    tagsArray = typeof tags === 'string'
      ? tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
      : tags;
  }

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'ভিডিওয়ের শিরোনাম দরকার' });
  }

  try {
    const isScheduledFuture = scheduledAt && new Date(scheduledAt).getTime() > Date.now();

    const video = await Video.create({
      userId: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      tags: tagsArray,
      aspectRatio: aspectRatio || '9:16',
      filePath: `/uploads/${req.file.filename}`,
      platforms: platformsArray,
      status: 'pending',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    });

    // Enqueue job for background posting
    if (platformsArray.length > 0) {
      try {
        const { enqueuePost } = require('../worker/poster');
        const delay = isScheduledFuture ? Math.max(0, new Date(scheduledAt).getTime() - Date.now()) : 0;
        await enqueuePost(video.id, delay);
      } catch (queueErr) {
        console.warn('Queue notification on upload:', queueErr.message);
      }
    }

    res.json(video);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'ভিডিও সেভ করতে সমস্যা হচ্ছে' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, platform } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const where = { userId: req.user.id };

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }
    if (platform) {
      where.platforms = { [Op.like]: `%"${platform}"%` };
    }

    const { rows: videos, count: total } = await Video.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: limitNum,
    });

    res.json({
      videos,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Get videos error:', err);
    res.status(500).json({ message: 'ভিডিও লিস্ট লোড করতে সমস্যা হচ্ছে' });
  }
});

// Single video
router.get('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    if (!video) return res.status(404).json({ message: 'ভিডিও পাওয়া যায়নি' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'ভিডিও লোড করতে সমস্যা হচ্ছে' });
  }
});

// Update video
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, platforms, tags, aspectRatio, scheduledAt } = req.body;
    const video = await Video.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!video) return res.status(404).json({ message: 'ভিডিও পাওয়া যায়নি' });

    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (description !== undefined) update.description = description.trim();
    if (tags !== undefined) {
      update.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    }
    if (aspectRatio !== undefined) update.aspectRatio = aspectRatio;
    if (platforms !== undefined) {
      const allowed = ['facebook', 'instagram', 'tiktok', 'youtube'];
      update.platforms = platforms.filter((p) => allowed.includes(p));
    }
    if (scheduledAt !== undefined) update.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    await video.update(update);

    if (scheduledAt && video.status === 'pending') {
      try {
        const { enqueuePost } = require('../worker/poster');
        const delay = new Date(scheduledAt).getTime() - Date.now();
        if (delay > 0) await enqueuePost(video.id, delay);
      } catch (queueErr) {
        console.warn('Queue notification on schedule:', queueErr.message);
      }
    }

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'ভিডিও আপডেট করতে সমস্যা হচ্ছে' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!video) return res.status(404).json({ message: 'ভিডিও পাওয়া যায়নি' });

    await video.destroy();
    res.json({ message: 'ভিডিও ডিলিট করা হয়েছে' });
  } catch (err) {
    res.status(500).json({ message: 'ভিডিও ডিলিট করতে সমস্যা হচ্ছে' });
  }
});

// Retry video
router.post('/:id/retry', auth, async (req, res) => {
  try {
    const video = await Video.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: User, as: 'user' }],
    });
    if (!video) return res.status(404).json({ message: 'ভিডিও পাওয়া যায়নি' });

    await video.update({
      status: 'pending',
      postedAt: null,
    });

    try {
      const { enqueuePost } = require('../worker/poster');
      await enqueuePost(video.id, 0);
    } catch (queueErr) {
      console.warn('Queue notification on retry:', queueErr.message);
    }

    res.json({ message: 'পুনরায় পোস্ট করার জন্য কিউয়ে যোগ করা হয়েছে', video });
  } catch (err) {
    res.status(500).json({ message: 'রিট্রাই করতে সমস্যা হচ্ছে' });
  }
});

module.exports = router;
