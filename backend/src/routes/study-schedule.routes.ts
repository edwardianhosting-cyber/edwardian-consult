import { Router, Request, Response } from 'express';
import { authenticate, authorize, parentReadOnly } from '../middleware/auth.middleware';
import { z } from 'zod';
import {
  createStudySchedule,
  getMyStudySchedules,
  updateStudySchedule,
  deleteStudySchedule,
  completeStudySchedule,
} from '../services/study-schedule.service';

const router = Router();

router.get('/', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const schedules = await getMyStudySchedules(req.user!.userId);
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
  }
});

router.post('/', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }

    const schema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      subject: z.string().min(1).max(100),
      topic: z.string().max(200).optional(),
      dayOfWeek: z.string().min(1).max(20),
      time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, expected HH:MM'),
      durationMinutes: z.number().int().positive().optional(),
      reminderEnabled: z.boolean().optional(),
      isCompleted: z.boolean().optional(),
    });

    const body = schema.parse(req.body);
    const schedule = await createStudySchedule(req.user!.userId, body);
    res.status(201).json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create schedule' });
  }
});

router.put('/:id', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }

    const schema = z.object({
      title: z.string().min(1).max(200).optional(),
      description: z.string().max(2000).optional(),
      subject: z.string().min(1).max(100).optional(),
      topic: z.string().max(200).optional(),
      dayOfWeek: z.string().min(1).max(20).optional(),
      time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, expected HH:MM').optional(),
      durationMinutes: z.number().int().positive().optional(),
      reminderEnabled: z.boolean().optional(),
      isCompleted: z.boolean().optional(),
    });

    const body = schema.parse(req.body);
    const schedule = await updateStudySchedule(req.user!.userId, req.params.id, body);
    res.json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update schedule' });
  }
});

router.patch('/:id/complete', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }
    const schedule = await completeStudySchedule(req.user!.userId, req.params.id);
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete schedule' });
  }
});

router.delete('/:id', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }
    await deleteStudySchedule(req.user!.userId, req.params.id);
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete schedule' });
  }
});

export default router;
