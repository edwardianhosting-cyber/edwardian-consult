import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createQuestion,
  getQuestions,
  generateCBT,
  submitCBT,
  getUserCBTResults,
  getPerformanceAnalysis,
  getExamById,
  getMockExamsForUser,
  createMockExam,
  publishMockExam,
  unpublishMockExam,
} from '../services/cbt.service';

const router = Router();

// Create question (Admin only)
router.post('/questions', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const question = await createQuestion(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create question' });
  }
});

// Get questions (with filters)
router.get('/questions', authenticate, async (req: Request, res: Response) => {
  try {
    const questions = await getQuestions({
      subject: req.query.subject as string,
      examType: req.query.examType as string,
      topic: req.query.topic as string,
      difficulty: req.query.difficulty as string,
      year: req.query.year ? parseInt(req.query.year as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
});

// Generate CBT
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const cbt = await generateCBT(req.user!.userId, req.body);
    res.json({ success: true, data: cbt });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get exam by ID
router.get('/exams/:examId', authenticate, async (req: Request, res: Response) => {
  try {
    const exam = await getExamById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch exam' });
  }
});

// Submit CBT
router.post('/submit/:examId', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await submitCBT(req.user!.userId, req.params.examId, req.body.answers, req.body.type);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user CBT results
router.get('/results', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const type = req.query.type as string | undefined;
    const results = await getUserCBTResults(req.user!.userId, page, 20, type);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch results' });
  }
});

// Get performance analysis
router.get('/performance', authenticate, async (req: Request, res: Response) => {
  try {
    const analysis = await getPerformanceAnalysis(req.user!.userId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch performance analysis' });
  }
});

// Mock Exams - Student: get available mock exams
router.get('/mock-exams', authenticate, async (req: Request, res: Response) => {
  try {
    const exams = await getMockExamsForUser(req.user!.userId);
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch mock exams' });
  }
});

// Mock Exams - Teacher/Admin: create mock exam
router.post('/mock-exams', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const exam = await createMockExam(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create mock exam' });
  }
});

// Mock Exams - Teacher/Admin: publish mock exam
router.patch('/mock-exams/:id/publish', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const exam = await publishMockExam(req.params.id);
    res.json({ success: true, data: exam, message: 'Mock exam published' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to publish mock exam' });
  }
});

// Mock Exams - Teacher/Admin: unpublish mock exam
router.patch('/mock-exams/:id/unpublish', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const exam = await unpublishMockExam(req.params.id);
    res.json({ success: true, data: exam, message: 'Mock exam unpublished' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unpublish mock exam' });
  }
});

export default router;
