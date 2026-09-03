import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { hashPassword, verifyPassword, generateToken, generatePortalId, generateParentCode, generateStudentPassword } from '../lib/auth';
import { sendWelcomeEmail } from '../lib/email';
import { generateStudentEmail, createStudentEmailAccount } from '../lib/whohost';

const router = Router();

// Validation schemas - password removed from registration
const registerSchema = z.object({
  // Personal
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  parentPhone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  lga: z.string().optional().nullable(),

  // Academic
  currentSchool: z.string().optional().nullable(),
  classLevel: z.string().optional().nullable(),
  programme: z.string().optional().nullable(),

  // Exams
  examTypes: z.array(z.string()).optional(),

  // JAMB / Post-UTME
  jambSubjects: z.array(z.string()).optional(),
  targetScore: z.string().optional().nullable(),

  // O'Level (WAEC/NECO) — subjects only, grades added later in profile
  olevelSubjects: z.array(z.string()).optional(),

  // Target
  targetInstitution: z.string().optional().nullable(),
  targetCourse: z.string().optional().nullable(),
  secondChoiceInstitution: z.string().optional().nullable(),
  secondChoiceCourse: z.string().optional().nullable(),
  admissionYear: z.string().optional().nullable(),

  // Legacy fields
  studentType: z.string().optional().nullable(),
  schoolCategory: z.string().optional().nullable(),
  targetSchool: z.string().optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const parentLoginSchema = z.object({
  portalId: z.string().min(1, 'Portal ID is required'),
  accessCode: z.string().min(1, 'Access code is required'),
});

// Register new student
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);

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

    // Generate password for student
    const generatedPassword = generateStudentPassword();
    const passwordHash = await hashPassword(generatedPassword);
    const portalId = generatePortalId();
    const parentAccessCode = generateParentCode();

    // Generate student email
    const studentEmail = generateStudentEmail(validated.fullName, portalId);

    const user = await prisma.user.create({
      data: {
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        parentPhone: validated.parentPhone || null,
        passwordHash,
        portalId,
        parentAccessCode,
        studentEmail,
        role: 'STUDENT',

        // Personal
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
        gender: validated.gender || null,
        address: validated.address || null,
        state: validated.state || null,
        lga: validated.lga || null,

        // Academic
        currentSchool: validated.currentSchool || null,
        classLevel: validated.classLevel || null,
        programme: validated.programme || null,

        // Exams
        examTypes: validated.examTypes || [],
        jambSubjects: validated.jambSubjects || [],
        targetScore: validated.targetScore || null,
        olevelSubjects: validated.olevelSubjects || [],

        // Target
        targetInstitution: validated.targetInstitution || validated.targetSchool || null,
        targetCourse: validated.targetCourse || null,
        secondChoiceInstitution: validated.secondChoiceInstitution || null,
        secondChoiceCourse: validated.secondChoiceCourse || null,
        admissionYear: validated.admissionYear || null,
      },
    });

    // Send welcome email (non-blocking — don't fail registration if email fails)
    sendWelcomeEmail(
      user.email,
      user.fullName,
      user.portalId,
      generatedPassword,
      user.parentAccessCode,
      studentEmail,
    ).catch(err => console.error('Welcome email error:', err));

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      portalId: user.portalId,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          portalId: user.portalId,
          parentAccessCode: user.parentAccessCode,
          role: user.role,
          studentEmail: user.studentEmail,
          programme: user.programme,
          examTypes: user.examTypes,
          jambSubjects: user.jambSubjects,
          olevelResults: user.olevelResults,
          targetInstitution: user.targetInstitution,
          targetCourse: user.targetCourse,
          classLevel: user.classLevel,
          currentSchool: user.currentSchool,
        },
        token,
        password: generatedPassword,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Zod validation error
    if (error.errors && Array.isArray(error.errors)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + error.errors.map((e: any) => e.message).join(', '),
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    // Try to find user by studentEmail first, then by email
    let user = await prisma.user.findUnique({
      where: { studentEmail: validated.email },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: validated.email },
      });
    }

    if (!user) {
      console.log('Login failed: user not found for email:', validated.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isValid) {
      console.log('Login failed: invalid password for email:', validated.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      console.log('Login failed: inactive account for email:', validated.email);
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.studentEmail || user.email,
      role: user.role,
      portalId: user.portalId,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.studentEmail || user.email,
          role: user.role,
          portalId: user.portalId,
          avatar: user.avatar,
          studentEmail: user.studentEmail,
          programme: user.programme,
          examTypes: user.examTypes,
          jambSubjects: user.jambSubjects,
          olevelResults: user.olevelResults,
          targetInstitution: user.targetInstitution,
          targetCourse: user.targetCourse,
          classLevel: user.classLevel,
          currentSchool: user.currentSchool,
          targetScore: user.targetScore,
          state: user.state,
          gender: user.gender,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
});

// Parent login
router.post('/parent-login', async (req: Request, res: Response) => {
  try {
    const validated = parentLoginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        portalId: validated.portalId,
        parentAccessCode: validated.accessCode,
        role: 'STUDENT',
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Portal ID or Access Code',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This student account has been deactivated',
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: 'PARENT_VIEW',
      portalId: user.portalId,
    });

    return res.json({
      success: true,
      message: 'Parent portal access granted',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          portalId: user.portalId,
          role: 'PARENT_VIEW',
        },
        token,
      },
    });
  } catch (error) {
    throw error;
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        studentEmail: true,
        phone: true,
        role: true,
        portalId: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        dateOfBirth: true,
        gender: true,
        state: true,
        lga: true,
        address: true,
        currentSchool: true,
        classLevel: true,
        programme: true,
        examTypes: true,
        jambSubjects: true,
        olevelResults: true,
        targetScore: true,
        targetInstitution: true,
        targetCourse: true,
        secondChoiceInstitution: true,
        secondChoiceCourse: true,
        admissionYear: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: currentUser,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;