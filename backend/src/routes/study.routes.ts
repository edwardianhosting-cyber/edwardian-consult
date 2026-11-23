import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  generateStudyPlan,
  getUserStudyPlans,
  getTodayTasks,
  completeTask,
  getTargetScoreTracker,
  getUserSubjects,
  updateUserSubjects,
} from '../services/study.service';

const router = Router();

// Generate study plan
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const plan = await generateStudyPlan(req.user!.userId, req.body);
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user study plans
router.get('/plans', authenticate, async (req: Request, res: Response) => {
  try {
    const plans = await getUserStudyPlans(req.user!.userId);
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch study plans' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const plans = await getUserStudyPlans(req.user!.userId);
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch study plans' });
  }
});

// Get today's tasks
router.get('/today', authenticate, async (req: Request, res: Response) => {
  try {
    const tasks = await getTodayTasks(req.user!.userId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch today tasks' });
  }
});

// Complete task
router.patch('/tasks/:id/complete', authenticate, async (req: Request, res: Response) => {
  try {
    const task = await completeTask(req.user!.userId, req.params.id);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete task' });
  }
});

// Get target score tracker
router.get('/target-score', authenticate, async (req: Request, res: Response) => {
  try {
    const tracker = await getTargetScoreTracker(req.user!.userId);
    res.json({ success: true, data: tracker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch target score' });
  }
});

// Get my subjects
router.get('/my-subjects', authenticate, async (req: Request, res: Response) => {
  try {
    const subjects = await getUserSubjects(req.user!.userId);
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
});

// Update my subjects
router.put('/my-subjects', authenticate, async (req: Request, res: Response) => {
  try {
    const { subjects } = req.body;
    if (!Array.isArray(subjects)) {
      return res.status(400).json({ success: false, message: 'Subjects must be an array' });
    }
    const updated = await updateUserSubjects(req.user!.userId, subjects);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update subjects' });
  }
});

export default router;
