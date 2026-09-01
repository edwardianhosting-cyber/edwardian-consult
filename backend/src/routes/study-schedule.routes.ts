import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createStudySchedule,
  getMyStudySchedules,
  updateStudySchedule,
  deleteStudySchedule,
  completeStudySchedule,
} from '../services/study-schedule.service';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const schedules = await getMyStudySchedules(req.user!.userId);
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const schedule = await createStudySchedule(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create schedule' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const schedule = await updateStudySchedule(req.user!.userId, req.params.id, req.body);
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
});

router.patch('/:id/complete', authenticate, async (req: Request, res: Response) => {
  try {
    const schedule = await completeStudySchedule(req.user!.userId, req.params.id);
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete schedule' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await deleteStudySchedule(req.user!.userId, req.params.id);
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete schedule' });
  }
});

export default router;
