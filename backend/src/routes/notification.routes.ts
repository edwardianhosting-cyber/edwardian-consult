import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  getRecentNotifications,
  createBulkNotifications,
} from '../services/notification.service';

const router = Router();

// Get user notifications with filtering
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
    const priority = req.query.priority as string;

    const result = await getUserNotifications(req.user!.userId, {
      page,
      limit,
      type,
      isRead,
      priority,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Get recent notifications for dashboard widget
router.get('/recent', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const notifications = await getRecentNotifications(req.user!.userId, limit);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recent notifications' });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const count = await getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    await markNotificationRead(req.params.id, req.user!.userId);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notification' });
  }
});

// Mark all as read
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    await markAllNotificationsRead(req.user!.userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notifications' });
  }
});

// Update notification preferences
router.patch('/preferences', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { notificationPreferences: req.body },
    });
    res.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
});

// Admin: Create manual notification
router.post('/admin/send', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const {
      title,
      message,
      type,
      priority,
      targetType,
      targetFilter,
      channels,
      scheduledAt,
    } = req.body;

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

    const recipients = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    const count = await createBulkNotifications(
      recipients.map(r => r.id),
      title,
      message,
      type,
      { priority, channels }
    );

    res.status(201).json({
      success: true,
      message: `Notification sent to ${count} recipients`,
      data: { recipientCount: count },
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
});

export default router;
