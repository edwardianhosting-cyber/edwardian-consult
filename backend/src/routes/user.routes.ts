import { Router, Request, Response } from 'express';
import { authenticate, authorize, hashPassword, generatePortalId, generateParentCode, generateStudentPassword } from '../lib/auth';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { verifyPassword } from '../lib/auth';
import { uploadToCloudinary } from '../services/cloudinary.service';
import { upload } from '../lib/upload';

const router = Router();

// Get users (admin/tutor/teacher)
router.get('/', authenticate, authorize('ADMIN', 'TUTOR', 'TEACHER'), async (req: Request, res: Response) => {
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
          examTypes: true,
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

// Get all students (admin/tutor/teacher)
router.get('/students', authenticate, authorize('ADMIN', 'TUTOR', 'TEACHER'), async (req: Request, res: Response) => {
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

// Get single student (admin/tutor/teacher)
router.get('/students/:id', authenticate, authorize('ADMIN', 'TUTOR', 'TEACHER'), async (req: Request, res: Response) => {
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

// Get dashboard stats (admin/tutor/teacher)
router.get('/stats', authenticate, authorize('ADMIN', 'TUTOR', 'TEACHER'), async (req: Request, res: Response) => {
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

// Get teacher-specific dashboard stats
router.get('/teacher-stats', authenticate, authorize('ADMIN', 'TEACHER', 'TUTOR'), async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.userId as string;
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { examTypes: true, fullName: true, id: true },
    });

    const teacherSubjects = (teacher?.examTypes as string[]) || [];

    const [
      totalAssignments,
      pendingGrading,
      totalCBTs,
      averageClassScoreResult,
      upcomingClasses,
      recentSubmissions,
    ] = await Promise.all([
      prisma.assignment.count({ where: { createdById: teacherId } }),
      prisma.assignmentAttempt.count({
        where: {
          assignment: { createdById: teacherId },
          submittedAt: { not: null },
          score: null,
        },
      }),
      prisma.exam.count({ where: { subject: { in: teacherSubjects } } }),
      prisma.cbtResult.aggregate({
        where: {
          subject: { in: teacherSubjects },
        },
        _avg: { score: true },
      }),
      prisma.timetableEntry.findMany({
        where: {
          OR: [
            { instructor: teacher?.fullName || undefined },
            { subject: { in: teacherSubjects } },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
      }),
      prisma.assignmentAttempt.findMany({
        where: {
          assignment: { createdById: teacherId },
          submittedAt: { not: null },
        },
        orderBy: { submittedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          score: true,
          totalQuestions: true,
          correctAnswers: true,
          submittedAt: true,
          assignment: { select: { title: true } },
          user: { select: { fullName: true } },
        },
      }),
    ]);

    const totalStudents = teacherSubjects.length > 0
      ? (await (prisma.$queryRaw`
          SELECT COUNT(*)::int as count FROM "User" 
          WHERE "role" = 'STUDENT' 
          AND "examTypes"::jsonb ?| ${teacherSubjects}
        `) as any[])[0]?.count || 0
      : await prisma.user.count({ where: { role: 'STUDENT' } });

    return res.json({
      success: true,
      data: {
        totalStudents,
        totalAssignments,
        pendingGrading,
        totalCBTs,
        averageClassScore: Math.round(averageClassScoreResult._avg.score || 0),
        upcomingClasses,
        recentSubmissions,
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
      examTypes: z.array(z.string()).optional(),
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
        examTypes: validated.examTypes || [],
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
        examTypes: true,
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
      examTypes: z.array(z.string()).optional(),
      jambSubjects: z.array(z.string()).optional(),
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
        examTypes: true,
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

// Reset a user's password (admin only) — returns the new plaintext password
// once, for the admin to hand to the user directly. Nothing is emailed here;
// pair this with the /auth/forgot-password flow for self-service resets.
router.post('/:id/reset-password', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const resetSchema = z.object({
      password: z.string().min(6).optional(),
    });
    const validated = resetSchema.parse(req.body);

    const newPassword = validated.password || generateStudentPassword();
    const passwordHash = await hashPassword(newPassword);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash },
      select: { id: true, fullName: true, email: true, role: true },
    });

    return res.json({
      success: true,
      message: 'Password reset successfully',
      data: { ...user, newPassword },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to reset password' });
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
      // Read-only on the frontend — included here so the backend stays
      // consistent if anything ever calls it, but ignored in the update.
      fullName: z.string().min(2).optional(),
      phone: z.string().optional(),

      // Editable fields
      currentSchool: z.string().optional().nullable(),
      classLevel: z.string().optional().nullable(),
      programme: z.string().optional().nullable(),
      examTypes: z.array(z.string()).optional(),
      jambSubjects: z.array(z.string()).optional(),
      olevelResults: z.array(z.string()).optional(),
      targetScore: z.string().optional().nullable(),
      targetInstitution: z.string().optional().nullable(),
      targetCourse: z.string().optional().nullable(),
      secondChoiceInstitution: z.string().optional().nullable(),
      secondChoiceCourse: z.string().optional().nullable(),
      admissionYear: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      state: z.string().optional().nullable(),
      lga: z.string().optional().nullable(),
      notificationPreferences: z.any().optional(),
      avatar: z.string().url().optional().nullable(),
    });

    const validated = updateSchema.parse(req.body);

    // Drop read-only fields from the update payload — these can only be
    // changed by an admin or through a re-verification flow.
    delete (validated as any).fullName;
    delete (validated as any).phone;

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
        programme: true,
        examTypes: true,
        jambSubjects: true,
        olevelResults: true,
        currentSchool: true,
        classLevel: true,
        targetScore: true,
        targetInstitution: true,
        targetCourse: true,
        secondChoiceInstitution: true,
        secondChoiceCourse: true,
        admissionYear: true,
        address: true,
        state: true,
        lga: true,
        avatar: true,
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

// Upload avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'avatars', 'image');
    
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatar: result.url },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        portalId: true,
        role: true,
        avatar: true,
      },
    });

    return res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to upload avatar' });
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