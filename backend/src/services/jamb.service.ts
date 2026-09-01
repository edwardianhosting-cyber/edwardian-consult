import { prisma } from '../lib/prisma';

interface JAMBSubject {
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

const JAMB_SUBJECTS: JAMBSubject[] = [
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

const SYLLABUS_DATA: JAMBSyllabus[] = [
  {
    id: '1',
    subject: 'English Language',
    topics: [
      {
        name: 'Comprehension',
        subtopics: [
          'Passage analysis',
          'Summary writing',
          'Inference and deduction',
          'Vocabulary in context',
        ],
      },
      {
        name: 'Grammar',
        subtopics: [
          'Parts of speech',
          'Tenses',
          'Subject-verb agreement',
          'Punctuation',
          'Sentence structure',
        ],
      },
      {
        name: 'Oral English',
        subtopics: [
          'Vowels and consonants',
          'Stress and intonation',
          'Phonetic symbols',
          'Rhyme and rhythm',
        ],
      },
      {
        name: 'Literature',
        subtopics: [
          'Prose',
          'Drama',
          'Poetry',
          'Literary devices',
        ],
      },
    ],
    year: 2026,
  },
  {
    id: '2',
    subject: 'Mathematics',
    topics: [
      {
        name: 'Algebra',
        subtopics: [
          'Equations (linear, quadratic, simultaneous)',
          'Polynomials',
          'Inequalities',
          'Sequences and series',
        ],
      },
      {
        name: 'Geometry and Trigonometry',
        subtopics: [
          'Plane geometry',
          'Coordinate geometry',
          'Trigonometric ratios',
          'Circle theorems',
        ],
      },
      {
        name: 'Calculus',
        subtopics: [
          'Differentiation',
          'Integration',
          'Applications of calculus',
        ],
      },
      {
        name: 'Statistics and Probability',
        subtopics: [
          'Measures of central tendency',
          'Measures of dispersion',
          'Probability distributions',
        ],
      },
    ],
    year: 2026,
  },
  {
    id: '3',
    subject: 'Physics',
    topics: [
      {
        name: 'Mechanics',
        subtopics: [
          'Motion (kinematics, dynamics)',
          'Forces',
          'Energy and work',
          'Momentum',
          'Gravitation',
        ],
      },
      {
        name: 'Electricity and Magnetism',
        subtopics: [
          'Electric fields and charges',
          'Current electricity',
          'Magnetism',
          'Electromagnetic induction',
        ],
      },
      {
        name: 'Waves and Optics',
        subtopics: [
          'Wave motion',
          'Sound waves',
          'Light waves',
          'Optical instruments',
        ],
      },
      {
        name: 'Modern Physics',
        subtopics: [
          'Atomic structure',
          'Radioactivity',
          'Quantum physics',
        ],
      },
    ],
    year: 2026,
  },
  {
    id: '4',
    subject: 'Chemistry',
    topics: [
      {
        name: 'Physical Chemistry',
        subtopics: [
          'Atomic structure',
          'Chemical bonding',
          'States of matter',
          'Thermodynamics',
          'Electrochemistry',
        ],
      },
      {
        name: 'Organic Chemistry',
        subtopics: [
          'Hydrocarbons',
          'Functional groups',
          'Reactions and mechanisms',
          'Polymers',
        ],
      },
      {
        name: 'Inorganic Chemistry',
        subtopics: [
          'Periodic table',
          'Transition metals',
          'Acids, bases, and salts',
        ],
      },
    ],
    year: 2026,
  },
  {
    id: '5',
    subject: 'Biology',
    topics: [
      {
        name: 'Cell Biology',
        subtopics: [
          'Cell structure',
          'Cell division',
          'Cell physiology',
        ],
      },
      {
        name: 'Genetics',
        subtopics: [
          'Mendelian genetics',
          'Molecular genetics',
          'Evolution',
        ],
      },
      {
        name: 'Ecology',
        subtopics: [
          'Ecosystems',
          'Energy flow',
          'Population ecology',
          'Conservation',
        ],
      },
      {
        name: 'Human Physiology',
        subtopics: [
          'Digestive system',
          'Circulatory system',
          'Nervous system',
          'Reproductive system',
        ],
      },
    ],
    year: 2026,
  },
];

export async function getJAMBSubjects(): Promise<JAMBSubject[]> {
  return JAMB_SUBJECTS;
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
  if (subject) {
    return SYLLABUS_DATA.filter(s => s.subject.toLowerCase() === subject.toLowerCase());
  }
  return SYLLABUS_DATA;
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

export async function getJAMBDeadlines(): Promise<{
  event: string;
  date: string;
  description: string;
}[]> {
  const currentYear = new Date().getFullYear();
  return [
    {
      event: 'JAMB Registration',
      date: `${currentYear}-01-31`,
      description: 'Deadline for JAMB UTME registration',
    },
    {
      event: 'JAMB Mock Examination',
      date: `${currentYear}-03-15`,
      description: 'JAMB Mock UTME examination date',
    },
    {
      event: 'JAMB UTME Examination',
      date: `${currentYear}-04-18`,
      description: 'Main JAMB UTME examination begins',
    },
    {
      event: 'JAMB Result Release',
      date: `${currentYear}-05-20`,
      description: 'Expected JAMB result release date',
    },
    {
      event: 'Post-UTME Registration',
      date: `${currentYear}-06-01`,
      description: 'Post-UTME registration begins for most institutions',
    },
    {
      event: 'Post-UTME Examination',
      date: `${currentYear}-08-15`,
      description: 'Post-UTME examinations for most institutions',
    },
    {
      event: 'Admission List',
      date: `${currentYear}-09-01`,
      description: 'First batch admission list release',
    },
    {
      event: 'JAMB CAPS',
      date: `${currentYear}-09-15`,
      description: 'JAMB CAPS admission status checking',
    },
  ];
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
