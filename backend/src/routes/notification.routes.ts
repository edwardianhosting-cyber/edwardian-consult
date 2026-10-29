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
import {
  getVapidPublicKey,
  saveSubscription,
  removeSubscription,
  sendPushToUser,
  saveDeviceToken,
  removeDeviceToken,
  getDeviceTokensForUser,
} from '../services/push.service';

const router = Router();

// Public: the VAPID public key the frontend needs to create a push subscription
router.get('/push/vapid-public-key', (req: Request, res: Response) => {
  res.json({ success: true, data: { publicKey: getVapidPublicKey() } });
});

// Save (or refresh) this device's push subscription for the logged-in user
router.post('/push/subscribe', authenticate, async (req: Request, res: Response) => {
  try {
    const { subscription } = req.body;
    await saveSubscription(req.user!.userId, subscription, req.headers['user-agent'] as string | undefined);
    res.json({ success: true, message: 'Subscribed to push notifications' });
  } catch (error: any) {
    console.error('Failed to save push subscription:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to subscribe' });
  }
});

// Remove this device's push subscription
router.post('/push/unsubscribe', authenticate, async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    await removeSubscription(req.user!.userId, endpoint);
    res.json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
  }
});

// Register a mobile device FCM token for push notifications
router.post('/register-device', authenticate, async (req: Request, res: Response) => {
  try {
    const { token, platform, deviceId, appVersion } = req.body;

    if (!token || !platform) {
      res.status(400).json({ success: false, message: 'token and platform are required' });
      return;
    }

    await saveDeviceToken(req.user!.userId, token, platform, deviceId, appVersion);
    res.json({ success: true, message: 'Device registered for push notifications' });
  } catch (error: any) {
    console.error('Failed to register device:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to register device' });
  }
});

// Unregister a mobile device FCM token
router.post('/unregister-device', authenticate, async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    await removeDeviceToken(req.user!.userId, token);
    res.json({ success: true, message: 'Device unregistered from push notifications' });
  } catch (error) {
    console.error('Failed to unregister device:', error);
    res.status(500).json({ success: false, message: 'Failed to unregister device' });
  }
});

// Get registered device tokens for the current user
router.get('/devices', authenticate, async (req: Request, res: Response) => {
  try {
    const devices = await getDeviceTokensForUser(req.user!.userId);
    res.json({ success: true, data: devices });
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch devices' });
  }
});

// Send a test push to the logged-in user's own devices (for verifying setup)
router.post('/push/test', authenticate, async (req: Request, res: Response) => {
  try {
    await sendPushToUser(req.user!.userId, {
      title: 'Test notification',
      message: 'Push notifications are set up correctly on this device.',
    });
    res.json({ success: true, message: 'Test push sent' });
  } catch (error) {
    console.error('Failed to send test push:', error);
    res.status(500).json({ success: false, message: 'Failed to send test push' });
  }
});

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
router.get('/preferences', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { notificationPreferences: true },
    });
    res.json({ success: true, data: user?.notificationPreferences || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch preferences' });
  }
});

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
      channels = ['DASHBOARD', 'EMAIL'],
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
      { 
        priority, 
        channels: channels?.length ? channels : ['DASHBOARD', 'EMAIL', 'PUSH'],
        link: req.body.link || undefined,
        emailPurpose: (channels?.includes('EMAIL') || !channels?.length) ? (req.body.emailPurpose || 'REGISTRAR') : undefined,
      }
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
