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

// Get public support settings (no auth required — used by Help pages)
router.get('/public/support', async (req: Request, res: Response) => {
  try {
    const keys = [
      'supportEmail',
      'supportPhone',
      'supportWhatsApp',
      'supportFaqs',
    ];
    const settings = await prisma.settings.findMany({
      where: { key: { in: keys } },
    });
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Defaults when settings are not yet configured
    if (!settingsMap.supportEmail) {
      settingsMap.supportEmail = 'support@edwardianeducationalconsult.com.ng';
    }
    if (!settingsMap.supportPhone) {
      settingsMap.supportPhone = '+234 800 000 0000';
    }
    if (!settingsMap.supportWhatsApp) {
      settingsMap.supportWhatsApp = '07055432059';
    }
    if (!settingsMap.supportFaqs) {
      settingsMap.supportFaqs = JSON.stringify([
        {
          question: 'How do I register for a CBT practice exam?',
          answer: 'Go to the CBT Practice section, select your subject, and click "Start Exam". You will get 50 questions with a 60-minute timer.',
        },
        {
          question: 'How do I view my exam results and corrections?',
          answer: 'After submitting your CBT or mock exam, you will see your score immediately. Tap "View Corrections" to see detailed explanations for each question.',
        },
        {
          question: 'How do I update my profile picture?',
          answer: 'Go to My Profile, tap the avatar circle, and select a photo from your device. The image will be uploaded to our secure cloud storage.',
        },
        {
          question: 'How do I download my Student ID Card?',
          answer: 'Navigate to the ID Card section. Your digital ID card is generated automatically from your profile information.',
        },
        {
          question: 'How do I change my password?',
          answer: 'Go to Settings > Security, enter your current password and new password, then click "Update Password".',
        },
        {
          question: 'How do I register for courses and subjects?',
          answer: 'Go to Settings > Examination to select your programme and exam types, then add subjects under "My Subjects".',
        },
        {
          question: 'How do I access study materials?',
          answer: 'Go to Study Materials, select a subject, then browse topics and resources. Materials are filtered by your registered subjects.',
        },
        {
          question: 'How do I contact support?',
          answer: 'Use the Help & Support page to email us, chat on WhatsApp, or call our helpline.',
        },
      ]);
    }

    res.json({ success: true, data: settingsMap });
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