const express = require('express');
const router = express.Router();
const { User } = require('../models');
const auth = require('../middleware/auth');

const DEFAULT_PLATFORMS = {
  facebook: {
    id: 'facebook',
    name: 'Facebook Pages & Reels',
    iconColor: '#1877F2',
    scope: 'pages_manage_posts,pages_read_engagement,publish_video',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram Business / Reels',
    iconColor: '#E4405F',
    scope: 'instagram_basic,instagram_content_publish',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Video Kit',
    iconColor: '#000000',
    scope: 'user.info.basic,video.publish,video.upload',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Shorts & Channel',
    iconColor: '#FF0000',
    scope: 'https://www.googleapis.com/auth/youtube.upload',
  },
};

// Get connection status for all platforms
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['socialTokens', 'name', 'email'] });
    const tokens = user?.socialTokens || {};

    const response = Object.keys(DEFAULT_PLATFORMS).map((key) => {
      const tokenData = tokens[key];
      const isConnected = !!(tokenData && tokenData.accessToken);
      return {
        key,
        ...DEFAULT_PLATFORMS[key],
        isConnected,
        accountName: tokenData?.accountName || (isConnected ? `${user.name} (@${key}_auto)` : null),
        accountAvatar: tokenData?.accountAvatar || null,
        connectedAt: tokenData?.connectedAt || null,
        expiresAt: tokenData?.expiresAt || null,
      };
    });

    res.json(response);
  } catch (err) {
    console.error('Social status error:', err);
    res.status(500).json({ message: 'স্ট্যাটাস লোড করতে সমস্যা হচ্ছে' });
  }
});

// Fast 1-click connect (Mock / Simulated for local & demo, OAuth fallback)
router.post('/connect-demo/:platform', auth, async (req, res) => {
  const { platform } = req.params;
  const allowed = ['facebook', 'instagram', 'tiktok', 'youtube'];
  if (!allowed.includes(platform)) {
    return res.status(400).json({ message: 'অনুমোদিত প্ল্যাটফর্ম নয়' });
  }

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const tokens = user.socialTokens ? { ...user.socialTokens } : {};
    tokens[platform] = {
      accessToken: `mock_token_${platform}_${Date.now()}`,
      accountName: `${user.name} on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      accountAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${platform}_${user.id}`,
      connectedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    };

    user.socialTokens = tokens;
    user.changed('socialTokens', true);
    await user.save();

    res.json({ message: `${platform} সফলভাবে কানেক্ট করা হয়েছে`, platform: tokens[platform] });
  } catch (err) {
    console.error('Connect error:', err);
    res.status(500).json({ message: 'কানেক্ট করতে সমস্যা হয়েছে' });
  }
});

// Disconnect platform
router.post('/disconnect/:platform', auth, async (req, res) => {
  const { platform } = req.params;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const tokens = user.socialTokens ? { ...user.socialTokens } : {};
    delete tokens[platform];
    user.socialTokens = tokens;
    user.changed('socialTokens', true);
    await user.save();

    res.json({ message: `${platform} ডিসকানেক্ট করা হয়েছে` });
  } catch (err) {
    res.status(500).json({ message: 'ডিসকানেক্ট করতে সমস্যা হয়েছে' });
  }
});

// OAuth generator (for live production OAuth flows)
router.get('/connect/:platform', auth, (req, res) => {
  const { platform } = req.params;
  if (!DEFAULT_PLATFORMS[platform]) {
    return res.status(400).json({ message: 'অনুমোদিত প্ল্যাটফর্ম নয়' });
  }

  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
  const redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/social/callback/${platform}`;
  const scope = encodeURIComponent(process.env[`${platform.toUpperCase()}_SCOPE`] || DEFAULT_PLATFORMS[platform].scope);

  let authUrl = '';
  switch (platform) {
    case 'facebook':
    case 'instagram':
      authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
      break;
    case 'tiktok':
      authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
      break;
    case 'youtube':
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      break;
  }

  res.json({ authUrl, platform });
});

module.exports = router;