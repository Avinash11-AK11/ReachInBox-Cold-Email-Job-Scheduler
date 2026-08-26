import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export interface EmailJobData {
  scheduledEmailId: string;
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
}

export const EMAIL_QUEUE_NAME = 'emailQueue';

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
});

console.log(`📦 BullMQ Queue '${EMAIL_QUEUE_NAME}' initialized.`);
