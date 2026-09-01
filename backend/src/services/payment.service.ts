import { prisma } from '../lib/prisma';
import { createNotification } from './notification.service';

interface CreatePaymentParams {
  userId: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  metadata?: any;
}

export async function createPayment(params: CreatePaymentParams) {
  const reference = generateReference();

  return prisma.payment.create({
    data: {
      userId: params.userId,
      reference,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      description: params.description,
      metadata: params.metadata,
      status: 'PENDING',
    },
  });
}

export async function verifyPayment(reference: string) {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { user: { select: { fullName: true, email: true, studentEmail: true } } },
  });

  if (!payment) throw new Error('Payment not found');

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'COMPLETED', paidAt: new Date() },
  });

  // Create wallet item
  await prisma.walletItem.create({
    data: {
      userId: payment.userId,
      type: 'PAYMENT_RECORD',
      title: payment.description || 'Payment',
      description: `Payment of ₦${payment.amount.toLocaleString()}`,
      reference: payment.reference,
      metadata: { amount: payment.amount, date: payment.paidAt },
    },
  });

  // Send notification
  await createNotification({
    userId: payment.userId,
    title: 'Payment Successful',
    message: `Your payment of ₦${payment.amount.toLocaleString()} has been confirmed. Reference: ${reference}`,
    type: 'PAYMENT',
    link: '/student/wallet',
    emailSubject: 'Payment Confirmation',
  });

  return updatedPayment;
}

export async function failPayment(reference: string, reason?: string) {
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
    link: '/student/payments',
  });

  return updatedPayment;
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

function generateReference(): string {
  const prefix = 'EEC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
