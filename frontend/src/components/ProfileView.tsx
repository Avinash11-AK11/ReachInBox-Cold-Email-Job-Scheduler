import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EmailStats } from '../types';
import { 
  User, 
  Mail, 
  Send, 
  AlertTriangle, 
  Calendar, 
  Pencil, 
  Lock, 
  Check, 
  Moon, 
  Bell, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface ProfileViewProps {
  stats: EmailStats;
  onNavigateTab?: (tab: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ stats }) => {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.name || 'ReachInbox Demo User');
  const [emailAddress, setEmailAddress] = useState(user?.email || 'demo.user@reachinbox.ai');
  const getCustomAvatar = (usr: typeof user): string | null => {
    if (!usr) return null;
    if (usr.email) {
      const byEmail = localStorage.getItem(`custom_user_avatar_${usr.email.toLowerCase()}`);
      if (byEmail) return byEmail;
    }
    if (usr.id) {
      const byId = localStorage.getItem(`custom_user_avatar_${usr.id}`);
      if (byId) return byId;
    }
    return null;
  };

  const saveCustomAvatar = (usr: typeof user, dataUrl: string) => {
    if (!usr) return;
    if (usr.email) {
      localStorage.setItem(`custom_user_avatar_${usr.email.toLowerCase()}`, dataUrl);
    }
    if (usr.id) {
      localStorage.setItem(`custom_user_avatar_${usr.id}`, dataUrl);
    }
  };

  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => {
    const saved = getCustomAvatar(user);
    if (saved) return saved;
    if (user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/'))) {
      return user.avatar;
    }
    return null;
  });

  const [isSaved, setIsSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Sync avatar when user changes
  React.useEffect(() => {
    if (user?.name) setFullName(user.name);
    if (user?.email) setEmailAddress(user.email);
    
    const saved = getCustomAvatar(user);
    if (saved) {
      setAvatarSrc(saved);
    } else if (user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/'))) {
      setAvatarSrc(user.avatar);
    } else {
      setAvatarSrc(null);
    }
  }, [user?.id, user?.email, user?.avatar, user?.name]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarSrc(result);
        saveCustomAvatar(user, result);
        window.dispatchEvent(new Event('avatar-updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isGoogleConnected = Boolean(user?.googleId && !user.googleId.startsWith('dev-'));

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200 pb-12">

      {/* Top Profile Banner Card */}
      <div className="clay-card rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Avatar & Primary Details (Col 7) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            
            {/* Avatar Container with Edit Pencil & File Input */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-[#ECE0CF] via-[#F5ECE0] to-[#D9C7B2] border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={fullName}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarSrc(null)}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-stone-800 font-black text-3xl tracking-wider select-none bg-gradient-to-tr from-amber-200 via-stone-200 to-amber-100">
                    {getInitials(fullName)}
                  </div>
                )}
              </div>
              
              <label 
                className="h-8 w-8 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition absolute bottom-0 right-0 cursor-pointer"
                title="Choose Profile Picture"
              >
                <Pencil className="h-3.5 w-3.5" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            {/* Name, Status, Joined Info */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  {fullName}
                </h2>
                <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active Account</span>
                </span>
              </div>

              <p className="text-xs font-semibold text-stone-500">
                {emailAddress}
              </p>

              <div className="flex items-center justify-center sm:justify-start space-x-2 text-stone-400 text-xs font-medium pt-1">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Joined on May 20, 2025</span>
              </div>
            </div>

          </div>

          {/* Right Account Overview Stats Box (Col 5) */}
          <div className="lg:col-span-5 bg-stone-50/90 border border-stone-200/80 rounded-2xl p-5 space-y-3.5 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-1">
              Account Overview
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-stone-200/50">
                <div className="flex items-center space-x-2.5">
                  <div className="h-7 w-7 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-900">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-stone-700">Emails Scheduled</span>
                </div>
                <span className="font-extrabold text-stone-900 text-sm">{stats.scheduled}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-stone-200/50">
                <div className="flex items-center space-x-2.5">
                  <div className="h-7 w-7 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-900">
                    <Send className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-stone-700">Emails Sent</span>
                </div>
                <span className="font-extrabold text-stone-900 text-sm">{stats.sent}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-stone-200/50">
                <div className="flex items-center space-x-2.5">
                  <div className="h-7 w-7 rounded-xl bg-rose-100/80 flex items-center justify-center text-rose-900">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-stone-700">Emails Failed</span>
                </div>
                <span className="font-extrabold text-stone-900 text-sm">{stats.failed}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Middle Section: Account Information (Left) & Security & Authentication (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Account Information Form Card */}
        <div className="clay-card rounded-3xl p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-extrabold text-stone-900">Account Information</h3>
            <p className="text-xs text-stone-400 font-medium mt-0.5">Your personal account details.</p>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-4 text-xs font-semibold">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className="block text-stone-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 px-4 py-3 text-stone-900 font-bold focus:border-stone-400 focus:bg-white focus:outline-none transition shadow-xs"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email Address Input (Read-only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-stone-700">Email Address</label>
                <span className="text-[10px] text-stone-400 font-medium">Read-only</span>
              </div>
              <input
                type="email"
                value={emailAddress}
                disabled
                readOnly
                className="w-full rounded-2xl border border-stone-200/90 bg-stone-100/80 px-4 py-3 text-stone-500 font-bold cursor-not-allowed shadow-xs"
                placeholder="Enter email address"
              />
            </div>

            {/* Save Changes Button */}
            <div className="pt-3">
              <button
                type="submit"
                className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs transition flex items-center justify-center space-x-2 ${
                  isSaved
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'clay-button-primary shadow-sm'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-stone-700" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security & Authentication Card */}
        <div className="clay-card rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-stone-900">Security & Authentication</h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">Manage your authentication settings.</p>
            </div>

            <div className="space-y-4">
              {/* Connection Row: Google OAuth vs Demo Mode */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50">
                <div className="flex items-center space-x-3.5">
                  <div className="h-9 w-9 rounded-2xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-xs">
                    {isGoogleConnected ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-amber-700" />
                    )}
                  </div>
                  <div>
                    <p className="font-extrabold text-stone-900 text-xs">
                      {isGoogleConnected ? 'Google Account' : 'Demo Account Session'}
                    </p>
                    <p className="text-[11px] text-stone-400 font-medium">
                      {isGoogleConnected ? 'Connected via Google OAuth' : 'Sandbox Mode (No Google OAuth)'}
                    </p>
                  </div>
                </div>

                {isGoogleConnected ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-xs font-bold text-amber-900">
                    <ShieldCheck className="h-3 w-3 text-amber-700" />
                    <span>Demo Mode</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
