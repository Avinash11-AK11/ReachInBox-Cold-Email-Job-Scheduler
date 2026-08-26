#!/bin/bash

# ReachInbox Email Scheduler - 1-Click Universal Startup Script

set -e

# Export OpenSSL config fix for macOS Node.js environment
export OPENSSL_CONF=/dev/null

echo "============================================================"
echo "🚀 Starting ReachInbox Email Scheduler & Outreach Engine"
echo "============================================================"

# 1. Start Redis & MySQL Services via Homebrew if available
echo "📦 [1/4] Checking & Starting Redis & MySQL Services..."
if command -v brew >/dev/null 2>&1; then
  brew services start redis >/dev/null 2>&1 || true
  brew services start mysql >/dev/null 2>&1 || true
fi

# 2. Check & Install Dependencies if needed
echo "⚙️  [2/4] Verifying Dependencies..."
if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend packages..."
  (cd backend && npm install)
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend packages..."
  (cd frontend && npm install)
fi

# 3. Initialize Prisma MySQL Database Schema
echo "🗄️  [3/4] Syncing MySQL Database Schema (port 3307)..."
(cd backend && OPENSSL_CONF=/dev/null npx prisma db push)

# 4. Launch Services Concurrently
echo "============================================================"
echo "🌟 [4/4] Launching All Services..."
echo "- Backend API:   http://localhost:5001"
echo "- BullMQ Worker: Running (Concurrency: 5)"
echo "- Frontend UI:   http://localhost:5173"
echo "============================================================"

npx concurrently \
  --kill-others \
  --names "BACKEND,WORKER,FRONTEND" \
  --prefix-colors "cyan.bold,yellow.bold,green.bold" \
  "cd backend && OPENSSL_CONF=/dev/null npm run dev" \
  "cd backend && OPENSSL_CONF=/dev/null npm run worker" \
  "cd frontend && OPENSSL_CONF=/dev/null npm run dev"
