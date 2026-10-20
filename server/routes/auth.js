const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

// Set token as httpOnly cookie + return user info
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const isProd = process.env.NODE_ENV === 'production';
  res
    .status(statusCode)
    .cookie('token', token, {
      httpOnly: true,
      secure: isProd, // HTTPS only in production
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    .json({
      token, // keep for client-side ProtectedRoute convenience
      user: { id: user._id, name: user.name, email: user.email },
    });
};

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'নাম, ইমেল ও পাসওয়ার্ড সবbach দরকার' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'পাসওয়ার্ড অন্তত ৬ ক্যারেক্টারের হতে হবে' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'ইমেলটি ইতিমধ্যে নিবন্ধিত' });
    user = new User({ name, email, password });
    await user.save();
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ message: 'সার্ভার ত্রুটি, পরে চেষ্টা করুন' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'ইমেল ও পাসওয়ার্ড দরকার' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'ইমেল বা পাসওয়ার্ড ভুল' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
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

// Forgot password - send reset link (simulated)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'ইমেল দরকার' });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'যদি 이 ইমেলটি নিবন্ধিত থাকে, রিসেট লিঙ্ক পাঠানো হবে' });
    }

    // Generate reset token valid for 15 minutes
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // In production, send email here with link: /reset-password?token=resetToken
    res.json({
      message: 'পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে (ডেভ মোডে টোকেনটি নিচে)',
      ...(process.env.NODE_ENV !== 'production' ? { resetToken } : {}),
    });
  } catch (err) {
    res.status(500).json({ message: 'সার্ভার ত্রুটি, পরে চেষ্টা করুন' });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'পাসওয়ার্ড অন্তত ৬ ক্যারেক্টারের হতে হবে' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'টোকেন অবৈধ বা মেয়াদোত্তীয়' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে' });
  } catch (err) {
    res.status(400).json({ message: 'টোকেন অবৈধ বা মেয়াদোত্তীয়' });
  }
});

module.exports = router;