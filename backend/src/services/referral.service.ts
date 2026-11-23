import { prisma } from '../lib/prisma';
import { sendEmail } from '../lib/email';

export function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName}${random}`;
}

export async function createReferral(referrerId: string, referredEmail: string) {
  const user = await prisma.user.findUnique({ where: { id: referrerId } });
  if (!user) throw new Error('User not found');

  const referralCode = user.portalId.slice(-8).toUpperCase();

  const referral = await prisma.referral.create({
    data: {
      referrerId,
      referredEmail,
      referralCode,
      status: 'PENDING',
    },
  });

  const subject = 'You are invited to Edwardian Educational Consult';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:30px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Edwardian Educational Consult</h1>
        <p style="color:#FFD700;margin:10px 0 0 0;">You are invited</p>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2 style="color:#333;">Hello,</h2>
        <p>You have been invited to join Edwardian Educational Consult by a current student.</p>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #6B003B;">
          <p style="margin:0 0 10px 0;color:#333;"><strong>Referral Code:</strong> <span style="color:#6B003B;font-weight:bold;font-size:18px;">${referralCode}</span></p>
          <p style="margin:0;color:#666;font-size:14px;">Use this code during registration to complete the referral.</p>
        </div>
        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://edwardian-consult.vercel.app'}/register"
             style="display:inline-block;background:#FFD700;color:#6B003B;padding:15px 40px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
            REGISTER NOW
          </a>
        </div>
      </div>
    </div>
  `;

  sendEmail({
    to: referredEmail,
    subject,
    html,
    purpose: 'NOTIFICATION',
  }).catch((err) => console.error('[referral] invite email failed:', err));

  return referral;
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
      referredUserId: newUserId,
    },
  });

  return referral;
}
