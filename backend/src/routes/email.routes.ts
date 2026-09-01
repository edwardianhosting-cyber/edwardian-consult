import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../lib/auth';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { sendBroadcastEmail, processEmailTemplate } from '../lib/email';

const router = Router();

// Send broadcast email (admin only)
router.post('/send-broadcast', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const broadcastSchema = z.object({
      recipientType: z.enum(['all', 'target', 'unpaid']),
      targetExam: z.string().optional(),
      subject: z.string().min(1),
      message: z.string().min(1),
    });

    const validated = broadcastSchema.parse(req.body);

    let recipients: { email: string; name: string; portalId: string; parentCode: string }[] = [];

    if (validated.recipientType === 'all') {
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { email: true, fullName: true, portalId: true, parentAccessCode: true },
      });
      recipients = students.map((s) => ({
        email: s.email,
        name: s.fullName,
        portalId: s.portalId,
        parentCode: s.parentAccessCode,
      }));
    } else if (validated.recipientType === 'target' && validated.targetExam) {
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT', programme: validated.targetExam as any },
        select: { email: true, fullName: true, portalId: true, parentAccessCode: true },
      });
      recipients = students.map((s) => ({
        email: s.email,
        name: s.fullName,
        portalId: s.portalId,
        parentCode: s.parentAccessCode,
      }));
    } else if (validated.recipientType === 'unpaid') {
      const studentsWithDebt = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          payments: {
            some: {
              status: 'PENDING',
            },
          },
        },
        select: { email: true, fullName: true, portalId: true, parentAccessCode: true },
        distinct: ['id'],
      });
      recipients = studentsWithDebt.map((s) => ({
        email: s.email,
        name: s.fullName,
        portalId: s.portalId,
        parentCode: s.parentAccessCode,
      }));
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipients found',
      });
    }

    const emailRecipients = recipients.map((r) => ({ email: r.email, name: r.name }));

    // Send emails in batches
    const batchSize = 50;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchEmailRecipients = batch.map((r) => ({ email: r.email, name: r.name }));

      const success = await sendBroadcastEmail(
        batchEmailRecipients,
        validated.subject,
        validated.message
      );

      if (success) {
        sentCount += batch.length;
      } else {
        failedCount += batch.length;
      }
    }

    return res.json({
      success: true,
      message: `Broadcast sent to ${sentCount} recipients (${failedCount} failed)`,
      data: {
        totalRecipients: recipients.length,
        sent: sentCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    throw error;
  }
});

// Get email logs (admin only)
router.get('/logs', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, emailType, status } = req.query;

    const where: any = {};
    if (emailType) {
      where.emailType = emailType;
    }
    if (status) {
      where.status = status;
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.emailLog.count({ where }),
    ]);

    return res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw error;
  }
});

// Get email stats (admin only)
router.get('/stats', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const stats = await prisma.emailLog.groupBy({
      by: ['status', 'emailType'],
      _count: { status: true },
    });

    const totalSent = stats
      .filter((s) => s.status === 'SENT')
      .reduce((a, b) => a + b._count.status, 0);
    const totalFailed = stats
      .filter((s) => s.status === 'FAILED')
      .reduce((a, b) => a + b._count.status, 0);

    return res.json({
      success: true,
      data: {
        totalSent,
        totalFailed,
        breakdown: stats,
      },
    });
  } catch (error) {
    throw error;
  }
});

export default router;
