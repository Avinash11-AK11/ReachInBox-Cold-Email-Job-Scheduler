# ReachInbox Email Scheduler — Frontend Application

[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo_Video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/KIoFVjHzvaE)

The frontend dashboard is built with **React.js 18, Tailwind CSS, TypeScript, Vite, Axios, and Lucide React Icons**, aligned with the official ReachInbox design specification.

👉 **[Watch Live Project Video Demo on YouTube](https://youtu.be/KIoFVjHzvaE)**

---

## ⚡ Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### 3. Start Vite Development Server
```bash
npm run dev
```

Open your web browser at **`http://localhost:5173`**.

---

## ✨ Features & Component Breakdown

- **`LoginPage.tsx`**: Google OAuth login screen with ReachInbox branding + Demo Quick Sign-In.
- **`DashboardPage.tsx`**: Header with active Google user avatar, live metrics summary cards, and tabs for Scheduled & Sent Emails.
- **`ComposeModal.tsx`**: Campaign composer with subject, rich text body, start time picker, inter-email delay input, and rate limit input.
- **`LeadUploader.tsx`**: Drag-and-drop CSV/TXT lead file uploader with automatic email regex parsing & unique lead count badge.
- **`EmailTable.tsx`**: Data tables for Scheduled and Sent emails with status badges, timestamps, loading skeletons, empty states, and direct links to **Ethereal Preview URLs**.

---

## 🛠️ Tech Stack

- **Framework**: React.js 18 (`react`, `react-dom`, `react-router-dom`)
- **Styling**: Tailwind CSS (`v3.4`) with custom glassmorphism panels & gradients
- **Language**: TypeScript (`v5.7`)
- **Build Tool**: Vite (`v6.0`)
