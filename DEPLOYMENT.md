# Production Deployment Guide (Vercel + Railway)

This guide walks you through deploying the **ReachInbox Cold Email Job Scheduler** to production matching the system architecture:

```
                    INTERNET
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        Vercel              Railway
       Frontend             Backend
          │                   │
          │                   ├── Express
          │                   │
          │                   └── BullMQ Worker
          │                         │
          │              ┌──────────┴─────────┐
          │              ▼                    ▼
          │           Redis              PostgreSQL
          │
          └────────────── HTTPS API ──────────┘
                                            │
                                            ▼
                                      Ethereal SMTP
```

---

## 1. Railway Deployment (Backend + MySQL + Redis)

### Step 1: Create a New Project on Railway
1. Go to [Railway.app](https://railway.app) and sign in.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository and choose the `backend` directory as the Root Directory.

### Step 2: Add Database Services on Railway
1. In your Railway project canvas, click **+ New**:
   - Select **Database** -> **Add MySQL**.
   - Select **Database** -> **Add Redis**.

### Step 3: Configure Backend Environment Variables
In your Railway Backend service, go to **Variables** and add:

| Variable Name | Description / Example |
| :--- | :--- |
| `PORT` | `5000` (or Railway default) |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{MySQL.MYSQL_URL}}` (Use Railway reference variable) |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` (Use Railway reference variable) |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `SESSION_SECRET` | Generate a random 32+ char secret |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | `https://your-backend.up.railway.app/api/auth/google/callback` |
| `WORKER_CONCURRENCY` | `5` |
| `MIN_EMAIL_DELAY_MS` | `2000` |
| `MAX_EMAILS_PER_HOUR` | `100` |
| `START_WORKER` | `true` |

### Step 4: Generate Public Domain for Backend
1. Go to **Settings** in your Railway Backend service.
2. Under **Networking** -> **Public Networking**, click **Generate Domain**.
3. Copy the URL (e.g. `https://reachinbox-backend.up.railway.app`).

---

## 2. Vercel Deployment (Frontend)

### Step 1: Import Project on Vercel
1. Go to [Vercel.com](https://vercel.com) and sign in.
2. Click **Add New** -> **Project**.
3. Select your GitHub repository.

### Step 2: Configure Project Settings
- **Root Directory**: Select `frontend` (or leave default if using root `vercel.json`).
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Set Environment Variables
Add the following Environment Variable in Vercel settings:

| Variable Name | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-backend.up.railway.app/api` |

### Step 4: Deploy
Click **Deploy**. Vercel will build the frontend and generate a URL (e.g., `https://reachinbox.vercel.app`).

---

## 3. Post-Deployment Verification Checklist

1. **Update OAuth Callback in Google Cloud Console**:
   - Add `https://your-backend.up.railway.app/api/auth/google/callback` to **Authorized Redirect URIs**.
   - Add `https://your-app.vercel.app` to **Authorized JavaScript Origins**.

2. **Verify Backend Health Check**:
   - Open `https://your-backend.up.railway.app/health` in your browser.
   - Response should be `{"status":"ok","timestamp":"..."}`.

3. **Verify Cold Email Scheduling & Worker**:
   - Open the Vercel app URL `https://your-app.vercel.app`.
   - Click **Demo Quick Sign-In** or **Sign in with Google**.
   - Schedule a campaign. Check backend logs on Railway to confirm BullMQ processes jobs and logs Ethereal SMTP preview URLs.
