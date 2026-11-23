import { prisma } from '../lib/prisma';
import { getPerformanceAnalysis } from './cbt.service';

interface StudyPlanConfig {
  examDate: Date;
  targetScore: number;
  subjects: string[];
  availableHoursPerDay: number;
  startDate?: Date;
}

export async function generateStudyPlan(userId: string, config: StudyPlanConfig) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const startDate = config.startDate || new Date();
  const daysUntilExam = Math.ceil((config.examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExam <= 0) {
    throw new Error('Exam date must be in the future');
  }

  const performance = await getPerformanceAnalysis(userId);
  
  // Prioritize weak subjects
  const subjectPriority = config.subjects.map(subject => {
    const weak = performance.weaknesses.find(w => w.subject === subject);
    const strong = performance.strengths.find(s => s.subject === subject);
    const priority = weak ? 3 : strong ? 1 : 2;
    return { subject, priority };
  }).sort((a, b) => b.priority - a.priority);

  const topicsBySubject: Record<string, string[]> = {
    'English Language': ['Comprehension', 'Grammar', 'Vocabulary', 'Oral English', 'Essay Writing', 'Summary'],
    'General Mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Number Theory', 'Probability'],
    'Mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Number Theory', 'Probability'],
    'Physics': ['Mechanics', 'Electricity', 'Magnetism', 'Waves', 'Thermodynamics', 'Optics', 'Modern Physics'],
    'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry'],
    'Biology': ['Cell Biology', 'Genetics', 'Ecology', 'Physiology', 'Evolution', 'Reproduction'],
    'Economics': ['Microeconomics', 'Macroeconomics', 'International Trade', 'Public Finance'],
    'Government': ['Constitution', 'Political System', 'International Relations', 'Public Administration'],
    'Literature in English': ['Prose', 'Drama', 'Poetry', 'Literary Terms', 'Literary Devices'],
    'Christian Religious Studies': ['Old Testament', 'New Testament', 'Church History', 'Christian Living'],
    'Islamic Religious Studies': ['Quran', 'Hadith', 'Islamic Law', 'Islamic History'],
    'Geography': ['Physical Geography', 'Human Geography', 'Map Reading', 'Climate', 'Geopolitics'],
    'History': ['Nigerian History', 'African History', 'World History', 'Government History'],
    'Commerce': ['Trade', 'Finance', 'Banking', 'Insurance', 'Marketing'],
    'Accounting': ['Financial Accounting', 'Cost Accounting', 'Auditing', 'Taxation'],
    'Financial Accounting': ['Financial Accounting', 'Cost Accounting', 'Auditing', 'Taxation'],
    'Further Mathematics': ['Advanced Algebra', 'Complex Numbers', 'Mechanics', 'Statistics'],
    'Agricultural Science': ['Crop Production', 'Animal Husbandry', 'Soil Science', 'Agricultural Economics'],
    'Computer Studies': ['Computer Fundamentals', 'Programming', 'Networking', 'Data Processing'],
    'ICT': ['Computer Fundamentals', 'Programming', 'Networking', 'Data Processing'],
    'Computer Science': ['Algorithms', 'Data Structures', 'Programming', 'Databases'],
    'Data Processing': ['Data Entry', 'Spreadsheets', 'Databases', 'Office Suites'],
    'Technical Drawing': ['Engineering Drawing', 'Geometric Construction', 'Isometric Drawing', 'CAD'],
    'Civic Education': ['Citizenship', 'Nationalism', 'Human Rights', 'Constitutionalism'],
    'French': ['Grammar', 'Vocabulary', 'Comprehension', 'Composition'],
    'Yoruba': ['Grammar', 'Vocabulary', 'Literature', 'Composition'],
    'Igbo': ['Grammar', 'Vocabulary', 'Literature', 'Composition'],
    'Hausa': ['Grammar', 'Vocabulary', 'Literature', 'Composition'],
    'Nigerian Language': ['Grammar', 'Vocabulary', 'Literature', 'Composition'],
    'Fine Arts': ['Drawing', 'Painting', 'Sculpture', 'Art History'],
    'Fine Art': ['Drawing', 'Painting', 'Sculpture', 'Art History'],
    'Music': ['Theory', 'Composition', 'Performance', 'Music History'],
    'Marketing': ['Principles of Marketing', 'Consumer Behaviour', 'Sales', 'Advertising'],
    'Office Practice': ['Office Procedures', 'Filing', 'Communication', 'Records Management'],
    'Insurance': ['Principles of Insurance', 'Risk Management', 'Underwriting', 'Claims'],
    'Food and Nutrition': ['Food Science', 'Nutrition', 'Meal Planning', 'Food Hygiene'],
    'Home Management': ['Home Economics', 'Family Living', 'Resource Management'],
    'Clothing and Textiles': ['Textile Science', 'Garment Construction', 'Fashion Design'],
    'Fisheries': ['Aquaculture', 'Fish Biology', 'Fish Farming', 'Fisheries Management'],
    'Animal Husbandry': ['Livestock Production', 'Animal Health', 'Breeding', 'Nutrition'],
    'Catering Craft Practice': ['Food Preparation', 'Catering Services', 'Hospitality'],
    'Garment Making': ['Pattern Making', 'Sewing', 'Fashion Design'],
    'Photography': ['Camera Operation', 'Composition', 'Lighting', 'Photo Editing'],
    'Tourism': ['Travel', 'Hospitality', 'Tour Operations', 'Tourism Marketing'],
  };

  const tasks: { subject: string; topic: string; dayNumber: number }[] = [];
  let dayNumber = 1;

  for (let day = 0; day < daysUntilExam && day < 90; day++) {
    const subjectsForDay = subjectPriority.slice(0, Math.min(3, subjectPriority.length));
    
    for (const { subject } of subjectsForDay) {
      const topics = topicsBySubject[subject] || ['General'];
      const topicIndex = day % topics.length;
      
      tasks.push({
        subject,
        topic: topics[topicIndex],
        dayNumber,
      });
    }
    
    dayNumber++;
  }

  // Add CBT practice every 3 days
  for (let i = 2; i < dayNumber; i += 3) {
    tasks.push({
      subject: 'CBT Practice',
      topic: 'Mixed Review',
      dayNumber: i,
    });
  }

  const plan = await prisma.studyPlan.create({
    data: {
      userId,
      title: `${daysUntilExam}-Day Study Plan`,
      description: `Personalized study plan targeting ${config.targetScore}% score`,
      startDate,
      endDate: config.examDate,
      tasks: {
        create: tasks,
      },
    },
    include: { tasks: true },
  });

  return plan;
}

