import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../lib/auth';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { generateVerificationCode } from '../lib/auth';

const router = Router();

// Public: Verify certificate/code
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const verification = await prisma.verificationCode.findFirst({
      where: {
        OR: [
          { code },
          { code: { contains: code } },
        ],
      },
    });

    if (!verification) {
      return res.json({
        valid: false,
        message: 'Verification code not found',
      });
    }

    if (!verification.isValid) {
      return res.json({
        valid: false,
        message: 'This verification code has been revoked',
        revokedAt: verification.revokedAt,
      });
    }

    if (verification.expiryDate && new Date(verification.expiryDate) < new Date()) {
      return res.json({
        valid: false,
        message: 'This verification code has expired',
        expiryDate: verification.expiryDate,
      });
    }

    return res.json({
      valid: true,
      data: {
        code: verification.code,
        studentName: verification.studentName,
        program: verification.program,
        grade: verification.grade,
        issuedDate: verification.issuedDate,
      },
    });
  } catch (error) {
    throw error;
  }
});

// Public: Verify by POST (for form submission)
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required',
      });
    }

    const verification = await prisma.verificationCode.findUnique({
      where: { code },
    });

    if (!verification) {
      return res.json({
        valid: false,
        message: 'Verification code not found',
      });
    }

    if (!verification.isValid) {
      return res.json({
        valid: false,
        message: 'This verification code has been revoked',
      });
    }

    return res.json({
      valid: true,
      data: {
        code: verification.code,
        studentName: verification.studentName,
        program: verification.program,
        grade: verification.grade,
        issuedDate: verification.issuedDate,
      },
    });
  } catch (error) {
    throw error;
  }
});

// Admin: Get all verification codes
router.get('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, isValid } = req.query;

    const where: any = {};
    if (isValid !== undefined) {
      where.isValid = isValid === 'true';
    }

    const [verifications, total] = await Promise.all([
      prisma.verificationCode.findMany({
        where,
        orderBy: { issuedDate: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.verificationCode.count({ where }),
    ]);

    return res.json({
      success: true,
      data: verifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw error;
  }
});

// Admin: Create verification code
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const verifySchema = z.object({
      studentName: z.string().min(1),
      program: z.string().min(1),
      grade: z.string().optional(),
      expiryDate: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    });

    const validated = verifySchema.parse(req.body);

    const code = generateVerificationCode();

    const verification = await prisma.verificationCode.create({
      data: {
        code,
        studentName: validated.studentName,
        program: validated.program,
        grade: validated.grade,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
        metadata: validated.metadata as any,
        type: 'CERTIFICATE',
        purpose: 'VERIFICATION',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Verification code created successfully',
      data: verification,
    });
  } catch (error) {
    throw error;
  }
});

// Admin: Revoke verification code
router.post('/:id/revoke', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { revokedBy } = req.body;

    const verification = await prisma.verificationCode.update({
      where: { id: req.params.id },
      data: {
        isValid: false,
        revokedAt: new Date(),
        revokedBy: revokedBy || (req as any).user.userId,
      },
    });

    return res.json({
      success: true,
      message: 'Verification code revoked successfully',
      data: verification,
    });
  } catch (error) {
    throw error;
  }
});

// Admin: Get verification stats
router.get('/stats/summary', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const [total, active, revoked] = await Promise.all([
      prisma.verificationCode.count(),
      prisma.verificationCode.count({ where: { isValid: true } }),
      prisma.verificationCode.count({ where: { isValid: false } }),
    ]);

    return res.json({
      success: true,
      data: {
        total,
        active,
        revoked,
      },
    });
  } catch (error) {
    throw error;
  }
});

export default router;
