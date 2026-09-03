// Master subject list for the CBT portal (backend).
// Mirror of `frontend/src/lib/subjects.ts` — keep in sync.

export const CORE_SUBJECTS = [
  'English Language',
  'General Mathematics',
  'Civic Education',
];

export const SCIENCE_SUBJECTS = [
  'Physics',
  'Chemistry',
  'Biology',
  'Further Mathematics',
  'Agricultural Science',
  'Geography',
  'Computer Studies',
  'Data Processing',
  'Technical Drawing',
];

export const COMMERCIAL_SUBJECTS = [
  'Economics',
  'Financial Accounting',
  'Commerce',
  'Marketing',
  'Office Practice',
  'Insurance',
  'Government',
  'Computer Studies',
  'Data Processing',
];

export const ART_SUBJECTS = [
  'Literature in English',
  'Government',
  'Christian Religious Studies',
  'Islamic Religious Studies',
  'History',
  'Economics',
  'Geography',
  'Nigerian Language',
  'French',
  'Fine Arts',
  'Music',
  'Yoruba',
  'Igbo',
  'Hausa',
];

export const ICT_SUBJECTS = [
  'Computer Studies',
  'Data Processing',
  'Computer Science',
  'ICT',
];

export const VOCATIONAL_SUBJECTS = [
  'Food and Nutrition',
  'Home Management',
  'Clothing and Textiles',
  'Fisheries',
  'Animal Husbandry',
  'Catering Craft Practice',
  'Garment Making',
  'Photography',
  'Tourism',
];

export const ALL_SUBJECTS: string[] = Array.from(
  new Set([
    ...CORE_SUBJECTS,
    ...SCIENCE_SUBJECTS,
    ...COMMERCIAL_SUBJECTS,
    ...ART_SUBJECTS,
    ...ICT_SUBJECTS,
    ...VOCATIONAL_SUBJECTS,
  ])
).sort();

export const JAMB_SUBJECTS: string[] = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature in English',
  'Christian Religious Studies',
  'Islamic Religious Studies',
  'Commerce',
  'Accounting',
  'Geography',
  'History',
  'Agricultural Science',
  'Further Mathematics',
  'Technical Drawing',
  'French',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Computer Studies',
  'Data Processing',
  'Insurance',
  'Marketing',
  'Office Practice',
  'Music',
  'Fine Arts',
];
