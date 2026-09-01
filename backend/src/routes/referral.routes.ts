import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createReferral,
  getReferralsByUser,
  getReferralStats,
} from '../services/referral.service';

const router = Router();

// Create referral
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const referral = await createReferral(req.user!.userId, req.body.email);
    res.status(201).json({ success: true, data: referral });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create referral' });
  }
});

// Get user referrals
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const referrals = await getReferralsByUser(req.user!.userId);
    res.json({ success: true, data: referrals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch referrals' });
  }
});

// Get referral stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await getReferralStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

export default router;
