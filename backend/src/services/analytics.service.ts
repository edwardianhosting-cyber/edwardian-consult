import { prisma } from '../lib/prisma';

export interface AnalyticsTimeSeriesPoint {
  date: string;
  students: number;
  exams: number;
  revenue: number;
}

export interface AdminAnalyticsStats {
  totalStudents: number;
  activeStudents: number;
  totalQuestions: number;
  totalExams: number;
  totalRevenue: number;
  revenueThisMonth: number;
  recentResults: number;
}

export async function getAdminAnalyticsStats(): Promise<AdminAnalyticsStats> {
  const [
    totalStudents,
    activeStudents,
    totalQuestions,
    totalExams,
    totalRevenue,
    revenueThisMonth,
    recentResults,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
    prisma.question.count(),
    prisma.exam.count(),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
    prisma.cbtResult.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    totalStudents,
    activeStudents,
    totalQuestions,
    totalExams,
    totalRevenue: totalRevenue._sum.amount || 0,
    revenueThisMonth: revenueThisMonth._sum.amount || 0,
    recentResults,
  };
}

export async function getAnalyticsTimeSeries(range: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsTimeSeriesPoint[]> {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const [userDays, examDays, paymentDays] = await Promise.all([
    prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT date_trunc('day', "createdAt")::date AS date, COUNT(*)::bigint AS count
      FROM "User"
      WHERE "createdAt" >= ${startDate}
        AND role = 'STUDENT'
      GROUP BY date
      ORDER BY date ASC
    `,
    prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT date_trunc('day', "createdAt")::date AS date, COUNT(*)::bigint AS count
      FROM "Exam"
      WHERE "createdAt" >= ${startDate}
      GROUP BY date
      ORDER BY date ASC
    `,
    prisma.$queryRaw<
      { date: string; revenue: number | null }[]
    >`
      SELECT date_trunc('day', "createdAt")::date AS date, SUM("amount")::numeric AS revenue
      FROM "Payment"
      WHERE "createdAt" >= ${startDate}
        AND status = 'SUCCESS'
      GROUP BY date
      ORDER BY date ASC
    `,
  ]);

  const map = new Map<string, { students: number; exams: number; revenue: number }>();

  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { students: 0, exams: 0, revenue: 0 });
  }

  for (const row of userDays) {
    const key = String(row.date);
    const current = map.get(key) || { students: 0, exams: 0, revenue: 0 };
    current.students = Number(row.count);
    map.set(key, current);
  }

  for (const row of examDays) {
    const key = String(row.date);
    const current = map.get(key) || { students: 0, exams: 0, revenue: 0 };
    current.exams = Number(row.count);
    map.set(key, current);
  }

  for (const row of paymentDays) {
    const key = String(row.date);
    const current = map.get(key) || { students: 0, exams: 0, revenue: 0 };
    current.revenue = Number(row.revenue || 0);
    map.set(key, current);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date: new Date(date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
      students: values.students,
      exams: values.exams,
      revenue: values.revenue,
    }));
}
