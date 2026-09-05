import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createReferral,
  getReferralsByUser,
  getReferralStats,
  useReferralCode,
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

// Validate/apply referral code
router.post('/apply', authenticate, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Referral code is required' });
    }

    const result = await useReferralCode(code.trim(), req.user!.userId);
    if (!result) {
      return res.status(400).json({ success: false, message: 'Invalid or already used referral code' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to apply referral code' });
  }
});

export default router;
