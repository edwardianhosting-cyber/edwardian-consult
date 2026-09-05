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
  const where: any = { isActive: true };

  switch (targetType) {
    case 'JAMB':
      where.role = 'STUDENT';
      where.programme = 'JAMB';
      break;
    case 'WAEC':
      where.role = 'STUDENT';
      where.programme = 'WAEC';
      break;
    case 'NECO':
      where.role = 'STUDENT';
      where.programme = 'NECO';
      break;
    case 'SS3':
      where.role = 'STUDENT';
      where.classLevel = 'SS3';
      break;
    case 'COURSE':
      where.role = 'STUDENT';
      where.targetCourse = targetFilter?.course;
      break;
    case 'INSTITUTION':
      where.role = 'STUDENT';
      where.targetInstitution = targetFilter?.institution;
      break;
    case 'SELECTED':
      where.role = 'STUDENT';
      where.id = { in: targetFilter?.userIds || [] };
      break;
    case 'PARENTS':
      where.role = 'STUDENT';
      where.parentEmail = { not: null };
      break;
    case 'ALL':
    default:
      where.role = 'STUDENT';
      break;
  }

  return prisma.user.count({ where });
}

export async function getRecipients(targetType: string, targetFilter?: any) {
  const where: any = { isActive: true };

  switch (targetType) {
    case 'JAMB':
      where.role = 'STUDENT';
      where.programme = 'JAMB';
      break;
    case 'WAEC':
      where.role = 'STUDENT';
      where.programme = 'WAEC';
      break;
    case 'NECO':
      where.role = 'STUDENT';
      where.programme = 'NECO';
      break;
    case 'SS3':
      where.role = 'STUDENT';
      where.classLevel = 'SS3';
      break;
    case 'COURSE':
      where.role = 'STUDENT';
      where.targetCourse = targetFilter?.course;
      break;
    case 'INSTITUTION':
      where.role = 'STUDENT';
      where.targetInstitution = targetFilter?.institution;
      break;
    case 'SELECTED':
      where.role = 'STUDENT';
      where.id = { in: targetFilter?.userIds || [] };
      break;
    case 'PARENTS':
      where.role = 'STUDENT';
      where.parentEmail = { not: null };
      break;
    case 'ALL':
    default:
      where.role = 'STUDENT';
      break;
  }

  return prisma.user.findMany({
    where,
    select: { id: true, email: true, studentEmail: true, fullName: true, parentEmail: true },
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
      let email: string;
      if (campaign.targetType === 'PARENTS') {
        email = recipient.parentEmail || recipient.studentEmail || recipient.email;
      } else {
        email = recipient.studentEmail || recipient.email;
      }

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
      const email = campaign.targetType === 'PARENTS'
        ? recipient.parentEmail || recipient.studentEmail || recipient.email
        : recipient.studentEmail || recipient.email;

      await prisma.campaignLog.create({
        data: {
          campaignId,
          recipientId: recipient.id,
          recipientEmail: email,
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

export async function updateCampaign(id: string, data: Partial<CreateCampaignParams>) {
  return prisma.emailCampaign.update({
    where: { id },
    data,
  });
}

export async function deleteCampaign(id: string) {
  await prisma.campaignLog.deleteMany({ where: { campaignId: id } });
  return prisma.emailCampaign.delete({ where: { id } });
}
