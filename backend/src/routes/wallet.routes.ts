import { Router, Request, Response } from 'express';
import { authenticate, authorize, parentReadOnly } from '../middleware/auth.middleware';
import { z } from 'zod';
import {
  getWalletItems,
  addWalletItem,
  getWalletSummary,
  getWalletBalance,
  depositToWallet,
  payFromWallet,
  getAllWalletItems,
  getMonthlyWalletStats,
  getAdminWalletStats,
} from '../services/wallet.service';

const router = Router();

// Get wallet items
router.get('/', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const items = await getWalletItems(req.user!.userId);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet' });
  }
});

// Get wallet summary
router.get('/summary', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const summary = await getWalletSummary(req.user!.userId);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

// Add wallet item
router.post('/', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }
    const item = await addWalletItem({
      userId: req.user!.userId,
      ...req.body,
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add item' });
  }
});

// Get wallet balance
router.get('/balance', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const balance = await getWalletBalance(req.user!.userId);
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch balance' });
  }
});

// Admin: Manual wallet deposit (adjustments, refunds, etc.)
router.post('/deposit', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { userId, amount, reference, description } = req.body;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid deposit parameters' });
    }
    const result = await depositToWallet(userId, amount, reference);
    res.json({ success: true, data: result, message: 'Deposit successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process deposit' });
  }
});

// Pay from wallet
router.post('/pay', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }

    const schema = z.object({
      amount: z.number().positive('Amount must be positive'),
      description: z.string().max(500).optional(),
      reference: z.string().max(100).optional(),
    });

    const { amount, description, reference } = schema.parse(req.body);
    const result = await payFromWallet(req.user!.userId, amount, description || 'Wallet payment', (reference || `PAY-${Date.now()}`) as string);
    res.json({ success: true, data: result, message: 'Payment successful' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to process payment' });
  }
});

// Admin: Get all wallet items
router.get('/admin/all', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const type = (req.query.type as string) || undefined;
    const items = await getAllWalletItems({ type });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet records' });
  }
});

// Admin: Get monthly wallet stats
router.get('/admin/monthly', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const stats = await getMonthlyWalletStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch monthly stats' });
  }
});

// Admin: Get wallet stats
router.get('/admin/stats', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const stats = await getAdminWalletStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

export default router;
