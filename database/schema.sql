-- =====================================================================
-- Edwardian Educational Consult — Neon (PostgreSQL) Database Schema
-- =====================================================================
-- Generated from: backend/prisma/schema.prisma
-- Run this in the Neon SQL editor to create all tables.
-- For re-runs, the script drops existing objects first (be careful!).
-- =====================================================================

-- Drop in reverse-dependency order
DROP TABLE IF EXISTS "TimetableEntry" CASCADE;
DROP TABLE IF EXISTS "StudySchedule" CASCADE;
DROP TABLE IF EXISTS "StudyTask" CASCADE;
DROP TABLE IF EXISTS "StudyPlan" CASCADE;
DROP TABLE IF EXISTS "StudyResource" CASCADE;
DROP TABLE IF EXISTS "StudyTopic" CASCADE;
DROP TABLE IF EXISTS "StudySubject" CASCADE;
DROP TABLE IF EXISTS "Career" CASCADE;
DROP TABLE IF EXISTS "Transcript" CASCADE;
DROP TABLE IF EXISTS "Wallet" CASCADE;
DROP TABLE IF EXISTS "WalletItem" CASCADE;
DROP TABLE IF EXISTS "Notice" CASCADE;
DROP TABLE IF EXISTS "Scholarship" CASCADE;
DROP TABLE IF EXISTS "Referral" CASCADE;
DROP TABLE IF EXISTS "AdmissionApplication" CASCADE;
DROP TABLE IF EXISTS "InstitutionCourse" CASCADE;
DROP TABLE IF EXISTS "Institution" CASCADE;
DROP TABLE IF EXISTS "Certificate" CASCADE;
DROP TABLE IF EXISTS "Document" CASCADE;
DROP TABLE IF EXISTS "AssignmentAttempt" CASCADE;
DROP TABLE IF EXISTS "AssignmentQuestion" CASCADE;
DROP TABLE IF EXISTS "Assignment" CASCADE;
DROP TABLE IF EXISTS "StudentBadge" CASCADE;
DROP TABLE IF EXISTS "Badge" CASCADE;
DROP TABLE IF EXISTS "CampaignLog" CASCADE;
DROP TABLE IF EXISTS "EmailCampaign" CASCADE;
DROP TABLE IF EXISTS "ContactCard" CASCADE;
DROP TABLE IF EXISTS "ContactSection" CASCADE;
DROP TABLE IF EXISTS "Program" CASCADE;
DROP TABLE IF EXISTS "Settings" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "AttendanceLog" CASCADE;
DROP TABLE IF EXISTS "SmsLog" CASCADE;
DROP TABLE IF EXISTS "EmailLog" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "VerificationCode" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Enrollment" CASCADE;
DROP TABLE IF EXISTS "ParentFeedback" CASCADE;
DROP TABLE IF EXISTS "CbtResult" CASCADE;
DROP TABLE IF EXISTS "ExamQuestion" CASCADE;
DROP TABLE IF EXISTS "Exam" CASCADE;
DROP TABLE IF EXISTS "Question" CASCADE;
DROP TABLE IF EXISTS "NewsArticle" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- USERS
-- =====================================================================
CREATE TABLE "User" (
  "id"                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "portalId"            TEXT NOT NULL UNIQUE,
  "parentAccessCode"    TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()::text,
  "parentPhone"         TEXT,
  "fullName"            TEXT NOT NULL,
  "email"               TEXT NOT NULL UNIQUE,
  "emailVerified"       BOOLEAN NOT NULL DEFAULT false,
  "phone"               TEXT NOT NULL,
  "passwordHash"        TEXT NOT NULL,
  "role"                TEXT NOT NULL DEFAULT 'STUDENT',
  "avatar"              TEXT,
  "isActive"            BOOLEAN NOT NULL DEFAULT true,
  "lastLogin"           TIMESTAMP(3),
  "studentEmail"        TEXT UNIQUE,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dateOfBirth"         TIMESTAMP(3),
  "gender"              TEXT,
  "address"             TEXT,
  "state"               TEXT,
  "lga"                 TEXT,
  "passportUrl"         TEXT,
  "currentSchool"       TEXT,
  "classLevel"          TEXT,
  "programme"           TEXT,
  "examTypes"           JSONB,
  "jambSubjects"        JSONB,
  "targetScore"         TEXT,
  "olevelResults"       JSONB,
  "targetInstitution"   TEXT,
  "targetCourse"        TEXT,
  "secondChoiceInstitution" TEXT,
  "secondChoiceCourse"  TEXT,
  "admissionYear"       TEXT,
  "preparationProgress" INTEGER NOT NULL DEFAULT 0,
  "mockAverage"         INTEGER NOT NULL DEFAULT 0,
  "notificationPreferences" JSONB DEFAULT '{}'::jsonb,
  "lockedUntil"         TIMESTAMP(3),
  "twoFactorEnabled"    BOOLEAN NOT NULL DEFAULT false,
  "lastLoginIp"         TEXT,
  "lastLoginAt"         TIMESTAMP(3)
);

