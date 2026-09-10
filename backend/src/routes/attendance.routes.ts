import { Router, Request, Response } from 'express';
import { authenticate, authorize, parentReadOnly } from '../middleware/auth.middleware';
import {
  markAttendance,
  markAttendanceByQR,
  getAttendanceLog,
  getAttendanceStats,
  getAllAttendance,
} from '../services/attendance.service';

const router = Router();

// Mark attendance (check-in/check-out)
router.post('/', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }
    const log = await markAttendance(req.user!.userId, req.body.type);
    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Mark attendance by QR scan (authenticated)
router.post('/scan', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }
    const { portalId } = req.body;
    if (!portalId) {
      return res.status(400).json({ success: false, message: 'portalId is required' });
    }
    const log = await markAttendanceByQR(portalId);
    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user attendance log
router.get('/', authenticate, parentReadOnly, async (req: Request, res: Response) => {
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
router.get('/stats', authenticate, parentReadOnly, async (req: Request, res: Response) => {
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
