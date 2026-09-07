import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ALL_SUBJECTS, CORE_SUBJECTS, SCIENCE_SUBJECTS, COMMERCIAL_SUBJECTS, ART_SUBJECTS, ICT_SUBJECTS, VOCATIONAL_SUBJECTS } from '../src/lib/subjects';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const studentPassword = await bcrypt.hash('Student@123', 12);
  const tutorPassword = await bcrypt.hash('Tutor@123', 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edwardianconsult.com' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@edwardianconsult.com',
      phone: '08000000000',
      passwordHash: adminPassword,
      role: 'ADMIN',
      portalId: 'EIEC/ADMIN/001',
      parentAccessCode: 'PAR-ADMIN-001',
    },
  });

  // Create tutor user
  const tutor = await prisma.user.upsert({
    where: { email: 'tutor@edwardianconsult.com' },
    update: {},
    create: {
      fullName: 'Demo Tutor',
      email: 'tutor@edwardianconsult.com',
      phone: '08000000003',
      passwordHash: tutorPassword,
      role: 'TUTOR',
      portalId: 'EIEC/TUTOR/001',
      parentAccessCode: 'PAR-TUTOR-001',
    },
  });

  // Create demo student
  const student = await prisma.user.upsert({
    where: { email: 'student@edwardianconsult.com' },
    update: {},
    create: {
      fullName: 'Demo Student',
      email: 'student@edwardianconsult.com',
      phone: '08000000001',
      parentPhone: '08000000002',
      passwordHash: studentPassword,
      role: 'STUDENT',
      portalId: 'EIEC/2026/0001',
      parentAccessCode: 'PAR-STU-0001',
      programme: 'JAMB',
      examTypes: ['JAMB'],
      jambSubjects: ['English Language', 'General Mathematics', 'Physics', 'Chemistry'],
      targetInstitution: 'University of Lagos',
      state: 'Lagos',
    },
  });

  // Create sample questions
  const subjects = ['English Language', 'General Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature in English', 'Geography', 'History'];
  const examTypes = ['JAMB', 'POST_UTME', 'WAEC', 'NECO'];

  for (const subject of subjects) {
    for (let i = 0; i < 5; i++) {
      await prisma.question.create({
        data: {
          subject,
          examType: examTypes[i % examTypes.length],
          year: 2020 + (i % 6),
          topic: `Topic ${i + 1}`,
          text: `Sample ${subject} question ${i + 1}. This is a practice question for students.`,
          options: JSON.stringify([
            'Option A - First possible answer',
            'Option B - Second possible answer',
            'Option C - Third possible answer',
            'Option D - Fourth possible answer',
          ]),
          correctOption: i % 4,
          explanation: `This is the explanation for ${subject} question ${i + 1}.`,
          difficulty: ['EASY', 'MEDIUM', 'HARD'][i % 3],
        },
      });
    }
  }

  // Create sample exam
  await prisma.exam.create({
    data: {
      title: 'JAMB Practice Exam - English',
      examType: 'JAMB',
      subject: 'English Language',
      duration: 30,
      totalMarks: 40,
      isActive: true,
    },
  });

  // Seed StudySubject table so the Study Materials page has subjects to
  // match against a student's registered jambSubjects. Each subject is
  // created with its category (Core/Science/Commercial/Art/ICT/Vocational)
  // for filtering in the admin UI. `code` is a slug of the subject name
  // since `StudySubject.code` is unique.
  for (const name of ALL_SUBJECTS) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await prisma.studySubject.upsert({
      where: { code: slug },
      update: { isActive: true, gradeLevel: 'SSS1-SSS3', name },
      create: {
        name,
        code: slug,
        gradeLevel: 'SSS1-SSS3',
        isActive: true,
      },
    });
  }

  // Seed JambSubject table with the provided subjects, codes and descriptions.
  const jambSubjects = [
    { id: '0a6d72a1-73a0-4216-b8ee-6079cd95e841', name: 'Data Processing', code: 'DTP', description: 'Data capture, processing tools, spreadsheets and database fundamentals.' },
    { id: '0e2bdb1d-c1ab-47d3-8aed-2b070bb5eb55', name: 'Garment Making', code: 'GRM', description: 'Garment construction, pattern drafting, sewing techniques and fashion.' },
    { id: '105b9cee-fd8f-4852-ba01-436fe3e89a29', name: 'Christian Religious Studies', code: 'CRS', description: 'Biblical studies, Christian history, ethics and comparative religion.' },
    { id: '188b6c12-23db-41da-aed5-4c1e4d8318e0', name: 'Financial Accounting', code: 'ACC', description: 'Double entry bookkeeping, ledgers, financial statements and ratio analysis.' },
    { id: '1dff99dc-a4a4-4f96-a378-3c0563c413ef', name: 'Nigerian Language', code: 'NGL', description: 'Yoruba, Igbo or Hausa as a subject — oral, written and literature.' },
    { id: '21315934-7b82-4f96-a473-bca5fa57e755', name: 'Clothing and Textiles', code: 'CTX', description: 'Textile science, garment construction, fashion design and fabric care.' },
    { id: '2fc6a0ff-4a75-403c-99cc-5b0eb389e783', name: 'Computer Studies', code: 'CMP', description: 'Computer fundamentals, hardware, software, networking and information systems.' },
    { id: '32d4fd00-2eff-46f3-996e-756e946edc5d', name: 'Office Practice', code: 'OFP', description: 'Office procedures, records management, communication and ICT in business.' },
    { id: '34c44593-7432-404c-b7e3-2d0b159715ee', name: 'Literature in English', code: 'LIT', description: 'Poetry, prose, drama, literary devices, appreciation and analysis.' },
    { id: '3a6d6391-1e7c-41fc-a311-6583d309d413', name: 'Physics', code: 'PHY', description: 'Mechanics, heat, waves, electricity, magnetism, optics and modern physics.' },
    { id: '416fae6c-c5d0-4d29-b497-b5226400c106', name: 'Music', code: 'MUS', description: 'Music theory, performance, African and Western music history.' },
    { id: '47fc745a-f7b0-4e75-9064-48d9a42581c1', name: 'Geography', code: 'GEO', description: 'Physical and human geography, map reading, climate and regional studies.' },
    { id: '4e49eaad-c536-468a-bc05-aa4477e35ead', name: 'General Mathematics', code: 'MTH', description: 'Algebra, calculus, trigonometry, statistics and probability for SSS students.' },
    { id: '5254fe19-a24c-4804-a98e-2ca5679c5b28', name: 'French', code: 'FRE', description: 'French grammar, comprehension, composition and oral communication.' },
    { id: '52673b21-bc0b-48bd-a725-ca9e93d11c8c', name: 'Commerce', code: 'CMR', description: 'Trade, commerce, business ownership, finance, insurance and transportation.' },
    { id: '5bbaf58a-75b3-4061-8baf-f050d0b4a866', name: 'Igbo', code: 'IGB', description: 'Igbo grammar, literature, oral tradition and composition.' },
    { id: '6449c8f9-38cc-4ce3-b977-5a8f1ab32a40', name: 'Fine Arts', code: 'ART', description: 'Drawing, painting, design, art history and creative expression.' },
    { id: '69636ed1-cda7-425a-a46a-43244f25ce85', name: 'Tourism', code: 'TRM', description: 'Tourism principles, hospitality, travel operations and destinations.' },
    { id: '6d911de2-7ab6-4242-96bc-0ee9fb783981', name: 'Technical Drawing', code: 'TDR', description: 'Engineering drawing, orthographic projection, isometric views and CAD basics.' },
    { id: '746dc965-1ac0-4b9b-b22e-0a5ea819c668', name: 'English Language', code: 'ENG', description: 'Mastery of English grammar, comprehension, summary, lexis and structure.' },
    { id: '793818bd-e67e-46e0-a394-99d31b8c1018', name: 'Yoruba', code: 'YOR', description: 'Yoruba grammar, literature, oral tradition and composition.' },
    { id: '7bd3ee0a-b71f-495a-af66-9ef66fe98f38', name: 'Food and Nutrition', code: 'FAN', description: 'Food science, nutrition, meal planning, food hygiene and preparation.' },
    { id: '823a7108-7037-4fd5-b4d5-4e876a4f9201', name: 'Computer Science', code: 'CSC', description: 'Programming, algorithms, data structures, web development and OOP.' },
    { id: '8329747f-75b2-4aec-9225-518cba66486c', name: 'History', code: 'HIS', description: 'African, Nigerian and world history from pre-colonial to modern era.' },
    { id: '8d46f56f-6f7c-4a65-a8b9-d0892cd7c8bc', name: 'Fisheries', code: 'FSH', description: 'Aquaculture, fish biology, pond management and fish preservation.' },
    { id: '8faf7d5f-a8cf-43aa-82df-1ca3db6b4fd5', name: 'Islamic Religious Studies', code: 'IRS', description: 'Quran, Hadith, Islamic history, jurisprudence and ethics.' },
    { id: '9a576c64-e623-41f9-9a6c-56dae1b30f73', name: 'Hausa', code: 'HAU', description: 'Hausa grammar, literature, oral tradition and composition.' },
    { id: '9b602824-3e93-408c-96bf-bc3f5f0486ef', name: 'Photography', code: 'PHT', description: 'Camera handling, composition, lighting, editing and visual storytelling.' },
    { id: '9e36c069-5d6d-418a-b342-99d6f030a854', name: 'Catering Craft Practice', code: 'CCP', description: 'Catering services, food preparation, hospitality and event management.' },
    { id: 'a3b82b6a-8f11-4130-be5d-2cc32457be6f', name: 'Government', code: 'GOV', description: 'Political theory, constitution, organs of government, public administration.' },
    { id: 'a6ca0776-3993-4519-9e52-4f4f32a392ca', name: 'ICT', code: 'ICT', description: 'Information and Communication Technology fundamentals and applications.' },
    { id: 'aabeae55-4f97-4566-b5ab-18867ed14e23', name: 'Chemistry', code: 'CHM', description: 'Atomic structure, bonding, acids/bases, organic and inorganic chemistry.' },
    { id: 'aeccb699-58c5-4821-8e56-0f8383085df6', name: 'Further Mathematics', code: 'FMT', description: 'Advanced algebra, complex numbers, vectors, mechanics and statistics.' },
    { id: 'b6d08135-cf2b-4703-94f9-7540b1e57d09', name: 'Insurance', code: 'INS', description: 'Principles of insurance, types of policies, claims and risk management.' },
    { id: 'b7fcd018-2aa1-418d-833a-2b29d3afadd4', name: 'Animal Husbandry', code: 'AHU', description: 'Livestock production, breeding, nutrition, health and farm structures.' },
    { id: 'bd5fc844-1b2e-408f-b4b1-43a4debd78d7', name: 'Marketing', code: 'MKT', description: 'Marketing mix, consumer behaviour, segmentation and digital marketing.' },
    { id: 'c94ea2ff-a738-4656-bd8d-46aeaf0b3bc4', name: 'Agricultural Science', code: 'AGR', description: 'Crop production, animal husbandry, soil science and farm management.' },
    { id: 'e625b320-12fe-44c5-a0b0-ed5e466ef90b', name: 'Civic Education', code: 'CVE', description: 'Citizenship, values, national duties and constitutional awareness.' },
    { id: 'f83b842a-effb-4521-a578-a23c8d620383', name: 'Home Management', code: 'HMG', description: 'Home economics, family living, household management and child care.' },
    { id: 'fc9b5b61-0b59-4227-986f-642af99b0207', name: 'Biology', code: 'BIO', description: 'Cell biology, ecology, genetics, evolution, reproduction and physiology.' },
    { id: 'ff123407-144c-4974-8892-1d383b20335b', name: 'Economics', code: 'ECO', description: 'Micro and macroeconomics, demand/supply, money, banking and trade.' },
  ];

  for (const subject of jambSubjects) {
    await prisma.jambSubject.upsert({
      where: { id: subject.id },
      update: {
        name: subject.name,
        code: subject.code,
        description: subject.description,
        isActive: true,
      },
      create: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        isActive: true,
      },
    });
  }

  // Seed Programs
  const programs = [
    {
      title: 'JAMB (UTME)',
      slug: 'jamb-utme',
      description: 'Joint Admissions and Matriculation Board (Unified Tertiary Matriculation Examination). A computer-based entrance exam required for tertiary education in Nigeria.',
      features: ['4 subjects total (English Language is compulsory + 3 subjects relevant to your chosen course)', 'CBT format', 'Admission into Nigerian Universities, Polytechnics, and Colleges of Education'],
      price: null,
      duration: null,
      isActive: true,
      order: 1,
    },
    {
      title: 'WAEC (SSCE)',
      slug: 'waec-ssce',
      description: 'West African Examinations Council (Senior School Certificate Examination). A regional standardized exam taken by final-year secondary school students across Anglophone West Africa.',
      features: ['Minimum of 8–9 subjects, including Mathematics, English Language, and key science/arts choices', 'Theory & Practical formats', 'Secondary school graduation certificate; required for tertiary admissions in Nigeria and abroad'],
      price: null,
      duration: null,
      isActive: true,
      order: 2,
    },
    {
      title: 'NECO (SSCE)',
      slug: 'neco-ssce',
      description: "National Examinations Council. Nigeria's indigenous examination body offering secondary school certification alongside WAEC.",
      features: ['Minimum of 8–9 subjects, matching the WAEC curriculum structure', 'Written & Practical formats', 'Alternative or supplementary Senior Secondary Certificate (SSCE) for Nigerian university admission'],
      price: null,
      duration: null,
      isActive: true,
      order: 3,
    },
    {
      title: 'NABTEB',
      slug: 'nabteb',
      description: 'National Business and Technical Examinations Board. An examination board focusing on technical, vocational, and business qualifications.',
      features: ['Combination of general secondary subjects and specialized technical/vocational trade modules', 'Admission into universities, polytechnics, technical colleges, or direct entry into skilled trades'],
      price: null,
      duration: null,
      isActive: true,
      order: 4,
    },
    {
      title: 'IGCSE / A-Levels',
      slug: 'igcse-a-levels',
      description: 'International General Certificate of Secondary Education / Advanced Levels. UK-curriculum international qualifications offered by Cambridge or Pearson Edexcel.',
      features: ['Student chooses specific subject tracks (3–4 subjects at A-Levels)', 'Deep essay and analytical assessments', 'Admission into top international universities (UK, US, Canada, Europe) or Direct Entry into 200-level in Nigeria'],
      price: null,
      duration: null,
      isActive: true,
      order: 5,
    },
    {
      title: 'SAT / IELTS',
      slug: 'sat-ielts',
      description: 'Scholastic Assessment Test / International English Language Testing System. Standardized aptitude and English proficiency tests used globally.',
      features: ['SAT assesses Reading, Writing, and Math', 'IELTS assesses Listening, Reading, Writing, and Speaking', 'Undergraduate admissions and visa processing for universities in the US, Canada, UK, and Australia'],
      price: null,
      duration: null,
      isActive: true,
      order: 6,
    },
  ];

  for (const program of programs) {
    await prisma.program.upsert({
      where: { slug: program.slug },
      update: program,
      create: program,
    });
  }
  await prisma.newsArticle.upsert({
    where: { slug: 'ui-2026-2027-admission-screening' },
    update: {},
    create: {
      title: 'UI 2026/2027 Admission Screening Date Announced',
      slug: 'ui-2026-2027-admission-screening',
      category: 'Admission',
      content: '<p>The University of Ile-Ife (UI) has announced the dates for the 2026/2027 admission screening exercise.</p>',
      excerpt: 'UI has announced the screening dates for the 2026/2027 academic session.',
      isPinned: true,
    },
  });

  // Create verification code
  await prisma.verificationCode.upsert({
    where: { code: 'EIEC-2026-DEMO' },
    update: {},
    create: {
      code: 'EIEC-2026-DEMO',
      studentName: 'Demo Student',
      program: 'JAMB Preparation Program',
      grade: 'A',
      type: 'CERTIFICATE',
      purpose: 'VERIFICATION',
      isValid: true,
    },
  });

  console.log('Seed data created successfully!');
  console.log(`Seeded ${ALL_SUBJECTS.length} study subjects.`);
  console.log('');
  console.log('=== DEMO CREDENTIALS ===');
  console.log('Admin: admin@edwardianconsult.com / Admin@123');
  console.log('Tutor: tutor@edwardianconsult.com / Tutor@123');
  console.log('Student: student@edwardianconsult.com / Student@123');
  console.log('Parent: Use student portal ID and parent access code');
  console.log('  Portal ID: EIEC/2026/0001');
  console.log('  Parent Access Code: PAR-STU-0001');
  console.log('========================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
