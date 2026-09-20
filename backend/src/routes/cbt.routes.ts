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
  getCBTResultByIdForAdmin,
  getAdminCBTStats,
  getAllCBTResultsForAdmin,
  getMockExamQuestions,
  addQuestionsToMockExam,
  uploadQuestionsToMockExam,
  removeQuestionFromMockExam,
  startMockExamAttempt,
  getFilteredCBTResultsForAdmin,
  getAdminFilteredResults,
  getMockExamRetakeRequests,
  updateExamQuestion,
  recalculateCbtResult,
  getResultReviewData,
  calculateJAMBAggregate,
} from '../services/cbt.service';
import { sendMockResultEmail } from '../lib/email';
import prisma from '../lib/prisma';

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

    if (result.type === 'MOCK') {
      const templateExamId = req.body.templateExamId || req.params.examId;
      const existingAttempt = await prisma.mockExamAttempt.findFirst({
        where: {
          userId: req.user!.userId,
          examId: templateExamId,
          isCompleted: false,
        },
      });

      if (existingAttempt) {
        await prisma.mockExamAttempt.update({
          where: { id: existingAttempt.id },
          data: {
            isCompleted: true,
            completedAt: new Date(),
          },
        });
      } else {
        await prisma.mockExamAttempt.create({
          data: {
            userId: req.user!.userId,
            examId: templateExamId,
            isCompleted: true,
            completedAt: new Date(),
          },
        });
      }
    }

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

    await prisma.mockExamAttempt.create({
      data: {
        userId: req.user!.userId,
        examId: req.params.examId,
        isCompleted: false,
      },
    });

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

// Mock Exams - Admin: add existing questions to a mock exam
router.post('/mock-exams/:examId/questions', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
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

// Mock Exams - Admin: upload questions to a mock exam
router.post('/mock-exams/:examId/upload', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
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

// Mock Exams - Admin: remove question from mock exam
router.delete('/mock-exams/:examId/questions/:questionId', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
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

// Mock Exams - Admin: get retake requests
router.get('/admin/mock-exams/:examId/retake-requests', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const requests = await getMockExamRetakeRequests(req.params.examId);
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch retake requests' });
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

// Admin: get filtered results with type, examId, and sorting
router.get('/admin/results/filtered', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as string) || 'ALL';
    const examId = (req.query.examId as string) || undefined;
    const sortBy = (req.query.sortBy as string) || 'score';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const data = await getAdminFilteredResults({
      type: type === 'ALL' ? undefined : type,
      examId,
      sortBy: sortBy === 'date' ? 'date' : 'score',
      page,
      limit,
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch filtered results' });
  }
});

// Admin: send mock result email to student
router.post('/admin/mock-results/:resultId/send-email', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { resultId } = req.params;
    const resultData = await getCBTResultByIdForAdmin(resultId);

    if (!resultData || resultData.result.type !== 'MOCK') {
      return res.status(404).json({ success: false, message: 'Mock result not found' });
    }

    const result = resultData.result;
    const exam = await getExamById(result.examId || '');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Mock exam not found' });
    }

    const recipientEmail = result.studentEmail || result.email;
    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Student email not found' });
    }

    const corrections = resultData.corrections || [];
    const success = await sendMockResultEmail(
      recipientEmail,
      result.studentName || 'Student',
      exam.title,
      exam.examType,
      result.score,
      result.score,
      result.correctAnswers,
      result.wrongAnswers,
      result.skippedAnswers,
      corrections as any
    );

    if (success) {
      res.json({ success: true, message: 'Mock result email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

// Mock Exams - Student: request retake
router.post('/mock-exams/:examId/request-retake', authenticate, async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || exam.examType !== 'MOCK') {
      return res.status(404).json({ success: false, message: 'Mock exam not found' });
    }

    const existingAttempt = await prisma.mockExamAttempt.findFirst({
      where: {
        userId,
        examId,
        isCompleted: true,
      },
    });

    if (!existingAttempt) {
      return res.status(400).json({ success: false, message: 'You have not completed this mock exam yet' });
    }

    if (existingAttempt.retakeApproved) {
      return res.status(400).json({ success: false, message: 'Retake has already been approved for this exam' });
    }

    await prisma.mockExamAttempt.update({
      where: { id: existingAttempt.id },
      data: {
        retakeRequested: true,
        updatedAt: new Date(),
      },
    });

    return res.json({ success: true, message: 'Retake request submitted. Awaiting admin approval.' });
  } catch (error) {
    console.error('Request retake error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit retake request' });
  }
});

// Mock Exams - Student: get retake status
router.get('/mock-exams/:examId/retake-status', authenticate, async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const attempt = await prisma.mockExamAttempt.findFirst({
      where: {
        userId,
        examId,
      },
    });

    if (!attempt) {
      return res.json({ success: true, data: { canRetake: true, retakeRequested: false, retakeApproved: false } });
    }

    return res.json({
      success: true,
      data: {
        canRetake: attempt.isCompleted ? attempt.retakeApproved : true,
        retakeRequested: attempt.retakeRequested,
        retakeApproved: attempt.retakeApproved,
      },
    });
  } catch (error) {
    console.error('Get retake status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get retake status' });
  }
});

// Mock Exams - Admin: approve retake
router.post('/admin/mock-exams/:examId/approve-retake', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const attempt = await prisma.mockExamAttempt.findFirst({
      where: {
        userId,
        examId,
      },
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Mock exam attempt not found' });
    }

    if (!attempt.retakeRequested) {
      return res.status(400).json({ success: false, message: 'Retake has not been requested for this exam' });
    }

    await prisma.mockExamAttempt.update({
      where: { id: attempt.id },
      data: {
        retakeApproved: true,
        updatedAt: new Date(),
      },
    });

    return res.json({ success: true, message: 'Retake approved successfully' });
  } catch (error) {
    console.error('Approve retake error:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve retake' });
  }
});

// Admin: get result review data
router.get('/admin/results/:resultId/review', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const data = await getResultReviewData(req.params.resultId);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch review data' });
  }
});

// Admin: recalculate CBT result after question edits
router.post('/admin/results/:resultId/recalculate', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const data = await recalculateCbtResult(req.params.resultId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to recalculate result' });
  }
});

// Admin: update exam question
router.patch('/admin/exams/:examId/questions/:questionId', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { examId, questionId } = req.params;
    const { text, options, correctOption, explanation } = req.body;

    if (!text && !options && correctOption === undefined && !explanation) {
      return res.status(400).json({ success: false, message: 'No update data provided' });
    }

    const updated = await updateExamQuestion(examId, questionId, {
      text,
      options,
      correctOption,
      explanation,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update question' });
  }
});

// Student: get JAMB aggregate score
router.get('/jamb/aggregate', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await calculateJAMBAggregate(req.user!.userId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate JAMB aggregate' });
  }
});

export default router;
