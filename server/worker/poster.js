const Queue = require('bullmq').Queue;
const Worker = require('bullmq').Worker;
const redis = require('../config/redis');
const Video = require('../models/Video');
const User = require('../models/User');

const POSTER_QUEUE = 'video-poster';

// Create queue
const posterQueue = new Queue(POSTER_QUEUE, { connection: redis });

// Add a video to poster queue
async function enqueuePost(videoId, delayMs = 0) {
  await posterQueue.add(
    'post-video',
    { videoId },
    {
      delay: delayMs,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    }
  );
}

// Worker that processes posting jobs
const posterWorker = new Worker(
  POSTER_QUEUE,
  async (job) => {
    const { videoId } = job.data;
    const video = await Video.findById(videoId).populate('user');
    if (!video) throw new Error('ভিডিও পাওয়া যায়নি');

    const user = video.user;
    const results = {};

    for (const platform of video.platforms) {
      const tokenObj = user.socialTokens?.[platform];
      if (!tokenObj || !tokenObj.accessToken) {
        results[platform] = 'অ্যাক্সেস টোকেন নেই';
        continue;
      }

      try {
        // Here you would call real platform APIs (Facebook Graph API, Instagram, TikTok, YouTube)
        // For now we simulate success
        results[platform] = 'পোস্ট করা হয়েছে';
      } catch (err) {
        results[platform] = 'পোস্ট করতে ব্যর্থ';
        console.error(`Post to ${platform} failed:`, err.message);
      }
    }

    const allPosted = Object.values(results).every((r) => r === 'পোস্ট করা হয়েছে');
    video.status = allPosted ? 'posted' : 'failed';
    video.postedAt = new Date();
    await video.save();

    return results;
  },
  { connection: redis }
);

posterWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed for video ${job.data.videoId}`);
});

posterWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

module.exports = { posterQueue, enqueuePost };
