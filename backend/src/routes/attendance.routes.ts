import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  markAttendance,
  markAttendanceByQR,
  getAttendanceLog,
  getAttendanceStats,
  getAllAttendance,
} from '../services/attendance.service';

const router = Router();

// Mark attendance (check-in/check-out)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const log = await markAttendance(req.user!.userId, req.body.type);
    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Mark attendance by QR scan (public endpoint with portalId)
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const log = await markAttendanceByQR(req.body.portalId);
    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user attendance log
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const startDate = req.query.start ? new Date(req.query.start as string) : undefined;
    const endDate = req.query.end ? new Date(req.query.end as string) : undefined;
    const logs = await getAttendanceLog(req.user!.userId, startDate, endDate);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

// Get attendance stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await getAttendanceStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Get all attendance for a date (Admin)
router.get('/all', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const logs = await getAllAttendance(date);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

export default router;
