import { prisma } from '../lib/prisma';

export function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName}${random}`;
}

export async function createReferral(referrerId: string, referredEmail: string) {
  const user = await prisma.user.findUnique({ where: { id: referrerId } });
  if (!user) throw new Error('User not found');

  const referralCode = user.portalId.slice(-8).toUpperCase();

  return prisma.referral.create({
    data: {
      referrerId,
      referredEmail,
      referralCode,
      status: 'PENDING',
    },
  });
}

export async function getReferralsByUser(userId: string) {
  return prisma.referral.findMany({
    where: { referrerId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
  });

  return {
    totalReferrals: referrals.length,
    pending: referrals.filter((r: any) => r.status === 'PENDING').length,
    registered: referrals.filter((r: any) => r.status === 'REGISTERED').length,
    converted: referrals.filter((r: any) => r.status === 'CONVERTED').length,
    rewardsGiven: referrals.filter((r: any) => r.rewardGiven).length,
  };
}

export async function useReferralCode(referralCode: string, newUserId: string) {
  const referral = await prisma.referral.findFirst({
    where: { referralCode, status: 'PENDING' },
  });

  if (!referral) return null;

  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: 'REGISTERED',
      registeredAt: new Date(),
    },
  });

  return referral;
}
