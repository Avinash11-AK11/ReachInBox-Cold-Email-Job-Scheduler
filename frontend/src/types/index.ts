export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
}

export type EmailStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';

export interface ScheduledEmail {
  id: string;
  campaignId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledFor: string;
  status: EmailStatus;
  attempts: number;
  errorMessage?: string | null;
  previewUrl?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  campaign?: {
    subject: string;
    delayBetweenEmails?: number;
  };
}

export interface EmailStats {
  total: number;
  scheduled: number;
  sent: number;
  failed: number;
}

export interface ScheduleCampaignPayload {
  subject: string;
  body: string;
  recipients?: string[];
  file?: File;
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
}
