import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createCampaign,
  sendCampaign,
  getCampaigns,
  getCampaignStats,
  updateCampaign,
  deleteCampaign,
} from '../services/campaign.service';

const router = Router();

// Create campaign (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const campaign = await createCampaign({
      ...req.body,
      createdById: req.user!.userId,
    });
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create campaign' });
  }
});

// Get all campaigns (Admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await getCampaigns(page);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
  }
});

// Get campaign stats
router.get('/:id/stats', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const stats = await getCampaignStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch campaign stats' });
  }
});

// Send campaign
router.post('/:id/send', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const result = await sendCampaign(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send campaign' });
  }
});

// Update campaign
router.put('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const campaign = await updateCampaign(req.params.id, req.body);
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update campaign' });
  }
});

// Delete campaign
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteCampaign(req.params.id);
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete campaign' });
  }
});

export default router;
