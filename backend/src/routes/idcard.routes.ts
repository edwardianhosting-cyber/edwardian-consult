import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  generateStudentIdCard,
  verifyStudent,
  generateCertificate,
  verifyCertificate,
} from '../services/idcard.service';

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
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
