import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  generateStudentIdCard,
  verifyStudent,
  generateCertificate,
  verifyCertificate,
} from '../services/idcard.service';
import { prisma } from '../lib/prisma';

const router = Router();

// Generate student ID card
router.get('/id-card', authenticate, async (req: Request, res: Response) => {
  try {
    const idCard = await generateStudentIdCard(req.user!.userId);
    res.json({ success: true, data: idCard });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Verify student by portal ID (public)
router.get('/verify/:portalId', async (req: Request, res: Response) => {
  try {
    const result = await verifyStudent(req.params.portalId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Generate certificate
router.post('/certificate', authenticate, async (req: Request, res: Response) => {
  try {
    const certificate = await generateCertificate(req.user!.userId, req.body.programme);
    res.json({ success: true, data: certificate });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Verify certificate (public)
router.get('/verify-certificate/:certNumber', async (req: Request, res: Response) => {
  try {
    const result = await verifyCertificate(req.params.certNumber);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to verify certificate' });
  }
});

// Admin: Get all students for ID cards
router.get('/admin/students', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const year = req.query.year as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = { role: 'STUDENT', isActive: true };
    if (year) where.admissionYear = year;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { portalId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        portalId: true,
        email: true,
        programme: true,
        classLevel: true,
        admissionYear: true,
        gender: true,
        state: true,
        avatar: true,
        passportUrl: true,
      },
      orderBy: { fullName: 'asc' },
    });

    const years = await prisma.user.findMany({
      where: { role: 'STUDENT', isActive: true, admissionYear: { not: null } },
      select: { admissionYear: true },
      distinct: ['admissionYear'],
    });

    res.json({
      success: true,
      data: {
        students,
        years: years.map(y => y.admissionYear).filter(Boolean).sort(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Admin: Generate ID card for student
router.get('/admin/students/:id/id-card', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const idCard = await generateStudentIdCard(req.params.id);
    res.json({ success: true, data: idCard });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
