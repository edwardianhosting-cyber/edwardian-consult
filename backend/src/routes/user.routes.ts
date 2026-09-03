import { Router, Request, Response } from 'express';
import { authenticate, authorize, hashPassword, generatePortalId, generateParentCode, generateStudentPassword } from '../lib/auth';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { verifyPassword } from '../lib/auth';

const router = Router();

// Get users (admin only) - supports role filter
router.get('/', authenticate, authorize('ADMIN', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const where: any = {};

    if (role) {
      where.role = role as string;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { portalId: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          portalId: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              cbtResults: true,
              payments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: users,
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

// Get all students (admin only)
router.get('/students', authenticate, authorize('ADMIN', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, programme, examType, isActive } = req.query;

    const where: any = { role: 'STUDENT' };

    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { portalId: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (programme) {
      where.programme = programme;
    }

    if (examType) {
      where.examTypes = { array_contains: examType };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          portalId: true,
          parentAccessCode: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              cbtResults: true,
              payments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: students,
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

// Get single student
router.get('/students/:id', authenticate, authorize('ADMIN', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const student = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'STUDENT' },
      include: {
        cbtResults: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        enrollments: {
          where: { status: 'ACTIVE' },
        },
        _count: {
          select: {
            cbtResults: true,
            payments: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    throw error;
  }
});

// Update student
router.put('/students/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const updateSchema = z.object({
      fullName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      programme: z.enum(['JAMB', 'POST_UTME', 'WAEC', 'NECO', 'JUPEB']).optional(),
      examTypes: z.array(z.string()).optional(),
      jambSubjects: z.array(z.string()).optional(),
      olevelResults: z.array(z.object({
        subject: z.string(),
        grade: z.string(),
        examYear: z.number().int().optional(),
        examType: z.string().optional(),
      })).optional(),
      targetInstitution: z.string().optional(),
      targetCourse: z.string().optional(),
      secondChoiceInstitution: z.string().optional(),
      secondChoiceCourse: z.string().optional(),
      admissionYear: z.string().optional(),
      targetScore: z.string().optional(),
      currentSchool: z.string().optional(),
      classLevel: z.string().optional(),
      isActive: z.boolean().optional(),
    });

    const validated = updateSchema.parse(req.body);

    const student = await prisma.user.update({
      where: { id: req.params.id },
      data: validated,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });

    return res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    throw error;
  }
});

// Reset parent access code
router.post('/students/:id/reset-parent-code', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { generateParentCode } = await import('../lib/auth');
    const newCode = generateParentCode();

    await prisma.user.update({
      where: { id: req.params.id },
      data: { parentAccessCode: newCode },
    });

    return res.json({
      success: true,
      message: 'Parent access code reset successfully',
      data: { parentAccessCode: newCode },
    });
  } catch (error) {
    throw error;
  }
});

// Get dashboard stats (admin)
router.get('/stats', authenticate, authorize('ADMIN', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalQuestions,
      totalExams,
      totalRevenue,
      revenueThisMonth,
      recentResults,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.question.count(),
      prisma.exam.count(),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      prisma.cbtResult.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        totalQuestions,
        totalExams,
        totalRevenue: totalRevenue._sum.amount || 0,
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
        recentResults,
      },
    });
  } catch (error) {
    throw error;
  }
});

// Create user (admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const createSchema = z.object({
      fullName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(10),
      role: z.enum(['STUDENT', 'TEACHER', 'ADMIN', 'TUTOR']).default('STUDENT'),
      isActive: z.boolean().default(true),
      password: z.string().min(6).optional(),
    });

    const validated = createSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.email },
          { phone: validated.phone },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or phone number already exists',
      });
    }

    const portalId = generatePortalId();
    const parentAccessCode = generateParentCode();
    const password = validated.password || generateStudentPassword();
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        passwordHash,
        portalId,
        parentAccessCode,
        role: validated.role,
        isActive: validated.isActive,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        portalId: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const updateSchema = z.object({
      fullName: z.string().min(2).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      role: z.enum(['STUDENT', 'TEACHER', 'ADMIN', 'TUTOR']).optional(),
      isActive: z.boolean().optional(),
    });

    const validated = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: validated,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        portalId: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to delete user' });
  }
});

// Update own profile
router.patch('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const updateSchema = z.object({
      fullName: z.string().min(2).optional(),
      phone: z.string().optional(),
    });

    const validated = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: validated,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        portalId: true,
        role: true,
      },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
  }
});

// Change password
router.post('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const changeSchema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    });

    const validated = changeSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = await verifyPassword(validated.currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const newHash = await hashPassword(validated.newPassword);
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { passwordHash: newHash },
    });

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to change password' });
  }
});

export default router;
