# ReachInbox Email Scheduler — Backend Service

The backend service is built with **Node.js, Express, TypeScript, Prisma ORM, MySQL, Redis, BullMQ, Passport Google OAuth, and Nodemailer**.

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

### 3. Run Database Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start API Server (Terminal 1)
```bash
npm run dev
```
- 🌐 API Base URL: `http://localhost:5001/api`
- 🔗 Health Check: `http://localhost:5001/health`

### 5. Start BullMQ Email Worker (Terminal 2)
```bash
npm run worker
```
- Processes delayed jobs with `WORKER_CONCURRENCY=5` and `MIN_EMAIL_DELAY_MS=2000`.
- Enforces atomic Redis hourly rate limiting (`MAX_EMAILS_PER_HOUR=100`).

---

## 🔍 How to View & Inspect MySQL Database & Tables

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
│   └── schema.prisma       # Prisma MySQL database schema
├── src/
│   ├── config/             # DB, Redis, Passport, Ethereal SMTP configs
│   ├── controllers/        # Auth & Email route handlers
│   ├── middleware/         # Authentication guard middleware
│   ├── queues/             # BullMQ queue setup & Worker processor
│   ├── routes/             # REST API routes (/api/auth, /api/emails)
│   ├── services/           # Nodemailer dispatch logic
│   ├── utils/              # Lead parser, rate limiter helper
│   ├── app.ts              # Express application configuration
│   ├── server.ts           # REST API entrypoint
│   └── worker.ts           # BullMQ worker entrypoint
├── .env.example            # Environment template
└── package.json            # Node.js dependencies & scripts
```
