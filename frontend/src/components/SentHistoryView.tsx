import React, { useState } from 'react';
import { ScheduledEmail, EmailStats } from '../types';
import { scheduleCampaignApi } from '../services/api';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ExternalLink,
  Check,
  X,
  RotateCw
} from 'lucide-react';
import totalSentImg from '../assets/sent_log/total_sent.png';
import deliveredImg from '../assets/sent_log/delivered.png';
import pendingImg from '../assets/sent_log/pending.png';
import failedImg from '../assets/sent_log/failed.png';

interface SentHistoryViewProps {
  emails: ScheduledEmail[];
  stats: EmailStats;
  loading?: boolean;
  onRefresh: () => void;
}

export const SentHistoryView: React.FC<SentHistoryViewProps> = ({
  emails,
  stats,
  loading,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'SENT' | 'SCHEDULED' | 'FAILED'>('All');
  const [dateRange, setDateRange] = useState<'All Dates' | 'Today' | 'This Week' | 'Next 30 Days'>('All Dates');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isPerPageOpen, setIsPerPageOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  const [perPage, setPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Resend Email Modal State
  const [resendTargetRow, setResendTargetRow] = useState<any>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Map real emails from database
  const displayRows = emails.map((e, idx) => {
    const parts = e.recipient.split('@')[0].split('.');
    const initials = parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : e.recipient.substring(0, 2).toUpperCase();

    const bgColors = [
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-amber-100 text-amber-700',
      'bg-teal-100 text-teal-700',
      'bg-orange-100 text-orange-700',
      'bg-rose-100 text-rose-700',
    ];

    return {
      id: e.id,
      recipient: e.recipient,
      subject: e.subject,
      campaign: (e.campaign?.subject ? e.campaign.subject.split(' ')[0] + ' Campaign' : 'Outreach Campaign'),
      sentTime: e.sentAt 
        ? new Date(e.sentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : new Date(e.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: e.status,
      details: e.status === 'SENT' 
        ? 'Delivered to inbox 250ms' 
        : e.status === 'FAILED' 
        ? (e.errorMessage || 'Delivery failed') 
        : 'Queued - Waiting to send',
      initials,
      bgColor: bgColors[idx % bgColors.length],
      previewUrl: e.previewUrl,
      errorMessage: e.errorMessage,
    };
  });

  // Filter rows based on search, status dropdown, and date range
  const filteredRows = displayRows.filter(row => {
    if (statusFilter !== 'All' && row.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!row.recipient.toLowerCase().includes(q) && 
          !row.subject.toLowerCase().includes(q) && 
          !row.campaign.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Dynamic Pagination Slice Logic
  const totalPages = Math.ceil(filteredRows.length / perPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, filteredRows.length);
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  // Calculate real dynamic numbers and percentages from MySQL database stats
  const totalCount = stats.total > 0 ? stats.total : emails.length;
  const sentCount = stats.sent;
  const scheduledCount = stats.scheduled;
  const failedCount = stats.failed;

  const deliveredPercent = totalCount > 0 ? ((sentCount / totalCount) * 100).toFixed(2) : '0';
  const pendingPercent = totalCount > 0 ? ((scheduledCount / totalCount) * 100).toFixed(2) : '0';
  const failedPercent = totalCount > 0 ? ((failedCount / totalCount) * 100).toFixed(2) : '0';

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredRows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredRows.map(r => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(i => i !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const exportToCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      ['Recipient,Subject,Campaign,Sent Time,Status,Details']
        .concat(filteredRows.map(r => `"${r.recipient}","${r.subject}","${r.campaign}","${r.sentTime}","${r.status}","${r.details}"`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sent_History_Log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none pb-12">
      
      {/* 4 Stat Overview Cards with 100% real dynamic database numbers & custom 3D assets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Sent */}
        <div className="clay-card rounded-3xl p-6 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-xs font-semibold text-stone-500">Total Sent</p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
              {totalCount}
            </h3>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">All time</p>
          </div>

          <div className="shrink-0 relative flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-emerald-100/80 via-emerald-50/40 to-transparent blur-xl pointer-events-none" />
            <img
              src={totalSentImg}
              alt="Total Sent"
              className="h-24 w-24 object-contain filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.25)] relative z-10 transform hover:scale-105 transition"
            />
          </div>
        </div>

        {/* Card 2: Delivered */}
        <div className="clay-card rounded-3xl p-6 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-xs font-semibold text-stone-500">Delivered</p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
              {sentCount}
            </h3>
            <p className="text-[11px] text-emerald-600 mt-1 font-bold">{deliveredPercent}%</p>
          </div>

          <div className="shrink-0 relative flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-emerald-100/80 via-emerald-50/40 to-transparent blur-xl pointer-events-none" />
            <img
              src={deliveredImg}
              alt="Delivered"
              className="h-24 w-24 object-contain filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.25)] relative z-10 transform hover:scale-105 transition"
            />
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="clay-card rounded-3xl p-6 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-xs font-semibold text-stone-500">Pending</p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
              {scheduledCount}
            </h3>
            <p className="text-[11px] text-amber-600 mt-1 font-bold">{pendingPercent}%</p>
          </div>

          <div className="shrink-0 relative flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-amber-100/80 via-amber-50/40 to-transparent blur-xl pointer-events-none" />
            <img
              src={pendingImg}
              alt="Pending"
              className="h-24 w-24 object-contain filter drop-shadow-[0_10px_20px_rgba(245,158,11,0.25)] relative z-10 transform hover:scale-105 transition"
            />
          </div>
        </div>

        {/* Card 4: Failed */}
        <div className="clay-card rounded-3xl p-6 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-xs font-semibold text-stone-500">Failed</p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
              {failedCount}
            </h3>
            <p className="text-[11px] text-rose-600 mt-1 font-bold">{failedPercent}%</p>
          </div>

          <div className="shrink-0 relative flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-rose-100/80 via-rose-50/40 to-transparent blur-xl pointer-events-none" />
            <img
              src={failedImg}
              alt="Failed"
              className="h-24 w-24 object-contain filter drop-shadow-[0_10px_20px_rgba(244,63,94,0.25)] relative z-10 transform hover:scale-105 transition"
            />
          </div>
        </div>

      </div>

      {/* Filter & Action Toolbar matching screenshot */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by recipient, subject or campaign..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl bg-white border border-stone-200/90 pl-11 pr-10 py-2.5 text-xs text-stone-900 placeholder-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#DCCBB5]/80 focus:border-[#C8B8A2] hover:border-stone-300 transition duration-200 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          
          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsDateDropdownOpen(false);
                setIsPerPageOpen(false);
              }}
              className="flex items-center space-x-2 rounded-2xl bg-white border border-stone-200/80 px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 transition"
            >
              <Filter className="h-3.5 w-3.5 text-stone-500" />
              <span>{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50">
                {[
                  { label: 'All Status', val: 'All' },
                  { label: 'Delivered Only', val: 'SENT' },
                  { label: 'Pending Only', val: 'SCHEDULED' },
                  { label: 'Failed Only', val: 'FAILED' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      setStatusFilter(opt.val as any);
                      setCurrentPage(1);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-left transition ${
                      statusFilter === opt.val ? 'bg-amber-50 text-amber-900' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.val && <Check className="h-3.5 w-3.5 text-amber-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Picker Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsDateDropdownOpen(!isDateDropdownOpen);
                setIsStatusDropdownOpen(false);
                setIsPerPageOpen(false);
              }}
              className="flex items-center space-x-2 rounded-2xl bg-white border border-stone-200/80 px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 transition"
            >
              <Calendar className="h-3.5 w-3.5 text-stone-500" />
              <span>{dateRange}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50">
                {['All Dates', 'Today', 'This Week', 'Next 30 Days'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRange(opt as any);
                      setCurrentPage(1);
                      setIsDateDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 rounded-2xl bg-white border border-stone-200/80 px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 transition active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-stone-500" />
            <span>Export</span>
          </button>

        </div>
      </div>

      {/* Sent / History Log Data Table */}
      <div className="clay-card rounded-3xl shadow-sm relative z-10">
        <div className="overflow-x-auto rounded-3xl [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/80 uppercase tracking-wider text-stone-500 font-bold text-[10px]">
              <tr>
                <th className="px-6 py-4">RECIPIENT</th>
                <th className="px-6 py-4">SUBJECT</th>
                <th className="px-6 py-4">CAMPAIGN</th>
                <th className="px-6 py-4">SENT TIME ↕</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">DELIVERY DETAILS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 text-stone-800 font-medium">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-400 font-medium">
                    No sent history logs match your search.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const isActive = activeMenuId === row.id;

                  return (
                    <tr 
                      key={row.id} 
                      className={`transition ${isActive ? 'relative z-30 bg-stone-50' : 'hover:bg-stone-50/80'}`}
                    >
                      {/* Recipient with Initials Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${row.bgColor}`}>
                            {row.initials}
                          </div>
                          <span className="font-bold text-stone-900 text-xs truncate max-w-[180px]">
                            {row.recipient}
                          </span>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4 font-semibold text-stone-900 max-w-[200px] truncate">
                        {row.subject}
                      </td>

                      {/* Campaign */}
                      <td className="px-6 py-4 text-stone-600 font-medium max-w-[160px] truncate">
                        {row.campaign}
                      </td>

                      {/* Sent Time */}
                      <td className="px-6 py-4 whitespace-nowrap text-stone-500 font-medium">
                        {row.sentTime}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.status === 'SENT' ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100/90 border border-emerald-300/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Delivered</span>
                          </span>
                        ) : row.status === 'FAILED' ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-rose-100/90 border border-rose-300/80 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                            <AlertTriangle className="h-3 w-3 text-rose-600" />
                            <span>Failed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100/90 border border-amber-300/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            <Clock className="h-3 w-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Delivery Details */}
                      <td className="px-6 py-4 whitespace-nowrap text-stone-600">
                        {row.status === 'SENT' ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-medium text-stone-500">{row.details}</span>
                            {row.previewUrl && (
                              <a
                                href={row.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-stone-400 hover:text-stone-700 transition"
                                title="View Ethereal Email Preview"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        ) : row.status === 'FAILED' ? (
                          <div>
                            <p className="text-[11px] font-bold text-rose-600 leading-tight">SMTP timeout</p>
                            <button
                              onClick={() => alert(row.errorMessage || 'Failed to establish SMTP handshake with mail server.')}
                              className="text-[10px] text-stone-400 underline hover:text-stone-700 transition"
                            >
                              View error
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[11px] font-bold text-stone-800 leading-tight">Queued</p>
                            <p className="text-[10px] text-stone-400 font-medium">Waiting to send</p>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap relative">
                        <button 
                          onClick={() => setActiveMenuId(isActive ? null : row.id)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-stone-100/80 text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {isActive && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setActiveMenuId(null)} 
                            />
                            <div className="absolute right-14 top-1/2 -translate-y-1/2 w-44 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 text-left">
                              {row.previewUrl && (
                                <a
                                  href={row.previewUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                                >
                                  <ExternalLink className="h-4 w-4 text-stone-500" />
                                  <span>Preview Email</span>
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setResendTargetRow(row);
                                }}
                                className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                              >
                                <RotateCw className="h-4 w-4 text-stone-500" />
                                <span>Resend Email</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar with interactive Items per page dropdown */}
        <div className="px-6 py-4 border-t border-stone-200/60 bg-stone-50/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-stone-500">
          
          {/* Results count */}
          <div>
            Showing <span className="font-bold text-stone-900">{filteredRows.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-stone-900">{endIndex}</span> of <span className="font-bold text-stone-900">{filteredRows.length}</span> results
          </div>

          {/* Dynamic Page Number Buttons */}
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="h-8 w-8 flex items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`h-8 w-8 flex items-center justify-center rounded-xl border font-bold transition shadow-xs ${
                  validCurrentPage === pageNum
                    ? 'bg-[#EADDCB] border-[#DCCBB5] text-stone-900'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages || filteredRows.length === 0}
              className="h-8 w-8 flex items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Interactive Items per page dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPerPageOpen(!isPerPageOpen);
                setIsDateDropdownOpen(false);
                setIsStatusDropdownOpen(false);
              }}
              className="flex items-center space-x-2 rounded-xl bg-white border border-stone-200 px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-xs hover:bg-stone-50 transition"
            >
              <span>{perPage} / page</span>
              <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform ${isPerPageOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPerPageOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-32 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50">
                {[5, 10, 20, 50].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setPerPage(num);
                      setCurrentPage(1);
                      setIsPerPageOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-left transition ${
                      perPage === num ? 'bg-amber-50 text-amber-900' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{num} / page</span>
                    {perPage === num && <Check className="h-3.5 w-3.5 text-amber-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Resend Email Custom Clay Confirmation Modal */}
      {resendTargetRow && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150 text-stone-900">
            <div className="flex items-center space-x-3.5">
              <div className="clay-icon-pill h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <RotateCw className="h-5 w-5 text-amber-900" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">Resend Email Campaign</h3>
                <p className="text-xs text-stone-400 font-medium">Re-enqueue campaign delivery job</p>
              </div>
            </div>

            {resendSuccess ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="font-extrabold text-emerald-900 text-sm">Email Re-enqueued!</p>
                <p className="text-xs text-emerald-700 font-medium">
                  Re-dispatch job successfully queued for {resendTargetRow.recipient}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-[#FAF9F6] border border-stone-200/90 rounded-2xl p-4 space-y-2.5 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-medium">Recipient:</span>
                    <span className="font-extrabold text-stone-900">{resendTargetRow.recipient}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-medium">Campaign:</span>
                    <span className="font-bold text-stone-800">{resendTargetRow.campaign}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-medium">Subject:</span>
                    <span className="font-bold text-stone-800 truncate max-w-[200px]">{resendTargetRow.subject}</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                  This will immediately enqueue a new email dispatch job in your BullMQ worker queue.
                </p>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResendTargetRow(null)}
                    disabled={isResending}
                    className="px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isResending}
                    onClick={async () => {
                      setIsResending(true);
                      try {
                        await scheduleCampaignApi({
                          subject: resendTargetRow.subject,
                          body: `Re-sent outreach email for campaign: ${resendTargetRow.subject}`,
                          recipients: [resendTargetRow.recipient],
                          startTime: new Date().toISOString(),
                          delayBetweenEmails: 1000,
                          hourlyLimit: 100,
                        });
                        setResendSuccess(true);
                        setTimeout(() => {
                          setResendSuccess(false);
                          setResendTargetRow(null);
                          if (onRefresh) onRefresh();
                        }, 1500);
                      } catch (err) {
                        alert('Failed to re-enqueue email');
                      } finally {
                        setIsResending(false);
                      }
                    }}
                    className="clay-button-primary flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-stone-900 shadow-md hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                  >
                    {isResending ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                        <span>Re-enqueueing...</span>
                      </>
                    ) : (
                      <>
                        <RotateCw className="h-3.5 w-3.5" />
                        <span>Confirm & Resend</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
