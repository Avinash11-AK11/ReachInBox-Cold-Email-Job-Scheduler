import React, { useState } from 'react';
import { ScheduledEmail, EmailStats } from '../types';
import { deleteScheduledEmailApi } from '../services/api';
import { 
  Calendar, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Send,
  Mail,
  Heart,
  Gift,
  Megaphone,
  CalendarDays,
  Clock,
  BarChart2,
  Trash2,
  Check,
  X
} from 'lucide-react';
import totalEmailImg from '../assets/home/total_email.png';
import scheduledImg from '../assets/home/sheduled.png';
import todayImg from '../assets/sheduled_email/today.png';
import totalRecipientsImg from '../assets/sheduled_email/total.png';

interface ScheduledEmailsViewProps {
  emails: ScheduledEmail[];
  stats: EmailStats;
  loading?: boolean;
  onComposeClick: () => void;
  onRefresh: () => void;
}

export const ScheduledEmailsView: React.FC<ScheduledEmailsViewProps> = ({
  emails,
  stats,
  loading,
  onComposeClick,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'All Dates' | 'Today' | 'This Week' | 'Next 30 Days'>('All Dates');
  const [statusFilter, setStatusFilter] = useState<'All' | 'SCHEDULED' | 'PROCESSING'>('All');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isPerPageOpen, setIsPerPageOpen] = useState(false);
  
  const [perPage, setPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Dynamic real data calculation from MySQL DB
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const todayCount = emails.filter(e => {
    const d = new Date(e.scheduledFor);
    return d.toDateString() === now.toDateString();
  }).length;

  const thisWeekCount = emails.filter(e => {
    const d = new Date(e.scheduledFor);
    return d >= now && d <= weekLater;
  }).length;

  const totalScheduledCount = stats.scheduled;
  const totalRecipientsCount = stats.total;

  // Filter emails based on selected Date Range and Status
  const filteredRawEmails = emails.filter(e => {
    const d = new Date(e.scheduledFor);
    if (dateRange === 'Today' && d.toDateString() !== now.toDateString()) return false;
    if (dateRange === 'This Week' && (d < now || d > weekLater)) return false;
    if (dateRange === 'Next 30 Days' && (d < now || d > thirtyDaysLater)) return false;
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    return true;
  });

  // Map real scheduled emails from MySQL Database
  const displayRows = filteredRawEmails.map((e, idx) => ({
    id: e.id,
    campaignName: e.subject.split(' ')[0] + ' Campaign',
    subject: e.subject,
    recipientCount: '1',
    fileName: e.recipient,
    rawScheduledDate: new Date(e.scheduledFor),
    scheduledTime: new Date(e.scheduledFor).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    delay: e.campaign?.delayBetweenEmails ? `${e.campaign.delayBetweenEmails / 1000} sec` : '2 sec',
    hourlyLimit: (e.campaign as any)?.hourlyLimit ? `${(e.campaign as any).hourlyLimit} emails/hour` : '100 emails/hour',
    status: e.status,
    icon: [Send, Mail, Heart, Gift, Megaphone][idx % 5],
    bgColor: [
      'bg-purple-100/80 text-purple-600',
      'bg-emerald-100/80 text-emerald-600',
      'bg-pink-100/80 text-pink-600',
      'bg-amber-100/80 text-amber-600',
      'bg-blue-100/80 text-blue-600',
    ][idx % 5],
  }));

  const filteredRows = displayRows.filter(row => 
    row.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Slice Logic
  const totalPages = Math.ceil(filteredRows.length / perPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, filteredRows.length);
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

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

  const handleDeleteRow = async (id: string) => {
    setDeletingId(id);
    setActiveMenuId(null);
    try {
      await deleteScheduledEmailApi(id);
      onRefresh();
    } catch (err) {
      console.error('Error deleting scheduled email:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 select-none pb-12">
      
      {/* 4 Stat Overview Cards matching real database values */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Scheduled */}
        <div className="clay-card rounded-3xl p-6 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-xs font-semibold text-stone-500">Total Scheduled</p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
              {totalScheduledCount}
            </h3>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">All campaigns</p>
          </div>

          <div className="shrink-0 relative flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-[#FAF4EB]/90 via-[#F3E7D5]/50 to-transparent blur-xl pointer-events-none" />
            <img
              src={totalEmailImg}
              alt="Total Scheduled"
              className="h-24 w-24 object-contain filter drop-shadow-[0_10px_20px_rgba(170,140,110,0.25)] relative z-10 transform hover:scale-105 transition"
            />
          </div>
        </div>

        {/* Card 2: Scheduled Today */}
        <div className="clay-card rounded-3xl p-6 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-xs font-semibold text-stone-500">Scheduled Today</p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
              {todayCount}
            </h3>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">Campaigns</p>
          </div>

          <div className="shrink-0 relative flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-emerald-100/80 via-emerald-50/40 to-transparent blur-xl pointer-events-none" />
            <img
              src={todayImg}
              alt="Scheduled Today"
              className="h-24 w-24 object-contain filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.25)] relative z-10 transform hover:scale-105 transition"
            />
          </div>
        </div>

        {/* Card 3: Scheduled This Week */}
        <div className="clay-card rounded-3xl p-6 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-xs font-semibold text-stone-500">Scheduled This Week</p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
              {thisWeekCount}
            </h3>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">Campaigns</p>
          </div>

          <div className="shrink-0 relative flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-[#FAF4EB]/90 via-[#F3E7D5]/50 to-transparent blur-xl pointer-events-none" />
            <img
              src={scheduledImg}
              alt="Scheduled This Week"
              className="h-24 w-24 object-contain filter drop-shadow-[0_10px_20px_rgba(170,140,110,0.25)] relative z-10 transform hover:scale-105 transition"
            />
          </div>
        </div>

        {/* Card 4: Total Recipients */}
        <div className="clay-card rounded-3xl p-6 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-xs font-semibold text-stone-500">Total Recipients</p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
              {totalRecipientsCount}
            </h3>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">Across all campaigns</p>
          </div>

          <div className="shrink-0 relative flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-gradient-to-tr from-purple-100/80 via-purple-50/40 to-transparent blur-xl pointer-events-none" />
            <img
              src={totalRecipientsImg}
              alt="Total Recipients"
              className="h-24 w-24 object-contain filter drop-shadow-[0_10px_20px_rgba(168,85,247,0.25)] relative z-10 transform hover:scale-105 transition"
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
            placeholder="Search by subject, campaign name or recipients..."
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
          
          {/* Interactive Date Range Dropdown Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsDateDropdownOpen(!isDateDropdownOpen);
                setIsFilterDropdownOpen(false);
                setIsPerPageOpen(false);
              }}
              className="flex items-center space-x-2 rounded-2xl bg-white border border-stone-200/80 px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 transition"
            >
              <Calendar className="h-3.5 w-3.5 text-stone-500" />
              <span>{dateRange}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Range Options Menu */}
            {isDateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50">
                {(['All Dates', 'Today', 'This Week', 'Next 30 Days'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      setDateRange(option);
                      setCurrentPage(1);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-left transition ${
                      dateRange === option ? 'bg-amber-50 text-amber-900' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{option}</span>
                    {dateRange === option && <Check className="h-3.5 w-3.5 text-amber-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Status Filter Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                setIsDateDropdownOpen(false);
                setIsPerPageOpen(false);
              }}
              className="flex items-center space-x-2 rounded-2xl bg-white border border-stone-200/80 px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 transition"
            >
              <Filter className="h-3.5 w-3.5 text-stone-500" />
              <span>Filter {statusFilter !== 'All' ? `(${statusFilter})` : ''}</span>
            </button>

            {/* Status Filter Options Menu */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50">
                {[
                  { label: 'All Statuses', val: 'All' },
                  { label: 'Scheduled Only', val: 'SCHEDULED' },
                  { label: 'Processing Only', val: 'PROCESSING' },
                ].map(item => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setStatusFilter(item.val as any);
                      setCurrentPage(1);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-left transition ${
                      statusFilter === item.val ? 'bg-amber-50 text-amber-900' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {statusFilter === item.val && <Check className="h-3.5 w-3.5 text-amber-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Scheduled Emails Data Table */}
      <div className="clay-card rounded-3xl shadow-sm relative z-10">
        <div className="overflow-x-auto rounded-3xl [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/80 uppercase tracking-wider text-stone-500 font-bold text-[10px]">
              <tr>
                <th className="px-6 py-4">CAMPAIGN / SUBJECT</th>
                <th className="px-6 py-4">RECIPIENTS</th>
                <th className="px-6 py-4">SCHEDULED TIME ↕</th>
                <th className="px-6 py-4">DELAY BETWEEN</th>
                <th className="px-6 py-4">HOURLY LIMIT</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 text-stone-800 font-medium">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-400 font-medium">
                    No scheduled emails match your query. Click <span className="font-bold text-stone-700">+ Compose New Email</span> to schedule a campaign.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const IconComponent = row.icon;
                  const isDeleting = deletingId === row.id;
                  const isActive = activeMenuId === row.id;

                  return (
                    <tr 
                      key={row.id} 
                      className={`transition ${isActive ? 'relative z-30 bg-stone-50' : 'hover:bg-stone-50/80'} ${isDeleting ? 'opacity-40 animate-pulse' : ''}`}
                    >
                      {/* Campaign / Subject */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 ${row.bgColor}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-stone-900 text-xs">{row.campaignName}</p>
                            <p className="text-[11px] text-stone-400 font-medium mt-0.5">{row.subject}</p>
                          </div>
                        </div>
                      </td>

                      {/* Recipients */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-extrabold text-stone-900 text-xs">{row.recipientCount}</p>
                          <p className="text-[11px] text-stone-400 font-medium mt-0.5">{row.fileName}</p>
                        </div>
                      </td>

                      {/* Scheduled Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 text-stone-700">
                          <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                          <span className="font-semibold text-xs">{row.scheduledTime}</span>
                        </div>
                      </td>

                      {/* Delay Between */}
                      <td className="px-6 py-4 text-stone-700 font-semibold whitespace-nowrap">
                        {row.delay}
                      </td>

                      {/* Hourly Limit */}
                      <td className="px-6 py-4 text-stone-700 font-semibold whitespace-nowrap">
                        {row.hourlyLimit}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1.5 rounded-full bg-[#FAF3E8] border border-[#ECDDBF] px-3 py-1 text-[11px] font-bold text-amber-900">
                          <Clock className="h-3 w-3 text-amber-700 animate-spin" />
                          <span>Scheduled</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap relative">
                        <button 
                          onClick={() => setActiveMenuId(isActive ? null : row.id)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-stone-100/80 text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isActive && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setActiveMenuId(null)} 
                            />
                            <div className="absolute right-6 top-full mt-1 w-44 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 text-left">
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                              >
                                <Trash2 className="h-4 w-4 text-rose-500" />
                                <span>Cancel Campaign</span>
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
                setIsFilterDropdownOpen(false);
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
    </div>
  );
};
