import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import cbtRoutes from './routes/cbt.routes';
import paymentRoutes from './routes/payment.routes';
import emailRoutes from './routes/email.routes';
import newsRoutes from './routes/news.routes';
import verificationRoutes from './routes/verification.routes';
import programRoutes from './routes/program.routes';
import contactRoutes from './routes/contact.routes';
import notificationRoutes from './routes/notification.routes';
import campaignRoutes from './routes/campaign.routes';
import idcardRoutes from './routes/idcard.routes';
import documentRoutes from './routes/document.routes';
import transcriptRoutes from './routes/transcript.routes';
import studyRoutes from './routes/study.routes';
import admissionRoutes from './routes/admission.routes';
import referralRoutes from './routes/referral.routes';
import noticeRoutes from './routes/notice.routes';
import scholarshipRoutes from './routes/scholarship.routes';
import careerRoutes from './routes/career.routes';
import attendanceRoutes from './routes/attendance.routes';
import walletRoutes from './routes/wallet.routes';
import gamificationRoutes from './routes/gamification.routes';
import jambRoutes from './routes/jamb.routes';
import questionRoutes from './routes/question.routes';
import studyMaterialRoutes from './routes/study-material.routes';
import assignmentRoutes from './routes/assignment.routes';
import studyScheduleRoutes from './routes/study-schedule.routes';
import timetableRoutes from './routes/timetable.routes';
import settingsRoutes from './routes/settings.routes';
import uploadRoutes from './routes/upload.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id']?.toString() || crypto.randomUUID()) as string;
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Multer config for multipart uploads
const upload = multer({ storage: multer.memoryStorage() });

// Local uploads directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const fs = require('fs');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOAD_DIR));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
// IMPORTANT: FRONTEND_URL must exactly match the origin your site is served
// from (protocol + host, no trailing slash) — e.g. "https://yourdomain.com".
// A mismatch here is the most common cause of the frontend showing
// "Failed to fetch": the browser blocks the request before it even reaches
// this server, so no error handler here ever runs — check the logs below
// instead.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://edwardian-consult.vercel.app',
].filter((o): o is string => !!o).map((origin) => origin.replace(/\/$/, '')) as string[];

// Also allow any Vercel preview deployment of this project
// (https://<project>-<hash>-<team>.vercel.app), since those change on every
// deploy and can't be listed individually.
const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  return allowedOrigins.includes(normalized) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized);
};

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin "${origin}". ` +
        `Allowed origins: ${allowedOrigins.join(', ') || '(none configured)'}. ` +
        `If this is your real frontend, set FRONTEND_URL to match it exactly.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting tiers
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many upload attempts, please try again later.',
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many payment attempts, please try again later.',
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/parent-login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/payments', paymentLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/questions/upload-image', uploadLimiter);
app.use('/api/questions/bulk-upload', uploadLimiter);
app.use('/api/questions/bulk-upload-json', uploadLimiter);
app.use('/api/study-material/upload', uploadLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Structured logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const requestId = req.headers['x-request-id']?.toString() || 'unknown';
    const duration = Date.now() - start;
    const logData = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || req.connection.remoteAddress || 'unknown',
    };
    if (res.statusCode >= 500) {
      console.error('[http]', JSON.stringify(logData));
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[http]', JSON.stringify(logData));
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Edwardian Educational Consult API',
    version: '1.0.0',
  });
});

// Wake ping endpoint (for keep-alive services)
app.get('/api/ping', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root wake ping (no /api prefix needed)
app.get('/ping', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cbt', cbtRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/idcard', idcardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/study-material', studyMaterialRoutes);
app.use('/api/study-schedules', studyScheduleRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/jamb', jambRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Database health check endpoint (tests DB connection and reconnects if needed)
app.get('/api/db-health', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
  ============================================
   Edwardian Educational Consult API
  ============================================
   Server running on port: ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   API URL: http://localhost:${PORT}/api
  ============================================
  `);
});

export default app;