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

export async function getAllWalletItems(filters?: { type?: string; userId?: string }) {
  const where: any = {};
  if (filters?.type) where.type = filters.type;
  if (filters?.userId) where.userId = filters.userId;

  return prisma.walletItem.findMany({
    where,
    include: {
      user: {
        select: { fullName: true, email: true, portalId: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMonthlyWalletStats() {
  const items = await prisma.walletItem.findMany({
    where: { type: 'PAYMENT_RECORD' },
    include: {
      user: {
        select: { fullName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const monthlyMap = new Map<string, { month: string; year: number; total: number; count: number; items: any[] }>();

  for (const item of items) {
    const date = new Date(item.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { month: monthName, year: date.getFullYear(), total: 0, count: 0, items: [] });
    }

    const stats = monthlyMap.get(monthKey)!;
    const metadata = item.metadata as any;
    const amount = typeof metadata?.amount === 'number' ? metadata.amount : 0;
    stats.total += amount;
    stats.count += 1;
    stats.items.push(item);
  }

  return Array.from(monthlyMap.values()).sort((a, b) => b.year - a.year || a.month.localeCompare(b.month));
}

export async function getAdminWalletStats() {
  const [totalItems, paymentItems] = await Promise.all([
    prisma.walletItem.count(),
    prisma.walletItem.count({ where: { type: 'PAYMENT_RECORD' } }),
  ]);

  return {
    totalItems,
    paymentItems,
  };
}
