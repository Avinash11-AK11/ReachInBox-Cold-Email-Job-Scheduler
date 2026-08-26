# ReachInbox Email Scheduler — Full-Stack Email Job Scheduler

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-FF4500?style=for-the-badge)](https://docs.bullmq.io/)

A production-grade, persistent full-stack cold email scheduling system built for the **ReachInbox Software Development Intern Hiring Assignment**.

For complete enterprise documentation, database design, API specifications, and architecture decisions, explore our [Master Documentation Index](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/00-documentation-index/DOCUMENTATION_INDEX.md).

---

## 🚀 Key Features

- 🔐 **Google OAuth 2.0 Integration**: Real authentication flow displaying user name, email, avatar, and logout option.
- 📁 **CSV/TXT Lead File Parser**: Browser and server-side lead parser with regex validation and automatic de-duplication.
- ⏱️ **Granular Scheduling Controls**: Custom start time, per-email throttle delay (`MIN_EMAIL_DELAY_MS`), and hourly rate limits (`MAX_EMAILS_PER_HOUR`).
- ⚡ **BullMQ & Redis Architecture**: Persistent job queues with **zero cron dependencies**.
- 📬 **Multi-Sender Ethereal SMTP Engine**: Dispatch emails via mock Ethereal SMTP accounts with direct web preview link generation.
- 📊 **Responsive Dashboard**: Tabs for Scheduled Emails, Sent Emails, loading states, empty states, and toast notifications.

---

## 🛠️ Technology Stack

- **Backend API**: Node.js, Express.js 4, TypeScript, Prisma ORM, Nodemailer, Passport.js.
- **Database & Queue**: MySQL 8.0, Redis 7, BullMQ.
- **Frontend SPA**: React.js 18, Vite, Tailwind CSS, TypeScript, Axios, Lucide React Icons.

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

Access detailed technical documentation in the [`documentation/`](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/00-documentation-index/DOCUMENTATION_INDEX.md) folder:

- 📘 **[Master Documentation Index](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/00-documentation-index/DOCUMENTATION_INDEX.md)**
- 🔍 **[Documentation Quality Audit](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/00-documentation-index/DOCUMENTATION_AUDIT.md)**
- 📋 **[Project Overview](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/01-project-overview/PROJECT_OVERVIEW.md)**
- 📋 **[Functional Requirements Specification](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/02-requirements/FUNCTIONAL_REQUIREMENTS.md)**
- ⚙️ **[System Architecture Design](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/03-system-design/SYSTEM_ARCHITECTURE.md)**
- 🗄️ **[Database Design & ER Diagram](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/04-database/DATABASE_DESIGN.md)**
- 📡 **[REST API Specifications](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/05-api/API_DOCUMENTATION.md)**
- 📦 **[Queue & Scheduling Architecture](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/06-queue-and-scheduler/QUEUE_ARCHITECTURE.md)**
- 🛡️ **[Rate Limiting & Throttling Strategy](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/07-rate-limiting/RATE_LIMITING.md)**
- 🔐 **[Authentication & Google OAuth Sequence](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/08-authentication/AUTHENTICATION.md)**
- 🎨 **[Frontend Component Architecture](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/09-frontend/FRONTEND_ARCHITECTURE.md)**
- 🧪 **[Testing Strategy & Executable Test Matrix](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/12-testing/TESTING_STRATEGY.md)**
- 📹 **[5-Minute Demo Video Recording Script](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/17-demo/DEMO_SCRIPT.md)**
- 🗺️ **[Assignment Requirement Traceability Matrix](file:///Users/avinash/Downloads/reachinbox-email-scheduler/documentation/18-assignment-mapping/ASSIGNMENT_REQUIREMENT_MAPPING.md)**

---

## ⚡ Quick Start Guide

### 1. Prerequisites
Ensure Redis and MySQL background services are started:
```bash
brew services start redis
brew services start mysql
```

### 2. Start Backend REST API (Terminal 1)
```bash
cd backend
npx prisma migrate dev --name init
npm run dev
```
*(Runs API server on `http://localhost:5001`)*

### 3. Start BullMQ Email Worker (Terminal 2)
```bash
cd backend
npm run worker
```
*(Processes email dispatches, rate limits, and Ethereal SMTP dispatches)*

### 4. Start React Frontend SPA (Terminal 3)
```bash
cd frontend
npm run dev
```
*(Runs React dashboard on `http://localhost:5173`)*

---

## 🗺️ Assignment Requirement Mapping

| Requirement | Implementation File | Status |
| :--- | :--- | :---: |
| **Node.js & TypeScript Backend** | `backend/src/server.ts` | Verified |
| **Relational Database** | MySQL 8.0 via `backend/prisma/schema.prisma` | Verified |
| **Persistent Queue (No Cron)** | BullMQ + Redis `backend/src/queues/emailQueue.ts` | Verified |
| **Configurable Concurrency** | `backend/src/queues/emailWorker.ts` (`WORKER_CONCURRENCY=5`) | Verified |
| **Minimum Email Delay** | `backend/src/queues/emailWorker.ts` (`MIN_EMAIL_DELAY_MS=2000`) | Verified |
| **Hourly Rate Limiting** | `backend/src/utils/rateLimiter.ts` (`MAX_EMAILS_PER_HOUR=100`) | Verified |
| **Idempotency Guard** | `backend/src/queues/emailWorker.ts` DB status check | Verified |
| **Server Restart Recovery** | Redis `ZSET` + MySQL DB persistence | Verified |
| **Fake SMTP Delivery** | Nodemailer with Ethereal Email test accounts | Verified |
| **Google OAuth Login** | Passport.js Google Strategy | Verified |
| **React.js + Tailwind Frontend** | `frontend/src/pages/DashboardPage.tsx` | Verified |

---

## 📦 Submission & Reviewer Access

### GitHub Reviewer Access
Access granted to assignment evaluators:
- `Mitrajit`
- `Yadav036`

### Submission Form
Completed ClickUp submission form: [https://forms.clickup.com/9005062261/f/8cbwp3n-8876/6NNNJ92DV93PQTAYST](https://forms.clickup.com/9005062261/f/8cbwp3n-8876/6NNNJ92DV93PQTAYST)
