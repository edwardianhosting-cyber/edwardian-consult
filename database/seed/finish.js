/* eslint-disable no-console */
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_S1nRIhXK6qyb@ep-wandering-forest-ay59vucq-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const uuid = () => crypto.randomUUID();
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

const TUTORS = [
  { email: 'tutor.physics@edwardian.ng', fullName: 'Mr. Tunde Bakare',   phone: '+2348000000001', subject: 'Physics' },
  { email: 'tutor.chemistry@edwardian.ng', fullName: 'Mrs. Ngozi Eze',  phone: '+2348000000002', subject: 'Chemistry' },
  { email: 'tutor.maths@edwardian.ng',  fullName: 'Mr. Yusuf Abdullahi', phone: '+2348000000003', subject: 'General Mathematics' },
  { email: 'tutor.english@edwardian.ng', fullName: 'Ms. Funke Adeyemi',   phone: '+2348000000004', subject: 'English Language' },
  { email: 'tutor.biology@edwardian.ng',  fullName: 'Mrs. Adaeze Okafor', phone: '+2348000000005', subject: 'Biology' },
  { email: 'tutor.economics@edwardian.ng',fullName: 'Mr. Chidi Ogun',   phone: '+2348000000006', subject: 'Economics' },
];

const COURSES_BY_INSTITUTION = {
  'University of Lagos': [
    { name: 'Computer Science', utmeCutoff: 240, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Medicine and Surgery', utmeCutoff: 320, jambSubjects: ['English Language','Biology','Chemistry','Physics'] },
    { name: 'Law', utmeCutoff: 280, jambSubjects: ['English Language','Government','Literature in English','History'] },
    { name: 'Accounting', utmeCutoff: 230, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
    { name: 'Mass Communication', utmeCutoff: 250, jambSubjects: ['English Language','Government','Economics','Literature in English'] },
  ],
  'University of Ibadan': [
    { name: 'Computer Science', utmeCutoff: 230, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Economics', utmeCutoff: 220, jambSubjects: ['English Language','Mathematics','Economics','Government'] },
    { name: 'Law', utmeCutoff: 270, jambSubjects: ['English Language','Government','History','Literature in English'] },
    { name: 'Nursing', utmeCutoff: 260, jambSubjects: ['English Language','Biology','Chemistry','Physics'] },
  ],
  'Ahmadu Bello University': [
    { name: 'Mechanical Engineering', utmeCutoff: 220, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Public Administration', utmeCutoff: 200, jambSubjects: ['English Language','Government','Economics','History'] },
    { name: 'Medicine and Surgery', utmeCutoff: 310, jambSubjects: ['English Language','Biology','Chemistry','Physics'] },
  ],
  'Obafemi Awolowo University': [
    { name: 'Computer Engineering', utmeCutoff: 240, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Architecture', utmeCutoff: 230, jambSubjects: ['English Language','Mathematics','Physics','Technical Drawing'] },
    { name: 'English', utmeCutoff: 220, jambSubjects: ['English Language','Literature in English','Government','History'] },
  ],
  'University of Nigeria, Nsukka': [
    { name: 'Computer Science', utmeCutoff: 230, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Accountancy', utmeCutoff: 220, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
    { name: 'Political Science', utmeCutoff: 210, jambSubjects: ['English Language','Government','History','Economics'] },
  ],
  'Covenant University': [
    { name: 'Computer Science', utmeCutoff: 250, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Business Administration', utmeCutoff: 240, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
    { name: 'Mass Communication', utmeCutoff: 235, jambSubjects: ['English Language','Government','Economics','Literature in English'] },
  ],
  'Babcock University': [
    { name: 'Computer Science', utmeCutoff: 240, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Public Health', utmeCutoff: 220, jambSubjects: ['English Language','Biology','Chemistry','Physics'] },
    { name: 'Accounting', utmeCutoff: 225, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
  ],
  'Lagos State University': [
    { name: 'Computer Science', utmeCutoff: 220, jambSubjects: ['English Language','Mathematics','Physics','Chemistry'] },
    { name: 'Business Administration', utmeCutoff: 210, jambSubjects: ['English Language','Mathematics','Economics','Commerce'] },
    { name: 'Law', utmeCutoff: 250, jambSubjects: ['English Language','Government','Literature in English','History'] },
  ],
};

async function seedExams(c) {
  const subs = await c.query(`SELECT "name" FROM "StudySubject"`);
  let created = 0, linked = 0;
  for (const s of subs.rows) {
    const ex = await c.query(`SELECT "id" FROM "Exam" WHERE "subject"=$1 AND "isPublished"=true LIMIT 1`, [s.name]);
    if (ex.rowCount > 0) continue;
    const qs = await c.query(`SELECT "id" FROM "Question" WHERE "subject"=$1 ORDER BY "createdAt" DESC LIMIT 20`, [s.name]);
    if (qs.rowCount < 5) continue;
    const examId = uuid();
    await c.query(
      `INSERT INTO "Exam" ("id","title","examType","subject","duration","totalMarks","isActive","isPublished","publishedAt","createdAt")
       VALUES ($1,$2,'JAMB',$3,30,$4,true,true,now(),now())`,
      [examId, `${s.name} Practice Test`, s.name, qs.rowCount * 2]
    );
    created++;
    const chosen = shuffle(qs.rows).slice(0, qs.rowCount);
    for (let i = 0; i < chosen.length; i++) {
      await c.query(`INSERT INTO "ExamQuestion" ("examId","questionId","order") VALUES ($1,$2,$3)`, [examId, chosen[i].id, i]);
      linked++;
    }
  }
  return { created, linked };
}

async function seedInstCourses(c) {
  let created = 0, skipped = 0;
  for (const [iname, courses] of Object.entries(COURSES_BY_INSTITUTION)) {
    const r = await c.query(`SELECT "id" FROM "Institution" WHERE "name"=$1`, [iname]);
    if (r.rowCount === 0) { skipped++; continue; }
    const instId = r.rows[0].id;
    for (const course of courses) {
      const ex = await c.query(`SELECT "id" FROM "InstitutionCourse" WHERE "institutionId"=$1 AND "name"=$2`, [instId, course.name]);
      if (ex.rowCount > 0) { skipped++; continue; }
      await c.query(
        `INSERT INTO "InstitutionCourse" ("id","institutionId","name","utmeCutoff","olevelRequirements","jambSubjects","postUtmeRequired","isActive")
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,true)`,
        [uuid(), instId, course.name, course.utmeCutoff, '5 credits including English & Mathematics', JSON.stringify(course.jambSubjects), Math.random() > 0.5]
      );
      created++;
    }
  }
  return { created, skipped };
}

async function seedTimetable(c) {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const times = ['08:00 - 09:30','09:30 - 11:00','11:00 - 12:30','12:30 - 14:00','14:00 - 15:30'];
  const venues = ['Room A','Room B','Lab 1','Lab 2','Online'];
  const subjects = ['English Language','General Mathematics','Physics','Chemistry','Biology','Economics','Government'];
  let created = 0;
  for (const day of days) {
    for (const time of times) {
      const ex = await c.query(`SELECT "id" FROM "TimetableEntry" WHERE "day"=$1 AND "time"=$2`, [day, time]);
      if (ex.rowCount > 0) continue;
      const subj = pick(subjects);
      const venue = pick(venues);
      await c.query(
        `INSERT INTO "TimetableEntry" ("id","day","time","subject","instructor","venue","type","examType","classLevel","isActive","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,'Edwardian Faculty',$5,'CLASS','JAMB','SSS3',true,now(),now())`,
        [uuid(), day, time, subj, venue]
      );
      created++;
    }
  }
  return { created };
}

async function seedTutors(c) {
  let created = 0, skipped = 0;
  const passwordHash = await bcrypt.hash('Tutor@123', 8);
  for (const t of TUTORS) {
    const ex = await c.query(`SELECT "id" FROM "User" WHERE "email"=$1`, [t.email]);
    if (ex.rowCount > 0) { skipped++; continue; }
    const portalId = 'EDW-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    await c.query(
      `INSERT INTO "User" ("id","portalId","parentAccessCode","fullName","email","emailVerified","phone","passwordHash","role","isActive","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,true,$6,$7,'TUTOR',true,now(),now())`,
      [uuid(), portalId, uuid(), t.fullName, t.email, t.phone, passwordHash]
    );
    created++;
  }
  return { created, skipped };
}

async function ensureAdmin(c) {
  const email = 'admin@edwardian.ng';
  const ex = await c.query(`SELECT "id" FROM "User" WHERE "email"=$1`, [email]);
  if (ex.rowCount > 0) return { created: 0 };
  const portalId = 'EDW-ADMIN';
  const passwordHash = await bcrypt.hash('Admin@123', 8);
  await c.query(
    `INSERT INTO "User" ("id","portalId","parentAccessCode","fullName","email","emailVerified","phone","passwordHash","role","isActive","createdAt","updatedAt","notificationPreferences")
     VALUES ($1,$2,$3,'Edwardian Admin',$4,true,'+2348000000000',$5,'ADMIN',true,now(),now(),'{}'::jsonb)`,
    [uuid(), portalId, uuid(), email, passwordHash]
  );
  return { created: 1 };
}

async function main() {
  const c = new Client({ connectionString: URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log('Connected. Running finish-seeder...');

  const s1 = await seedExams(c);
  console.log('Exams: created=' + s1.created + ' exam-questions-linked=' + s1.linked);

  const s2 = await seedInstCourses(c);
  console.log('InstitutionCourses: created=' + s2.created + ' skipped=' + s2.skipped);

  const s3 = await seedTimetable(c);
  console.log('Timetable: created=' + s3.created);

  const s4 = await seedTutors(c);
  console.log('Tutors: created=' + s4.created + ' skipped=' + s4.skipped);

  const s5 = await ensureAdmin(c);
  console.log('Admin: created=' + s5.created);

  console.log('\nLogin verification:');
  for (const [email, pw, role] of [
    ['admin@edwardian.ng', 'Admin@123', 'admin'],
    ['tutor.physics@edwardian.ng', 'Tutor@123', 'tutor'],
  ]) {
    const r = await c.query(`SELECT "passwordHash" FROM "User" WHERE "email"=$1 AND "role"=$2`, [email, role.toUpperCase()]);
    if (r.rowCount === 0) { console.log(email + ' -> no such ' + role); continue; }
    const ok = await bcrypt.compare(pw, r.rows[0].passwordHash);
    console.log(email + ' / ' + pw + ' -> ' + (ok ? 'OK' : 'BAD'));
  }

  await c.end();
  console.log('Done.');
}

main().catch(e => { console.error('FAIL', e); process.exit(1); });
