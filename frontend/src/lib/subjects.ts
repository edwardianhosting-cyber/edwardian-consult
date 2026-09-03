// Master subject list for the CBT portal.
// Used by the registration form, student courses page, and study service.
// Subjects are deduplicated across the Science, Commercial, and Art
// classes and organized by category for easy reuse.

// Core (compulsory across all classes)
export const CORE_SUBJECTS = [
  'English Language',
  'General Mathematics',
  'Civic Education',
] as const;

// Science class subjects
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
] as const;

// Commercial class subjects
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
] as const;

// Art class subjects
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
] as const;

// Technology & ICT
export const ICT_SUBJECTS = [
  'Computer Studies',
  'Data Processing',
  'Computer Science',
  'ICT',
] as const;

// Vocational subjects
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
] as const;

// Combined deduped master list (registration/CBT pickers, My Courses)
export const ALL_SUBJECTS: readonly string[] = Array.from(
  new Set([
    ...CORE_SUBJECTS,
    ...SCIENCE_SUBJECTS,
    ...COMMERCIAL_SUBJECTS,
    ...ART_SUBJECTS,
    ...ICT_SUBJECTS,
    ...VOCATIONAL_SUBJECTS,
  ])
).sort() as string[];

// JAMB picks (no Civic Education, no vocationals, no Nigerian languages
// beyond the JAMB-recognised ones; mirrors the official JAMB subject list).
export const JAMB_SUBJECTS: readonly string[] = [
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

// WAEC / NECO picks include the broader curriculum (vocationals, languages, art).
export const WAEC_NECO_SUBJECTS: readonly string[] = Array.from(
  new Set([
    ...ALL_SUBJECTS,
  ])
).sort() as string[];

// Display categories for the registration form
export const SUBJECT_CATEGORIES = [
  { id: 'core', label: 'Core Subjects', subjects: CORE_SUBJECTS },
  { id: 'science', label: 'Science', subjects: SCIENCE_SUBJECTS },
  { id: 'commercial', label: 'Commercial', subjects: COMMERCIAL_SUBJECTS },
  { id: 'art', label: 'Arts', subjects: ART_SUBJECTS },
  { id: 'ict', label: 'Technology & ICT', subjects: ICT_SUBJECTS },
  { id: 'vocational', label: 'Vocational', subjects: VOCATIONAL_SUBJECTS },
] as const;
