import { prisma } from '../lib/prisma';
import { createNotification } from './notification.service';

interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: { type: string; value: number | string };
  points: number;
}

const DEFAULT_BADGES: BadgeDefinition[] = [
  // CBT Badges
  { name: 'First Steps', description: 'Complete your first CBT', icon: '🎯', category: 'CBT', requirement: { type: 'cbt_count', value: 1 }, points: 10 },
  { name: 'Practice Makes Perfect', description: 'Complete 10 CBTs', icon: '📚', category: 'CBT', requirement: { type: 'cbt_count', value: 10 }, points: 50 },
  { name: 'CBT Master', description: 'Complete 50 CBTs', icon: '🏆', category: 'CBT', requirement: { type: 'cbt_count', value: 50 }, points: 200 },
  { name: 'Century Club', description: 'Answer 100 questions', icon: '💯', category: 'CBT', requirement: { type: 'questions_answered', value: 100 }, points: 30 },
  { name: 'Question Veteran', description: 'Answer 1000 questions', icon: '🎖️', category: 'CBT', requirement: { type: 'questions_answered', value: 1000 }, points: 300 },

  // Score Badges
  { name: 'High Flyer', description: 'Score 80% or above', icon: '⭐', category: 'SCORE', requirement: { type: 'score_percent', value: 80 }, points: 50 },
  { name: 'Excellence', description: 'Score 90% or above', icon: '🌟', category: 'SCORE', requirement: { type: 'score_percent', value: 90 }, points: 100 },
  { name: 'Perfect Score', description: 'Score 100%', icon: '✨', category: 'SCORE', requirement: { type: 'score_percent', value: 100 }, points: 200 },

  // Streak Badges
  { name: 'Consistent Learner', description: '7-day study streak', icon: '🔥', category: 'STREAK', requirement: { type: 'streak_days', value: 7 }, points: 50 },
  { name: 'Dedicated Student', description: '30-day study streak', icon: '🔥', category: 'STREAK', requirement: { type: 'streak_days', value: 30 }, points: 200 },
  { name: 'Unstoppable', description: '100-day study streak', icon: '🔥', category: 'STREAK', requirement: { type: 'streak_days', value: 100 }, points: 500 },

  // Milestone Badges
  { name: 'Welcome Aboard', description: 'Complete your profile', icon: '👋', category: 'MILESTONE', requirement: { type: 'profile_complete', value: 100 }, points: 20 },
  { name: 'Early Bird', description: 'One of the first 100 students', icon: '🐦', category: 'MILESTONE', requirement: { type: 'early_adopter', value: 100 }, points: 50 },

  // Competition Badges
  { name: 'Top 10', description: 'Rank in top 10 on leaderboard', icon: '🥇', category: 'COMPETITION', requirement: { type: 'leaderboard_rank', value: 10 }, points: 100 },
  { name: 'Top 3', description: 'Rank in top 3 on leaderboard', icon: '🥈', category: 'COMPETITION', requirement: { type: 'leaderboard_rank', value: 3 }, points: 200 },
  { name: 'Number One', description: 'Rank #1 on leaderboard', icon: '🥇', category: 'COMPETITION', requirement: { type: 'leaderboard_rank', value: 1 }, points: 500 },
];

export async function initializeBadges() {
  for (const badge of DEFAULT_BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    });
  }
}

export async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      cbtResults: true,
      studentBadges: { include: { badge: true } },
    },
  });

  if (!user) return [];

  const earnedBadgeIds = new Set(user.studentBadges.map(sb => sb.badgeId));
  const allBadges = await prisma.badge.findMany({ where: { isActive: true } });
  const newlyEarned: string[] = [];

  const cbtCount = user.cbtResults.length;
  const questionsAnswered = user.cbtResults.reduce((sum, r) => sum + r.totalQuestions, 0);
  const avgScore = cbtCount > 0 
    ? user.cbtResults.reduce((sum, r) => sum + r.score, 0) / cbtCount 
    : 0;
  const bestScore = cbtCount > 0 
    ? Math.max(...user.cbtResults.map(r => r.score)) 
    : 0;

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    const req = badge.requirement as { type: string; value: number };
    let earned = false;

    switch (req.type) {
      case 'cbt_count':
        earned = cbtCount >= req.value;
        break;
      case 'questions_answered':
        earned = questionsAnswered >= req.value;
        break;
      case 'score_percent':
        earned = bestScore >= req.value;
        break;
      case 'profile_complete':
        earned = (user.preparationProgress || 0) >= req.value;
        break;
    }

    if (earned) {
      await prisma.studentBadge.create({
        data: { userId, badgeId: badge.id },
      });
      newlyEarned.push(badge.id);

      await createNotification({
        userId,
        title: 'New Badge Earned!',
        message: `Congratulations! You've earned the "${badge.name}" badge. ${badge.description}`,
        type: 'SYSTEM',
        link: '/student/badges',
      });
    }
  }

  return newlyEarned;
}

export async function getUserBadges(userId: string) {
  const [earned, all] = await Promise.all([
    prisma.studentBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    }),
    prisma.badge.findMany({ where: { isActive: true } }),
  ]);

  const earnedIds = new Set(earned.map(e => e.badgeId));

  return {
    earned,
    available: all.filter(b => !earnedIds.has(b.id)),
    totalPoints: earned.reduce((sum, e) => sum + e.badge.points, 0),
  };
}

export async function getLeaderboard(limit = 50, examType?: string) {
  const where: any = {};
  if (examType) {
    where.subject = examType;
  }

  const results = await prisma.cbtResult.groupBy({
    by: ['userId'],
    where,
    _sum: { correctAnswers: true, totalQuestions: true },
    _count: { id: true },
    orderBy: { _sum: { correctAnswers: 'desc' } },
    take: limit,
  });

  const userIds = results.map(r => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, fullName: true, avatar: true, portalId: true, examTypes: true },
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  return results.map((r, index) => {
    const user = userMap.get(r.userId);
    const totalQ = r._sum.totalQuestions || 1;
    const correct = r._sum.correctAnswers || 0;
    return {
      rank: index + 1,
      userId: r.userId,
      name: user?.fullName || 'Unknown',
      avatar: user?.avatar,
      portalId: user?.portalId,
      examTypes: user?.examTypes || [],
      cbtCount: r._count.id,
      totalQuestions: totalQ,
      correctAnswers: correct,
      accuracy: Math.round((correct / totalQ) * 100),
    };
  });
}

export async function getUserRank(userId: string) {
  const leaderboard = await getLeaderboard(1000);
  const userEntry = leaderboard.find(e => e.userId === userId);
  return userEntry || null;
}
