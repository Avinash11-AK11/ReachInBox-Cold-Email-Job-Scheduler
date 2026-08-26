import axios from 'axios';
import { User, ScheduledEmail, EmailStats, ScheduleCampaignPayload } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchMe(): Promise<User | null> {
  try {
    const response = await api.get('/auth/me');
    return response.data.user || null;
  } catch (error) {
    return null;
  }
}

export async function logoutUser(): Promise<boolean> {
  try {
    await api.post('/auth/logout');
    return true;
  } catch (error) {
    return false;
  }
}

export async function getScheduledEmails(): Promise<ScheduledEmail[]> {
  const response = await api.get('/emails/scheduled');
  return response.data.emails || [];
}

export async function getSentEmails(): Promise<ScheduledEmail[]> {
  const response = await api.get('/emails/sent');
  return response.data.emails || [];
}

export async function getStats(): Promise<EmailStats> {
  const response = await api.get('/emails/stats');
  return response.data.stats || { total: 0, scheduled: 0, sent: 0, failed: 0 };
}

export async function deleteScheduledEmailApi(id: string): Promise<boolean> {
  try {
    await api.delete(`/emails/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete scheduled email:', error);
    return false;
  }
}

export async function scheduleCampaignApi(payload: ScheduleCampaignPayload): Promise<any> {
  const formData = new FormData();
  formData.append('subject', payload.subject);
  formData.append('body', payload.body);
  formData.append('startTime', payload.startTime);
  formData.append('delayBetweenEmails', String(payload.delayBetweenEmails));
  formData.append('hourlyLimit', String(payload.hourlyLimit));

  if (payload.recipients && payload.recipients.length > 0) {
    formData.append('recipients', JSON.stringify(payload.recipients));
  }

  if (payload.file) {
    formData.append('file', payload.file);
  }

  const response = await api.post('/emails/schedule', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function parseLeadsFromFileApi(file: File): Promise<{ count: number; emails: string[] }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/emails/parse-leads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
