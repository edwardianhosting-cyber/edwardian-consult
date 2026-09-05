import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  initializeBadges,
  getUserBadges,
  getLeaderboard,
  getUserRank,
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
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

// Admin: Get all badges
router.get('/admin/badges', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const badges = await getAllBadges();
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch badges' });
  }
});

// Admin: Create badge
router.post('/admin/badges', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const badge = await createBadge(req.body);
    res.status(201).json({ success: true, data: badge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create badge' });
  }
});

// Admin: Update badge
router.put('/admin/badges/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const badge = await updateBadge(req.params.id, req.body);
    res.json({ success: true, data: badge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update badge' });
  }
});

// Admin: Delete badge
router.delete('/admin/badges/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteBadge(req.params.id);
    res.json({ success: true, message: 'Badge deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete badge' });
  }
});

export default router;
