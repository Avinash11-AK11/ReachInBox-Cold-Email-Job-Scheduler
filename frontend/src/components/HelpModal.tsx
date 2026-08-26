import React, { useState } from 'react';
import { X, Send, Headset, CheckCircle2, AlertCircle, Sparkles, LifeBuoy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scheduleCampaignApi } from '../services/api';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const [senderName, setSenderName] = useState(user?.name || 'ReachInbox Demo User');
  const [senderEmail, setSenderEmail] = useState(user?.email || 'demo.user@reachinbox.ai');
  const [topic, setTopic] = useState('Technical Support');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please provide both a subject and details message.');
      return;
    }

    setError(null);
    setLoading(true);

    try {

      await scheduleCampaignApi({
        subject: `[SUPPORT TICKET] - ${topic}: ${subject}`,
        body: `SUPPORT TICKET REQUEST\n-----------------------\nFrom Name: ${senderName}\nFrom Email: ${senderEmail}\nTopic: ${topic}\nSubmitted At: ${new Date().toLocaleString()}\n\nMESSAGE DETAILS:\n${message}`,
        recipients: ['chavdaavinsh24@gmail.com'],
        startTime: new Date().toISOString(),
        delayBetweenEmails: 1000,
        hourlyLimit: 100,
      });

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setSubject('');
        setMessage('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit support ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">

      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-3xl border border-stone-200/90 bg-white shadow-2xl overflow-hidden text-stone-900 flex flex-col animate-in zoom-in-95 duration-150 select-none z-50">

        <div className="flex items-center justify-between border-b border-stone-200/80 px-6 py-4 bg-[#F9F8F6]">
          <div className="flex items-center space-x-3">
            <div className="clay-icon-pill h-10 w-10 rounded-2xl flex items-center justify-center shadow-xs">
              <Headset className="h-5 w-5 text-amber-900" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">Contact Support</h2>
              <p className="text-xs text-stone-400 font-medium">Direct inquiry line to chavdaavinsh24@gmail.com</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-200/80 hover:text-stone-800 transition"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {sentSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto stroke-[2.5]" />
              <h3 className="font-extrabold text-emerald-950 text-base">Support Ticket Sent!</h3>
              <p className="text-xs text-emerald-800 font-medium max-w-xs mx-auto leading-relaxed">
                Your inquiry has been dispatched directly to <span className="font-bold underline">chavdaavinsh24@gmail.com</span>. Our technical team will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Your Name</span>
                  <span className="text-stone-900 font-bold truncate block">{senderName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Your Email</span>
                  <span className="text-stone-900 font-bold truncate block">{senderEmail}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">Support Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/60 px-4 py-3 text-xs font-bold text-stone-900 focus:border-stone-400 focus:bg-white focus:outline-none transition shadow-xs"
                >
                  <option value="Technical Support">Technical Support & API Issue</option>
                  <option value="Campaign & Queue Help">Campaign & Queue Scheduling</option>
                  <option value="Account & Deliverability">Deliverability & Account Inquiry</option>
                  <option value="Urgent Bug Report">Urgent Bug Report</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your question or issue"
                  className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/60 px-4 py-3 text-xs font-bold text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none transition shadow-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue, feedback, or request in detail..."
                  className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/60 px-4 py-3 text-xs font-medium text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none transition shadow-xs"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-stone-400 font-medium pt-1">
                <LifeBuoy className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                <span>Ticket will be sent directly to <span className="font-bold text-stone-700">chavdaavinsh24@gmail.com</span></span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition text-xs font-bold shadow-sm cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="clay-button-primary flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-stone-900 shadow-md hover:scale-[1.02] active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Support Ticket</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
