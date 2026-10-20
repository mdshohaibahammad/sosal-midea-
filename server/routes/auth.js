const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

// Set token as httpOnly cookie + return user info
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);
  const isProd = process.env.NODE_ENV === 'production';
  res
    .status(statusCode)
    .cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        socialTokens: user.socialTokens,
        settings: user.settings,
      },
    });
};

// Current logged in user info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update profile info
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar, settings } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (settings) user.settings = { ...user.settings, ...settings };

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'বর্তমান এবং নতুন পাসওয়ার্ড উভয়ই দিন' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'নতুন পাসওয়ার্ড অন্তত ৬ ক্যারেক্টারের হতে হবে' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'বর্তমান পাসওয়ার্ড সঠিক নয়' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে' });
  } catch (err) {
    res.status(500).json({ message: 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'নাম, ইমেল ও পাসওয়ার্ড সবই দরকার' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'পাসওয়ার্ড অন্তত ৬ ক্যারেক্টারের হতে হবে' });
  }

  try {
    let existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'ইমেলটি ইতিমধ্যে নিবন্ধিত' });

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'সার্ভার ত্রুটি, পরে চেষ্টা করুন' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'ইমেল ও পাসওয়ার্ড দরকার' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'ইমেল বা পাসওয়ার্ড ভুল' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'সার্ভার ত্রুটি, পরে চেষ্টা করুন' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ message: 'লগআউট সম্পন্ন' });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'ইমেল দরকার' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'যদি এই ইমেলটি নিবন্ধিত থাকে, রিসেট লিঙ্ক পাঠানো হবে' });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.json({
      message: 'পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে (নিচে টোকেন উপলব্ধ)',
      ...(process.env.NODE_ENV !== 'production' ? { resetToken } : {}),
    });
  } catch (err) {
    res.status(500).json({ message: 'সার্ভার ত্রুটি, পরে চেষ্টা করুন' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'পাসওয়ার্ড অন্তত ৬ ক্যারেক্টারের হতে হবে' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findOne({
      where: {
        id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) return res.status(400).json({ message: 'টোকেন অবৈধ বা মেয়াদোত্তীর্ণ' });

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে' });
  } catch (err) {
    res.status(400).json({ message: 'টোকেন অবৈধ বা মেয়াদোত্তীর্ণ' });
  }
});

module.exports = router;