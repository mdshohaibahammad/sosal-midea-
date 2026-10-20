const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/connect/:platform', auth, (req, res) => {
  const { platform } = req.params;
  const allowed = ['facebook', 'instagram', 'tiktok', 'youtube'];
  if (!allowed.includes(platform)) {
    return res.status(400).json({ message: 'অনুমোদিত প্ল্যাটফর্ম নয়' });
  }

  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
  const redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/social/callback/${platform}`;
  const scope = encodeURIComponent(process.env[`${platform.toUpperCase()}_SCOPE`] || '');

  // Build OAuth authorize URL per platform (placeholders - replace with real provider docs)
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

router.post('/callback/:platform', auth, async (req, res) => {
  const { platform } = req.params;
  const allowedPlatforms = ['facebook', 'instagram', 'tiktok', 'youtube'];
  if (!allowedPlatforms.includes(platform)) {
    return res.status(400).json({ message: 'অনুমোদিত প্ল্যাটফর্ম নয়' });
  }
  const { accessToken, expiresAt } = req.body;
  if (!accessToken) {
    return res.status(400).json({ message: 'অ্যাক্সেস টোকেন দরকার' });
  }
  try {
    await User.findByIdAndUpdate(req.user.id, {
      [`socialTokens.${platform}`]: { accessToken, expiresAt: new Date(expiresAt) },
    });
    res.json({ message: `${platform} সংযুক্ত করা হয়েছে` });
  } catch (err) {
    res.status(500).json({ message: 'প্ল্যাটফর্ম সংযুক্ত করতে সমস্যা হচ্ছে' });
  }
});

router.get('/status', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('socialTokens');
  res.json(user.socialTokens);
});

module.exports = router;