import React from 'react';
import { Send, CheckCircle2, Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/auth/google`;
  };

  const handleDevLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/auth/dev-login`;
  };

  return (
    <div className="relative min-h-screen bg-[#F6F5F2] flex flex-col justify-center items-center px-4 overflow-hidden select-none">

      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-stone-300/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#ECE0CF] to-[#D9C7B2] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_20px_rgba(180,150,120,0.25)] border border-white mb-4 transform hover:scale-105 transition">
            <Send className="h-8 w-8 text-stone-800 transform -rotate-12" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            ReachInbox <span className="text-amber-800">Scheduler</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 font-medium">
            High-volume cold outreach & persistent job scheduling engine
          </p>
        </div>

        <div className="clay-card rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-stone-900">Welcome back</h2>
            <p className="text-xs text-stone-500 mt-1 font-medium">Sign in with your Google account to access dashboard</p>
          </div>

          <div className="space-y-4">

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 rounded-2xl border border-stone-200/90 bg-white py-3.5 px-4 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-50 active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              onClick={handleDevLogin}
              className="clay-button-primary w-full flex items-center justify-center space-x-2 rounded-2xl py-3.5 px-4 text-xs font-extrabold text-stone-900 shadow-md active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-amber-800" />
              <span>Demo Quick Sign-In</span>
              <ArrowRight className="h-4 w-4 text-amber-800" />
            </button>
          </div>

          <div className="mt-8 border-t border-stone-200/70 pt-6 space-y-3">
            <div className="flex items-center text-xs font-semibold text-stone-600">
              <CheckCircle2 className="mr-2.5 h-4 w-4 text-emerald-600 shrink-0" />
              BullMQ + Redis Persistent Job Scheduler
            </div>
            <div className="flex items-center text-xs font-semibold text-stone-600">
              <Shield className="mr-2.5 h-4 w-4 text-amber-700 shrink-0" />
              Redis Hourly Rate Limiting & Concurrency Guard
            </div>
            <div className="flex items-center text-xs font-semibold text-stone-600">
              <Zap className="mr-2.5 h-4 w-4 text-amber-600 shrink-0" />
              Server Restart Resilience & Ethereal SMTP
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400 font-medium">
          ReachInbox Software Development Intern Hiring Assignment
        </p>
      </div>
    </div>
  );
};
