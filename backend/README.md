# ReachInbox Email Scheduler — Backend Service

[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo_Video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/KIoFVjHzvaE)

The backend service is built with **Node.js, Express, TypeScript, Prisma ORM, MySQL/PostgreSQL, Redis, BullMQ, Passport Google OAuth, and Nodemailer**.

👉 **[Watch Live Project Video Demo on YouTube](https://youtu.be/KIoFVjHzvaE)**

---

## ⚡ Quick Start Guide

### 1. Prerequisites
Ensure MySQL and Redis background services are running:
```bash
brew services start redis
brew services start mysql
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Start API Server & Embedded BullMQ Worker
```bash
npm run dev
```
- 🌐 API Base URL: `http://localhost:5001/api`
- 🔗 Health Check: `http://localhost:5001/health`

---

## 🔍 How to View & Inspect Database & Tables

### Method 1: Prisma Studio Web GUI (Recommended)
Run in `backend/`:
```bash
npx prisma studio
```
This opens an interactive database browser at **`http://localhost:5555`** where you can view, edit, filter, and inspect `User`, `Campaign`, `ScheduledEmail`, and `SenderAccount` tables in real-time.

### Method 2: MySQL CLI
Connect via terminal:
```bash
mysql -u root --host=127.0.0.1 --port=3307 reachinbox
```
Useful SQL queries:
```sql
SHOW TABLES;
SELECT id, recipient, subject, status, scheduledFor, previewUrl FROM ScheduledEmail;
SELECT id, subject, totalRecipients, startTime FROM Campaign;
SELECT id, email, name FROM User;
```

---

## 📁 Key File Structure

```text
backend/
├── prisma/
│   └── schema.prisma       # Prisma database schema
├── src/
│   ├── config/             # DB, Redis, Passport, Ethereal SMTP configs
│   ├── controllers/        # Auth & Email route handlers
│   ├── middleware/         # Authentication guard middleware
│   ├── queues/             # BullMQ queue setup & Worker processor
│   ├── routes/             # REST API routes (/api/auth, /api/emails)
│   ├── utils/              # Lead parser, rate limiter helper
│   ├── app.ts              # Express application configuration
│   ├── server.ts           # REST API entrypoint
│   └── worker.ts           # BullMQ worker entrypoint
├── railway.json            # Railway deployment manifest
├── .env.example            # Environment template
└── package.json            # Node.js dependencies & scripts
```
