import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getJAMBSubjects,
  getSubjectCombinations,
  getSubjectCombinationByCourse,
  checkSubjectCombination,
  getJAMBSyllabus,
  getJAMBNews,
  getJAMBDeadlines,
  getCAPSGuidance,
  getChangeOfCourseGuidance,
  calculateJAMBScore,
  getJAMBResources,
} from '../services/jamb.service';

const router = Router();

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
