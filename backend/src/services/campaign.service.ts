import { prisma } from '../lib/prisma';
import { sendEmail } from '../lib/email';
import { createBulkNotifications } from './notification.service';

interface CreateCampaignParams {
  name: string;
  subject: string;
  content: string;
  targetType: string;
  targetFilter?: any;
  scheduledAt?: Date;
  createdById?: string;
}

export async function createCampaign(params: CreateCampaignParams) {
  const recipientCount = await getRecipientCount(params.targetType, params.targetFilter);

  return prisma.emailCampaign.create({
    data: {
      name: params.name,
      subject: params.subject,
      content: params.content,
      targetType: params.targetType,
      targetFilter: params.targetFilter,
      recipientCount,
      scheduledAt: params.scheduledAt,
      status: params.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      createdById: params.createdById,
    },
  });
}

export async function getRecipientCount(targetType: string, targetFilter?: any) {
  const where: any = { isActive: true, role: 'STUDENT' };

  switch (targetType) {
    case 'JAMB':
      where.programme = 'JAMB';
      break;
    case 'WAEC':
      where.programme = 'WAEC';
      break;
    case 'NECO':
      where.programme = 'NECO';
      break;
    case 'SS3':
      where.classLevel = 'SS3';
      break;
    case 'COURSE':
      where.targetCourse = targetFilter?.course;
      break;
    case 'INSTITUTION':
      where.targetInstitution = targetFilter?.institution;
      break;
    case 'SELECTED':
      where.id = { in: targetFilter?.userIds || [] };
      break;
    case 'ALL':
    default:
      break;
  }

  return prisma.user.count({ where });
}

export async function getRecipients(targetType: string, targetFilter?: any) {
  const where: any = { isActive: true, role: 'STUDENT' };

  switch (targetType) {
    case 'JAMB':
      where.programme = 'JAMB';
      break;
    case 'WAEC':
      where.programme = 'WAEC';
      break;
    case 'NECO':
      where.programme = 'NECO';
      break;
    case 'SS3':
      where.classLevel = 'SS3';
      break;
    case 'COURSE':
      where.targetCourse = targetFilter?.course;
      break;
    case 'INSTITUTION':
      where.targetInstitution = targetFilter?.institution;
      break;
    case 'SELECTED':
      where.id = { in: targetFilter?.userIds || [] };
      break;
  }

  return prisma.user.findMany({
    where,
    select: { id: true, email: true, studentEmail: true, fullName: true },
  });
}

export async function sendCampaign(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) throw new Error('Campaign not found');

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: 'SENDING' },
  });

  const recipients = await getRecipients(campaign.targetType, campaign.targetFilter as any);

  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    try {
      const email = recipient.studentEmail || recipient.email;
      
      await sendEmail({
        to: email,
        subject: campaign.subject,
        html: campaign.content.replace(/{{name}}/g, recipient.fullName),
      });

      await prisma.campaignLog.create({
        data: {
          campaignId,
          recipientId: recipient.id,
          recipientEmail: email,
          status: 'SENT',
        },
      });

      sentCount++;
    } catch (error) {
      await prisma.campaignLog.create({
        data: {
          campaignId,
          recipientId: recipient.id,
          recipientEmail: recipient.studentEmail || recipient.email,
          status: 'FAILED',
          errorMsg: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      failedCount++;
    }
  }

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      sentCount,
      failedCount,
      deliveredCount: sentCount,
    },
  });

  return { sentCount, failedCount, total: recipients.length };
}

export async function getCampaigns(page = 1, limit = 20) {
  const [campaigns, total] = await Promise.all([
    prisma.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.emailCampaign.count(),
  ]);

  return {
    campaigns,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCampaignStats(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      _count: { select: { logs: true } },
    },
  });

  if (!campaign) throw new Error('Campaign not found');

  const logs = await prisma.campaignLog.groupBy({
    by: ['status'],
    where: { campaignId },
    _count: { status: true },
  });

  const stats = logs.reduce((acc, log) => {
    acc[log.status] = log._count.status;
    return acc;
  }, {} as Record<string, number>);

  return {
    campaign,
    stats: {
      sent: stats.SENT || 0,
      delivered: stats.DELIVERED || 0,
      opened: stats.OPENED || 0,
      failed: stats.FAILED || 0,
    },
  };
}
