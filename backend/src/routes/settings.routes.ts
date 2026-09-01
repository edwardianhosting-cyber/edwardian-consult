import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all settings
router.get('/', async (req: Request, res: Response) => {
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

// Get single setting by key
router.get('/:key', async (req: Request, res: Response) => {
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

// Update or create setting
router.put('/:key', async (req: Request, res: Response) => {
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

// Bulk update settings
router.post('/bulk', async (req: Request, res: Response) => {
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