CREATE INDEX "User_email_idx" ON "User" ("email");
CREATE INDEX "User_portalId_idx" ON "User" ("portalId");
CREATE INDEX "User_parentAccessCode_idx" ON "User" ("parentAccessCode");
CREATE INDEX "User_programme_idx" ON "User" ("programme");

-- =====================================================================
-- CBT
-- =====================================================================
CREATE TABLE "Question" (
  "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "subject"       TEXT NOT NULL,
  "examType"      TEXT NOT NULL,
  "institution"   TEXT,
  "year"          INTEGER NOT NULL,
  "topic"         TEXT,
  "difficulty"    TEXT NOT NULL DEFAULT 'MEDIUM',
  "text"          TEXT NOT NULL,
  "imageUrl"      TEXT,
  "options"       JSONB NOT NULL,
  "correctOption" INTEGER NOT NULL,
  "explanation"   TEXT,
  "isActive"      BOOLEAN NOT NULL DEFAULT true,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Question_subject_idx" ON "Question" ("subject");
CREATE INDEX "Question_examType_idx" ON "Question" ("examType");
CREATE INDEX "Question_topic_idx" ON "Question" ("topic");
CREATE INDEX "Question_year_idx" ON "Question" ("year");

CREATE TABLE "Exam" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"       TEXT NOT NULL,
  "examType"    TEXT NOT NULL,
  "subject"     TEXT NOT NULL,
  "duration"    INTEGER NOT NULL,
  "totalMarks"  INTEGER NOT NULL,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Exam_examType_idx" ON "Exam" ("examType");
CREATE INDEX "Exam_subject_idx" ON "Exam" ("subject");
CREATE INDEX "Exam_isPublished_idx" ON "Exam" ("isPublished");

CREATE TABLE "ExamQuestion" (
  "examId"     UUID NOT NULL,
  "questionId" UUID NOT NULL,
  "order"      INTEGER NOT NULL,
  PRIMARY KEY ("examId", "questionId"),
  CONSTRAINT "ExamQuestion_examId_fkey"     FOREIGN KEY ("examId")     REFERENCES "Exam"     ("id") ON DELETE CASCADE,
  CONSTRAINT "ExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE
);

CREATE TABLE "CbtResult" (
  "id"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"         UUID NOT NULL,
  "examId"         UUID,
  "subject"        TEXT NOT NULL,
  "type"           TEXT NOT NULL DEFAULT 'PRACTICE',
  "score"          DOUBLE PRECISION NOT NULL,
  "totalQuestions" INTEGER NOT NULL,
  "correctAnswers" INTEGER NOT NULL,
  "wrongAnswers"   INTEGER NOT NULL,
  "skippedAnswers" INTEGER NOT NULL,
  "durationUsed"   INTEGER NOT NULL,
  "userAnswers"    JSONB NOT NULL,
  "weakTopics"     JSONB,
  "completedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CbtResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "CbtResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE SET NULL
);
CREATE INDEX "CbtResult_userId_idx" ON "CbtResult" ("userId");
CREATE INDEX "CbtResult_examId_idx" ON "CbtResult" ("examId");
CREATE INDEX "CbtResult_type_idx"    ON "CbtResult" ("type");

-- =====================================================================
-- PARENT / ENROLLMENT / FEEDBACK
-- =====================================================================
CREATE TABLE "ParentFeedback" (
  "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"     UUID NOT NULL,
  "authorName" TEXT NOT NULL,
  "message"    TEXT NOT NULL,
  "isRead"     BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ParentFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "ParentFeedback_userId_idx" ON "ParentFeedback" ("userId");

CREATE TABLE "Enrollment" (
  "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"     UUID NOT NULL,
  "courseName" TEXT NOT NULL,
  "courseCode" TEXT,
  "status"     TEXT NOT NULL DEFAULT 'ACTIVE',
  "startDate"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endDate"    TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment" ("userId");

-- =====================================================================
-- NEWS
-- =====================================================================
CREATE TABLE "NewsArticle" (
  "id"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"        TEXT NOT NULL,
  "slug"         TEXT NOT NULL UNIQUE,
  "category"     TEXT NOT NULL,
  "content"      TEXT NOT NULL,
  "excerpt"      TEXT,
  "coverImage"   TEXT,
  "isPublished"  BOOLEAN NOT NULL DEFAULT true,
  "isPinned"     BOOLEAN NOT NULL DEFAULT false,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "authorId"     TEXT,
  "viewCount"    INTEGER NOT NULL DEFAULT 0,
  "targetType"   TEXT NOT NULL DEFAULT 'ALL',
  "targetFilter" TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "NewsArticle_slug_idx"        ON "NewsArticle" ("slug");
CREATE INDEX "NewsArticle_category_idx"    ON "NewsArticle" ("category");
CREATE INDEX "NewsArticle_isPublished_idx" ON "NewsArticle" ("isPublished");
CREATE INDEX "NewsArticle_targetType_idx"  ON "NewsArticle" ("targetType");

-- =====================================================================
-- STUDY MATERIALS
-- =====================================================================
CREATE TABLE "StudySubject" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "code"        TEXT UNIQUE,
  "gradeLevel"  TEXT,
  "icon"        TEXT,
  "imageUrl"    TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "StudySubject_name_idx"     ON "StudySubject" ("name");
CREATE INDEX "StudySubject_isActive_idx" ON "StudySubject" ("isActive");

CREATE TABLE "StudyTopic" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "subjectId"   UUID NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "order"       INTEGER NOT NULL DEFAULT 0,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudyTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "StudySubject" ("id") ON DELETE CASCADE
);
CREATE INDEX "StudyTopic_subjectId_idx" ON "StudyTopic" ("subjectId");
CREATE INDEX "StudyTopic_isActive_idx"  ON "StudyTopic" ("isActive");

CREATE TABLE "StudyResource" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "topicId"   UUID NOT NULL,
  "title"     TEXT NOT NULL,
  "type"      TEXT NOT NULL DEFAULT 'TEXT',
  "content"   TEXT,
  "fileUrl"   TEXT,
  "fileSize"  INTEGER,
  "mimeType"  TEXT,
  "duration"  INTEGER,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudyResource_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "StudyTopic" ("id") ON DELETE CASCADE
);
CREATE INDEX "StudyResource_topicId_idx"  ON "StudyResource" ("topicId");
CREATE INDEX "StudyResource_isActive_idx" ON "StudyResource" ("isActive");

-- =====================================================================
-- PAYMENTS
-- =====================================================================
CREATE TABLE "Payment" (
  "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"        UUID NOT NULL,
  "reference"     TEXT NOT NULL UNIQUE,
  "amount"        DOUBLE PRECISION NOT NULL,
  "status"        TEXT NOT NULL DEFAULT 'PENDING',
  "paymentMethod" TEXT NOT NULL,
  "description"   TEXT,
  "metadata"      JSONB,
  "paidAt"        TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "Payment_userId_idx"    ON "Payment" ("userId");
CREATE INDEX "Payment_reference_idx" ON "Payment" ("reference");
CREATE INDEX "Payment_status_idx"    ON "Payment" ("status");

-- =====================================================================
-- VERIFICATION / EMAIL / SMS LOGS / AUDIT
-- =====================================================================
CREATE TABLE "VerificationCode" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"      UUID,
  "code"        TEXT NOT NULL UNIQUE,
  "type"        TEXT NOT NULL,
  "purpose"     TEXT NOT NULL,
  "studentName" TEXT,
  "program"     TEXT,
  "grade"       TEXT,
  "issuedDate"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiryDate"  TIMESTAMP(3),
  "expiresAt"   TIMESTAMP(3),
  "isValid"     BOOLEAN NOT NULL DEFAULT true,
  "isUsed"      BOOLEAN NOT NULL DEFAULT false,
  "usedAt"      TIMESTAMP(3),
  "revokedAt"   TIMESTAMP(3),
  "revokedBy"   TEXT,
  "metadata"    TEXT,
  CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "VerificationCode_code_idx"     ON "VerificationCode" ("code");
CREATE INDEX "VerificationCode_isValid_idx"  ON "VerificationCode" ("isValid");
CREATE INDEX "VerificationCode_userId_idx"   ON "VerificationCode" ("userId");
CREATE INDEX "VerificationCode_type_idx"     ON "VerificationCode" ("type");

CREATE TABLE "EmailLog" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "recipient" TEXT NOT NULL,
  "sender"    TEXT,
  "subject"   TEXT NOT NULL,
  "emailType" TEXT NOT NULL,
  "status"    TEXT NOT NULL,
  "errorMsg"  TEXT,
  "metadata"  JSONB,
  "sentAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "EmailLog_recipient_idx" ON "EmailLog" ("recipient");
CREATE INDEX "EmailLog_emailType_idx" ON "EmailLog" ("emailType");
CREATE INDEX "EmailLog_status_idx"    ON "EmailLog" ("status");

CREATE TABLE "SmsLog" (
  "id"      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "recipient" TEXT NOT NULL,
  "message"   TEXT NOT NULL,
  "smsType"   TEXT NOT NULL,
  "status"    TEXT NOT NULL,
  "errorMsg"  TEXT,
  "sentAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "SmsLog_recipient_idx" ON "SmsLog" ("recipient");
CREATE INDEX "SmsLog_smsType_idx"   ON "SmsLog" ("smsType");

CREATE TABLE "AuditLog" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"      TEXT,
  "action"      TEXT NOT NULL,
  "entityType"  TEXT NOT NULL,
  "entityId"    TEXT,
  "oldValue"    TEXT,
  "newValue"    TEXT,
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "description" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AuditLog_userId_idx"     ON "AuditLog" ("userId");
CREATE INDEX "AuditLog_action_idx"     ON "AuditLog" ("action");
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog" ("entityType");
CREATE INDEX "AuditLog_createdAt_idx"  ON "AuditLog" ("createdAt");

CREATE TABLE "AttendanceLog" (
  "id"       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"   UUID NOT NULL,
  "date"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "checkIn"  TIMESTAMP(3),
  "checkOut" TIMESTAMP(3),
  "status"   TEXT NOT NULL,
  "notes"    TEXT,
  CONSTRAINT "AttendanceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "AttendanceLog_userId_idx" ON "AttendanceLog" ("userId");
CREATE INDEX "AttendanceLog_date_idx"   ON "AttendanceLog" ("date");

-- =====================================================================
-- NOTIFICATIONS / MESSAGES
-- =====================================================================
CREATE TABLE "Notification" (
  "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"     UUID NOT NULL,
  "title"      TEXT NOT NULL,
  "message"    TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "priority"   TEXT NOT NULL DEFAULT 'NORMAL',
  "isRead"     BOOLEAN NOT NULL DEFAULT false,
  "readAt"     TIMESTAMP(3),
  "link"       TEXT,
  "entityType" TEXT,
  "entityId"   TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "Notification_userId_idx"  ON "Notification" ("userId");
CREATE INDEX "Notification_isRead_idx"  ON "Notification" ("isRead");
CREATE INDEX "Notification_type_idx"    ON "Notification" ("type");
CREATE INDEX "Notification_priority_idx" ON "Notification" ("priority");

CREATE TABLE "Message" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "senderId"  UUID,
  "recipient" TEXT NOT NULL,
  "subject"   TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "isRead"    BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE SET NULL
);
CREATE INDEX "Message_recipient_idx" ON "Message" ("recipient");
CREATE INDEX "Message_isRead_idx"    ON "Message" ("isRead");

-- =====================================================================
-- SETTINGS / PROGRAMS / CONTACT
-- =====================================================================
CREATE TABLE "Settings" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "key"       TEXT NOT NULL UNIQUE,
  "value"     TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Program" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"       TEXT NOT NULL,
  "slug"        TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "features"    TEXT,
  "icon"        TEXT,
  "imageUrl"    TEXT,
  "price"       DOUBLE PRECISION,
  "duration"    TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "order"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Program_slug_idx"     ON "Program" ("slug");
CREATE INDEX "Program_isActive_idx" ON "Program" ("isActive");

CREATE TABLE "ContactSection" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"     TEXT NOT NULL,
  "slug"      TEXT NOT NULL UNIQUE,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "ContactSection_slug_idx"     ON "ContactSection" ("slug");
CREATE INDEX "ContactSection_isActive_idx" ON "ContactSection" ("isActive");

CREATE TABLE "ContactCard" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "icon"        TEXT,
  "link"        TEXT NOT NULL,
  "linkType"    TEXT NOT NULL DEFAULT 'url',
  "order"       INTEGER NOT NULL DEFAULT 0,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sectionId"   UUID NOT NULL,
  CONSTRAINT "ContactCard_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ContactSection" ("id") ON DELETE CASCADE
);
CREATE INDEX "ContactCard_sectionId_idx" ON "ContactCard" ("sectionId");
CREATE INDEX "ContactCard_isActive_idx"  ON "ContactCard" ("isActive");

-- =====================================================================
-- EMAIL CAMPAIGNS
-- =====================================================================
CREATE TABLE "EmailCampaign" (
  "id"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name"           TEXT NOT NULL,
  "subject"        TEXT NOT NULL,
  "content"        TEXT NOT NULL,
  "targetType"     TEXT NOT NULL,
  "targetFilter"   TEXT,
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "sentCount"      INTEGER NOT NULL DEFAULT 0,
  "deliveredCount" INTEGER NOT NULL DEFAULT 0,
  "openedCount"    INTEGER NOT NULL DEFAULT 0,
  "failedCount"    INTEGER NOT NULL DEFAULT 0,
  "scheduledAt"    TIMESTAMP(3),
  "sentAt"         TIMESTAMP(3),
  "status"         TEXT NOT NULL DEFAULT 'DRAFT',
  "createdById"    TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "EmailCampaign_status_idx"      ON "EmailCampaign" ("status");
CREATE INDEX "EmailCampaign_scheduledAt_idx" ON "EmailCampaign" ("scheduledAt");

CREATE TABLE "CampaignLog" (
  "id"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "campaignId"     UUID NOT NULL,
  "recipientId"    TEXT,
  "recipientEmail" TEXT NOT NULL,
  "status"         TEXT NOT NULL,
  "errorMsg"       TEXT,
  "sentAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "openedAt"       TIMESTAMP(3),
  CONSTRAINT "CampaignLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign" ("id") ON DELETE CASCADE
);
CREATE INDEX "CampaignLog_campaignId_idx"  ON "CampaignLog" ("campaignId");
CREATE INDEX "CampaignLog_recipientId_idx" ON "CampaignLog" ("recipientId");

-- =====================================================================
-- GAMIFICATION (BADGES)
-- =====================================================================
CREATE TABLE "Badge" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name"        TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "icon"        TEXT NOT NULL,
  "category"    TEXT NOT NULL,
  "requirement" JSONB NOT NULL,
  "points"      INTEGER NOT NULL DEFAULT 10,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "StudentBadge" (
  "id"       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"   UUID NOT NULL,
  "badgeId"  UUID NOT NULL,
  "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentBadge_userId_fkey"  FOREIGN KEY ("userId")  REFERENCES "User"   ("id") ON DELETE CASCADE,
  CONSTRAINT "StudentBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"  ("id") ON DELETE CASCADE,
  CONSTRAINT "StudentBadge_userId_badgeId_key" UNIQUE ("userId", "badgeId")
);
CREATE INDEX "StudentBadge_userId_idx" ON "StudentBadge" ("userId");

-- =====================================================================
-- STUDY PLANS / TASKS
-- =====================================================================
CREATE TABLE "StudyPlan" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"      UUID NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "startDate"   TIMESTAMP(3) NOT NULL,
  "endDate"     TIMESTAMP(3) NOT NULL,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "StudyPlan_userId_idx" ON "StudyPlan" ("userId");

CREATE TABLE "StudyTask" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "planId"      UUID NOT NULL,
  "subject"     TEXT NOT NULL,
  "topic"       TEXT NOT NULL,
  "dayNumber"   INTEGER NOT NULL,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudyTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan" ("id") ON DELETE CASCADE
);
CREATE INDEX "StudyTask_planId_idx" ON "StudyTask" ("planId");

-- =====================================================================
-- ASSIGNMENTS
-- =====================================================================
CREATE TABLE "Assignment" (
  "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"           TEXT NOT NULL,
  "description"     TEXT,
  "subject"         TEXT NOT NULL,
  "topic"           TEXT,
  "classLevel"      TEXT,
  "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "totalMarks"      INTEGER NOT NULL DEFAULT 100,
  "passingScore"    INTEGER NOT NULL DEFAULT 50,
  "isActive"        BOOLEAN NOT NULL DEFAULT true,
  "isPublished"     BOOLEAN NOT NULL DEFAULT false,
  "publishedAt"     TIMESTAMP(3),
  "deadline"        TIMESTAMP(3),
  "createdById"     TEXT NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Assignment_subject_idx"      ON "Assignment" ("subject");
CREATE INDEX "Assignment_createdById_idx"  ON "Assignment" ("createdById");
CREATE INDEX "Assignment_isActive_idx"     ON "Assignment" ("isActive");
CREATE INDEX "Assignment_isPublished_idx"  ON "Assignment" ("isPublished");

CREATE TABLE "AssignmentQuestion" (
  "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "assignmentId"  UUID NOT NULL,
  "questionId"    TEXT,
  "text"          TEXT NOT NULL,
  "options"       JSONB NOT NULL,
  "correctOption" INTEGER NOT NULL,
  "explanation"   TEXT,
  "marks"         INTEGER NOT NULL DEFAULT 1,
  "order"         INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssignmentQuestion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE
);
CREATE INDEX "AssignmentQuestion_assignmentId_idx" ON "AssignmentQuestion" ("assignmentId");

CREATE TABLE "AssignmentAttempt" (
  "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "assignmentId"    UUID NOT NULL,
  "userId"          UUID NOT NULL,
  "score"           DOUBLE PRECISION,
  "totalQuestions"  INTEGER NOT NULL,
  "correctAnswers"  INTEGER NOT NULL,
  "wrongAnswers"    INTEGER NOT NULL,
  "skippedAnswers"  INTEGER NOT NULL,
  "userAnswers"     JSONB NOT NULL,
  "startedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedAt"     TIMESTAMP(3),
  "timeSpentSeconds" INTEGER,
  CONSTRAINT "AssignmentAttempt_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE,
  CONSTRAINT "AssignmentAttempt_userId_fkey"       FOREIGN KEY ("userId")       REFERENCES "User"       ("id") ON DELETE CASCADE
);
CREATE INDEX "AssignmentAttempt_assignmentId_idx" ON "AssignmentAttempt" ("assignmentId");
CREATE INDEX "AssignmentAttempt_userId_idx"       ON "AssignmentAttempt" ("userId");
CREATE INDEX "AssignmentAttempt_submittedAt_idx"  ON "AssignmentAttempt" ("submittedAt");

-- =====================================================================
-- DOCUMENTS / CERTIFICATES
-- =====================================================================
CREATE TABLE "Document" (
  "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"     UUID NOT NULL,
  "name"       TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "fileUrl"    TEXT NOT NULL,
  "fileSize"   INTEGER,
  "mimeType"   TEXT,
  "status"     TEXT NOT NULL DEFAULT 'PENDING',
  "reviewedBy" TEXT,
  "reviewNote" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "Document_userId_idx" ON "Document" ("userId");
CREATE INDEX "Document_type_idx"   ON "Document" ("type");
CREATE INDEX "Document_status_idx" ON "Document" ("status");

CREATE TABLE "Certificate" (
  "id"                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"            UUID NOT NULL,
  "certificateNumber" TEXT NOT NULL UNIQUE,
  "programme"         TEXT NOT NULL,
  "issueDate"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiryDate"        TEXT,
  "status"            TEXT NOT NULL DEFAULT 'ACTIVE',
  "qrCode"            TEXT,
  "metadata"          JSONB,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "Certificate_userId_idx"            ON "Certificate" ("userId");
CREATE INDEX "Certificate_certificateNumber_idx" ON "Certificate" ("certificateNumber");

-- =====================================================================
-- ADMISSIONS
-- =====================================================================
CREATE TABLE "Institution" (
  "id"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name"         TEXT NOT NULL,
  "abbreviation" TEXT,
  "type"         TEXT NOT NULL,
  "location"     TEXT,
  "state"        TEXT,
  "website"      TEXT,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Institution_name_idx" ON "Institution" ("name");

CREATE TABLE "InstitutionCourse" (
  "id"                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "institutionId"      UUID NOT NULL,
  "name"               TEXT NOT NULL,
  "utmeCutoff"         INTEGER,
  "olevelRequirements" TEXT,
  "jambSubjects"       JSONB,
  "postUtmeRequired"   BOOLEAN NOT NULL DEFAULT false,
  "postUtmeCutoff"     DOUBLE PRECISION,
  "applicationFee"     DOUBLE PRECISION,
  "deadline"           TIMESTAMP(3),
  "isActive"           BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "InstitutionCourse_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE
);
CREATE INDEX "InstitutionCourse_institutionId_idx" ON "InstitutionCourse" ("institutionId");

CREATE TABLE "AdmissionApplication" (
  "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"        UUID NOT NULL,
  "institutionId" UUID NOT NULL,
  "courseId"      UUID NOT NULL,
  "choiceNumber"  INTEGER,
  "status"        TEXT NOT NULL DEFAULT 'DRAFT',
  "utmeScore"     INTEGER,
  "olevelResults" JSONB,
  "paymentRef"    TEXT,
  "submittedAt"   TIMESTAMP(3),
  "decisionAt"    TIMESTAMP(3),
  "notes"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdmissionApplication_userId_fkey"        FOREIGN KEY ("userId")        REFERENCES "User"        ("id") ON DELETE CASCADE,
  CONSTRAINT "AdmissionApplication_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE
);
CREATE INDEX "AdmissionApplication_userId_idx" ON "AdmissionApplication" ("userId");
CREATE INDEX "AdmissionApplication_status_idx" ON "AdmissionApplication" ("status");

-- =====================================================================
-- REFERRALS / SCHOLARSHIPS / NOTICES
-- =====================================================================
CREATE TABLE "Referral" (
  "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "referrerId"    TEXT NOT NULL,
  "referredEmail" TEXT NOT NULL,
  "referralCode"  TEXT NOT NULL,
  "status"        TEXT NOT NULL DEFAULT 'PENDING',
  "registeredAt"  TIMESTAMP(3),
  "rewardGiven"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Referral_referrerId_idx"   ON "Referral" ("referrerId");
CREATE INDEX "Referral_referralCode_idx" ON "Referral" ("referralCode");

CREATE TABLE "Scholarship" (
  "id"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"          TEXT NOT NULL,
  "description"    TEXT NOT NULL,
  "provider"       TEXT NOT NULL,
  "amount"         DOUBLE PRECISION,
  "currency"       TEXT NOT NULL DEFAULT 'NGN',
  "eligibility"    TEXT NOT NULL,
  "deadline"       TIMESTAMP(3),
  "applicationUrl" TEXT,
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Scholarship_isActive_idx" ON "Scholarship" ("isActive");

CREATE TABLE "Notice" (
  "id"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"        TEXT NOT NULL,
  "content"      TEXT NOT NULL,
  "type"         TEXT NOT NULL,
  "targetType"   TEXT NOT NULL,
  "targetFilter" TEXT,
  "isPinned"     BOOLEAN NOT NULL DEFAULT false,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "startDate"    TIMESTAMP(3),
  "endDate"      TIMESTAMP(3),
  "createdById"  TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Notice_type_idx"     ON "Notice" ("type");
CREATE INDEX "Notice_isPinned_idx" ON "Notice" ("isPinned");
CREATE INDEX "Notice_isActive_idx" ON "Notice" ("isActive");

-- =====================================================================
-- WALLET / TRANSCRIPT
-- =====================================================================
CREATE TABLE "WalletItem" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"      UUID NOT NULL,
  "type"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "fileUrl"     TEXT,
  "reference"   TEXT,
  "metadata"    JSONB,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "WalletItem_userId_idx" ON "WalletItem" ("userId");
CREATE INDEX "WalletItem_type_idx"   ON "WalletItem" ("type");

CREATE TABLE "Wallet" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"    UUID NOT NULL UNIQUE,
  "balance"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency"  TEXT NOT NULL DEFAULT 'NGN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "Wallet_userId_idx" ON "Wallet" ("userId");

CREATE TABLE "Transcript" (
  "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"          UUID NOT NULL,
  "academicSession" TEXT NOT NULL,
  "data"            TEXT NOT NULL,
  "generatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pdfUrl"          TEXT,
  CONSTRAINT "Transcript_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "Transcript_userId_idx" ON "Transcript" ("userId");

-- =====================================================================
-- CAREERS
-- =====================================================================
CREATE TABLE "Career" (
  "id"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title"            TEXT NOT NULL UNIQUE,
  "description"      TEXT NOT NULL,
  "requiredSubjects" JSONB,
  "relatedCourses"   JSONB,
  "overview"         TEXT,
  "requirements"     TEXT,
  "skills"           TEXT,
  "workEnvironment"  TEXT,
  "salaryRange"      TEXT,
  "growthProspect"   TEXT,
  "suitability"      TEXT,
  "isActive"         BOOLEAN NOT NULL DEFAULT true,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Career_isActive_idx" ON "Career" ("isActive");

-- =====================================================================
-- SCHEDULES / TIMETABLE
-- =====================================================================
CREATE TABLE "StudySchedule" (
  "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"          UUID NOT NULL,
  "title"           TEXT NOT NULL,
  "description"     TEXT,
  "subject"         TEXT NOT NULL,
  "topic"           TEXT,
  "scheduledAt"     TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
  "isCompleted"     BOOLEAN NOT NULL DEFAULT false,
  "completedAt"     TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudySchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
CREATE INDEX "StudySchedule_userId_idx"      ON "StudySchedule" ("userId");
CREATE INDEX "StudySchedule_scheduledAt_idx" ON "StudySchedule" ("scheduledAt");

CREATE TABLE "TimetableEntry" (
  "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "day"        TEXT NOT NULL,
  "time"       TEXT NOT NULL,
  "subject"    TEXT NOT NULL,
  "instructor" TEXT,
  "venue"      TEXT,
  "type"       TEXT NOT NULL DEFAULT 'CLASS',
  "examType"   TEXT,
  "classLevel" TEXT,
  "isActive"   BOOLEAN NOT NULL DEFAULT true,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "TimetableEntry_day_idx"     ON "TimetableEntry" ("day");
CREATE INDEX "TimetableEntry_examType_idx" ON "TimetableEntry" ("examType");
