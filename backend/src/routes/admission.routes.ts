import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createInstitution,
  getInstitutions,
  createInstitutionCourse,
  matchInstitutions,
  checkCourseEligibility,
  createAdmissionApplication,
  getAdmissionTracker,
  updateApplicationStatus,
  updateMyApplicationStatus,
  getAdmissionHub,
} from '../services/admission.service';

const router = Router();

// Create institution (Admin)
router.post('/institutions', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const institution = await createInstitution(req.body);
    res.status(201).json({ success: true, data: institution });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create institution' });
  }
});

// Get institutions
router.get('/institutions', authenticate, async (req: Request, res: Response) => {
  try {
    const institutions = await getInstitutions({
      type: req.query.type as string,
      state: req.query.state as string,
    });
    res.json({ success: true, data: institutions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch institutions' });
  }
});

// Create institution course (Admin)
router.post('/courses', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const course = await createInstitutionCourse(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create course' });
  }
});

// Match institutions for student
router.get('/match', authenticate, async (req: Request, res: Response) => {
  try {
    const matches = await matchInstitutions(req.user!.userId);
    res.json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to match institutions' });
  }
});

// Check course eligibility
router.post('/check-eligibility', authenticate, async (req: Request, res: Response) => {
  try {
    const results = await checkCourseEligibility(
      req.user!.userId,
      req.body.courseName,
      req.body.utmeScore,
      req.body.olevelResults
    );
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check eligibility' });
  }
});

// Create admission application
router.post('/apply', authenticate, async (req: Request, res: Response) => {
  try {
    const application = await createAdmissionApplication(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create application' });
  }
});

// Get admission tracker
router.get('/tracker', authenticate, async (req: Request, res: Response) => {
  try {
    const tracker = await getAdmissionTracker(req.user!.userId);
    res.json({ success: true, data: tracker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tracker' });
  }
});

// Update application status (Admin)
router.patch('/applications/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const application = await updateApplicationStatus(req.params.id, req.body.status, req.body.notes);
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application' });
  }
});

// Update own application status (Student)
router.patch('/my-applications/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const application = await updateMyApplicationStatus(req.user!.userId, req.params.id, req.body.status);
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
});

// Get admission hub (schools still offering admission)
router.get('/hub', authenticate, async (req: Request, res: Response) => {
  try {
    const hub = await getAdmissionHub(req.user!.userId);
    res.json({ success: true, data: hub });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admission hub' });
  }
});

export default router;
