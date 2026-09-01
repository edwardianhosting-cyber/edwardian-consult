import { prisma } from '../lib/prisma';

interface CreateScholarshipParams {
  title: string;
  description: string;
  provider: string;
  amount?: number;
  currency?: string;
  eligibility: any;
  deadline?: Date;
  applicationUrl?: string;
}

export async function createScholarship(params: CreateScholarshipParams) {
  return prisma.scholarship.create({
    data: {
      title: params.title,
      description: params.description,
      provider: params.provider,
      amount: params.amount,
      currency: params.currency || 'NGN',
      eligibility: params.eligibility,
      deadline: params.deadline,
      applicationUrl: params.applicationUrl,
    },
  });
}

export async function getScholarships(filters?: {
  level?: string;
  field?: string;
  location?: string;
}) {
  const scholarships = await prisma.scholarship.findMany({
    where: { isActive: true },
    orderBy: { deadline: 'asc' },
  });

  if (!filters) return scholarships;

  return scholarships.filter((s: any) => {
    const eligibility = s.eligibility as any;
    if (filters.level && eligibility.level !== filters.level) return false;
    if (filters.field && eligibility.field !== filters.field) return false;
    if (filters.location && eligibility.location !== filters.location) return false;
    return true;
  });
}

export async function matchScholarships(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const scholarships = await prisma.scholarship.findMany({
    where: { isActive: true },
  });

  return scholarships.filter((s: any) => {
    const eligibility = s.eligibility as any;
    
    // Match by programme/level
    if (eligibility.level === 'undergraduate' && (user as any).programme === 'JAMB') return true;
    if (eligibility.level === 'secondary' && ['WAEC', 'NECO'].includes((user as any).programme || '')) return true;
    
    // Match by field of study
    if (eligibility.field && (user as any).targetCourse) {
      const fieldKeywords: Record<string, string[]> = {
        'STEM': ['Science', 'Engineering', 'Technology', 'Mathematics', 'Computer', 'Medicine'],
        'Arts': ['Arts', 'Literature', 'History', 'Language'],
        'Social Science': ['Economics', 'Government', 'Sociology', 'Psychology'],
      };
      
      const keywords = fieldKeywords[eligibility.field] || [];
      if (keywords.some(k => (user as any).targetCourse?.includes(k))) return true;
    }
    
    return true; // Show all by default
  });
}

export async function deleteScholarship(id: string) {
  return prisma.scholarship.update({
    where: { id },
    data: { isActive: false },
  });
}
