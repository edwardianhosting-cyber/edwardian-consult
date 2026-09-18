import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { z } from 'zod';
import prisma from '../lib/prisma';
import {
  createQuestionGroup,
  getQuestionGroups,
  getQuestionGroupById,
  updateQuestionGroup,
  deleteQuestionGroup,
  addQuestionToGroup,
  removeQuestionFromGroup,
  reorderQuestionsInGroup,
  GROUP_TYPES,
} from '../services/question-group.service';

const router = Router();

// Create question group
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      subject: z.string().min(1),
      examType: z.string().min(1),
      groupType: z.string().min(1),
      title: z.string().optional().nullable(),
      instructions: z.string().optional().nullable(),
      passage: z.string().optional().nullable(),
      imageUrl: z.string().optional().nullable(),
      order: z.number().int().optional(),
      isActive: z.boolean().optional(),
    });

    const validated = schema.parse(req.body);
    const group = await createQuestionGroup({
      subject: validated.subject,
      examType: validated.examType,
      groupType: validated.groupType as any,
      title: validated.title || undefined,
      instructions: validated.instructions || undefined,
      passage: validated.passage || undefined,
      imageUrl: validated.imageUrl || undefined,
      order: validated.order,
      isActive: validated.isActive ?? true,
    });

    return res.status(201).json({ success: true, data: group });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create question group' });
  }
});

// Get all question groups
router.get('/', authenticate, authorize('ADMIN', 'AUTHENTICATED'), async (req: Request, res: Response) => {
  try {
    const { subject, examType, groupType, isActive } = req.query;

    const groups = await getQuestionGroups({
      subject: subject as string | undefined,
      examType: examType as string | undefined,
      groupType: groupType as any,
      isActive: isActive === 'false' ? false : isActive === 'true' ? true : undefined,
    });

    return res.json({ success: true, data: groups });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to get question groups' });
  }
});

// Get question group by ID
router.get('/:id', authenticate, authorize('ADMIN', 'AUTHENTICATED'), async (req: Request, res: Response) => {
  try {
    const group = await getQuestionGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Question group not found' });
    }
    return res.json({ success: true, data: group });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to get question group' });
  }
});

// Update question group
router.put('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      subject: z.string().optional(),
      examType: z.string().optional(),
      groupType: z.string().optional(),
      title: z.string().optional().nullable(),
      instructions: z.string().optional().nullable(),
      passage: z.string().optional().nullable(),
      imageUrl: z.string().optional().nullable(),
      order: z.number().int().optional(),
      isActive: z.boolean().optional(),
    });

    const validated = schema.parse(req.body);
    const group = await updateQuestionGroup(req.params.id, validated as any);
    return res.json({ success: true, data: group });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update question group' });
  }
});

// Delete question group
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await deleteQuestionGroup(req.params.id);
    return res.json({ success: true, message: 'Question group deleted' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to delete question group' });
  }
});

// Add question to group
router.post('/:id/questions', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { questionId, order } = req.body;
    if (!questionId) {
      return res.status(400).json({ success: false, message: 'questionId is required' });
    }

    const group = await addQuestionToGroup(req.params.id, questionId, order || 0);
    return res.status(201).json({ success: true, data: group });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to add question to group' });
  }
});

// Remove question from group
router.delete('/:id/questions/:questionId', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await removeQuestionFromGroup(req.params.questionId);
    return res.json({ success: true, message: 'Question removed from group' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to remove question from group' });
  }
});

// Reorder questions in group
router.put('/:id/questions/reorder', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { questionIds } = z.object({ questionIds: z.array(z.string()) }).parse(req.body);
    await reorderQuestionsInGroup(req.params.id, questionIds);
    return res.json({ success: true, message: 'Questions reordered' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to reorder questions' });
  }
});

// Get available group types
router.get('/group-types', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: Object.entries(GROUP_TYPES).map(([key, value]) => ({
        key,
        value,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      })),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to get group types' });
  }
});

export default router;
