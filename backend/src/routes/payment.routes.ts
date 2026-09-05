import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import {
  initiateERCASPayment,
  verifyERCASPayment,
  createPaymentRecord,
  processSuccessfulPayment,
  handleFailedPayment,
  generatePaymentReference,
  getUserPayments,
  getPaymentStats,
  getAdminPaymentStats,
  getPaymentById,
} from '../services/ercas.service';

const router = Router();

// Initialize payment
router.post('/initialize', authenticate, async (req: Request, res: Response) => {
  try {
    const { amount, description, type, metadata } = req.body;
    const user = req.user!;

    const reference = generatePaymentReference();

    const paymentRecord = await createPaymentRecord({
      userId: user.userId,
      amount,
      paymentMethod: 'ERCAS_PAY',
      description,
      reference,
      metadata,
    });

    const paymentResponse = await initiateERCASPayment({
      amount,
      reference,
      customerEmail: user.email,
      customerName: user.fullName || 'Student',
      description: description || 'Payment',
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/ercas/callback`,
      metadata: {
        userId: user.userId,
        paymentId: paymentRecord.id,
        ...metadata,
      },
    });

    if (paymentResponse.success) {
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { reference: paymentResponse.reference },
      });

      res.json({
        success: true,
        data: {
          paymentUrl: paymentResponse.paymentUrl,
          reference: paymentResponse.reference,
        },
      });
    } else {
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { status: 'FAILED' },
      });

      res.status(400).json({
        success: false,
        message: paymentResponse.message || 'Payment initialization failed',
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize payment' });
  }
});

// Verify payment
router.get('/verify/:reference', authenticate, async (req: Request, res: Response) => {
  try {
    const verification = await verifyERCASPayment(req.params.reference);

    if (verification.success && verification.status === 'successful') {
      await processSuccessfulPayment(req.params.reference);
    } else if (verification.status === 'failed') {
      await handleFailedPayment(req.params.reference);
    }

    res.json({ success: true, data: verification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

// ERCAS callback
router.post('/ercas/callback', async (req: Request, res: Response) => {
  try {
    const { reference, status } = req.body;

    if (status === 'successful') {
      await processSuccessfulPayment(reference);
    } else {
      await handleFailedPayment(reference);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('ERCAS callback error:', error);
    res.status(500).json({ success: false });
  }
});

// Get user payments
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await getUserPayments(req.user!.userId, page);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// Get payment stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await getPaymentStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Get single payment by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const payment = await getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (payment.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment' });
  }
});

// Admin: Get all payments
router.get('/admin/all', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: { fullName: true, portalId: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * 20,
        take: 20,
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: { page, limit: 20, total, totalPages: Math.ceil(total / 20) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// Admin: Get payment stats
router.get('/admin/stats', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const stats = await getAdminPaymentStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

export default router;
