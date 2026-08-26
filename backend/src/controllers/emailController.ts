import { Request, Response } from 'express';
import prisma from '../config/database';
import { emailQueue } from '../queues/emailQueue';
import { extractAndDeduplicateEmails } from '../utils/leadParser';

export async function scheduleCampaign(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const { subject, body, recipients, startTime, delayBetweenEmails = 2000, hourlyLimit = 100 } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ success: false, message: 'Subject and body are required.' });
    }

    let emailList: string[] = [];

    if (Array.isArray(recipients)) {
      emailList = extractAndDeduplicateEmails(recipients.join('\n'));
    } else if (typeof recipients === 'string') {
      emailList = extractAndDeduplicateEmails(recipients);
    }

    if (req.file) {
      const fileContent = req.file.buffer.toString('utf-8');
      const parsedFromFile = extractAndDeduplicateEmails(fileContent);
      emailList = Array.from(new Set([...emailList, ...parsedFromFile]));
    }

    if (emailList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient email addresses detected.',
      });
    }

    const campaignStartTime = startTime ? new Date(startTime) : new Date();

    // Find or create default SenderAccount for user
    let senderAccount = await prisma.senderAccount.findFirst({
      where: { userId: user.id },
    });

    if (!senderAccount) {
      senderAccount = await prisma.senderAccount.create({
        data: {
          userId: user.id,
          email: user.email || 'outreach@reachinbox.ai',
          name: user.name || 'Outreach Manager',
          host: process.env.ETHEREAL_HOST || 'smtp.ethereal.email',
          port: parseInt(process.env.ETHEREAL_PORT || '587', 10),
          username: process.env.ETHEREAL_USER || 'ethereal-user',
          password: process.env.ETHEREAL_PASS || 'ethereal-pass',
        },
      });
    }

    // 1. Transaction to save Campaign and ScheduledEmail records
    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        subject,
        body,
        startTime: campaignStartTime,
        delayBetweenEmails: Number(delayBetweenEmails),
        hourlyLimit: Number(hourlyLimit),
        totalRecipients: emailList.length,
      },
    });

    const now = Date.now();
    const baseStartTimeMs = campaignStartTime.getTime();
    const startDelayMs = Math.max(0, baseStartTimeMs - now);
    const delayStep = Number(delayBetweenEmails);

    const scheduledEmailData = emailList.map((recipient, index) => {
      const recipientScheduledTime = new Date(baseStartTimeMs + index * delayStep);
      return {
        campaignId: campaign.id,
        recipient,
        subject,
        body,
        scheduledFor: recipientScheduledTime,
        status: 'SCHEDULED' as const,
      };
    });

    await prisma.scheduledEmail.createMany({
      data: scheduledEmailData,
    });

    // Fetch created records to get IDs for BullMQ job queue
    const createdEmails = await prisma.scheduledEmail.findMany({
      where: { campaignId: campaign.id },
      orderBy: { createdAt: 'asc' },
    });

    // 2. Add BullMQ delayed jobs
    const bulkJobs = createdEmails.map((emailRecord, index) => {
      const jobDelay = startDelayMs + index * delayStep;
      return {
        name: 'send-email',
        data: {
          scheduledEmailId: emailRecord.id,
          campaignId: campaign.id,
          senderId: senderAccount.id,
          recipient: emailRecord.recipient,
          subject: emailRecord.subject,
          body: emailRecord.body,
          delayBetweenEmails: Number(delayBetweenEmails),
          hourlyLimit: Number(hourlyLimit),
        },
        opts: {
          delay: jobDelay,
          jobId: `email-${emailRecord.id}`,
        },
      };
    });

    await emailQueue.addBulk(bulkJobs);

    console.log(
      `🚀 Created Campaign [${campaign.id}] with ${emailList.length} emails scheduled starting at ${campaignStartTime.toISOString()}`
    );

    return res.json({
      success: true,
      message: `Successfully scheduled ${emailList.length} emails!`,
      campaignId: campaign.id,
      totalRecipients: emailList.length,
      startTime: campaignStartTime,
    });
  } catch (error: any) {
    console.error('❌ Error scheduling campaign:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule campaign.',
      error: error.message,
    });
  }
}

export async function getScheduledEmails(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const emails = await prisma.scheduledEmail.findMany({
      where: {
        campaign: { userId: user.id },
        status: { in: ['SCHEDULED', 'PROCESSING'] },
      },
      orderBy: { scheduledFor: 'asc' },
      include: {
        campaign: { select: { subject: true, delayBetweenEmails: true, hourlyLimit: true } },
      },
    });

    return res.json({
      success: true,
      emails,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSentEmails(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const emails = await prisma.scheduledEmail.findMany({
      where: {
        campaign: { userId: user.id },
        status: { in: ['SENT', 'FAILED'] },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        campaign: { select: { subject: true } },
      },
    });

    return res.json({
      success: true,
      emails,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStats(req: Request, res: Response) {
  try {
    const user = req.user as any;

    const [total, scheduled, sent, failed] = await Promise.all([
      prisma.scheduledEmail.count({ where: { campaign: { userId: user.id } } }),
      prisma.scheduledEmail.count({
        where: { campaign: { userId: user.id }, status: { in: ['SCHEDULED', 'PROCESSING'] } },
      }),
      prisma.scheduledEmail.count({ where: { campaign: { userId: user.id }, status: 'SENT' } }),
      prisma.scheduledEmail.count({ where: { campaign: { userId: user.id }, status: 'FAILED' } }),
    ]);

    return res.json({
      success: true,
      stats: {
        total,
        scheduled,
        sent,
        failed,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteScheduledEmail(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const emailRecord = await prisma.scheduledEmail.findFirst({
      where: { id, campaign: { userId: user.id } },
    });

    if (!emailRecord) {
      return res.status(404).json({ success: false, message: 'Scheduled email not found.' });
    }

    // Try to remove from BullMQ queue
    try {
      const job = await emailQueue.getJob(`email-${id}`);
      if (job) await job.remove();
    } catch (err) {
      console.warn(`Could not remove job email-${id} from queue:`, err);
    }

    await prisma.scheduledEmail.delete({ where: { id } });

    return res.json({ success: true, message: 'Scheduled email canceled and deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function parseLeadsFromFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const content = req.file.buffer.toString('utf-8');
    const emails = extractAndDeduplicateEmails(content);

    return res.json({
      success: true,
      count: emails.length,
      emails,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
