import { prisma } from '../lib/prisma';

interface JAMBSubject {
  id?: string;
  name: string;
  code: string;
}

interface JAMBSubjectCombination {
  id: string;
  course: string;
  subjects: JAMBSubject[];
  compulsory: JAMBSubject[];
  optional: JAMBSubject[];
  createdAt: Date;
}

interface JAMBSyllabus {
  id: string;
  subject: string;
  topics: {
    name: string;
    subtopics: string[];
  }[];
  year: number;
}

interface JAMBNews {
  id: string;
  title: string;
  content: string;
  category: string;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
}

interface JAMBDeadline {
  id: string;
  event: string;
  date: Date;
  description: string;
  isActive: boolean;
  order: number;
}

interface AdminJambSubject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
}

const COURSE_SUBJECT_COMBINATIONS: JAMBSubjectCombination[] = [
  {
    id: '1',
    course: 'Medicine and Surgery',
    subjects: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
      { name: 'Biology', code: 'BIO' },
    ],
    compulsory: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
      { name: 'Biology', code: 'BIO' },
    ],
    optional: [],
    createdAt: new Date(),
  },
  {
    id: '2',
    course: 'Engineering (All)',
    subjects: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MTH' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
    ],
    compulsory: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MTH' },
      { name: 'Physics', code: 'PHY' },
    ],
    optional: [{ name: 'Chemistry', code: 'CHM' }],
    createdAt: new Date(),
  },
  {
    id: '3',
    course: 'Computer Science',
    subjects: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MTH' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
    ],
    compulsory: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MTH' },
    ],
    optional: [
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
      { name: 'Biology', code: 'BIO' },
      { name: 'Economics', code: 'ECO' },
    ],
    createdAt: new Date(),
  },
  {
    id: '4',
    course: 'Law',
    subjects: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Literature in English', code: 'LIT' },
      { name: 'Government', code: 'GOV' },
      { name: 'Christian Religious Studies', code: 'CRS' },
    ],
    compulsory: [{ name: 'English Language', code: 'ENG' }],
    optional: [
      { name: 'Literature in English', code: 'LIT' },
      { name: 'Government', code: 'GOV' },
      { name: 'Christian Religious Studies', code: 'CRS' },
      { name: 'Islamic Religious Studies', code: 'IRS' },
      { name: 'History', code: 'HIS' },
      { name: 'Economics', code: 'ECO' },
    ],
    createdAt: new Date(),
  },
  {
    id: '5',
    course: 'Accounting',
    subjects: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MTH' },
      { name: 'Economics', code: 'ECO' },
      { name: 'Accounting', code: 'ACC' },
    ],
    compulsory: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MTH' },
    ],
    optional: [
      { name: 'Economics', code: 'ECO' },
      { name: 'Accounting', code: 'ACC' },
      { name: 'Commerce', code: 'COM' },
      { name: 'Government', code: 'GOV' },
    ],
    createdAt: new Date(),
  },
  {
    id: '6',
    course: 'Nursing',
    subjects: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
      { name: 'Biology', code: 'BIO' },
    ],
    compulsory: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
      { name: 'Biology', code: 'BIO' },
    ],
    optional: [],
    createdAt: new Date(),
  },
  {
    id: '7',
    course: 'Pharmacy',
    subjects: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
      { name: 'Biology', code: 'BIO' },
    ],
    compulsory: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
    ],
    optional: [{ name: 'Biology', code: 'BIO' }, { name: 'Mathematics', code: 'MTH' }],
    createdAt: new Date(),
  },
  {
    id: '8',
    course: 'Architecture',
    subjects: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MTH' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHM' },
    ],
    compulsory: [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MTH' },
      { name: 'Physics', code: 'PHY' },
    ],
    optional: [{ name: 'Chemistry', code: 'CHM' }, { name: 'Geography', code: 'GEO' }],
    createdAt: new Date(),
  },
];

function mapDbSubject(s: any): AdminJambSubject {
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    description: s.description,
    isActive: s.isActive,
  };
}

function mapDbSyllabus(s: any): JAMBSyllabus {
  return {
    id: s.id,
    subject: s.subject,
    topics: s.topics,
    year: s.year,
  };
}

function mapDbDeadline(d: any): JAMBDeadline {
  return {
    id: d.id,
    event: d.event,
    date: d.date,
    description: d.description || '',
    isActive: d.isActive,
    order: d.order,
  };
}

