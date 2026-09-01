import { prisma } from '../lib/prisma';
import { createNotification } from './notification.service';

const ERCAS_API_URL = process.env.ERCAS_API_URL || 'https://api.ercaspay.com';
const ERCAS_API_KEY = process.env.ERCAS_API_KEY;
const ERCAS_MERCHANT_ID = process.env.ERCAS_MERCHANT_ID;

interface ERCASPaymentRequest {
  amount: number;
  currency?: string;
  reference: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

interface ERCASPaymentResponse {
  success: boolean;
  paymentUrl: string;
  reference: string;
  message?: string;
}

interface ERCASVerificationResponse {
  success: boolean;
  status: 'pending' | 'successful' | 'failed';
  amount: number;
  reference: string;
  customerEmail: string;
  metadata?: Record<string, any>;
}

export async function initiateERCASPayment(params: ERCASPaymentRequest): Promise<ERCASPaymentResponse> {
  try {
    const response = await fetch(`${ERCAS_API_URL}/v1/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ERCAS_API_KEY}`,
        'Merchant-ID': ERCAS_MERCHANT_ID || '',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || 'NGN',
        reference: params.reference,
        customer_email: params.customerEmail,
        customer_name: params.customerName,
        customer_phone: params.customerPhone,
        description: params.description,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        paymentUrl: data.data.payment_url,
        reference: data.data.reference,
      };
    }

    return {
      success: false,
      paymentUrl: '',
      reference: params.reference,
      message: data.message || 'Payment initialization failed',
    };
  } catch (error) {
    console.error('ERCAS payment initiation error:', error);
    return {
      success: false,
      paymentUrl: '',
      reference: params.reference,
      message: 'Payment service unavailable',
    };
  }
}

export async function verifyERCASPayment(reference: string): Promise<ERCASVerificationResponse> {
  try {
    const response = await fetch(`${ERCAS_API_URL}/v1/payments/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ERCAS_API_KEY}`,
        'Merchant-ID': ERCAS_MERCHANT_ID || '',
      },
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        status: data.data.status,
        amount: data.data.amount,
        reference: data.data.reference,
        customerEmail: data.data.customer_email,
        metadata: data.data.metadata,
      };
    }

    return {
      success: false,
      status: 'failed',
      amount: 0,
      reference,
      customerEmail: '',
    };
  } catch (error) {
    console.error('ERCAS payment verification error:', error);
    return {
      success: false,
      status: 'failed',
      amount: 0,
      reference,
      customerEmail: '',
    };
  }
}

export async function createPaymentRecord(params: {
  userId: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  reference: string;
  metadata?: any;
}) {
  return prisma.payment.create({
    data: {
      userId: params.userId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      description: params.description,
      reference: params.reference,
      metadata: params.metadata,
      status: 'PENDING',
    },
  });
}

export async function processSuccessfulPayment(reference: string) {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: {
      user: {
        select: { fullName: true, email: true, studentEmail: true },
      },
    },
  });

  if (!payment) throw new Error('Payment not found');

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'COMPLETED', paidAt: new Date() },
  });

  await prisma.walletItem.create({
    data: {
      userId: payment.userId,
      type: 'RECEIPT',
      title: payment.description || 'Payment Receipt',
      description: `Payment of ₦${payment.amount.toLocaleString()}`,
      reference: payment.reference,
      metadata: {
        amount: payment.amount,
        date: payment.paidAt,
        reference: payment.reference,
      },
    },
  });

  await createNotification({
    userId: payment.userId,
    title: 'Payment Successful',
    message: `Your payment of ₦${payment.amount.toLocaleString()} has been confirmed. Reference: ${reference}`,
    type: 'PAYMENT',
    priority: 'IMPORTANT',
    link: '/student/wallet',
    entityType: 'PAYMENT',
    entityId: payment.id,
    channels: ['DASHBOARD', 'EMAIL'],
    emailSubject: 'Payment Confirmation',
    smsContent: `Your payment of ₦${payment.amount.toLocaleString()} has been confirmed. Ref: ${reference}`,
  });

  return updatedPayment;
}

export async function handleFailedPayment(reference: string, reason?: string) {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) throw new Error('Payment not found');

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'FAILED' },
  });

  await createNotification({
    userId: payment.userId,
    title: 'Payment Failed',
    message: `Your payment of ₦${payment.amount.toLocaleString()} failed. ${reason || 'Please try again.'}`,
    type: 'PAYMENT',
    priority: 'URGENT',
    link: '/student/payments',
    entityType: 'PAYMENT',
    entityId: payment.id,
    channels: ['DASHBOARD', 'EMAIL', 'SMS'],
    emailSubject: 'Payment Failed',
    smsContent: `Your payment of ₦${payment.amount.toLocaleString()} failed. Please try again or contact support.`,
  });

  return updatedPayment;
}

export function generatePaymentReference(): string {
  const prefix = 'EEC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function getUserPayments(userId: string, page = 1, limit = 20) {
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where: { userId } }),
  ]);

  return {
    payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPaymentStats(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { userId, status: 'COMPLETED' },
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonth = payments.filter(p => {
    const now = new Date();
    return p.paidAt && p.paidAt.getMonth() === now.getMonth() && p.paidAt.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + p.amount, 0);

  return {
    totalPaid,
    thisMonth,
    paymentCount: payments.length,
  };
}

export async function getAdminPaymentStats() {
  const [totalRevenue, thisMonthRevenue, pendingPayments, failedPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.payment.count({ where: { status: 'FAILED' } }),
  ]);

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    thisMonthRevenue: thisMonthRevenue._sum.amount || 0,
    pendingPayments,
    failedPayments,
  };
}
