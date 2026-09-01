import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createNotice,
  getActiveNotices,
  getNotices,
  updateNotice,
  deleteNotice,
} from '../services/notice.service';
import { createBulkNotifications } from '../services/notification.service';
import prisma from '../lib/prisma';

const router = Router();

// Get active notices for user
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const notices = await getActiveNotices(req.user!.userId);
    res.json({ success: true, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notices' });
  }
});

// Get all notices (Admin)
router.get('/all', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await getNotices(page);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notices' });
  }
});

// Create notice (Admin)
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const notice = await createNotice({
      ...req.body,
      createdById: req.user!.userId,
    });

    // Send notifications to matching students
    const studentWhere: any = { role: 'STUDENT' };
    if (notice.targetType === 'JAMB') {
      studentWhere.programme = 'JAMB';
    } else if (notice.targetType === 'WAEC') {
      studentWhere.programme = 'WAEC';
    } else if (notice.targetType === 'NECO') {
      studentWhere.programme = 'NECO';
    } else if (notice.targetType === 'SS3') {
      studentWhere.classLevel = 'SS3';
    }

    const targetStudents = await prisma.user.findMany({
      where: studentWhere,
      select: { id: true },
    });

    if (targetStudents.length > 0) {
      await createBulkNotifications(
        targetStudents.map(s => s.id),
        notice.title,
        notice.content,
        'ANNOUNCEMENT',
        {
          priority: notice.isPinned ? 'IMPORTANT' : 'NORMAL',
          link: '/student/notices',
          entityType: 'NOTICE',
          entityId: notice.id,
          channels: ['DASHBOARD', 'EMAIL'],
          emailPurpose: 'REGISTRAR',
        }
      );
    }

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create notice' });
  }
});

// Update notice (Admin)
router.patch('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const notice = await updateNotice(req.params.id, req.body);
    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notice' });
  }
});

// Delete notice (Admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteNotice(req.params.id);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notice' });
  }
});

export default router;
