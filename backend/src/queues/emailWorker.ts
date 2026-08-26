import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { EMAIL_QUEUE_NAME, emailQueue, EmailJobData } from './emailQueue';
import prisma from '../config/database';
import { checkAndIncrementRateLimit } from '../utils/rateLimiter';
import { getEtherealTransporter, getPreviewUrl } from '../config/ethereal';

const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
const minDelayMs = parseInt(process.env.MIN_EMAIL_DELAY_MS || '2000', 10);
const defaultMaxPerHour = parseInt(process.env.MAX_EMAILS_PER_HOUR || '100', 10);

export function startEmailWorker() {
  console.log(`⚙️ Starting BullMQ Email Worker with concurrency = ${concurrency}...`);

  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<EmailJobData>) => {
      const { scheduledEmailId, campaignId, senderId, recipient, subject, body, hourlyLimit } = job.data;
      const maxPerHour = hourlyLimit || defaultMaxPerHour;

      console.log(`\n📨 Processing Job [${job.id}] for recipient: ${recipient}`);

      const emailRecord = await prisma.scheduledEmail.findUnique({
        where: { id: scheduledEmailId },
      });

      if (!emailRecord) {
        console.warn(`⚠️ ScheduledEmail [${scheduledEmailId}] not found in DB. Skipping.`);
        return;
      }

      if (emailRecord.status === 'SENT') {
        console.log(`✅ Email [${scheduledEmailId}] already marked SENT. Skipping (Idempotent).`);
        return;
      }

      await prisma.scheduledEmail.update({
        where: { id: scheduledEmailId },
        data: { status: 'PROCESSING', attempts: { increment: 1 } },
      });

      const rateLimitResult = await checkAndIncrementRateLimit(senderId, maxPerHour);

      if (!rateLimitResult.allowed) {
        console.warn(
          `⏳ Hourly rate limit (${maxPerHour}/hr) reached for sender [${senderId}]. ` +
          `Rescheduling job [${job.id}] to next hour (in ${Math.round(rateLimitResult.delayMs / 1000)}s)...`
        );

        await prisma.scheduledEmail.update({
          where: { id: scheduledEmailId },
          data: { status: 'SCHEDULED' },
        });

        await emailQueue.add('send-email', job.data, {
          delay: rateLimitResult.delayMs,
          jobId: `retry-ratelimit-${scheduledEmailId}-${Date.now()}`,
        });

        return;
      }

      if (minDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, minDelayMs));
      }

      try {
        const { transporter, user: senderEmail } = await getEtherealTransporter();

        const info = await transporter.sendMail({
          from: `"ReachInbox Outreach" <${senderEmail}>`,
          to: recipient,
          subject: subject,
          text: body,
          html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">${body.replace(/\n/g, '<br/>')}</div>`,
        });

        const previewUrl = getPreviewUrl(info) || null;

        await prisma.scheduledEmail.update({
          where: { id: scheduledEmailId },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            previewUrl: previewUrl ? String(previewUrl) : null,
          },
        });

        console.log(`🎉 Successfully sent email to ${recipient}! Message ID: ${info.messageId}`);
        if (previewUrl) {
          console.log(`🔗 Ethereal Preview URL: ${previewUrl}`);
        }
      } catch (sendError: any) {
        console.error(`❌ Failed to send email to ${recipient}:`, sendError.message);

        await prisma.scheduledEmail.update({
          where: { id: scheduledEmailId },
          data: {
            status: 'FAILED',
            errorMessage: sendError.message || 'SMTP sending error',
          },
        });

        throw sendError;
      }
    },
    {
      connection: redisConnection,
      concurrency: concurrency,
    }
  );

  worker.on('completed', (job) => {
    console.log(`✔ Job [${job.id}] completed.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job [${job?.id}] failed: ${err.message}`);
  });

  return worker;
}
