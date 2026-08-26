import React, { useState } from 'react';
import { EmailStats, ScheduledEmail } from '../types';
import recentActivityImg from '../assets/home/recent_activity.png';
import { Send, Clock, AlertTriangle, CheckCircle2, ArrowUpDown, ChevronDown } from 'lucide-react';

interface RightPanelProps {
  stats: EmailStats;
  recentEmails?: ScheduledEmail[];
  onNavigateTab?: (tab: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ stats, recentEmails = [] }) => {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const total = stats.total || 0;
  const sentPercent = total > 0 ? Math.round((stats.sent / total) * 100) : 0;
  const scheduledPercent = total > 0 ? Math.round((stats.scheduled / total) * 100) : 0;
  const failedPercent = total > 0 ? Math.round((stats.failed / total) * 100) : 0;

  // Calculate SVG Donut chart angles if total > 0
  const circumference = 2 * Math.PI * 42; // r=42
  const sentDash = (sentPercent / 100) * circumference;
  const scheduledDash = (scheduledPercent / 100) * circumference;
  const failedDash = (failedPercent / 100) * circumference;

  // Sort real emails dynamically based on selected sortOrder
  const sortedActivities = [...recentEmails].sort((a, b) => {
    const timeA = new Date(a.sentAt || a.updatedAt || a.scheduledFor || 0).getTime();
    const timeB = new Date(b.sentAt || b.updatedAt || b.scheduledFor || 0).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="space-y-6 select-none">
      
      {/* Delivery Overview Card */}
      <div className="clay-card rounded-3xl p-6 relative overflow-hidden select-none shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-stone-900">Delivery Overview</h3>
          <p className="text-xs text-stone-400 mt-0.5 font-medium">Real-time delivery statistics</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-6 px-2">
          
          {/* Donut Ring Indicator */}
          <div className="relative flex items-center justify-center shrink-0">
            {/* SVG Donut Ring */}
            <div className="relative h-36 w-36 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Default Empty 3D Beige Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#EBE0D0]"
                  strokeWidth="12"
                  fill="transparent"
                />

                {total > 0 && (
                  <>
                    {/* Sent (Green) */}
                    {stats.sent > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-emerald-500 transition-all duration-500"
                        strokeWidth="12"
                        strokeDasharray={`${sentDash} ${circumference}`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    )}

                    {/* Scheduled (Amber) */}
                    {stats.scheduled > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-amber-500 transition-all duration-500"
                        strokeWidth="12"
                        strokeDasharray={`${scheduledDash} ${circumference}`}
                        strokeDashoffset={`-${sentDash}`}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    )}

                    {/* Failed (Rose) */}
                    {stats.failed > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-rose-500 transition-all duration-500"
                        strokeWidth="12"
                        strokeDasharray={`${failedDash} ${circumference}`}
                        strokeDashoffset={`-${sentDash + scheduledDash}`}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    )}
                  </>
                )}
              </svg>

              {/* Inner Center Circle with Total Count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-stone-900 leading-none">{stats.total}</span>
                <span className="text-[11px] font-semibold text-stone-400 mt-1">Total</span>
              </div>
            </div>
          </div>

          {/* Stats Legend List */}
          <div className="space-y-4 text-xs flex-1 max-w-[200px] font-medium">
            
            {/* Sent Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-300 shadow-xs shrink-0" />
                <span className="font-extrabold text-stone-800">Sent</span>
              </div>
              <span className="font-bold text-stone-400">{stats.sent} ({sentPercent}%)</span>
            </div>

            {/* Scheduled Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-300 shadow-xs shrink-0" />
                <span className="font-extrabold text-stone-800">Scheduled</span>
              </div>
              <span className="font-bold text-stone-400">{stats.scheduled} ({scheduledPercent}%)</span>
            </div>

            {/* Failed Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-300 shadow-xs shrink-0" />
                <span className="font-extrabold text-stone-800">Failed</span>
              </div>
              <span className="font-bold text-stone-400">{stats.failed} ({failedPercent}%)</span>
            </div>

          </div>

        </div>
      </div>

      {/* Fixed-size Recent Activity Card */}
      <div className="clay-card rounded-3xl p-6 h-[350px] min-h-[350px] flex flex-col justify-between relative overflow-hidden select-none shadow-sm">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">Recent Activity</h3>
              <p className="text-xs text-stone-400 mt-0.5 font-medium">Your latest email campaign activity</p>
            </div>

            {sortedActivities.length > 0 && (
              <div className="flex items-center space-x-2 shrink-0">
                {/* Sort Order Dropdown Pill */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white border border-stone-200 shadow-xs text-xs font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                  >
                    <ArrowUpDown className="h-3 w-3 text-stone-500" />
                    <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                    <ChevronDown className={`h-3 w-3 text-stone-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)} />
                      <div className="absolute right-0 mt-1 w-36 rounded-2xl bg-white border border-stone-200 shadow-xl py-1.5 z-50 text-xs font-bold animate-in fade-in zoom-in-95 duration-150">
                        <button
                          onClick={() => {
                            setSortOrder('newest');
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-stone-50 transition flex items-center justify-between ${
                            sortOrder === 'newest' ? 'text-amber-900 bg-amber-50/60' : 'text-stone-700'
                          }`}
                        >
                          <span>Newest First</span>
                          {sortOrder === 'newest' && <span>✓</span>}
                        </button>
                        <button
                          onClick={() => {
                            setSortOrder('oldest');
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-stone-50 transition flex items-center justify-between ${
                            sortOrder === 'oldest' ? 'text-amber-900 bg-amber-50/60' : 'text-stone-700'
                          }`}
                        >
                          <span>Oldest First</span>
                          {sortOrder === 'oldest' && <span>✓</span>}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Counter Pill */}
                <span className="flex items-center justify-center rounded-xl bg-amber-100/90 px-2.5 py-1 text-xs font-black text-amber-950 shadow-xs border border-amber-300/80">
                  {sortedActivities.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Activity Scrollable Container with Fixed h-[255px] */}
        {sortedActivities.length > 0 ? (
          <div className="space-y-2.5 my-3 h-[255px] max-h-[255px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-stone-300/80 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {sortedActivities.map((activity) => {
              const eventDate = new Date(activity.sentAt || activity.scheduledFor || activity.updatedAt);
              const eventTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-stone-200/80 bg-stone-50/60 hover:bg-white hover:border-stone-300 hover:shadow-xs transition"
                >
                  <div className="flex items-center space-x-3 truncate">
                    {/* Status Icon */}
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                      activity.status === 'SENT' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : activity.status === 'SCHEDULED'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {activity.status === 'SENT' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : activity.status === 'SCHEDULED' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </div>

                    {/* Email & Subject */}
                    <div className="truncate text-xs">
                      <p className="font-extrabold text-stone-900 truncate">
                        {activity.recipient}
                      </p>
                      <p className="text-[11px] text-stone-400 font-semibold truncate max-w-[180px]">
                        {activity.subject}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Time */}
                  <div className="text-right shrink-0 ml-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      activity.status === 'SENT'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : activity.status === 'SCHEDULED'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {activity.status === 'SENT' ? 'Sent' : activity.status === 'SCHEDULED' ? 'Scheduled' : 'Failed'}
                    </span>
                    <p className="text-[10px] text-stone-400 font-bold mt-0.5">{eventTime}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Default Empty State Illustration */
          <div className="flex flex-col items-center justify-center py-4 text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-gradient-to-tr from-[#F7EFE4]/60 via-[#F3E7D5]/40 to-transparent blur-2xl pointer-events-none" />

            <div className="relative mb-3 flex flex-col items-center justify-center h-32 w-36">
              <div className="absolute bottom-1 -left-2 h-7 w-7 rounded-full bg-gradient-to-tr from-[#EBE0D0] via-[#F8F3EA] to-white border border-white shadow-[0_6px_16px_rgba(180,150,120,0.25)] animate-float-delayed z-20" />
              <div className="absolute top-0 -right-2 h-5 w-5 rounded-full bg-gradient-to-tr from-[#E5DAC8] via-[#F5ECE0] to-white border border-white/90 shadow-[0_4px_10px_rgba(180,150,120,0.2)] animate-float z-20" />

              <img
                src={recentActivityImg}
                alt="Recent Activity"
                className="h-28 w-28 object-contain animate-float-card filter drop-shadow-[0_12px_24px_rgba(170,140,110,0.25)] relative z-10"
              />

              <div className="w-24 h-2.5 bg-gradient-to-r from-transparent via-[#C8B8A2]/50 to-transparent rounded-full blur-md animate-ground-shadow mt-[-4px] z-0" />
            </div>

            <p className="text-xs font-extrabold text-stone-800 relative z-10">No recent activity</p>
            <p className="text-[11px] text-stone-400 mt-0.5 font-medium relative z-10">Your activity will appear here</p>
          </div>
        )}
      </div>

    </div>
  );
};
