import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createScholarship,
  getScholarships,
  deleteScholarship,
  matchScholarships,
} from '../services/scholarship.service';

const router = Router();

// Create scholarship (Admin)
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const scholarship = await createScholarship(req.body);
    res.status(201).json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create scholarship' });
  }
});

// Get scholarships
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const scholarships = await getScholarships({
      level: req.query.level as string,
      field: req.query.field as string,
      location: req.query.location as string,
    });
    res.json({ success: true, data: scholarships });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch scholarships' });
  }
});

// Delete scholarship (Admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteScholarship(req.params.id);
    res.json({ success: true, message: 'Scholarship deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete scholarship' });
  }
});

// Match scholarships for student
router.get('/match', authenticate, async (req: Request, res: Response) => {
  try {
    const scholarships = await matchScholarships(req.user!.userId);
    res.json({ success: true, data: scholarships });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to match scholarships' });
  }
});

export default router;
