import { Router, Request, Response } from 'express';
import { authenticate, authorize, parentReadOnly } from '../middleware/auth.middleware';
import { z } from 'zod';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignmentAttempt,
  getAssignmentResults,
  getAssignmentResultById,
  getAssignmentQuestions,
  uploadAssignmentFile,
  getPublishedAssignmentsForUser,
  publishAssignment,
  unpublishAssignment,
} from '../services/assignment.service';
import { upload } from '../lib/upload';

const router = Router();

router.get('/', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const assignments = await getAssignments(req.user!.userId, req.user!.role);
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
});

router.get('/available', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const assignments = await getPublishedAssignmentsForUser(req.user!.userId);
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
});

router.get('/results', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const results = await getAssignmentResults(req.user!.userId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignment results' });
  }
});

router.get('/:id', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const assignment = await getAssignmentById(req.params.id);
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignment' });
  }
});

router.get('/:id/questions', authenticate, parentReadOnly, async (req: Request, res: Response) => {
  try {
    const questions = await getAssignmentQuestions(req.params.id);
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignment questions' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const assignment = await createAssignment(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create assignment' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const assignment = await updateAssignment(req.params.id, req.body);
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update assignment' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    await deleteAssignment(req.params.id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete assignment' });
  }
});

router.post('/:id/submit', authenticate, authorize('STUDENT'), async (req: Request, res: Response) => {
  try {
    if (req.user!.role === 'PARENT_VIEW') {
      return res.status(403).json({ success: false, message: 'Read-only access' });
    }

    const schema = z.object({
      answers: z.record(z.string(), z.any()).optional(),
      text: z.string().max(5000).optional(),
      fileUrl: z.string().url().optional(),
    });

    const body = schema.parse(req.body);
    const result = await submitAssignmentAttempt(req.user!.userId, req.params.id, body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to submit assignment' });
  }
});

router.post('/upload', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    const result = await uploadAssignmentFile(req.file);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
});

router.patch('/:id/publish', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const assignment = await publishAssignment(req.params.id);
    res.json({ success: true, data: assignment, message: 'Assignment published' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to publish assignment' });
  }
});

router.patch('/:id/unpublish', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const assignment = await unpublishAssignment(req.params.id);
    res.json({ success: true, data: assignment, message: 'Assignment unpublished' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unpublish assignment' });
  }
});

export default router;
