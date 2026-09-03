// Master subject list for the CBT portal.
// Used by the registration form, student courses page, and study service.
// Subjects are deduplicated across the Science, Commercial, and Art
// classes and organized by category for easy reuse.

// Core (compulsory across all classes)
export const CORE_SUBJECTS = [
  'English Language',
  'General Mathematics',
  'Civic Education',
  'Health Education',
  'Physical Education',
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
  'Animal Husbandry',
  'Fisheries',
  'Horticulture and Crop Production',
  'Livestock Farming',
  'Food and Nutrition',
] as const;

// Commercial class subjects
export const COMMERCIAL_SUBJECTS = [
  'Economics',
  'Financial Accounting',
  'Commerce',
  'Marketing',
  'Office Practice',
  'Insurance',
  'Business Studies',
  'Store Keeping',
  'Store Management',
  'Book Keeping',
  'Business Management',
  'Salesmanship',
  'Principles of Cost Accounting',
  'Typing',
  'Shorthand',
  'Keyboard',
] as const;

// Art class subjects
export const ART_SUBJECTS = [
  'Literature in English',
  'Government',
  'History',
  'Christian Religious Studies',
  'Islamic Religious Studies',
  'French',
  'Arabic',
  'Music',
  'Visual Arts',
  'Fine Art',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Edo',
  'Efik',
  'Ibibio',
  'Nigerian Language',
  'Photography',
  'Ceramics',
  'Picture Making',
  'Painting and Decorating',
] as const;

// Technology & ICT
export const ICT_SUBJECTS = [
  'Computer Studies',
  'Data Processing',
  'Computer Science',
  'ICT',
  'Information Communication Technology',
  'Graphic Design',
  'Printing Practice',
  'Solar Photovoltaic Installation and Maintenance',
  'Computer Hardware and GSM Repairs',
  'GSM Phones Maintenance and Repairs',
] as const;

// Vocational subjects
export const VOCATIONAL_SUBJECTS = [
  'Home Management',
  'Home Economics',
  'Clothing and Textiles',
  'Catering Craft Practice',
  'Garment Making',
  'Tourism',
  'Mining',
  'Blocklaying',
  'Bricklaying and Concrete Work',
  'Dyeing and Bleaching',
  'Beauty and Cosmetology',
  'Cosmetology',
  'Fashion Design and Garment Making',
  'Leather Goods Manufacturing',
  'Textile Trade',
  'Carpentry and Joinery',
  'Furniture Making',
  'Auto Mechanics',
  'Auto Body Repair and Spray Painting',
  'Auto Electrical Work',
  'Auto Parts Merchandising',
  'Air Conditioning and Refrigeration',
  'Welding and Fabrication',
  'Plumbing and Pipe Fitting',
  'Basic Electricity',
  'Applied Electricity',
  'Electronics',
  'Basic Electronics',
  'Electronics Works',
  'Metal Work',
  'Woodwork',
  'Wood Work',
  'Machine Woodworking',
  'Building Construction',
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

// JAMB picks (mirrors the official JAMB subject list — no vocationals, no Arabic, etc.)
export const JAMB_SUBJECTS: readonly string[] = [
  'English Language',
  'General Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature in English',
  'Christian Religious Studies',
  'Islamic Religious Studies',
  'Commerce',
  'Financial Accounting',
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

// WAEC / NECO picks include the broader curriculum (vocationals, languages, art, technical).
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
