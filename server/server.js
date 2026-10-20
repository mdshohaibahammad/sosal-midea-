const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const socialRoutes = require('./routes/social');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

dotenv.config();
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend origin (comma separated in env, fallback to localhost dev)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Security headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Tailwind inline styles need this relaxed in dev
  })
);

// Rate limiting (general)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'অনুরোধের määrä খুব বেশি, কিছুক্ষণ পর চেষ্টা করুন' },
});
app.use(generalLimiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'অথরাইজেশন রoute-এর জন্য অধিক অরোহণ, পরে চেষ্টা করুন' },
});

// Body parsing & sanitization
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent NoSQL injection

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/social', socialRoutes);

app.get('/', (req, res) => res.send('Social Media Auto Poster API Running'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler (sanitized messages)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

// Initialize background poster worker
try {
  require('./worker/poster');
} catch (err) {
  console.error('ব্যাকগ্রাউন্ড পোস্টার ওয়ার্কার শুরু করতে সমস্যা:', err.message);
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));