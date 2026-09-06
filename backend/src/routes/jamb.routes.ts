import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getJAMBSubjects,
  getAllJambSubjects,
  getSubjectCombinations,
  getSubjectCombinationByCourse,
  checkSubjectCombination,
  getJAMBSyllabus,
  getJAMBNews,
  getJAMBDeadlines,
  getAllJambDeadlines,
  createJambDeadline,
  updateJambDeadline,
  deleteJambDeadline,
  createJambSubject,
  updateJambSubject,
  deleteJambSubject,
  bulkUploadJambSubjects,
  createJambSyllabus,
  updateJambSyllabus,
  deleteJambSyllabus,
  getCAPSGuidance,
  getChangeOfCourseGuidance,
  calculateJAMBScore,
  getJAMBResources,
} from '../services/jamb.service';
import prisma from '../lib/prisma';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Admin: Get all JAMB syllabus
router.get('/admin/syllabus', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const syllabus = await getJAMBSyllabus();
    res.json({ success: true, data: syllabus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch syllabus' });
  }
});

// Admin: Create JAMB syllabus
router.post('/admin/syllabus', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const syllabus = await createJambSyllabus(req.body);
    res.status(201).json({ success: true, data: syllabus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create syllabus' });
  }
});

// Admin: Update JAMB syllabus
router.put('/admin/syllabus/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const syllabus = await updateJambSyllabus(req.params.id, req.body);
    res.json({ success: true, data: syllabus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update syllabus' });
  }
});

// Admin: Delete JAMB syllabus
router.delete('/admin/syllabus/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteJambSyllabus(req.params.id);
    res.json({ success: true, message: 'Syllabus deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete syllabus' });
  }
});

// Get all JAMB subjects
router.get('/subjects', authenticate, async (req: Request, res: Response) => {
  try {
    const subjects = await getJAMBSubjects();
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
});

// Get subject combinations for all courses
router.get('/combinations', authenticate, async (req: Request, res: Response) => {
  try {
    const combinations = await getSubjectCombinations();
    res.json({ success: true, data: combinations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch combinations' });
  }
});

// Get subject combination for a specific course
router.get('/combinations/:course', authenticate, async (req: Request, res: Response) => {
  try {
    const combination = await getSubjectCombinationByCourse(req.params.course);
    if (!combination) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, data: combination });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch combination' });
  }
});

// Check if subject combination is valid for a course
router.post('/check-combination', authenticate, async (req: Request, res: Response) => {
  try {
    const { course, subjects } = req.body;
    const result = await checkSubjectCombination(course, subjects);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check combination' });
  }
});

// Get JAMB syllabus
router.get('/syllabus', authenticate, async (req: Request, res: Response) => {
  try {
    const subject = req.query.subject as string;
    const syllabus = await getJAMBSyllabus(subject);
    res.json({ success: true, data: syllabus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch syllabus' });
  }
});

// Get JAMB news
router.get('/news', authenticate, async (req: Request, res: Response) => {
  try {
    const news = await getJAMBNews();
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
});

// Get JAMB deadlines
router.get('/deadlines', authenticate, async (req: Request, res: Response) => {
  try {
    const deadlines = await getJAMBDeadlines();
    res.json({ success: true, data: deadlines });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch deadlines' });
  }
});

// Admin: Get all JAMB deadlines
router.get('/admin/deadlines', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const deadlines = await getAllJambDeadlines();
    res.json({ success: true, data: deadlines });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch deadlines' });
  }
});

// Admin: Create JAMB deadline
router.post('/admin/deadlines', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const deadline = await createJambDeadline(req.body);
    res.status(201).json({ success: true, data: deadline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create deadline' });
  }
});

// Admin: Update JAMB deadline
router.put('/admin/deadlines/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const deadline = await updateJambDeadline(req.params.id, req.body);
    res.json({ success: true, data: deadline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update deadline' });
  }
});

// Admin: Delete JAMB deadline
router.delete('/admin/deadlines/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteJambDeadline(req.params.id);
    res.json({ success: true, message: 'Deadline deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete deadline' });
  }
});

// Admin: Get all JAMB subjects
router.get('/admin/subjects', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const subjects = await getAllJambSubjects();
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
});

// Admin: Create JAMB subject
router.post('/admin/subjects', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const subject = await createJambSubject(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create subject' });
  }
});

// Admin: Update JAMB subject
router.put('/admin/subjects/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const subject = await updateJambSubject(req.params.id, req.body);
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update subject' });
  }
});

// Admin: Delete JAMB subject
router.delete('/admin/subjects/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteJambSubject(req.params.id);
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete subject' });
  }
});

// Admin: Bulk upload JAMB subjects via CSV
router.post('/admin/subjects/bulk', authenticate, authorize('ADMIN'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file provided' });
    }

    const csvText = req.file.buffer.toString('utf-8');
    const subjects = await bulkUploadJambSubjects(csvText);
    res.status(201).json({ success: true, data: subjects, message: `Successfully imported ${subjects.length} subjects` });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload subjects' });
  }
});

// Get CAPS guidance
router.get('/caps-guide', authenticate, async (req: Request, res: Response) => {
  try {
    const guidance = await getCAPSGuidance();
    res.json({ success: true, data: guidance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch guidance' });
  }
});

// Get change of course guidance
router.get('/change-course-guide', authenticate, async (req: Request, res: Response) => {
  try {
    const guidance = await getChangeOfCourseGuidance();
    res.json({ success: true, data: guidance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch guidance' });
  }
});

// Calculate JAMB score
router.post('/calculate-score', authenticate, async (req: Request, res: Response) => {
  try {
    const { correctAnswers, totalQuestions } = req.body;
    const result = await calculateJAMBScore(correctAnswers, totalQuestions);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate score' });
  }
});

// Get JAMB resources
router.get('/resources', authenticate, async (req: Request, res: Response) => {
  try {
    const resources = await getJAMBResources();
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resources' });
  }
});

export default router;
