import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  initializeBadges,
  getUserBadges,
  getLeaderboard,
  getUserRank,
} from '../services/gamification.service';

const router = Router();

// Initialize badges (run once)
router.post('/init', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await initializeBadges();
    res.json({ success: true, message: 'Badges initialized' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to initialize badges' });
  }
});

// Get user badges
router.get('/badges', authenticate, async (req: Request, res: Response) => {
  try {
    const badges = await getUserBadges(req.user!.userId);
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch badges' });
  }
});

// Get leaderboard
router.get('/leaderboard', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const examType = req.query.examType as string | undefined;
    const leaderboard = await getLeaderboard(limit, examType);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

// Get user rank
router.get('/rank', authenticate, async (req: Request, res: Response) => {
  try {
    const rank = await getUserRank(req.user!.userId);
    res.json({ success: true, data: rank });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch rank' });
  }
});

export default router;
