import React, { useState } from 'react';
import { X, Send, Clock, Sparkles, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
import { LeadUploader } from './LeadUploader';
import { extractAndDeduplicateEmails } from '../utils/emailUtils';
import { scheduleCampaignApi } from '../services/api';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [manualRecipients, setManualRecipients] = useState('');
  const [parsedFileEmails, setParsedFileEmails] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  
  // Schedule settings
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 2); // default 2 minutes in future
    return now.toISOString().slice(0, 16);
  });
  const [delayBetweenEmails, setDelayBetweenEmails] = useState(2000); // 2 seconds
  const [hourlyLimit, setHourlyLimit] = useState(100); // 100 per hour

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Combine manual text area + uploaded file emails
  const manualList = extractAndDeduplicateEmails(manualRecipients);
  const allUniqueEmails = Array.from(new Set([...manualList, ...parsedFileEmails]));

  const handleLoadSample = () => {
    setSubject('Automated Cold Outreach Demo Campaign');
    setBody('Hi {{name}},\n\nWe would love to introduce ReachInbox to scale your email outreach automation.\n\nBest regards,\nReachInbox Team');
    setManualRecipients('chavdaavinash24@gmail.com, demo.lead1@company.com, demo.lead2@outreach.org');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setError('Please provide a subject and email body.');
      return;
    }

    if (allUniqueEmails.length === 0 && !selectedFile) {
      setError('Please upload a leads file or enter at least one recipient email.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await scheduleCampaignApi({
        subject,
        body,
        recipients: allUniqueEmails,
        file: selectedFile,
        startTime: new Date(startTime).toISOString(),
        delayBetweenEmails: Number(delayBetweenEmails),
        hourlyLimit: Number(hourlyLimit),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to schedule campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-stone-200/90 bg-white shadow-2xl overflow-hidden text-stone-900 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 select-none z-50">
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-200/80 px-6 py-4 bg-[#F9F8F6] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="clay-icon-pill h-10 w-10 rounded-2xl flex items-center justify-center shadow-xs">
              <Sparkles className="h-5 w-5 text-amber-900" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">Compose & Schedule Campaign</h2>
              <p className="text-xs text-stone-400 font-medium">Configure email outreach queue parameters</p>
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

        {/* Modal Form Scrollable Area */}
        <form id="compose-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}


          {/* Subject */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              Email Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Scaling cold outreach with automated scheduling"
              className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/60 px-4 py-3 text-xs font-bold text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none transition shadow-xs"
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              Email Body <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi {{name}}, We'd love to introduce ReachInbox..."
              className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/60 px-4 py-3 text-xs font-medium text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none transition shadow-xs"
              required
            />
          </div>

          {/* Lead File Upload */}
          <LeadUploader
            onLeadsExtracted={(emails, file) => {
              setParsedFileEmails(emails);
              setSelectedFile(file);
            }}
            detectedCount={allUniqueEmails.length}
          />

          {/* Manual Recipients Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              Or Enter Recipient Emails (Comma or Newline separated)
            </label>
            <textarea
              rows={2}
              value={manualRecipients}
              onChange={(e) => setManualRecipients(e.target.value)}
              placeholder="john@company.com, alice@outreach.org"
              className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/60 px-4 py-3 text-xs font-medium text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none transition shadow-xs"
            />
          </div>

          {/* Scheduling Configuration Controls */}
          <div className="rounded-2xl border border-stone-200/90 bg-[#FAF9F6] p-4 space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center">
              <Clock className="mr-1.5 h-4 w-4 text-amber-900" />
              Scheduling & Rate Limit Controls
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Start Time */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/90 bg-white px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none shadow-xs"
                  required
                />
              </div>

              {/* Inter-email Delay */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  Delay Between Sends (ms)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={delayBetweenEmails}
                  onChange={(e) => setDelayBetweenEmails(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200/90 bg-white px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none shadow-xs"
                  required
                />
                <span className="text-[10px] text-stone-400 block font-medium">e.g. 2000ms = 2s</span>
              </div>

              {/* Hourly Limit */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  Max Emails / Hour
                </label>
                <input
                  type="number"
                  min="1"
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200/90 bg-white px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none shadow-xs"
                  required
                />
                <span className="text-[10px] text-stone-400 block font-medium">Redis rate-limit cap</span>
              </div>
            </div>
          </div>
        </form>

        {/* Pinned Sticky Footer Actions Bar */}
        <div className="border-t border-stone-200/80 bg-[#F9F8F6] px-6 py-4 flex items-center justify-between shrink-0 z-20">
          {/* Detected Recipient Count */}
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-700">
            <Users className="h-4 w-4 text-stone-500" />
            <span>
              {allUniqueEmails.length === 0 ? (
                <span className="text-stone-400 font-medium">No recipients selected</span>
              ) : (
                <span className="text-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline mr-1" />
                  {allUniqueEmails.length} {allUniqueEmails.length === 1 ? 'Recipient' : 'Recipients'} Detected
                </span>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition shadow-sm cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="compose-form"
              disabled={loading || allUniqueEmails.length === 0}
              className="clay-button-primary flex items-center space-x-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold text-stone-900 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                  <span>Enqueueing Queue Jobs...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Schedule Campaign ({allUniqueEmails.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
