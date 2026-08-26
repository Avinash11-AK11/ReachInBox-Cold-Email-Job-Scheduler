import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, RefreshCw, Plus, ChevronDown, User } from 'lucide-react';

interface NavbarProps {
  onRefresh: () => void;
  refreshing: boolean;
  onComposeClick: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onNavigateProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  refreshing,
  onComposeClick,
  title,
  subtitle,
  icon,
  onNavigateProfile
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

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

  const [customAvatar, setCustomAvatar] = React.useState<string | null>(() => getCustomAvatar(user));

  React.useEffect(() => {
    const handleAvatarUpdate = () => {
      setCustomAvatar(getCustomAvatar(user));
    };
    handleAvatarUpdate();
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('avatar-updated', handleAvatarUpdate);
  }, [user?.id, user?.email]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const activeAvatar = customAvatar || (user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/')) ? user.avatar : null);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    setImgFailed(false);
  }, [activeAvatar]);

  return (
    <div className="w-full flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6 select-none">

      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 flex items-center gap-2.5">
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{title || `Welcome back, ${firstName}! 👋`}</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 font-medium mt-1">
          {subtitle || "Here's what's happening with your email outreach campaigns."}
        </p>
      </div>

      <div className="flex flex-col items-end space-y-3 shrink-0">

        <div className="flex items-center space-x-3">

          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 rounded-2xl bg-white border border-stone-200/80 px-3.5 py-1.5 shadow-sm hover:bg-stone-50 transition cursor-pointer"
              >
                {activeAvatar && !imgFailed ? (
                  <img
                    src={activeAvatar}
                    alt={user.name || 'Avatar'}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-stone-200 shrink-0"
                    onError={() => setImgFailed(true)}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-200 via-stone-200 to-amber-100 text-stone-900 font-extrabold text-xs shrink-0 ring-1 ring-stone-200 shadow-xs">
                    {getInitials(user.name)}
                  </div>
                )}

                <div className="text-left text-xs hidden sm:block">
                  <p className="font-bold text-stone-900 leading-tight">{user.name || 'ReachInbox Demo User'}</p>
                  <p className="text-[11px] text-stone-400 leading-tight truncate max-w-[150px]">{user.email}</p>
                </div>

                <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-stone-100 sm:hidden">
                      <p className="font-bold text-xs text-stone-900">{user.name}</p>
                      <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                    </div>

                    {onNavigateProfile && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigateProfile();
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition text-left"
                      >
                        <User className="h-4 w-4 text-stone-500" />
                        <span>View Profile</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left border-t border-stone-100"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (refreshing) return;
              onRefresh();
            }}
            disabled={refreshing}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${
              refreshing
                ? 'bg-stone-100 border border-stone-300 text-stone-900 cursor-wait'
                : 'bg-white border border-stone-200/90 text-stone-700 hover:bg-stone-50 hover:border-stone-300 hover:shadow-md'
            }`}
            title="Sync latest campaign data from server"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 transition-transform ${
                refreshing
                  ? 'animate-spin text-amber-800'
                  : 'text-stone-600 group-hover:rotate-45'
              }`}
            />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={onComposeClick}
            className="clay-button-primary flex items-center space-x-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold text-stone-900 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Compose New Email</span>
          </button>
        </div>

      </div>
    </div>
  );
};
