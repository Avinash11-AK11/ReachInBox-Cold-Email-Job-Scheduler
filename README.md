# ReachInbox Cold Email Job Scheduler

[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo_Video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/KIoFVjHzvaE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-FF4500?style=for-the-badge)](https://docs.bullmq.io/)

A production-grade, persistent full-stack cold email scheduling system built for the **ReachInbox Software Development Intern Hiring Assignment**.

---

## 🎬 Video Walkthrough & Live Demo

Watch the comprehensive video demonstration walking through Google OAuth authentication, bulk CSV lead ingestion, BullMQ persistent queue scheduling, Redis hourly rate-limiting, and live Ethereal SMTP email delivery:

[![ReachInbox Email Scheduler Video Demo](https://img.youtube.com/vi/KIoFVjHzvaE/maxresdefault.jpg)](https://youtu.be/KIoFVjHzvaE)

👉 **[Click Here to Watch Full Video Demo on YouTube](https://youtu.be/KIoFVjHzvaE)**

---

## 🚀 Key Features

- 🔐 **Google OAuth 2.0 Integration**: Real authentication flow displaying user name, email, avatar, and logout option.
- 📁 **CSV/TXT Lead File Parser**: Browser and server-side lead parser with regex validation and automatic de-duplication.
- ⏱️ **Granular Scheduling Controls**: Custom start time, per-email throttle delay (`MIN_EMAIL_DELAY_MS`), and hourly rate limits (`MAX_EMAILS_PER_HOUR`).
- ⚡ **BullMQ & Redis Architecture**: Persistent job queues with **zero cron dependencies** and full restart resilience.
- 🛡️ **Redis Rate Limiter & Concurrency Guard**: Atomic sliding counter preventing email domain blacklisting.
- 📬 **Multi-Sender Ethereal SMTP Engine**: Dispatch emails via mock Ethereal SMTP accounts with direct web preview link generation.
- 📊 **Responsive Dashboard**: Live stats, Scheduled Emails table, Sent History view, search/filter capabilities, and custom claymorphic UI styling.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons, Axios |
| **Backend API** | Node.js, Express.js 4, TypeScript, Passport.js, Multer, Zod |
| **ORM & Database** | Prisma ORM, MySQL 8.0 |
| **Queue & Cache** | Redis 7, BullMQ, ioredis |
| **Email Service** | Nodemailer, Ethereal SMTP |

---

## 🏗️ System Architecture Overview

```text
                               ┌─────────────────────────┐
                               │   Google OAuth Provider │
                               └────────────┬────────────┘
                                            │
                                            ▼
┌─────────────────────────┐        ┌─────────────────────────┐
│   React 18 + Vite UI    │───────▶│   Express 4 + Node.js   │
│   Tailwind CSS          │        │   TypeScript REST API   │
│   Axios / Context API   │        └────────────┬────────────┘
└─────────────────────────┘                     │
                                  ┌─────────────┼─────────────┐
                                  │             │             │
                                  ▼             ▼             ▼
                               MySQL          BullMQ        Redis
                              (Prisma)     (Job Queue)  (Limit Counter)
                                  │             │             │
                                  │             ▼             │
                                  │        Email Worker ◄─────┘
                                  │     (Concurrency: N)
                                  │             │
                                  │             ├── Rate Limit Check (Redis INCR)
                                  │             ├── Throttle Delay (2000ms)
                                  │             └── Idempotency Guard (DB Check)
                                  │             │
                                  │             ▼
                                  │       Nodemailer Client
                                  │             │
                                  │             ▼
                                  │       Ethereal SMTP Server
                                  │
                                  └──── Sync Status (SENT / FAILED)
```

---

## 📖 Comprehensive Documentation System

Access detailed technical documentation in the [`documentation/`](documentation/00-documentation-index/DOCUMENTATION_INDEX.md) directory:

- 📘 **[Master Documentation Index](documentation/00-documentation-index/DOCUMENTATION_INDEX.md)**
- 🔍 **[Documentation Quality Audit](documentation/00-documentation-index/DOCUMENTATION_AUDIT.md)**
- 📋 **[Project Overview](documentation/01-project-overview/PROJECT_OVERVIEW.md)**
- 📋 **[Functional Requirements Specification](documentation/02-requirements/FUNCTIONAL_REQUIREMENTS.md)**
- ⚙️ **[System Architecture Design](documentation/03-system-design/SYSTEM_ARCHITECTURE.md)**
- 🗄️ **[Database Design & ER Diagram](documentation/04-database/DATABASE_DESIGN.md)**
- 📡 **[REST API Specifications](documentation/05-api/API_DOCUMENTATION.md)**
- 📦 **[Queue & Scheduling Architecture](documentation/06-queue-and-scheduler/QUEUE_ARCHITECTURE.md)**
- 🛡️ **[Rate Limiting & Throttling Strategy](documentation/07-rate-limiting/RATE_LIMITING.md)**
- 🔐 **[Authentication & Google OAuth Sequence](documentation/08-authentication/AUTHENTICATION.md)**
- 🎨 **[Frontend Component Architecture](documentation/09-frontend/FRONTEND_ARCHITECTURE.md)**
- 🧪 **[Testing Strategy & Executable Test Matrix](documentation/12-testing/TESTING_STRATEGY.md)**
- 📹 **[5-Minute Demo Video Recording Script](documentation/17-demo/DEMO_SCRIPT.md)**
- 🗺️ **[Assignment Requirement Traceability Matrix](documentation/18-assignment-mapping/ASSIGNMENT_REQUIREMENT_MAPPING.md)**

---

## ⚡ Quick Start Guide (Local Development)

### 1. Prerequisites
Ensure Redis and MySQL background services are running:
```bash
brew services start redis
brew services start mysql
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```
*(Backend REST API runs on `http://localhost:5001` with embedded BullMQ Email Worker)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(Frontend SPA dashboard runs on `http://localhost:5173`)*
