import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { getEnglishExamBlueprint, updateEnglishExamBlueprint } from '../services/exam-blueprint.service';

const router = Router();

// English exam blueprint
router.get('/english_exam_blueprint', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const blueprint = await getEnglishExamBlueprint();
    res.json({ success: true, data: blueprint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/english_exam_blueprint', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const blueprint = await updateEnglishExamBlueprint(req.body);
    res.json({ success: true, data: blueprint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all settings (admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findMany({
      orderBy: { key: 'asc' },
    });
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    res.json({ success: true, data: settingsMap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single setting by key (admin only)
router.get('/:key', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: req.params.key },
    });
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.json({ success: true, data: setting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update or create setting (admin only)
router.put('/:key', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    const setting = await prisma.settings.upsert({
      where: { key: req.params.key },
      update: { value: String(value) },
      create: { key: req.params.key, value: String(value) },
    });
    res.json({ success: true, data: setting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update settings (admin only)
router.post('/bulk', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const updates = req.body as Record<string, string>;
    const results = await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.settings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
