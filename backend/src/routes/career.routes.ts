import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createCareer,
  getCareers,
  getCareerById,
  updateCareer,
  deleteCareer,
  matchCareers,
  initializeCareers,
} from '../services/career.service';

const router = Router();

// Initialize careers (run once)
router.post('/init', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await initializeCareers();
    res.json({ success: true, message: 'Careers initialized' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to initialize careers' });
  }
});

// Create career (Admin)
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const career = await createCareer(req.body);
    res.status(201).json({ success: true, data: career });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create career' });
  }
});

// Get all careers
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const careers = await getCareers();
    res.json({ success: true, data: careers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch careers' });
  }
});

// Get single career
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const career = await getCareerById(req.params.id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }
    res.json({ success: true, data: career });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch career' });
  }
});

// Update career (Admin)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const career = await updateCareer(req.params.id, req.body);
    res.json({ success: true, data: career });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update career' });
  }
});

// Delete career (Admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteCareer(req.params.id);
    res.json({ success: true, message: 'Career deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete career' });
  }
});

// Match careers based on subjects
router.post('/match', authenticate, async (req: Request, res: Response) => {
  try {
    const careers = await matchCareers(req.body.subjects);
    res.json({ success: true, data: careers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to match careers' });
  }
});

export default router;
