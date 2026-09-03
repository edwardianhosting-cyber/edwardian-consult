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
      where: { name },
      update: { isActive: true, gradeLevel: 'SSS1-SSS3', code: slug },
      create: {
        name,
        code: slug,
        gradeLevel: 'SSS1-SSS3',
        isActive: true,
      },
    });
  }

  // Create sample news
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
