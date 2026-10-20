const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  filePath: { type: String, required: true },
  platforms: [{ type: String, enum: ['facebook','instagram','tiktok','youtube'], default: [] }],
  status: { type: String, enum: ['pending','posted','failed'], default: 'pending' },
  scheduledAt: { type: Date },
  postedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);