-- Add missing tables and fields to sync database with Prisma schema

-- =====================================================================
-- Missing table: MockExamAttempt
-- =====================================================================
CREATE TABLE "MockExamAttempt" (
  "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"          UUID NOT NULL,
  "examId"          UUID NOT NULL,
  "isCompleted"     Boolean NOT NULL DEFAULT false,
  "retakeRequested" Boolean NOT NULL DEFAULT false,
  "retakeApproved"  Boolean NOT NULL DEFAULT false,
  "startedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"     TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MockExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "MockExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "MockExamAttempt_userId_examId_key" ON "MockExamAttempt" ("userId", "examId");
CREATE INDEX "MockExamAttempt_userId_idx" ON "MockExamAttempt" ("userId");
CREATE INDEX "MockExamAttempt_examId_idx" ON "MockExamAttempt" ("examId");
CREATE INDEX "MockExamAttempt_retakeApproved_idx" ON "MockExamAttempt" ("retakeApproved");

-- =====================================================================
-- Missing table: PushSubscription
-- =====================================================================
CREATE TABLE "PushSubscription" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"    UUID NOT NULL,
  "endpoint"  TEXT NOT NULL UNIQUE,
  "p256dh"    TEXT NOT NULL,
  "auth"      TEXT NOT NULL,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription" ("userId");

-- =====================================================================
-- Missing table: DeviceToken
-- =====================================================================
CREATE TABLE "DeviceToken" (
  "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"     UUID NOT NULL,
  "token"      TEXT NOT NULL UNIQUE,
  "platform"   TEXT NOT NULL,
  "deviceId"   TEXT,
  "appVersion" TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "DeviceToken_userId_idx" ON "DeviceToken" ("userId");
CREATE INDEX "DeviceToken_platform_idx" ON "DeviceToken" ("platform");

-- =====================================================================
-- Missing fields on CbtResult: templateExamId
-- =====================================================================
ALTER TABLE "CbtResult" ADD COLUMN "templateExamId" TEXT;
CREATE INDEX "CbtResult_templateExamId_idx" ON "CbtResult" ("templateExamId");

-- =====================================================================
-- Missing fields on Exam: questionsPerSubject, isAttempt, templateExamId
-- =====================================================================
ALTER TABLE "Exam" ADD COLUMN "questionsPerSubject" INTEGER;
ALTER TABLE "Exam" ADD COLUMN "isAttempt" Boolean NOT NULL DEFAULT false;
ALTER TABLE "Exam" ADD COLUMN "templateExamId" TEXT;
CREATE INDEX "Exam_isAttempt_idx" ON "Exam" ("isAttempt");
CREATE INDEX "Exam_templateExamId_idx" ON "Exam" ("templateExamId");

-- =====================================================================
-- Missing fields on Question: textHtml, optionsHtml, formatting, explanationHtml, groupType, groupId, groupOrder
-- =====================================================================
ALTER TABLE "Question" ADD COLUMN "textHtml" TEXT;
ALTER TABLE "Question" ADD COLUMN "optionsHtml" JSONB;
ALTER TABLE "Question" ADD COLUMN "formatting" JSONB;
ALTER TABLE "Question" ADD COLUMN "explanationHtml" TEXT;
ALTER TABLE "Question" ADD COLUMN "groupType" TEXT;
ALTER TABLE "Question" ADD COLUMN "groupId" UUID;
ALTER TABLE "Question" ADD COLUMN "groupOrder" INTEGER;
ALTER TABLE "Question" ADD CONSTRAINT "Question_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "QuestionGroup" ("id") ON DELETE SET NULL;
CREATE INDEX "Question_groupType_idx" ON "Question" ("groupType");
CREATE INDEX "Question_groupId_idx" ON "Question" ("groupId");
CREATE INDEX "Question_examType_subject_idx" ON "Question" ("examType", "subject");

-- =====================================================================
-- Missing fields on ExamQuestion: options, correctOption, questionGroupId, questionGroupType
-- =====================================================================
ALTER TABLE "ExamQuestion" ADD COLUMN "options" JSONB;
ALTER TABLE "ExamQuestion" ADD COLUMN "correctOption" INTEGER;
ALTER TABLE "ExamQuestion" ADD COLUMN "questionGroupId" TEXT;
ALTER TABLE "ExamQuestion" ADD COLUMN "questionGroupType" TEXT;
