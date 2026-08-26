import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { StatsCard } from '../components/StatsCard';
import { EmailTable } from '../components/EmailTable';
import { RightPanel } from '../components/RightPanel';
import { QuickTips } from '../components/QuickTips';
import { ComposeModal } from '../components/ComposeModal';
import { ScheduledEmailsView } from '../components/ScheduledEmailsView';
import { SentHistoryView } from '../components/SentHistoryView';
import { ProfileView } from '../components/ProfileView';
import { getScheduledEmails, getSentEmails, getStats } from '../services/api';
import { ScheduledEmail, EmailStats } from '../types';
import { Clock, CheckCircle2, AlertTriangle, User } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [sidebarTab, setSidebarTab] = useState<'dashboard' | 'scheduled' | 'sent' | 'profile'>('dashboard');
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent' | 'failed'>('scheduled');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<ScheduledEmail[]>([]);
  const [failedEmails, setFailedEmails] = useState<ScheduledEmail[]>([]);
  const [stats, setStats] = useState<EmailStats>({ total: 0, scheduled: 0, sent: 0, failed: 0 });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isInitial = false, isSilent = false) => {
    if (isInitial) setLoading(true);
    else if (!isSilent) setRefreshing(true);

    const startTime = Date.now();

    try {
      const [scheduledRes, sentRes, statsRes] = await Promise.all([
        getScheduledEmails(),
        getSentEmails(),
        getStats(),
      ]);

      setScheduledEmails(scheduledRes);
      setSentEmails(sentRes.filter(e => e.status === 'SENT'));
      setFailedEmails(sentRes.filter(e => e.status === 'FAILED'));
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      if (!isSilent) {
        const elapsedTime = Date.now() - startTime;
        const minSpinTime = isInitial ? 0 : 600;
        const remainingTime = Math.max(0, minSpinTime - elapsedTime);

        setTimeout(() => {
          setLoading(false);
          setRefreshing(false);
        }, remainingTime);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData(true);

    const interval = setInterval(() => {
      loadData(false, true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSidebarTabChange = (tab: typeof sidebarTab) => {
    setSidebarTab(tab);
    if (tab === 'scheduled') setActiveTab('scheduled');
    else if (tab === 'sent') setActiveTab('sent');
    else setActiveTab('scheduled');
  };

  const getDisplayedEmails = () => {
    if (activeTab === 'scheduled') return scheduledEmails;
    if (activeTab === 'sent') return sentEmails;
    return failedEmails;
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-stone-900 flex select-none">

      <Sidebar
        activeTab={sidebarTab === 'profile' ? 'dashboard' : sidebarTab}
        onTabChange={handleSidebarTabChange}
        stats={stats}
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">

        {sidebarTab === 'scheduled' ? (
          <>

            <Navbar
              title="Scheduled Emails"
              subtitle="View and manage all your scheduled email campaigns."
              icon={<Clock className="h-7 w-7 text-amber-900/80" />}
              onRefresh={() => loadData(false)}
              refreshing={refreshing}
              onComposeClick={() => setIsComposeOpen(true)}
              onNavigateProfile={() => setSidebarTab('profile')}
            />

            <ScheduledEmailsView
              emails={scheduledEmails}
              stats={stats}
              loading={loading}
              onComposeClick={() => setIsComposeOpen(true)}
              onRefresh={() => loadData(false)}
            />
          </>
        ) : sidebarTab === 'sent' ? (
          <>

            <Navbar
              title="Sent / History Log"
              subtitle="View all sent emails and their delivery status history."
              icon={<CheckCircle2 className="h-7 w-7 text-emerald-700" />}
              onRefresh={() => loadData(false)}
              refreshing={refreshing}
              onComposeClick={() => setIsComposeOpen(true)}
              onNavigateProfile={() => setSidebarTab('profile')}
            />

            <SentHistoryView
              emails={[...sentEmails, ...failedEmails]}
              stats={stats}
              loading={loading}
              onRefresh={() => loadData(false)}
            />
          </>
        ) : sidebarTab === 'profile' ? (
          <>

            <Navbar
              title="Profile"
              subtitle="Manage your account details and preferences."
              icon={<User className="h-7 w-7 text-amber-900/80" />}
              onRefresh={() => loadData(false)}
              refreshing={refreshing}
              onComposeClick={() => setIsComposeOpen(true)}
              onNavigateProfile={() => setSidebarTab('profile')}
            />

            <ProfileView stats={stats} />
          </>
        ) : (

          <>

            <Navbar
              onRefresh={() => loadData(false)}
              refreshing={refreshing}
              onComposeClick={() => setIsComposeOpen(true)}
              onNavigateProfile={() => setSidebarTab('profile')}
            />

            <StatsCard stats={stats} loading={loading} />

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'scheduled'
                    ? 'bg-[#EADDCB] text-stone-900 border border-[#DCCBB5]'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-100'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Scheduled Emails ({stats.scheduled})</span>
              </button>

              <button
                onClick={() => setActiveTab('sent')}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'sent'
                    ? 'bg-[#EADDCB] text-stone-900 border border-[#DCCBB5]'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-100'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Sent / History Log ({stats.sent})</span>
              </button>

              {stats.failed > 0 && (
                <button
                  onClick={() => setActiveTab('failed')}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                    activeTab === 'failed'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-100'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span>Failed Emails ({stats.failed})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              <div className="lg:col-span-7">
                <div className="clay-card rounded-3xl p-6 h-[564px] flex flex-col justify-between overflow-hidden select-none shadow-sm">
                  <div className="mb-3 shrink-0">
                    <h3 className="text-sm font-extrabold text-stone-900">
                      {activeTab === 'scheduled'
                        ? 'Scheduled Emails Overview'
                        : activeTab === 'sent'
                        ? 'Sent Email History Overview'
                        : 'Delivery Failures Log'}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5 font-medium">
                      {activeTab === 'scheduled'
                        ? 'Track your upcoming email campaigns'
                        : 'Review completed email dispatches and preview links'}
                    </p>
                  </div>

                  <EmailTable
                    emails={getDisplayedEmails()}
                    type={activeTab === 'scheduled' ? 'scheduled' : 'sent'}
                    loading={loading}
                    onComposeClick={() => setIsComposeOpen(true)}
                  />
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col">
                <RightPanel stats={stats} recentEmails={[...scheduledEmails, ...sentEmails, ...failedEmails]} />
              </div>

            </div>

            <QuickTips />
          </>
        )}

      </main>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSuccess={() => loadData(false)}
      />

    </div>
  );
};
