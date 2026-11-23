import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getAdminAnalyticsStats,
  getAnalyticsTimeSeries,
} from '../services/analytics.service';

const router = Router();

router.get('/stats', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const stats = await getAdminAnalyticsStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch analytics stats' });
  }
});

router.get('/timeseries', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as '7d' | '30d' | '90d') || '30d';
    const data = await getAnalyticsTimeSeries(range);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch analytics timeseries' });
  }
});

export default router;
