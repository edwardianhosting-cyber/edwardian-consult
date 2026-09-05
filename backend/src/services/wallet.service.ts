import { prisma } from '../lib/prisma';

export async function getWalletItems(userId: string) {
  const items = await prisma.walletItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return items;
}

export async function addWalletItem(params: {
  userId: string;
  type: string;
  title: string;
  description?: string;
  fileUrl?: string;
  reference?: string;
  metadata?: any;
}) {
  return prisma.walletItem.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      description: params.description,
      fileUrl: params.fileUrl,
      reference: params.reference,
      metadata: params.metadata,
    },
  });
}

export async function getWalletSummary(userId: string) {
  const items = await prisma.walletItem.findMany({
    where: { userId },
  });

  return {
    totalItems: items.length,
    idCards: items.filter(i => i.type === 'ID_CARD').length,
    certificates: items.filter(i => i.type === 'CERTIFICATE').length,
    receipts: items.filter(i => i.type === 'RECEIPT').length,
    results: items.filter(i => i.type === 'RESULT').length,
    documents: items.filter(i => ['ADMISSION_DOC', 'APPLICATION_DOC'].includes(i.type)).length,
    payments: items.filter(i => i.type === 'PAYMENT_RECORD').length,
    academicRecords: items.filter(i => i.type === 'ACADEMIC_RECORD').length,
  };
}

export async function getWalletBalance(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    await prisma.wallet.create({
      data: { userId, balance: 0, currency: 'NGN' },
    });
    return { balance: 0, currency: 'NGN' };
  }

  return { balance: wallet.balance, currency: wallet.currency };
}

export async function depositToWallet(userId: string, amount: number, reference?: string) {
  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: { balance: { increment: amount } },
    create: { userId, balance: amount, currency: 'NGN' },
  });

  await addWalletItem({
    userId,
    type: 'PAYMENT_RECORD',
    title: `Wallet Deposit - ₦${amount.toLocaleString()}`,
    description: 'Wallet funding',
    reference: reference || `DEP-${Date.now()}`,
    metadata: { type: 'deposit', amount },
  });

  return { balance: wallet.balance, currency: wallet.currency };
}

export async function payFromWallet(userId: string, amount: number, description: string, reference?: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet || wallet.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  const updated = await prisma.wallet.update({
    where: { userId },
    data: { balance: { decrement: amount } },
  });

  await addWalletItem({
    userId,
    type: 'PAYMENT_RECORD',
    title: `Payment - ${description}`,
    description: `Debit: ₦${amount.toLocaleString()}`,
    reference: reference || `PAY-${Date.now()}`,
    metadata: { type: 'payment', amount, description },
  });

  return { balance: updated.balance, currency: updated.currency };
}
