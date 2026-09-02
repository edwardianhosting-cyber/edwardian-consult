-- =============================================================================
--  Edwardian Educational Consult — Full Database Schema
--  Database: PostgreSQL
--  Generated from: backend/prisma/schema.prisma
--
--  HOW TO RUN:
--  1. Create your database first:
--       CREATE DATABASE edwardian_db;
--  2. Connect to it:
--       \c edwardian_db
--  3. Run this file:
--       \i schema.sql
--     OR paste it into pgAdmin / TablePlus / Supabase SQL editor
-- =============================================================================



-- =============================================================================
-- CORE TABLES
-- =============================================================================

CREATE TABLE "User" (
    "id"                      TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "portalId"                TEXT        NOT NULL,
    "parentAccessCode"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "parentPhone"             TEXT,
    "fullName"                TEXT        NOT NULL,
    "email"                   TEXT        NOT NULL,
    "emailVerified"           BOOLEAN     NOT NULL DEFAULT false,
    "phone"                   TEXT        NOT NULL,
    "passwordHash"            TEXT        NOT NULL,
    "role"                    TEXT        NOT NULL DEFAULT 'STUDENT',
    "avatar"                  TEXT,
    "isActive"                BOOLEAN     NOT NULL DEFAULT true,
    "lastLogin"               TIMESTAMP(3),
    "studentEmail"            TEXT,
    "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateOfBirth"             TIMESTAMP(3),
    "gender"                  TEXT,
    "address"                 TEXT,
    "state"                   TEXT,
    "lga"                     TEXT,
    "passportUrl"             TEXT,
    "currentSchool"           TEXT,
    "classLevel"              TEXT,
    "programme"               TEXT,
    "examTypes"               JSONB,
    "jambSubjects"            JSONB,
    "targetScore"             TEXT,
    "olevelResults"           JSONB,
    "targetInstitution"       TEXT,
    "targetCourse"            TEXT,
    "secondChoiceInstitution" TEXT,
    "secondChoiceCourse"      TEXT,
    "admissionYear"           TEXT,
    "preparationProgress"     INTEGER     NOT NULL DEFAULT 0,
    "mockAverage"             INTEGER     NOT NULL DEFAULT 0,
    "notificationPreferences" JSONB       DEFAULT '{}',
    "lockedUntil"             TIMESTAMP(3),
    "twoFactorEnabled"        BOOLEAN     NOT NULL DEFAULT false,
    "lastLoginIp"             TEXT,
    "lastLoginAt"             TIMESTAMP(3),

    CONSTRAINT "User_pkey"                PRIMARY KEY ("id"),
    CONSTRAINT "User_portalId_key"        UNIQUE ("portalId"),
    CONSTRAINT "User_parentAccessCode_key" UNIQUE ("parentAccessCode"),
    CONSTRAINT "User_email_key"           UNIQUE ("email"),
    CONSTRAINT "User_studentEmail_key"    UNIQUE ("studentEmail")
);

CREATE INDEX "User_email_idx"             ON "User"("email");
CREATE INDEX "User_portalId_idx"          ON "User"("portalId");
CREATE INDEX "User_parentAccessCode_idx"  ON "User"("parentAccessCode");
CREATE INDEX "User_programme_idx"         ON "User"("programme");

-- =============================================================================
-- CBT / EXAM TABLES
-- =============================================================================

CREATE TABLE "Question" (
    "id"            TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "subject"       TEXT        NOT NULL,
    "examType"      TEXT        NOT NULL,
    "institution"   TEXT,
    "year"          INTEGER     NOT NULL,
    "topic"         TEXT,
    "difficulty"    TEXT        NOT NULL DEFAULT 'MEDIUM',
    "text"          TEXT        NOT NULL,
    "imageUrl"      TEXT,
    "options"       JSONB       NOT NULL,
    "correctOption" INTEGER     NOT NULL,
    "explanation"   TEXT,
    "isActive"      BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Question_subject_idx"  ON "Question"("subject");
CREATE INDEX "Question_examType_idx" ON "Question"("examType");
CREATE INDEX "Question_topic_idx"    ON "Question"("topic");
CREATE INDEX "Question_year_idx"     ON "Question"("year");

CREATE TABLE "Exam" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"       TEXT        NOT NULL,
    "examType"    TEXT        NOT NULL,
    "subject"     TEXT        NOT NULL,
    "duration"    INTEGER     NOT NULL,
    "totalMarks"  INTEGER     NOT NULL,
    "isActive"    BOOLEAN     NOT NULL DEFAULT true,
    "isPublished" BOOLEAN     NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Exam_examType_idx"    ON "Exam"("examType");
CREATE INDEX "Exam_subject_idx"     ON "Exam"("subject");
CREATE INDEX "Exam_isPublished_idx" ON "Exam"("isPublished");

CREATE TABLE "ExamQuestion" (
    "examId"     TEXT    NOT NULL,
    "questionId" TEXT    NOT NULL,
    "order"      INTEGER NOT NULL,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("examId", "questionId"),
    CONSTRAINT "ExamQuestion_examId_fkey"     FOREIGN KEY ("examId")     REFERENCES "Exam"("id")     ON DELETE CASCADE,
    CONSTRAINT "ExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE
);

CREATE TABLE "CbtResult" (
    "id"             TEXT         NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"         TEXT         NOT NULL,
    "examId"         TEXT,
    "subject"        TEXT         NOT NULL,
    "type"           TEXT         NOT NULL DEFAULT 'PRACTICE',
    "score"          DOUBLE PRECISION NOT NULL,
    "totalQuestions" INTEGER      NOT NULL,
    "correctAnswers" INTEGER      NOT NULL,
    "wrongAnswers"   INTEGER      NOT NULL,
    "skippedAnswers" INTEGER      NOT NULL,
    "durationUsed"   INTEGER      NOT NULL,
    "userAnswers"    JSONB        NOT NULL,
    "weakTopics"     JSONB,
    "completedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CbtResult_pkey"   PRIMARY KEY ("id"),
    CONSTRAINT "CbtResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "CbtResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL
);

CREATE INDEX "CbtResult_userId_idx" ON "CbtResult"("userId");
CREATE INDEX "CbtResult_examId_idx" ON "CbtResult"("examId");
CREATE INDEX "CbtResult_type_idx"   ON "CbtResult"("type");

-- =============================================================================
-- STUDY TABLES
-- =============================================================================

CREATE TABLE "StudySubject" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "name"        TEXT        NOT NULL,
    "description" TEXT,
    "code"        TEXT,
    "gradeLevel"  TEXT,
    "icon"        TEXT,
    "imageUrl"    TEXT,
    "isActive"    BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudySubject_pkey"     PRIMARY KEY ("id"),
    CONSTRAINT "StudySubject_code_key" UNIQUE ("code")
);

