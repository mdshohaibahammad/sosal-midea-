# Social Media Auto Poster

একসাথে ভিডিও আপলোড করে ফেসবুক, ইন্সটাগ্রাম, টিকটক ও ইউটিউবে পোস্ট করার স্টার্টার প্রজেক্ট।

## প্রযুক্তি (Tech Stack)
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + MongoDB
- **Auth:** JWT + bcryptjs
- **File Upload:** Multer

## ফোল্ডার কাঠামো
- `client/` — React फ्रন্টএন্ড
- `server/` — এক্সপ্রেস ব্যাকএন্ড

## এlessly শুরু করুন

### ব্যাকএন্ড সেটআপ
```bash
cd server
npm install
npm run dev
```

### ফ্রন্টএন্ড সেটআপ
```bash
cd client
npm install
npm run dev
```

## এনভায়রনমেন্ট ভ্যারিয়েবল (.env)
`server/` ফোল্ডারে একটি `.env` ফাইল তৈরি করুন:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/social_autoposter
JWT_SECRET=your_secret_key
```

## বৈশিষ্ট্য
- ব্যবহারকারী রেজিস্ট্রেশন ও লগইন (JWT + httpOnly কুকি)
- পাসওয়ার্ড ভুলে গেলে রিসেট (Forgot/Reset Password)
- ভিডিও আপলোড ও প্ল্যাটফর্ম সিলেকশন (ফাইল টাইপ ও সাইজ ভ্যালিডেশন)
- ড্যাশবোর্ডে আপলোডের স্ট্যাটাস ট্র্যাকিং (পেজিনেশন, সার্চ, ফিল্টার)
- ভিডিও এডিট ও ডিলিট
- ব্যাকগ্রাউন্ড জব কিউ (Redis + BullMQ) দিয়ে অটো-পোস্টিং
- সোশ্যাল মিডিয়া অ্যাকাউন্ট কানেক্ট করার অথ রুট (OAuth URL জেনারেশন)
- রিট্রাই ফেইলড ভিডিও
- নিরাপত্তা: রেট-লIMIT, হেলমেট হেডার, MongoDB স্যানিটাইজেশন, ফাইল আপলোড সীমাবদ্ধতা

##bag: এlessly শুরু করুন

### prerequisite
- Node.js (v18+)
- MongoDB (লোকাল ২৭০১৭ অথবা MongoDB Atlas)
- Redis (ব্যাকগ্রাউন্ড জব কিউয়ের জন্য)

### ব্যাকএন্ড সেটআপ
```bash
cd server
npm install
cp ../.env.example .env   # এনভায়রনমেন্ট ভেরিয়েবল সেট করুন
npm run dev
```

### ফ্রন্টএন্ড সেটআপ
```bash
cd client
npm install
npm run dev
```

### ডকার দিয়ে একসাথে চালানো
```bash
docker-compose up --build
```

## এনভায়রনমেন্ট ভ্যারিয়েবল (.env)
`server/` ফোল্ডারে একটি `.env` ফাইল তৈরি করুন:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/social_autoposter
JWT_SECRET=your_strong_random_secret_key_here
CORS_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:5000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## API রুট লিস্ট
### Auth
- `POST /api/auth/register` – নibandhan
- `POST /api/auth/login` – লগইন (httpOnly কুকি)
- `POST /api/auth/logout` – লগআউট
- `POST /api/auth/forgot-password` – পাসওয়ার্ড রিসেট লিঙ্ক
- `POST /api/auth/reset-password/:token` – পাসওয়ার্ড নবায়ন

### Videos
- `POST /api/videos/upload` – ভিডিও আপলোড
- `GET /api/videos` – ভিডিও লিস্ট (সার্চ/ফিল্টার/পেজিনেশন)
- `GET /api/videos/:id` – একক ভিডিও
- `PUT /api/videos/:id` – ভিডিও আপডেট/শিডিউল
- `DELETE /api/videos/:id` – ভিডিও ডিলিট
- `POST /api/videos/:id/retry` – ফেইলড ভিডিও রিট্রাই

### Social
- `GET /api/social/connect/:platform` – OAuth URL পেতে
- `POST /api/social/callback/:platform` – OAuth কলব্যাক
- `GET /api/social/status` – কানেক্টেড প্ল্যাটফর্মের স্ট্যাটাস