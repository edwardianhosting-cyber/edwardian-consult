import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createTimetableEntry,
  getAllTimetableEntries,
  getTimetableByExamType,
  updateTimetableEntry,
  deleteTimetableEntry,
} from '../services/timetable.service';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const entries = await getTimetableByExamType(req.user!.userId);
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
});

router.get('/admin/all', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const entries = await getAllTimetableEntries();
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const entry = await createTimetableEntry(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create timetable entry' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const entry = await updateTimetableEntry(req.params.id, req.body);
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update timetable entry' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    await deleteTimetableEntry(req.params.id);
    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete timetable entry' });
  }
});

export default router;