CREATE INDEX "StudySubject_name_idx"     ON "StudySubject"("name");
CREATE INDEX "StudySubject_isActive_idx" ON "StudySubject"("isActive");

CREATE TABLE "StudyTopic" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "subjectId"   TEXT        NOT NULL,
    "name"        TEXT        NOT NULL,
    "description" TEXT,
    "order"       INTEGER     NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyTopic_pkey"         PRIMARY KEY ("id"),
    CONSTRAINT "StudyTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "StudySubject"("id") ON DELETE CASCADE
);

CREATE INDEX "StudyTopic_subjectId_idx" ON "StudyTopic"("subjectId");
CREATE INDEX "StudyTopic_isActive_idx"  ON "StudyTopic"("isActive");

CREATE TABLE "StudyResource" (
    "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "topicId"   TEXT        NOT NULL,
    "title"     TEXT        NOT NULL,
    "type"      TEXT        NOT NULL DEFAULT 'TEXT',
    "content"   TEXT,
    "fileUrl"   TEXT,
    "fileSize"  INTEGER,
    "mimeType"  TEXT,
    "duration"  INTEGER,
    "order"     INTEGER     NOT NULL DEFAULT 0,
    "isActive"  BOOLEAN     NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyResource_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "StudyResource_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "StudyTopic"("id") ON DELETE CASCADE
);

CREATE INDEX "StudyResource_topicId_idx"  ON "StudyResource"("topicId");
CREATE INDEX "StudyResource_isActive_idx" ON "StudyResource"("isActive");

CREATE TABLE "StudyPlan" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"      TEXT        NOT NULL,
    "title"       TEXT        NOT NULL,
    "description" TEXT,
    "startDate"   TIMESTAMP(3) NOT NULL,
    "endDate"     TIMESTAMP(3) NOT NULL,
    "isActive"    BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyPlan_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "StudyPlan_userId_idx" ON "StudyPlan"("userId");

CREATE TABLE "StudyTask" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "planId"      TEXT        NOT NULL,
    "subject"     TEXT        NOT NULL,
    "topic"       TEXT        NOT NULL,
    "dayNumber"   INTEGER     NOT NULL,
    "isCompleted" BOOLEAN     NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyTask_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "StudyTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE
);

CREATE INDEX "StudyTask_planId_idx" ON "StudyTask"("planId");

