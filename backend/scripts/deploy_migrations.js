// Script to apply missing schema changes to the live database
const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL environment variable');
  process.exit(1);
}

async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
  });

  try {
    // Check if MockExamAttempt table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'MockExamAttempt'
      ) as "exists"
    `;

    const tableExists = tableCheck[0]?.exists;
    console.log('MockExamAttempt table exists:', tableExists);

    if (!tableExists) {
      console.log('Creating MockExamAttempt table...');
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "MockExamAttempt" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
          "userId" TEXT NOT NULL,
          "examId" TEXT NOT NULL,
          "isCompleted" BOOLEAN NOT NULL DEFAULT false,
          "completedAt" TIMESTAMP(3),
          "retakeRequested" BOOLEAN NOT NULL DEFAULT false,
          "retakeApproved" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "MockExamAttempt_pkey" PRIMARY KEY ("id")
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX "MockExamAttempt_userId_examId_key" ON "MockExamAttempt"("userId", "examId")
      `);
      await prisma.$executeRawUnsafe(`CREATE INDEX "MockExamAttempt_userId_idx" ON "MockExamAttempt"("userId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "MockExamAttempt_examId_idx" ON "MockExamAttempt"("examId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "MockExamAttempt_isCompleted_idx" ON "MockExamAttempt"("isCompleted")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "MockExamAttempt_retakeApproved_idx" ON "MockExamAttempt"("retakeApproved")`);

      console.log('MockExamAttempt table created successfully!');
    }

    // Check for QuestionGroup table
    const qgCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'QuestionGroup'
      ) as "exists"
    `;

    if (!qgCheck[0]?.exists) {
      console.log('Creating QuestionGroup table...');
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "QuestionGroup" (
          "id" TEXT NOT NULL,
          "subject" TEXT NOT NULL,
          "examType" TEXT NOT NULL,
          "groupType" TEXT NOT NULL,
          "title" TEXT,
          "instructions" TEXT,
          "passage" TEXT,
          "imageUrl" TEXT,
          "order" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "QuestionGroup_pkey" PRIMARY KEY ("id")
        )
      `);

      await prisma.$executeRawUnsafe(`CREATE INDEX "QuestionGroup_subject_idx" ON "QuestionGroup"("subject")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "QuestionGroup_examType_idx" ON "QuestionGroup"("examType")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "QuestionGroup_groupType_idx" ON "QuestionGroup"("groupType")`);

      console.log('QuestionGroup table created successfully!');
    }

    // Check and add missing columns to Question table
    const qCols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Question'`;
    const questionColNames = qCols.map((c) => c.column_name);

    if (!questionColNames.includes('groupId')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Question" ADD COLUMN "groupId" TEXT`);
      console.log('Added groupId to Question');
    }
    if (!questionColNames.includes('groupOrder')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Question" ADD COLUMN "groupOrder" INTEGER`);
      console.log('Added groupOrder to Question');
    }
    if (!questionColNames.includes('groupType')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Question" ADD COLUMN "groupType" TEXT`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Question_groupType_idx" ON "Question"("groupType")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Question_groupId_idx" ON "Question"("groupId")`);
      console.log('Added groupType to Question');
    }

    // Check FK constraint
    const fkCheck = await prisma.$queryRaw`
      SELECT 1 FROM pg_constraint WHERE conname = 'Question_groupId_fkey'
    `;
    if (fkCheck.length === 0) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Question"
        ADD CONSTRAINT "Question_groupId_fkey"
        FOREIGN KEY ("groupId") REFERENCES "QuestionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('Added Question_groupId_fkey');
    }

    // Check missing columns on ExamQuestion
    const eqCols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'ExamQuestion'`;
    const examQuestionColNames = eqCols.map((c) => c.column_name);

    if (!examQuestionColNames.includes('questionGroupId')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "ExamQuestion" ADD COLUMN "questionGroupId" TEXT`);
      console.log('Added questionGroupId to ExamQuestion');
    }
    if (!examQuestionColNames.includes('questionGroupType')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "ExamQuestion" ADD COLUMN "questionGroupType" TEXT`);
      console.log('Added questionGroupType to ExamQuestion');
    }
    if (!examQuestionColNames.includes('correctOption')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "ExamQuestion" ADD COLUMN "correctOption" INTEGER`);
      console.log('Added correctOption to ExamQuestion');
    }
    if (!examQuestionColNames.includes('options')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "ExamQuestion" ADD COLUMN "options" JSONB`);
      console.log('Added options to ExamQuestion');
    }

    // Check Question_examType_subject_idx
    const idxCheck = await prisma.$queryRaw`
      SELECT 1 FROM pg_indexes WHERE indexname = 'Question_examType_subject_idx'
    `;
    if (idxCheck.length === 0) {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Question_examType_subject_idx" ON "Question"("examType", "subject")`);
      console.log('Added Question_examType_subject_idx');
    }

    // Check StudySchedule columns
    const ssCols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'StudySchedule'`;
    const studyScheduleColNames = ssCols.map((c) => c.column_name);
    if (!studyScheduleColNames.includes('dayOfWeek')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "StudySchedule" ADD COLUMN "dayOfWeek" TEXT NOT NULL DEFAULT 'Monday'`);
      console.log('Added dayOfWeek to StudySchedule');
    }
    if (!studyScheduleColNames.includes('time')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "StudySchedule" ADD COLUMN "time" TEXT NOT NULL DEFAULT '08:00'`);
      console.log('Added time to StudySchedule');
    }

    // Check StudyResource columns
    const srCols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'StudyResource'`;
    const studyResourceColNames = srCols.map((c) => c.column_name);
    if (!studyResourceColNames.includes('imageUrl')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "StudyResource" ADD COLUMN "imageUrl" TEXT`);
      console.log('Added imageUrl to StudyResource');
    }
    if (!studyResourceColNames.includes('textContent')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "StudyResource" ADD COLUMN "textContent" TEXT`);
      console.log('Added textContent to StudyResource');
    }

    console.log('\nAll schema checks complete!');

    // Register migrations in _prisma_migrations
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" UUID NOT NULL PRIMARY KEY,
        "checksum" TEXT NOT NULL,
        "finished_at" TIMESTAMPTZ NOT NULL,
        "migration_name" TEXT NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL,
        "applied_steps_count" INTEGER NOT NULL
      )
    `);

    const migrations = [
      { id: 'a3b6588b-7ea8-47d1-8b61-cf502dadbb92', checksum: 'a6a964e719736b519b2655edcffda65be1e339d2e1317455f0e1e05de40f6e69', name: '20250909000000_init' },
      { id: '5b65c167-81ae-45d0-a671-3dfc333df4b8', checksum: 'ea64c01518e958378e88a99ae14854d132238e4870d333ed97100f462aa1db4f', name: '20250909000002_add_question_index' },
      { id: 'd509333e-54e3-4859-965f-04146154b728', checksum: 'manual', name: '20260916000000_add-question-groups' },
      { id: '9d0ff051-66aa-478a-8a1a-e7d6e01ef2f3', checksum: 'manual', name: '20260916000001_add-exam-question-group-fields' },
      { id: '0248b5ae-5216-4a41-bdee-3f65738305f6', checksum: 'manual', name: '20260919000000_add-mock-exam-attempts' },
      { id: '8b205aa0-8096-407a-ac2b-f4c332a5d161', checksum: '4ba9d1892950b56032b739de0a08737df712bb5113372c545a1123f8a5f78302', name: '20260921000000_add_startedat_to_mock_exam_attempt' },
      { id: '283b0c12-97f5-4749-8047-2ff8f036213c', checksum: 'ab8132eb1eeef6e21b8f3129e3c126610265359f004bea20fa0d6dda76fbce6b', name: '20250903210551_add_study_fields' },
      { id: '59eeb04e-6e13-41f6-b847-713fe76f8bb8', checksum: 'bba533bf3659df7d378ed42d8326a945e3030c016d3cfa04620eae21eaaf9045', name: '20250903210600_assignment_schema' },
    ];

    for (const mig of migrations) {
      const existing = await prisma.$queryRaw`
        SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = ${mig.name}
      `;
      if (existing.length === 0) {
        await prisma.$executeRaw`
          INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
          VALUES (${mig.id}, ${mig.checksum}, NOW(), ${mig.name}, '', NULL, NOW(), 1)
        `;
        console.log(`Registered migration: ${mig.name}`);
      } else {
        console.log(`Migration already registered: ${mig.name}`);
      }
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error applying migrations:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
