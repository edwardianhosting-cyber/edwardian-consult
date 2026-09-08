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
  getAllMockExamsForTeacher,
  getAllMockExamsForAdmin,
  updateMockExam,
  deleteMockExam,
  getCBTResultById,
  getAdminCBTStats,
  getAllCBTResultsForAdmin,
  getMockExamQuestions,
  addQuestionsToMockExam,
  uploadQuestionsToMockExam,
  removeQuestionFromMockExam,
  startMockExamAttempt,
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

// Get single CBT result by ID
router.get('/results/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await getCBTResultById(req.user!.userId, req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch result details' });
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

// Mock Exams - Student: start mock exam attempt (generates shuffled questions from bank)
router.post('/mock-exams/:examId/start', authenticate, async (req: Request, res: Response) => {
  try {
    const exam = await startMockExamAttempt(req.user!.userId, req.params.examId);
    res.json({ success: true, data: exam });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
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

// Mock Exams - Teacher/Admin: get all mock exams (including drafts)
router.get('/mock-exams/admin/all', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const exams = await getAllMockExamsForTeacher(req.user!.userId);
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch mock exams' });
  }
});

// Mock Exams - Teacher/Admin: get questions for a specific mock exam
router.get('/mock-exams/:examId/questions', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const questions = await getMockExamQuestions(req.params.examId);
    if (!questions) {
      return res.status(404).json({ success: false, message: 'Mock exam not found' });
    }
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
});

// Mock Exams - Teacher/Admin: add existing questions to a mock exam
router.post('/mock-exams/:examId/questions', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const { questionIds } = req.body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'questionIds array is required' });
    }
    const questions = await addQuestionsToMockExam(req.params.examId, questionIds);
    res.json({ success: true, data: questions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add questions' });
  }
});

// Mock Exams - Teacher/Admin: upload questions to a mock exam
router.post('/mock-exams/:examId/upload', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'questions array is required' });
    }
    const uploadedQuestions = await uploadQuestionsToMockExam(req.params.examId, questions);
    res.json({ success: true, data: uploadedQuestions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to upload questions' });
  }
});

// Mock Exams - Teacher/Admin: remove question from mock exam
router.delete('/mock-exams/:examId/questions/:questionId', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const questions = await removeQuestionFromMockExam(req.params.examId, req.params.questionId);
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove question' });
  }
});

// Mock Exams - Teacher/Admin: update mock exam
router.put('/mock-exams/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const exam = await updateMockExam(req.params.id, req.body);
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update mock exam' });
  }
});

// Mock Exams - Teacher/Admin: delete mock exam
router.delete('/mock-exams/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    await deleteMockExam(req.params.id);
    res.json({ success: true, message: 'Mock exam deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete mock exam' });
  }
});

// Admin: get all mock exams
router.get('/admin/mock-exams', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const exams = await getAllMockExamsForAdmin();
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch mock exams' });
  }
});

// Admin: get CBT statistics
router.get('/admin/stats', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const stats = await getAdminCBTStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Admin: get all CBT results
router.get('/admin/results', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await getAllCBTResultsForAdmin(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch results' });
  }
});

export default router;
