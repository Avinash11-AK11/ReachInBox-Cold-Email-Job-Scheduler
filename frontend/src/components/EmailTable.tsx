import React from 'react';
import { ScheduledEmail } from '../types';
import { Mail, Clock, CheckCircle2, AlertTriangle, ExternalLink, Calendar, Plus } from 'lucide-react';
import emailIcon from '../assets/home/email_icon.png';

interface EmailTableProps {
  emails: ScheduledEmail[];
  type: 'scheduled' | 'sent';
  loading?: boolean;
  onComposeClick?: () => void;
}

export const EmailTable: React.FC<React.PropsWithChildren<EmailTableProps>> = ({
  emails,
  type,
  loading,
  onComposeClick,
}) => {
  if (loading) {
    return (
      <div className="clay-card rounded-3xl p-8 min-h-[360px] flex flex-col justify-center space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="h-4 w-48 rounded bg-stone-200" />
            <div className="h-4 w-32 rounded bg-stone-200" />
            <div className="h-4 w-24 rounded bg-stone-200" />
          </div>
        ))}
      </div>
    );
  }

  // Empty State with animated floating envelope, breathing ground shadow, radial backdrop pulse & floating spheres
  if (emails.length === 0) {
    return (
      <div className="w-full bg-[#FAF9F6]/80 border border-stone-200/80 rounded-2xl p-6 sm:p-8 h-[450px] flex flex-col items-center justify-center text-center select-none relative overflow-hidden">
        
        {/* Soft Background Radial Ambient Glow with Pulse */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-tr from-amber-100/40 via-stone-100/30 to-transparent blur-3xl animate-pulse pointer-events-none" />

        {/* 3D Envelope Container with Floating Spheres & Ground Shadow */}
        <div className="relative mb-3 flex flex-col items-center justify-center h-48 w-64">
          
          {/* Floating Sphere 1: Top Left */}
          <div className="absolute top-1 left-6 h-7 w-7 rounded-full bg-gradient-to-tr from-[#EBE0D0] via-[#F8F3EA] to-white border border-white shadow-[0_6px_16px_rgba(180,150,120,0.25)] animate-float-delayed z-20" />

          {/* Floating Sphere 2: Top Right */}
          <div className="absolute top-3 right-8 h-8 w-8 rounded-full bg-gradient-to-tr from-[#E5DAC8] via-[#F5ECE0] to-white border border-white/90 shadow-[0_8px_18px_rgba(180,150,120,0.25)] animate-float z-20" />

          {/* Main 3D Envelope Asset */}
          <img
            src={emailIcon}
            alt="No Emails"
            className="h-36 w-36 object-contain animate-float-card filter drop-shadow-[0_12px_24px_rgba(180,150,120,0.3)] relative z-10"
          />

          {/* Ground Shadow */}
          <div className="w-32 h-3 bg-gradient-to-r from-transparent via-[#C8B8A2]/50 to-transparent rounded-full blur-md animate-ground-shadow mt-[-8px] z-0" />
        </div>

        <h3 className="text-sm font-extrabold text-stone-900 relative z-10">
          {type === 'scheduled' ? 'No Scheduled Emails in Queue' : 'No Sent Email History Yet'}
        </h3>
        <p className="text-xs text-stone-400 mt-1 max-w-xs font-medium leading-relaxed relative z-10">
          {type === 'scheduled'
            ? 'Compose a campaign to add scheduled emails to the BullMQ persistent queue.'
            : 'Your sent email campaigns and delivery status logs will appear here.'}
        </p>

        {type === 'scheduled' && onComposeClick && (
          <button
            onClick={onComposeClick}
            className="clay-button-primary mt-4 flex items-center space-x-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold text-stone-900 shadow-md relative z-10 hover:scale-[1.02] active:scale-95 transition"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Compose Your First Email</span>
          </button>
        )}
      </div>
    );
  }

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-amber-100/80 text-amber-900 border-amber-300/80';
      case 'PROCESSING':
        return 'bg-blue-100/80 text-blue-900 border-blue-300/80 animate-pulse';
      case 'SENT':
        return 'bg-emerald-100/80 text-emerald-900 border-emerald-300/80';
      case 'FAILED':
        return 'bg-rose-100/80 text-rose-900 border-rose-300/80';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="w-full h-[450px] rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-xs flex flex-col">
      <div 
        className="flex-1 overflow-y-auto overflow-x-auto min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-stone-300/80 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-20 bg-[#FAF9F6] border-b border-stone-200/90 uppercase tracking-wider text-stone-500 font-bold text-[10px] shadow-xs">
            <tr>
              <th className="px-6 py-4">Recipient</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">
                {type === 'scheduled' ? 'Scheduled For' : 'Sent Timestamp'}
              </th>
              <th className="px-6 py-4">Status</th>
              {type === 'sent' && <th className="px-6 py-4">Action / Preview</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/60 text-stone-800 font-medium">
            {emails.map((email) => (
              <tr key={email.id} className="transition hover:bg-stone-50/80">
                
                {/* Recipient */}
                <td className="px-6 py-4 font-bold text-stone-900 max-w-[200px] truncate">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                    <span className="truncate">{email.recipient}</span>
                  </div>
                </td>

                {/* Subject */}
                <td className="px-6 py-4 max-w-[250px] truncate text-stone-700 font-medium">
                  {email.subject}
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-stone-500 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-stone-400" />
                    <span>
                      {type === 'scheduled'
                        ? new Date(email.scheduledFor).toLocaleString()
                        : email.sentAt
                        ? new Date(email.sentAt).toLocaleString()
                        : new Date(email.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${getBadgeStyle(
                      email.status
                    )}`}
                  >
                    {email.status === 'SCHEDULED' && <Clock className="mr-1 h-3 w-3" />}
                    {email.status === 'SENT' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {email.status === 'FAILED' && <AlertTriangle className="mr-1 h-3 w-3" />}
                    {email.status}
                  </span>
                </td>

                {/* Sent Ethereal Preview URL */}
                {type === 'sent' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {email.previewUrl ? (
                      <a
                        href={email.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-[11px] font-bold text-stone-800 border border-stone-300 hover:bg-stone-200 transition shadow-sm"
                      >
                        <span>Ethereal Preview</span>
                        <ExternalLink className="h-3 w-3 text-stone-600" />
                      </a>
                    ) : (
                      <span className="text-stone-400 italic">
                        {email.errorMessage || 'No preview URL'}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
