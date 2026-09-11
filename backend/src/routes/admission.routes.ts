import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createInstitution,
  getInstitutions,
  updateInstitution,
  deleteInstitution,
  createInstitutionCourse,
  updateInstitutionCourse,
  deleteInstitutionCourse,
  getAllInstitutionCourses,
  matchInstitutions,
  checkCourseEligibility,
  createAdmissionApplication,
  getAdmissionTracker,
  updateApplicationStatus,
  updateMyApplicationStatus,
  getAdmissionHub,
  getAllApplications,
} from '../services/admission.service';
import {
  getAdmissionAnnouncements,
  getAdmissionAnnouncement,
  createAdmissionAnnouncement,
  updateAdmissionAnnouncement,
  deleteAdmissionAnnouncement,
} from '../services/admission-announcement.service';

const router = Router();

// Institutions
router.post('/institutions', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const institution = await createInstitution(req.body);
    res.status(201).json({ success: true, data: institution });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create institution' });
  }
});

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

router.put('/institutions/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const institution = await updateInstitution(req.params.id, req.body);
    res.json({ success: true, data: institution });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update institution' });
  }
});

router.delete('/institutions/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteInstitution(req.params.id);
    res.json({ success: true, message: 'Institution deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete institution' });
  }
});

// Institution Courses
router.get('/courses', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const courses = await getAllInstitutionCourses({
      institutionId: req.query.institutionId as string | undefined,
      search: req.query.search as string | undefined,
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

router.post('/courses', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const course = await createInstitutionCourse(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create course' });
  }
});

router.put('/courses/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const course = await updateInstitutionCourse(req.params.id, req.body);
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update course' });
  }
});

router.delete('/courses/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteInstitutionCourse(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
});

// Student matching
router.get('/match', authenticate, async (req: Request, res: Response) => {
  try {
    const matches = await matchInstitutions(req.user!.userId);
    res.json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to match institutions' });
  }
});

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

// Applications
router.post('/apply', authenticate, async (req: Request, res: Response) => {
  try {
    const application = await createAdmissionApplication(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create application' });
  }
});

router.get('/tracker', authenticate, async (req: Request, res: Response) => {
  try {
    const tracker = await getAdmissionTracker(req.user!.userId);
    res.json({ success: true, data: tracker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tracker' });
  }
});

router.patch('/applications/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const application = await updateApplicationStatus(req.params.id, req.body.status, req.body.notes);
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application' });
  }
});

router.patch('/my-applications/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const application = await updateMyApplicationStatus(req.user!.userId, req.params.id, req.body.status);
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
});

router.get('/admin/applications', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const applications = await getAllApplications({
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// Admission hub
router.get('/hub', authenticate, async (req: Request, res: Response) => {
  try {
    const hub = await getAdmissionHub(req.user!.userId);
    res.json({ success: true, data: hub });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admission hub' });
  }
});

// Admission Announcements
router.get('/announcements', authenticate, async (req: Request, res: Response) => {
  try {
    const announcements = await getAdmissionAnnouncements({
      category: req.query.category as string,
      published: req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined,
    });
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
});

router.get('/announcements/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const announcement = await getAdmissionAnnouncement(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch announcement' });
  }
});

router.post('/announcements', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const announcement = await createAdmissionAnnouncement({
      ...req.body,
      authorId: req.user!.userId,
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
});

router.put('/announcements/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const announcement = await updateAdmissionAnnouncement(req.params.id, req.body);
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update announcement' });
  }
});

router.delete('/announcements/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteAdmissionAnnouncement(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
});

export default router;