CREATE TABLE "StudySchedule" (
    "id"              TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"          TEXT        NOT NULL,
    "title"           TEXT        NOT NULL,
    "description"     TEXT,
    "subject"         TEXT        NOT NULL,
    "topic"           TEXT,
    "scheduledAt"     TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER     NOT NULL DEFAULT 30,
    "reminderEnabled" BOOLEAN     NOT NULL DEFAULT true,
    "isCompleted"     BOOLEAN     NOT NULL DEFAULT false,
    "completedAt"     TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudySchedule_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "StudySchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "StudySchedule_userId_idx"      ON "StudySchedule"("userId");
CREATE INDEX "StudySchedule_scheduledAt_idx" ON "StudySchedule"("scheduledAt");

-- =============================================================================
-- ASSIGNMENT TABLES
-- =============================================================================

CREATE TABLE "Assignment" (
    "id"              TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"           TEXT        NOT NULL,
    "description"     TEXT,
    "subject"         TEXT        NOT NULL,
    "topic"           TEXT,
    "classLevel"      TEXT,
    "durationMinutes" INTEGER     NOT NULL DEFAULT 30,
    "totalMarks"      INTEGER     NOT NULL DEFAULT 100,
    "passingScore"    INTEGER     NOT NULL DEFAULT 50,
    "isActive"        BOOLEAN     NOT NULL DEFAULT true,
    "isPublished"     BOOLEAN     NOT NULL DEFAULT false,
    "publishedAt"     TIMESTAMP(3),
    "deadline"        TIMESTAMP(3),
    "createdById"     TEXT        NOT NULL,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Assignment_subject_idx"     ON "Assignment"("subject");
CREATE INDEX "Assignment_createdById_idx" ON "Assignment"("createdById");
CREATE INDEX "Assignment_isActive_idx"    ON "Assignment"("isActive");
CREATE INDEX "Assignment_isPublished_idx" ON "Assignment"("isPublished");

CREATE TABLE "AssignmentQuestion" (
    "id"           TEXT    NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "assignmentId" TEXT    NOT NULL,
    "questionId"   TEXT,
    "text"         TEXT    NOT NULL,
    "options"      JSONB   NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "explanation"  TEXT,
    "marks"        INTEGER NOT NULL DEFAULT 1,
    "order"        INTEGER NOT NULL DEFAULT 0,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentQuestion_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "AssignmentQuestion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE
);

CREATE INDEX "AssignmentQuestion_assignmentId_idx" ON "AssignmentQuestion"("assignmentId");

CREATE TABLE "AssignmentAttempt" (
    "id"               TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "assignmentId"     TEXT        NOT NULL,
    "userId"           TEXT        NOT NULL,
    "score"            DOUBLE PRECISION,
    "totalQuestions"   INTEGER     NOT NULL,
    "correctAnswers"   INTEGER     NOT NULL,
    "wrongAnswers"     INTEGER     NOT NULL,
    "skippedAnswers"   INTEGER     NOT NULL,
    "userAnswers"      JSONB       NOT NULL,
    "startedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt"      TIMESTAMP(3),
    "timeSpentSeconds" INTEGER,

    CONSTRAINT "AssignmentAttempt_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "AssignmentAttempt_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE,
    CONSTRAINT "AssignmentAttempt_userId_fkey"       FOREIGN KEY ("userId")       REFERENCES "User"("id")       ON DELETE CASCADE
);

CREATE INDEX "AssignmentAttempt_assignmentId_idx" ON "AssignmentAttempt"("assignmentId");
CREATE INDEX "AssignmentAttempt_userId_idx"        ON "AssignmentAttempt"("userId");
CREATE INDEX "AssignmentAttempt_submittedAt_idx"   ON "AssignmentAttempt"("submittedAt");

-- =============================================================================
-- PAYMENT / WALLET TABLES
-- =============================================================================

CREATE TABLE "Payment" (
    "id"            TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"        TEXT        NOT NULL,
    "reference"     TEXT        NOT NULL,
    "amount"        DOUBLE PRECISION NOT NULL,
    "status"        TEXT        NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT        NOT NULL,
    "description"   TEXT,
    "metadata"      JSONB,
    "paidAt"        TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey"          PRIMARY KEY ("id"),
    CONSTRAINT "Payment_reference_key" UNIQUE ("reference"),
    CONSTRAINT "Payment_userId_fkey"   FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Payment_userId_idx"    ON "Payment"("userId");
CREATE INDEX "Payment_reference_idx" ON "Payment"("reference");
CREATE INDEX "Payment_status_idx"    ON "Payment"("status");

CREATE TABLE "Wallet" (
    "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"    TEXT        NOT NULL,
    "balance"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency"  TEXT        NOT NULL DEFAULT 'NGN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "Wallet_userId_key"  UNIQUE ("userId")
);

CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

CREATE TABLE "WalletItem" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"      TEXT        NOT NULL,
    "type"        TEXT        NOT NULL,
    "title"       TEXT        NOT NULL,
    "description" TEXT,
    "fileUrl"     TEXT,
    "reference"   TEXT,
    "metadata"    JSONB,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WalletItem_userId_idx" ON "WalletItem"("userId");
CREATE INDEX "WalletItem_type_idx"   ON "WalletItem"("type");

-- =============================================================================
-- COMMUNICATION TABLES
-- =============================================================================

CREATE TABLE "Notification" (
    "id"         TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"     TEXT        NOT NULL,
    "title"      TEXT        NOT NULL,
    "message"    TEXT        NOT NULL,
    "type"       TEXT        NOT NULL,
    "priority"   TEXT        NOT NULL DEFAULT 'NORMAL',
    "isRead"     BOOLEAN     NOT NULL DEFAULT false,
    "readAt"     TIMESTAMP(3),
    "link"       TEXT,
    "entityType" TEXT,
    "entityId"   TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Notification_userId_idx"   ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx"   ON "Notification"("isRead");
CREATE INDEX "Notification_type_idx"     ON "Notification"("type");
CREATE INDEX "Notification_priority_idx" ON "Notification"("priority");

CREATE TABLE "Message" (
    "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "senderId"  TEXT,
    "recipient" TEXT        NOT NULL,
    "subject"   TEXT        NOT NULL,
    "content"   TEXT        NOT NULL,
    "isRead"    BOOLEAN     NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey"          PRIMARY KEY ("id"),
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "Message_recipient_idx" ON "Message"("recipient");
CREATE INDEX "Message_isRead_idx"    ON "Message"("isRead");

CREATE TABLE "VerificationCode" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"      TEXT,
    "code"        TEXT        NOT NULL,
    "type"        TEXT        NOT NULL,
    "purpose"     TEXT        NOT NULL,
    "studentName" TEXT,
    "program"     TEXT,
    "grade"       TEXT,
    "issuedDate"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate"  TIMESTAMP(3),
    "expiresAt"   TIMESTAMP(3),
    "isValid"     BOOLEAN     NOT NULL DEFAULT true,
    "isUsed"      BOOLEAN     NOT NULL DEFAULT false,
    "usedAt"      TIMESTAMP(3),
    "revokedAt"   TIMESTAMP(3),
    "revokedBy"   TEXT,
    "metadata"    TEXT,

    CONSTRAINT "VerificationCode_pkey"     PRIMARY KEY ("id"),
    CONSTRAINT "VerificationCode_code_key" UNIQUE ("code"),
    CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "VerificationCode_code_idx"    ON "VerificationCode"("code");
CREATE INDEX "VerificationCode_isValid_idx" ON "VerificationCode"("isValid");
CREATE INDEX "VerificationCode_userId_idx"  ON "VerificationCode"("userId");
CREATE INDEX "VerificationCode_type_idx"    ON "VerificationCode"("type");

CREATE TABLE "ParentFeedback" (
    "id"         TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"     TEXT        NOT NULL,
    "authorName" TEXT        NOT NULL,
    "message"    TEXT        NOT NULL,
    "isRead"     BOOLEAN     NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentFeedback_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "ParentFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "ParentFeedback_userId_idx" ON "ParentFeedback"("userId");

-- =============================================================================
-- LOGGING TABLES
-- =============================================================================

CREATE TABLE "EmailLog" (
    "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "recipient" TEXT        NOT NULL,
    "sender"    TEXT,
    "subject"   TEXT        NOT NULL,
    "emailType" TEXT        NOT NULL,
    "status"    TEXT        NOT NULL,
    "errorMsg"  TEXT,
    "metadata"  JSONB,
    "sentAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailLog_recipient_idx"  ON "EmailLog"("recipient");
CREATE INDEX "EmailLog_emailType_idx"  ON "EmailLog"("emailType");
CREATE INDEX "EmailLog_status_idx"     ON "EmailLog"("status");

CREATE TABLE "SmsLog" (
    "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "recipient" TEXT        NOT NULL,
    "message"   TEXT        NOT NULL,
    "smsType"   TEXT        NOT NULL,
    "status"    TEXT        NOT NULL,
    "errorMsg"  TEXT,
    "sentAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SmsLog_recipient_idx" ON "SmsLog"("recipient");
CREATE INDEX "SmsLog_smsType_idx"   ON "SmsLog"("smsType");

CREATE TABLE "AttendanceLog" (
    "id"       TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"   TEXT        NOT NULL,
    "date"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkIn"  TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status"   TEXT        NOT NULL,
    "notes"    TEXT,

    CONSTRAINT "AttendanceLog_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "AttendanceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "AttendanceLog_userId_idx" ON "AttendanceLog"("userId");
CREATE INDEX "AttendanceLog_date_idx"   ON "AttendanceLog"("date");

CREATE TABLE "AuditLog" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"      TEXT,
    "action"      TEXT        NOT NULL,
    "entityType"  TEXT        NOT NULL,
    "entityId"    TEXT,
    "oldValue"    TEXT,
    "newValue"    TEXT,
    "ipAddress"   TEXT,
    "userAgent"   TEXT,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_userId_idx"     ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx"     ON "AuditLog"("action");
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");
CREATE INDEX "AuditLog_createdAt_idx"  ON "AuditLog"("createdAt");

-- =============================================================================
-- CONTENT TABLES
-- =============================================================================

CREATE TABLE "NewsArticle" (
    "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"        TEXT        NOT NULL,
    "slug"         TEXT        NOT NULL,
    "category"     TEXT        NOT NULL,
    "content"      TEXT        NOT NULL,
    "excerpt"      TEXT,
    "coverImage"   TEXT,
    "isPublished"  BOOLEAN     NOT NULL DEFAULT true,
    "isPinned"     BOOLEAN     NOT NULL DEFAULT false,
    "isActive"     BOOLEAN     NOT NULL DEFAULT true,
    "authorId"     TEXT,
    "viewCount"    INTEGER     NOT NULL DEFAULT 0,
    "targetType"   TEXT        NOT NULL DEFAULT 'ALL',
    "targetFilter" TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticle_pkey"     PRIMARY KEY ("id"),
    CONSTRAINT "NewsArticle_slug_key" UNIQUE ("slug")
);

CREATE INDEX "NewsArticle_slug_idx"        ON "NewsArticle"("slug");
CREATE INDEX "NewsArticle_category_idx"    ON "NewsArticle"("category");
CREATE INDEX "NewsArticle_isPublished_idx" ON "NewsArticle"("isPublished");
CREATE INDEX "NewsArticle_targetType_idx"  ON "NewsArticle"("targetType");

CREATE TABLE "Notice" (
    "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"        TEXT        NOT NULL,
    "content"      TEXT        NOT NULL,
    "type"         TEXT        NOT NULL,
    "targetType"   TEXT        NOT NULL,
    "targetFilter" TEXT,
    "isPinned"     BOOLEAN     NOT NULL DEFAULT false,
    "isActive"     BOOLEAN     NOT NULL DEFAULT true,
    "startDate"    TIMESTAMP(3),
    "endDate"      TIMESTAMP(3),
    "createdById"  TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notice_type_idx"     ON "Notice"("type");
CREATE INDEX "Notice_isPinned_idx" ON "Notice"("isPinned");
CREATE INDEX "Notice_isActive_idx" ON "Notice"("isActive");

CREATE TABLE "Program" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"       TEXT        NOT NULL,
    "slug"        TEXT        NOT NULL,
    "description" TEXT        NOT NULL,
    "features"    TEXT,
    "icon"        TEXT,
    "imageUrl"    TEXT,
    "price"       DOUBLE PRECISION,
    "duration"    TEXT,
    "isActive"    BOOLEAN     NOT NULL DEFAULT true,
    "order"       INTEGER     NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Program_pkey"     PRIMARY KEY ("id"),
    CONSTRAINT "Program_slug_key" UNIQUE ("slug")
);

CREATE INDEX "Program_slug_idx"     ON "Program"("slug");
CREATE INDEX "Program_isActive_idx" ON "Program"("isActive");

CREATE TABLE "Settings" (
    "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "key"       TEXT        NOT NULL,
    "value"     TEXT        NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settings_pkey"    PRIMARY KEY ("id"),
    CONSTRAINT "Settings_key_key" UNIQUE ("key")
);

-- =============================================================================
-- CONTACT TABLES
-- =============================================================================

CREATE TABLE "ContactSection" (
    "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"     TEXT        NOT NULL,
    "slug"      TEXT        NOT NULL,
    "order"     INTEGER     NOT NULL DEFAULT 0,
    "isActive"  BOOLEAN     NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSection_pkey"     PRIMARY KEY ("id"),
    CONSTRAINT "ContactSection_slug_key" UNIQUE ("slug")
);

CREATE INDEX "ContactSection_slug_idx"     ON "ContactSection"("slug");
CREATE INDEX "ContactSection_isActive_idx" ON "ContactSection"("isActive");

CREATE TABLE "ContactCard" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"       TEXT        NOT NULL,
    "description" TEXT,
    "icon"        TEXT,
    "link"        TEXT        NOT NULL,
    "linkType"    TEXT        NOT NULL DEFAULT 'url',
    "order"       INTEGER     NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sectionId"   TEXT        NOT NULL,

    CONSTRAINT "ContactCard_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "ContactCard_sectionId_fkey"  FOREIGN KEY ("sectionId") REFERENCES "ContactSection"("id") ON DELETE CASCADE
);

CREATE INDEX "ContactCard_sectionId_idx" ON "ContactCard"("sectionId");
CREATE INDEX "ContactCard_isActive_idx"  ON "ContactCard"("isActive");

-- =============================================================================
-- CAMPAIGN TABLES
-- =============================================================================

CREATE TABLE "EmailCampaign" (
    "id"             TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "name"           TEXT        NOT NULL,
    "subject"        TEXT        NOT NULL,
    "content"        TEXT        NOT NULL,
    "targetType"     TEXT        NOT NULL,
    "targetFilter"   TEXT,
    "recipientCount" INTEGER     NOT NULL DEFAULT 0,
    "sentCount"      INTEGER     NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER     NOT NULL DEFAULT 0,
    "openedCount"    INTEGER     NOT NULL DEFAULT 0,
    "failedCount"    INTEGER     NOT NULL DEFAULT 0,
    "scheduledAt"    TIMESTAMP(3),
    "sentAt"         TIMESTAMP(3),
    "status"         TEXT        NOT NULL DEFAULT 'DRAFT',
    "createdById"    TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailCampaign_status_idx"      ON "EmailCampaign"("status");
CREATE INDEX "EmailCampaign_scheduledAt_idx" ON "EmailCampaign"("scheduledAt");

CREATE TABLE "CampaignLog" (
    "id"             TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "campaignId"     TEXT        NOT NULL,
    "recipientId"    TEXT,
    "recipientEmail" TEXT        NOT NULL,
    "status"         TEXT        NOT NULL,
    "errorMsg"       TEXT,
    "sentAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt"       TIMESTAMP(3),

    CONSTRAINT "CampaignLog_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "CampaignLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE
);

CREATE INDEX "CampaignLog_campaignId_idx"  ON "CampaignLog"("campaignId");
CREATE INDEX "CampaignLog_recipientId_idx" ON "CampaignLog"("recipientId");

-- =============================================================================
-- GAMIFICATION TABLES
-- =============================================================================

CREATE TABLE "Badge" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "name"        TEXT        NOT NULL,
    "description" TEXT        NOT NULL,
    "icon"        TEXT        NOT NULL,
    "category"    TEXT        NOT NULL,
    "requirement" JSONB       NOT NULL,
    "points"      INTEGER     NOT NULL DEFAULT 10,
    "isActive"    BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey"     PRIMARY KEY ("id"),
    CONSTRAINT "Badge_name_key" UNIQUE ("name")
);

CREATE TABLE "StudentBadge" (
    "id"       TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"   TEXT        NOT NULL,
    "badgeId"  TEXT        NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentBadge_pkey"              PRIMARY KEY ("id"),
    CONSTRAINT "StudentBadge_userId_badgeId_key" UNIQUE ("userId", "badgeId"),
    CONSTRAINT "StudentBadge_userId_fkey"        FOREIGN KEY ("userId")  REFERENCES "User"("id")  ON DELETE CASCADE,
    CONSTRAINT "StudentBadge_badgeId_fkey"       FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE
);

CREATE INDEX "StudentBadge_userId_idx" ON "StudentBadge"("userId");

-- =============================================================================
-- ADMISSION TABLES
-- =============================================================================

CREATE TABLE "Institution" (
    "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "name"         TEXT        NOT NULL,
    "abbreviation" TEXT,
    "type"         TEXT        NOT NULL,
    "location"     TEXT,
    "state"        TEXT,
    "website"      TEXT,
    "isActive"     BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Institution_name_idx" ON "Institution"("name");

CREATE TABLE "InstitutionCourse" (
    "id"                 TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "institutionId"      TEXT        NOT NULL,
    "name"               TEXT        NOT NULL,
    "utmeCutoff"         INTEGER,
    "olevelRequirements" TEXT,
    "jambSubjects"       JSONB,
    "postUtmeRequired"   BOOLEAN     NOT NULL DEFAULT false,
    "postUtmeCutoff"     DOUBLE PRECISION,
    "applicationFee"     DOUBLE PRECISION,
    "deadline"           TIMESTAMP(3),
    "isActive"           BOOLEAN     NOT NULL DEFAULT true,

    CONSTRAINT "InstitutionCourse_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "InstitutionCourse_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE
);

CREATE INDEX "InstitutionCourse_institutionId_idx" ON "InstitutionCourse"("institutionId");

CREATE TABLE "AdmissionApplication" (
    "id"            TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"        TEXT        NOT NULL,
    "institutionId" TEXT        NOT NULL,
    "courseId"      TEXT        NOT NULL,
    "choiceNumber"  INTEGER,
    "status"        TEXT        NOT NULL DEFAULT 'DRAFT',
    "utmeScore"     INTEGER,
    "olevelResults" JSONB,
    "paymentRef"    TEXT,
    "submittedAt"   TIMESTAMP(3),
    "decisionAt"    TIMESTAMP(3),
    "notes"         TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionApplication_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "AdmissionApplication_userId_fkey"      FOREIGN KEY ("userId")        REFERENCES "User"("id")        ON DELETE CASCADE,
    CONSTRAINT "AdmissionApplication_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE
);

CREATE INDEX "AdmissionApplication_userId_idx" ON "AdmissionApplication"("userId");
CREATE INDEX "AdmissionApplication_status_idx" ON "AdmissionApplication"("status");

-- =============================================================================
-- MISC TABLES
-- =============================================================================

CREATE TABLE "Document" (
    "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"      TEXT        NOT NULL,
    "name"        TEXT        NOT NULL,
    "type"        TEXT        NOT NULL,
    "fileUrl"     TEXT        NOT NULL,
    "fileSize"    INTEGER,
    "mimeType"    TEXT,
    "status"      TEXT        NOT NULL DEFAULT 'PENDING',
    "reviewedBy"  TEXT,
    "reviewNote"  TEXT,
    "reviewedAt"  TIMESTAMP(3),
    "uploadedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Document_userId_idx" ON "Document"("userId");
CREATE INDEX "Document_type_idx"   ON "Document"("type");
CREATE INDEX "Document_status_idx" ON "Document"("status");

CREATE TABLE "Certificate" (
    "id"                TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"            TEXT        NOT NULL,
    "certificateNumber" TEXT        NOT NULL,
    "programme"         TEXT        NOT NULL,
    "issueDate"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate"        TEXT,
    "status"            TEXT        NOT NULL DEFAULT 'ACTIVE',
    "qrCode"            TEXT,
    "metadata"          JSONB,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey"                  PRIMARY KEY ("id"),
    CONSTRAINT "Certificate_certificateNumber_key" UNIQUE ("certificateNumber"),
    CONSTRAINT "Certificate_userId_fkey"           FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Certificate_userId_idx"            ON "Certificate"("userId");
CREATE INDEX "Certificate_certificateNumber_idx" ON "Certificate"("certificateNumber");

CREATE TABLE "Enrollment" (
    "id"         TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"     TEXT        NOT NULL,
    "courseName" TEXT        NOT NULL,
    "courseCode" TEXT,
    "status"     TEXT        NOT NULL DEFAULT 'ACTIVE',
    "startDate"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate"    TIMESTAMP(3),
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

CREATE TABLE "Referral" (
    "id"            TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "referrerId"    TEXT        NOT NULL,
    "referredEmail" TEXT        NOT NULL,
    "referralCode"  TEXT        NOT NULL,
    "status"        TEXT        NOT NULL DEFAULT 'PENDING',
    "registeredAt"  TIMESTAMP(3),
    "rewardGiven"   BOOLEAN     NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Referral_referrerId_idx"   ON "Referral"("referrerId");
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");

CREATE TABLE "Scholarship" (
    "id"             TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"          TEXT        NOT NULL,
    "description"    TEXT        NOT NULL,
    "provider"       TEXT        NOT NULL,
    "amount"         DOUBLE PRECISION,
    "currency"       TEXT        NOT NULL DEFAULT 'NGN',
    "eligibility"    TEXT        NOT NULL,
    "deadline"       TIMESTAMP(3),
    "applicationUrl" TEXT,
    "isActive"       BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Scholarship_isActive_idx" ON "Scholarship"("isActive");

CREATE TABLE "Career" (
    "id"              TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"           TEXT        NOT NULL,
    "description"     TEXT        NOT NULL,
    "requiredSubjects" JSONB,
    "relatedCourses"  JSONB,
    "overview"        TEXT,
    "requirements"    TEXT,
    "skills"          TEXT,
    "workEnvironment" TEXT,
    "salaryRange"     TEXT,
    "growthProspect"  TEXT,
    "suitability"     TEXT,
    "isActive"        BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Career_pkey"       PRIMARY KEY ("id"),
    CONSTRAINT "Career_title_key"  UNIQUE ("title")
);

CREATE INDEX "Career_isActive_idx" ON "Career"("isActive");

CREATE TABLE "Transcript" (
    "id"              TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"          TEXT        NOT NULL,
    "academicSession" TEXT        NOT NULL,
    "data"            TEXT        NOT NULL,
    "generatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl"          TEXT,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Transcript_userId_idx" ON "Transcript"("userId");

CREATE TABLE "TimetableEntry" (
    "id"         TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "day"        TEXT        NOT NULL,
    "time"       TEXT        NOT NULL,
    "subject"    TEXT        NOT NULL,
    "instructor" TEXT,
    "venue"      TEXT,
    "type"       TEXT        NOT NULL DEFAULT 'CLASS',
    "examType"   TEXT,
    "classLevel" TEXT,
    "isActive"   BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TimetableEntry_day_idx"      ON "TimetableEntry"("day");
CREATE INDEX "TimetableEntry_examType_idx" ON "TimetableEntry"("examType");


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- ─── Default Settings ─────────────────────────────────────────────────────────
INSERT INTO "Settings" ("id", "key", "value") VALUES
  (gen_random_uuid()::TEXT, 'site_name',          'Edwardian Educational Consult'),
  (gen_random_uuid()::TEXT, 'site_email',         'registrar@edwardianeducationalconsult.com.ng'),
  (gen_random_uuid()::TEXT, 'site_phone',         '+234 800 000 0000'),
  (gen_random_uuid()::TEXT, 'registration_open',  'true'),
  (gen_random_uuid()::TEXT, 'maintenance_mode',   'false'),
  (gen_random_uuid()::TEXT, 'max_cbt_attempts',   '5'),
  (gen_random_uuid()::TEXT, 'session_year',       '2026');

-- ─── Programs ─────────────────────────────────────────────────────────────────
INSERT INTO "Program" ("id", "title", "slug", "description", "duration", "price", "isActive", "order") VALUES
  (gen_random_uuid()::TEXT, 'JAMB UTME Preparation',    'jamb-utme',   'Comprehensive JAMB UTME preparation covering all subjects with past questions and mock exams.', '3 months', 25000, true, 1),
  (gen_random_uuid()::TEXT, 'WAEC/NECO Preparation',    'waec-neco',   'Intensive preparation for WAEC and NECO examinations with subject specialists.', '4 months', 20000, true, 2),
  (gen_random_uuid()::TEXT, 'Post-UTME Coaching',       'post-utme',   'Targeted coaching for university Post-UTME screening tests.', '6 weeks', 15000, true, 3),
  (gen_random_uuid()::TEXT, 'JUPEB Programme',          'jupeb',       'Joint Universities Preliminary Examinations Board direct entry programme.', '12 months', 80000, true, 4),
  (gen_random_uuid()::TEXT, 'IJMB Programme',           'ijmb',        'Interim Joint Matriculation Board advanced level programme.', '12 months', 75000, true, 5);

-- ─── Badges ───────────────────────────────────────────────────────────────────
INSERT INTO "Badge" ("id", "name", "description", "icon", "category", "requirement", "points") VALUES
  (gen_random_uuid()::TEXT, 'First Login',       'Logged in for the first time',            '🎯', 'MILESTONE',   '{"type":"login","count":1}',       5),
  (gen_random_uuid()::TEXT, 'Quick Learner',     'Completed your first CBT practice',       '⚡', 'CBT',         '{"type":"cbt","count":1}',         10),
  (gen_random_uuid()::TEXT, 'High Scorer',       'Scored above 80% in a CBT exam',          '🏆', 'CBT',         '{"type":"cbt_score","min":80}',    25),
  (gen_random_uuid()::TEXT, 'Consistent',        'Practiced CBT 7 days in a row',           '🔥', 'STREAK',      '{"type":"streak","days":7}',       30),
  (gen_random_uuid()::TEXT, 'Top Performer',     'Ranked in the top 10 on leaderboard',     '⭐', 'LEADERBOARD', '{"type":"rank","max":10}',         50),
  (gen_random_uuid()::TEXT, 'Profile Complete',  'Completed your student profile 100%',     '✅', 'PROFILE',     '{"type":"profile","percent":100}', 15),
  (gen_random_uuid()::TEXT, 'Study Planner',     'Created your first study plan',           '📅', 'STUDY',       '{"type":"study_plan","count":1}',  10),
  (gen_random_uuid()::TEXT, 'Assignment Ace',    'Scored 100% in an assignment',            '💯', 'ASSIGNMENT',  '{"type":"assignment_score","min":100}', 20);

-- ─── Sample Institutions ──────────────────────────────────────────────────────
INSERT INTO "Institution" ("id", "name", "abbreviation", "type", "state", "isActive") VALUES
  (gen_random_uuid()::TEXT, 'University of Lagos',              'UNILAG',  'FEDERAL',  'Lagos',  true),
  (gen_random_uuid()::TEXT, 'University of Ibadan',             'UI',      'FEDERAL',  'Oyo',    true),
  (gen_random_uuid()::TEXT, 'Obafemi Awolowo University',       'OAU',     'FEDERAL',  'Osun',   true),
  (gen_random_uuid()::TEXT, 'Ahmadu Bello University',          'ABU',     'FEDERAL',  'Kaduna', true),
  (gen_random_uuid()::TEXT, 'University of Nigeria, Nsukka',    'UNN',     'FEDERAL',  'Enugu',  true),
  (gen_random_uuid()::TEXT, 'University of Benin',              'UNIBEN',  'FEDERAL',  'Edo',    true),
  (gen_random_uuid()::TEXT, 'Lagos State University',           'LASU',    'STATE',    'Lagos',  true),
  (gen_random_uuid()::TEXT, 'University of Port Harcourt',      'UNIPORT', 'FEDERAL',  'Rivers', true);

-- ─── Sample Questions ─────────────────────────────────────────────────────────
INSERT INTO "Question" ("id", "subject", "examType", "year", "topic", "difficulty", "text", "options", "correctOption", "explanation") VALUES
  (gen_random_uuid()::TEXT, 'Mathematics', 'JAMB', 2024, 'Algebra', 'EASY',
   'Simplify: 3x + 2x - x',
   '["3x","4x","5x","6x"]', 1, '3x + 2x - x = (3+2-1)x = 4x'),

  (gen_random_uuid()::TEXT, 'Mathematics', 'JAMB', 2024, 'Algebra', 'MEDIUM',
   'If 2x + 3 = 11, what is the value of x?',
   '["2","3","4","5"]', 2, '2x = 11 - 3 = 8, so x = 4'),

  (gen_random_uuid()::TEXT, 'English Language', 'JAMB', 2024, 'Grammar', 'EASY',
   'Choose the word that best completes the sentence: "She is _____ honest person."',
   '["a","an","the","some"]', 1, '"Honest" starts with a vowel sound, so we use "an"'),

  (gen_random_uuid()::TEXT, 'Physics', 'JAMB', 2024, 'Mechanics', 'MEDIUM',
   'What is the SI unit of force?',
   '["Watt","Joule","Newton","Pascal"]', 2, 'The SI unit of force is the Newton (N), named after Isaac Newton'),

  (gen_random_uuid()::TEXT, 'Chemistry', 'JAMB', 2024, 'Atomic Structure', 'MEDIUM',
   'The atomic number of an element represents:',
   '["Number of neutrons","Number of protons","Number of electrons and protons","Mass number"]', 1,
   'Atomic number = number of protons in the nucleus of an atom'),

  (gen_random_uuid()::TEXT, 'Biology', 'JAMB', 2024, 'Cell Biology', 'EASY',
   'Which organelle is known as the powerhouse of the cell?',
   '["Nucleus","Ribosome","Mitochondria","Golgi apparatus"]', 2,
   'Mitochondria produce ATP through cellular respiration, providing energy for the cell'),

  (gen_random_uuid()::TEXT, 'Economics', 'WAEC', 2024, 'Supply and Demand', 'MEDIUM',
   'When the price of a good rises, the quantity demanded generally:',
   '["Increases","Decreases","Stays the same","Doubles"]', 1,
   'According to the law of demand, there is an inverse relationship between price and quantity demanded');

-- ─── Sample Scholarships ──────────────────────────────────────────────────────
INSERT INTO "Scholarship" ("id", "title", "description", "provider", "amount", "eligibility", "isActive") VALUES
  (gen_random_uuid()::TEXT,
   'Federal Government Scholarship',
   'Scholarship for outstanding Nigerian students pursuing undergraduate studies.',
   'Federal Government of Nigeria',
   150000,
   'Nigerian citizen, JAMB score above 280, CGPA 4.5 and above',
   true),
  (gen_random_uuid()::TEXT,
   'Niger Delta Development Commission Scholarship',
   'Scholarship for students from Niger Delta states.',
   'NDDC',
   200000,
   'From Niger Delta states, undergraduate student in accredited university',
   true),
  (gen_random_uuid()::TEXT,
   'Edwardian Academic Excellence Award',
   'Awarded to students with exceptional performance in our mock examinations.',
   'Edwardian Educational Consult',
   50000,
   'Enrolled student with mock exam average above 85%',
   true);

-- ─── Sample Careers ───────────────────────────────────────────────────────────
INSERT INTO "Career" ("id", "title", "description", "requiredSubjects", "salaryRange", "isActive") VALUES
  (gen_random_uuid()::TEXT, 'Medical Doctor',
   'Diagnose and treat illnesses, injuries, and other health conditions.',
   '["Biology","Chemistry","Physics","Mathematics"]',
   '₦500,000 - ₦2,000,000/month', true),
  (gen_random_uuid()::TEXT, 'Software Engineer',
   'Design, develop, and maintain software applications and systems.',
   '["Mathematics","Physics","Further Mathematics"]',
   '₦300,000 - ₦1,500,000/month', true),
  (gen_random_uuid()::TEXT, 'Lawyer',
   'Advise and represent clients in legal matters and court proceedings.',
   '["English Language","Government","Literature in English"]',
   '₦200,000 - ₦1,000,000/month', true),
  (gen_random_uuid()::TEXT, 'Civil Engineer',
   'Design and oversee construction of infrastructure projects.',
   '["Mathematics","Physics","Further Mathematics","Chemistry"]',
   '₦250,000 - ₦800,000/month', true),
  (gen_random_uuid()::TEXT, 'Accountant',
   'Prepare and examine financial records and ensure accuracy.',
   '["Mathematics","Economics","Accounting","Commerce"]',
   '₦150,000 - ₦600,000/month', true);

-- ─── Sample News ──────────────────────────────────────────────────────────────
INSERT INTO "NewsArticle" ("id", "title", "slug", "category", "content", "excerpt", "isPublished", "isPinned", "targetType") VALUES
  (gen_random_uuid()::TEXT,
   '2026 JAMB UTME Registration Now Open',
   '2026-jamb-utme-registration-open',
   'JAMB',
   'The Joint Admissions and Matriculation Board (JAMB) has officially opened registration for the 2026 Unified Tertiary Matriculation Examination (UTME). Students are advised to register early to avoid last-minute rush. Registration closes on March 15, 2026.',
   'JAMB has officially opened registration for the 2026 UTME. Register now before the deadline.',
   true, true, 'ALL'),
  (gen_random_uuid()::TEXT,
   'Edwardian Students Excel in 2025 WAEC Results',
   'edwardian-students-excel-2025-waec',
   'RESULTS',
   'We are proud to announce that over 95% of our students who sat for the 2025 WAEC examinations obtained credit passes in 5 or more subjects. This outstanding performance reflects the dedication of our tutors and students alike.',
   '95% of Edwardian students scored credit passes in 5+ subjects in the 2025 WAEC.',
   true, false, 'ALL'),
  (gen_random_uuid()::TEXT,
   'New Mock Exam Schedule Released',
   'new-mock-exam-schedule-released',
   'ANNOUNCEMENT',
   'The new mock examination schedule for the second quarter of 2026 has been released. Students are advised to log in to their portals to view their assigned examination dates and prepare accordingly.',
   'Check your portal for the new mock exam schedule for Q2 2026.',
   true, false, 'STUDENT');

-- ─── Sample Notices ───────────────────────────────────────────────────────────
INSERT INTO "Notice" ("id", "title", "content", "type", "targetType", "isPinned", "isActive") VALUES
  (gen_random_uuid()::TEXT,
   'Portal Maintenance Notice',
   'The student portal will undergo scheduled maintenance on Saturday, September 5, 2026 from 12:00 AM to 4:00 AM. Please save all your work before this period.',
   'SYSTEM', 'ALL', true, true),
  (gen_random_uuid()::TEXT,
   'Mock Exam Reminder',
   'Reminder: All SS3 students are expected to participate in the upcoming mock JAMB exam scheduled for next week. Please ensure you have reviewed the timetable.',
   'ACADEMIC', 'STUDENT', false, true),
  (gen_random_uuid()::TEXT,
   'Fee Payment Deadline',
   'The deadline for second term tuition payment is September 30, 2026. Students who have not paid will have limited access to study materials.',
   'PAYMENT', 'STUDENT', true, true);

-- =============================================================================
-- TEST USERS
-- Passwords are bcrypt hashes of the values shown in the comments below.
-- All test accounts use password: Test@1234
-- Hash generated with bcrypt rounds=12
-- =============================================================================

-- ─── ADMIN user ───────────────────────────────────────────────────────────────
-- Email:    admin@edwardianeducationalconsult.com.ng
-- Password: Admin@1234
INSERT INTO "User" (
  "id", "portalId", "parentAccessCode", "fullName", "email", "phone",
  "passwordHash", "role", "isActive", "emailVerified"
) VALUES (
  'admin-test-user-0001',
  'EIEC/2026/0001',
  'PAR-ADMIN1',
  'Super Administrator',
  'admin@edwardianeducationalconsult.com.ng',
  '08000000001',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewWe5GDrXm3R7xDe',
  'ADMIN',
  true,
  true
);

-- ─── TEACHER user ─────────────────────────────────────────────────────────────
-- Email:    teacher@edwardianeducationalconsult.com.ng
-- Password: Test@1234
INSERT INTO "User" (
  "id", "portalId", "parentAccessCode", "fullName", "email", "phone",
  "passwordHash", "role", "isActive", "emailVerified",
  "currentSchool", "programme"
) VALUES (
  'teacher-test-user-001',
  'EIEC/2026/0002',
  'PAR-TEACH1',
  'Mrs. Adaeze Okonkwo',
  'teacher@edwardianeducationalconsult.com.ng',
  '08000000002',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrCr/a2.',
  'TEACHER',
  true,
  true,
  'Edwardian Educational Consult',
  'JAMB'
);

-- ─── STUDENT user 1 ───────────────────────────────────────────────────────────
-- Email:    student1@gmail.com
-- Password: Test@1234
INSERT INTO "User" (
  "id", "portalId", "parentAccessCode", "fullName", "email", "studentEmail",
  "phone", "passwordHash", "role", "isActive", "emailVerified",
  "gender", "state", "classLevel", "programme",
  "examTypes", "jambSubjects", "targetScore",
  "targetInstitution", "targetCourse", "admissionYear",
  "preparationProgress", "mockAverage"
) VALUES (
  'student-test-user-001',
  'EIEC/2026/1001',
  'PAR-STU001',
  'Chukwuemeka Obi',
  'student1@gmail.com',
  'chukwuemeka.obi.eiec2026@edwardianeducationalconsult.com.ng',
  '08011111111',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrCr/a2.',
  'STUDENT',
  true,
  true,
  'male',
  'Anambra',
  'SS3',
  'JAMB',
  '["JAMB","WAEC"]',
  '["Mathematics","Physics","Chemistry","English Language"]',
  '280',
  'University of Lagos',
  'Computer Science',
  '2026',
  65,
  72
);

-- ─── STUDENT user 2 ───────────────────────────────────────────────────────────
-- Email:    student2@gmail.com
-- Password: Test@1234
INSERT INTO "User" (
  "id", "portalId", "parentAccessCode", "fullName", "email", "studentEmail",
  "phone", "passwordHash", "role", "isActive", "emailVerified",
  "gender", "state", "classLevel", "programme",
  "examTypes", "jambSubjects", "targetScore",
  "targetInstitution", "targetCourse", "admissionYear",
  "preparationProgress", "mockAverage"
) VALUES (
  'student-test-user-002',
  'EIEC/2026/1002',
  'PAR-STU002',
  'Fatimah Abdullahi',
  'student2@gmail.com',
  'fatimah.abdullahi.eiec2026@edwardianeducationalconsult.com.ng',
  '08022222222',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrCr/a2.',
  'STUDENT',
  true,
  true,
  'female',
  'Kano',
  'SS3',
  'JAMB',
  '["JAMB"]',
  '["Biology","Chemistry","Physics","English Language"]',
  '300',
  'Ahmadu Bello University',
  'Medicine and Surgery',
  '2026',
  80,
  85
);

-- ─── Wallets for students ─────────────────────────────────────────────────────
INSERT INTO "Wallet" ("id", "userId", "balance", "currency") VALUES
  (gen_random_uuid()::TEXT, 'student-test-user-001', 5000, 'NGN'),
  (gen_random_uuid()::TEXT, 'student-test-user-002', 10000, 'NGN');

-- ─── Enrollments for students ─────────────────────────────────────────────────
INSERT INTO "Enrollment" ("id", "userId", "courseName", "courseCode", "status") VALUES
  (gen_random_uuid()::TEXT, 'student-test-user-001', 'JAMB UTME Preparation', 'JAMB-2026', 'ACTIVE'),
  (gen_random_uuid()::TEXT, 'student-test-user-001', 'WAEC/NECO Preparation', 'WAEC-2026', 'ACTIVE'),
  (gen_random_uuid()::TEXT, 'student-test-user-002', 'JAMB UTME Preparation', 'JAMB-2026', 'ACTIVE');

-- ─── Notifications for students ───────────────────────────────────────────────
INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "priority") VALUES
  (gen_random_uuid()::TEXT, 'student-test-user-001',
   'Welcome to Edwardian!',
   'Your account has been set up. Start your CBT practice today to get ahead.',
   'WELCOME', 'HIGH'),
  (gen_random_uuid()::TEXT, 'student-test-user-001',
   'Mock Exam Available',
   'A new JAMB mock exam has been published. Take it now to test your preparation level.',
   'EXAM', 'NORMAL'),
  (gen_random_uuid()::TEXT, 'student-test-user-002',
   'Welcome to Edwardian!',
   'Your account has been set up. Start your CBT practice today to get ahead.',
   'WELCOME', 'HIGH'),
  (gen_random_uuid()::TEXT, 'student-test-user-002',
   'Scholarship Available',
   'A new scholarship opportunity matching your profile has been posted. Check it out!',
   'SCHOLARSHIP', 'NORMAL');

-- =============================================================================
-- DONE
-- =============================================================================