export async function getUserStudyPlans(userId: string) {
  return prisma.studyPlan.findMany({
    where: { userId },
    include: {
      tasks: {
        orderBy: { dayNumber: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTodayTasks(userId: string) {
  const activePlan = await prisma.studyPlan.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!activePlan) return [];

  const today = new Date();
  const dayNumber = Math.ceil((today.getTime() - activePlan.startDate.getTime()) / (1000 * 60 * 60 * 24));

  return prisma.studyTask.findMany({
    where: {
      planId: activePlan.id,
      dayNumber: { lte: dayNumber },
    },
    orderBy: [{ dayNumber: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function completeTask(userId: string, taskId: string) {
  const task = await prisma.studyTask.findFirst({
    where: { id: taskId, plan: { userId } },
  });

  if (!task) throw new Error('Task not found');

  return prisma.studyTask.update({
    where: { id: taskId },
    data: { isCompleted: true, completedAt: new Date() },
  });
}

export async function getTargetScoreTracker(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const targetScore = parseInt(user.targetScore || '300');
  const results = await prisma.cbtResult.findMany({
    where: { userId },
    orderBy: { completedAt: 'asc' },
  });

  const currentAverage = results.length > 0
    ? results.reduce((sum, r) => sum + r.score, 0) / results.length
    : 0;

  const requiredIncrease = Math.max(0, targetScore - currentAverage);
  const progressPercent = targetScore > 0 ? Math.min(100, (currentAverage / targetScore) * 100) : 0;

  return {
    targetScore,
    currentAverage: Math.round(currentAverage),
    requiredIncrease: Math.round(requiredIncrease),
    progressPercent: Math.round(progressPercent),
    totalCBTs: results.length,
    history: results.map(r => ({
      date: r.completedAt,
      score: r.score,
      subject: r.subject,
    })),
  };
}

export async function getUserSubjects(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { jambSubjects: true },
  });

  if (!user) throw new Error('User not found');
  return (user.jambSubjects as string[]) || [];
}

export async function updateUserSubjects(userId: string, subjects: string[]): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const max = maxSubjectsForProgramme(user.examTypes as string[] | undefined, user.programme);
  if (subjects.length > max) {
    throw new Error(
      `You can register a maximum of ${max} subject${max === 1 ? '' : 's'} for ${
        max === 4 ? 'JAMB / Post-UTME' : 'O\'Level (WAEC / NECO)'
      }. Please remove ${subjects.length - max} subject${subjects.length - max === 1 ? '' : 's'} before saving.`
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { jambSubjects: subjects },
    select: { jambSubjects: true },
  });

  return (updated.jambSubjects as string[]) || [];
}

export function maxSubjectsForProgramme(
  examTypes: string[] | undefined,
  programme: string | null | undefined
): number {
  const types = (examTypes || []).map((t) => t.toUpperCase());
  const prog = (programme || '').toUpperCase();
  if (types.includes('JAMB') || types.includes('POST_UTME') || prog === 'JAMB' || prog === 'POST-UTME' || prog === 'POST_UTME') {
    return 4;
  }
  if (types.includes('WAEC') || types.includes('NECO') || prog === 'WAEC' || prog === 'NECO') {
    return 9;
  }
  return 9; // default to O'Level limit when unspecified
}