function getFallbackSubjects(): JAMBSubject[] {
  return [
    { name: 'English Language', code: 'ENG' },
    { name: 'Mathematics', code: 'MTH' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Chemistry', code: 'CHM' },
    { name: 'Biology', code: 'BIO' },
    { name: 'Government', code: 'GOV' },
    { name: 'Economics', code: 'ECO' },
    { name: 'Geography', code: 'GEO' },
    { name: 'Literature in English', code: 'LIT' },
    { name: 'Christian Religious Studies', code: 'CRS' },
    { name: 'Islamic Religious Studies', code: 'IRS' },
    { name: 'Civic Education', code: 'CIV' },
    { name: 'Commerce', code: 'COM' },
    { name: 'Accounting', code: 'ACC' },
    { name: 'Agricultural Science', code: 'AGR' },
    { name: 'Further Mathematics', code: 'FMT' },
    { name: 'History', code: 'HIS' },
    { name: 'Arabic', code: 'ARA' },
    { name: 'French', code: 'FRE' },
    { name: 'Hausa', code: 'HAU' },
    { name: 'Igbo', code: 'IGB' },
    { name: 'Yoruba', code: 'YOR' },
  ];
}

export async function getJAMBSubjects(): Promise<JAMBSubject[]> {
  const subjects = await prisma.jambSubject.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  if (subjects.length === 0) {
    return getFallbackSubjects();
  }
  return subjects.map(s => ({ id: s.id, name: s.name, code: s.code }));
}

export async function getAllJambSubjects(): Promise<AdminJambSubject[]> {
  const subjects = await prisma.jambSubject.findMany({
    orderBy: { name: 'asc' },
  });
  return subjects.map(mapDbSubject);
}

export async function getSubjectCombinations(): Promise<JAMBSubjectCombination[]> {
  return COURSE_SUBJECT_COMBINATIONS;
}

export async function getSubjectCombinationByCourse(courseName: string): Promise<JAMBSubjectCombination | null> {
  return COURSE_SUBJECT_COMBINATIONS.find(
    c => c.course.toLowerCase().includes(courseName.toLowerCase())
  ) || null;
}

export async function checkSubjectCombination(
  courseName: string,
  selectedSubjects: string[]
): Promise<{
  valid: boolean;
  missing: string[];
  extra: string[];
  message: string;
}> {
  const combination = await getSubjectCombinationByCourse(courseName);

  if (!combination) {
    return {
      valid: false,
      missing: [],
      extra: [],
      message: 'Course not found in our database. Please check the course name.',
    };
  }

  const requiredSubjects = combination.compulsory.map(s => s.name);
  const optionalSubjects = combination.optional.map(s => s.name);
  const allValidSubjects = [...requiredSubjects, ...optionalSubjects];

  const missing = requiredSubjects.filter(s => !selectedSubjects.includes(s));
  const extra = selectedSubjects.filter(s => !allValidSubjects.includes(s));

  const valid = missing.length === 0 && selectedSubjects.length >= 4;

  let message = '';
  if (valid) {
    message = 'Your subject combination is valid for this course!';
  } else if (missing.length > 0) {
    message = `Missing required subjects: ${missing.join(', ')}`;
  } else if (selectedSubjects.length < 4) {
    message = 'You need at least 4 subjects including English Language.';
  } else if (extra.length > 0) {
    message = `These subjects are not required: ${extra.join(', ')}`;
  }

  return { valid, missing, extra, message };
}

export async function getJAMBSyllabus(subject?: string): Promise<JAMBSyllabus[]> {
  const where = subject ? { subject: { contains: subject, mode: 'insensitive' as const } } : undefined;
  const items = await prisma.jambSyllabus.findMany({
    where,
    orderBy: [{ year: 'desc' }, { subject: 'asc' }],
  });
  return items.map(mapDbSyllabus);
}

export async function createJambSyllabus(data: { subject: string; year: number; topics: any[]; isActive?: boolean }) {
  return prisma.jambSyllabus.create({ data });
}

export async function updateJambSyllabus(id: string, data: { subject?: string; year?: number; topics?: any[]; isActive?: boolean }) {
  return prisma.jambSyllabus.update({ where: { id }, data });
}

export async function deleteJambSyllabus(id: string) {
  return prisma.jambSyllabus.delete({ where: { id } });
}

export async function getJAMBNews(): Promise<JAMBNews[]> {
  return prisma.newsArticle.findMany({
    where: {
      isPublished: true,
      category: { in: ['JAMB', 'EXAMINATION', 'ADMISSION'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  }) as any;
}

export async function getJAMBDeadlines(): Promise<JAMBDeadline[]> {
  const deadlines = await prisma.jambDeadline.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { date: 'asc' }],
  });
  return deadlines.map(mapDbDeadline);
}

export async function getAllJambDeadlines() {
  const deadlines = await prisma.jambDeadline.findMany({
    orderBy: [{ order: 'asc' }, { date: 'asc' }],
  });
  return deadlines.map(mapDbDeadline);
}

export async function createJambDeadline(data: {
  event: string;
  date: Date;
  description?: string;
  isActive?: boolean;
  order?: number;
}) {
  return prisma.jambDeadline.create({ data });
}

export async function updateJambDeadline(id: string, data: {
  event?: string;
  date?: Date;
  description?: string;
  isActive?: boolean;
  order?: number;
}) {
  return prisma.jambDeadline.update({ where: { id }, data });
}

export async function deleteJambDeadline(id: string) {
  return prisma.jambDeadline.delete({ where: { id } });
}

export async function createJambSubject(data: {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}) {
  return prisma.jambSubject.create({ data });
}

export async function updateJambSubject(id: string, data: {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}) {
  return prisma.jambSubject.update({ where: { id }, data });
}

export async function deleteJambSubject(id: string) {
  return prisma.jambSubject.delete({ where: { id } });
}

export async function getCAPSGuidance(): Promise<{
  title: string;
  steps: string[];
  tips: string[];
}> {
  return {
    title: 'JAMB CAPS (Central Admission Processing System) Guide',
    steps: [
      'Visit the JAMB CAPS portal at caps.jamb.gov.ng',
      'Log in with your JAMB registration number and password',
      'Click on "Check Admission Status"',
      'If admitted, click "Accept" to confirm your admission',
      'If not admitted, wait for subsequent lists or consider change of course/institution',
      'Print your admission letter once accepted',
    ],
    tips: [
      'Check your CAPS regularly for updates',
      'Accept your admission within the given timeframe',
      'If you want to reject an admission, click "Reject" (use with caution)',
      'Ensure your O\'Level results are uploaded on CAPS',
      'Contact JAMB support if you encounter any issues',
    ],
  };
}

export async function getChangeOfCourseGuidance(): Promise<{
  title: string;
  steps: string[];
  requirements: string[];
}> {
  return {
    title: 'JAMB Change of Institution/Course Guide',
    steps: [
      'Visit the JAMB portal at portal.jamb.gov.ng',
      'Log in with your credentials',
      'Select "Change of Course/Institution"',
      'Select your preferred course or institution',
      'Pay the required fee (₦2,500)',
      'Print the change of course/institution slip',
    ],
    requirements: [
      'JAMB registration number',
      'Valid email address',
      'Phone number',
      'Payment method (card or bank)',
      'Must be done during the allowed period',
    ],
  };
}

export async function calculateJAMBScore(
  correctAnswers: number,
  totalQuestions: number
): Promise<{
  score: number;
  percentage: number;
  grade: string;
}> {
  const score = Math.round((correctAnswers / totalQuestions) * 400);
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  let grade = 'F';
  if (percentage >= 70) grade = 'A';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 50) grade = 'C';
  else if (percentage >= 45) grade = 'D';
  else if (percentage >= 40) grade = 'E';

  return { score, percentage, grade };
}

export async function getJAMBResources(): Promise<{
  title: string;
  description: string;
  links: { name: string; url: string }[];
}[]> {
  return [
    {
      title: 'Official JAMB Portal',
      description: 'Register for JAMB and check your results',
      links: [
        { name: 'JAMB Portal', url: 'https://portal.jamb.gov.ng' },
        { name: 'JAMB CAPS', url: 'https://caps.jamb.gov.ng' },
        { name: 'JAMB eFacility', url: 'https://efacility.jamb.gov.ng' },
      ],
    },
    {
      title: 'JAMB Recommended Textbooks',
      description: 'Official textbooks for JAMB preparation',
      links: [
        { name: 'JAMB Brochure', url: 'https://portal.jamb.gov.ng/efacility/' },
      ],
    },
    {
      title: 'Practice Resources',
      description: 'Practice with past questions and mock exams',
      links: [
        { name: 'JAMB Past Questions', url: '/student/jamb/past-questions' },
        { name: 'CBT Practice', url: '/student/cbt' },
        { name: 'Mock Examination', url: '/student/mock' },
      ],
    },
  ];
}
