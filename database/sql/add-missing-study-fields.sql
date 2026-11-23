CREATE SCHEMA "public";
CREATE SCHEMA "neon_auth";
CREATE TABLE "AdmissionApplication" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"institutionId" text NOT NULL,
	"courseId" text NOT NULL,
	"choiceNumber" integer,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"utmeScore" integer,
	"olevelResults" jsonb,
	"paymentRef" text,
	"submittedAt" timestamp,
	"decisionAt" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Assignment" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"title" text NOT NULL,
	"description" text,
	"subject" text NOT NULL,
	"topic" text,
	"classLevel" text,
	"durationMinutes" integer DEFAULT 30 NOT NULL,
	"totalMarks" integer DEFAULT 100 NOT NULL,
	"passingScore" integer DEFAULT 50 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"deadline" timestamp,
	"createdById" text NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "AssignmentAttempt" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"assignmentId" text NOT NULL,
	"userId" text NOT NULL,
	"score" double precision,
	"totalQuestions" integer NOT NULL,
	"correctAnswers" integer NOT NULL,
	"wrongAnswers" integer NOT NULL,
	"skippedAnswers" integer NOT NULL,
	"userAnswers" jsonb NOT NULL,
	"startedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"submittedAt" timestamp,
	"timeSpentSeconds" integer
);
CREATE TABLE "AssignmentQuestion" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"assignmentId" text NOT NULL,
	"questionId" text,
	"text" text NOT NULL,
	"options" jsonb NOT NULL,
	"correctOption" integer NOT NULL,
	"explanation" text,
	"marks" integer DEFAULT 1 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "AttendanceLog" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"checkIn" timestamp,
	"checkOut" timestamp,
	"status" text NOT NULL,
	"notes" text
);
CREATE TABLE "AuditLog" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text,
	"action" text NOT NULL,
	"entityType" text NOT NULL,
	"entityId" text,
	"oldValue" text,
	"newValue" text,
	"ipAddress" text,
	"userAgent" text,
	"description" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Badge" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"name" text NOT NULL CONSTRAINT "Badge_name_key" UNIQUE,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"category" text NOT NULL,
	"requirement" jsonb NOT NULL,
	"points" integer DEFAULT 10 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "CampaignLog" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"campaignId" text NOT NULL,
	"recipientId" text,
	"recipientEmail" text NOT NULL,
	"status" text NOT NULL,
	"errorMsg" text,
	"sentAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"openedAt" timestamp
);
CREATE TABLE "Career" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"title" text NOT NULL CONSTRAINT "Career_title_key" UNIQUE,
	"description" text NOT NULL,
	"requiredSubjects" jsonb,
	"relatedCourses" jsonb,
	"overview" text,
	"requirements" text,
	"skills" text,
	"workEnvironment" text,
	"salaryRange" text,
	"growthProspect" text,
	"suitability" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "CbtResult" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"examId" text,
	"subject" text NOT NULL,
	"type" text DEFAULT 'PRACTICE' NOT NULL,
	"score" double precision NOT NULL,
	"totalQuestions" integer NOT NULL,
	"correctAnswers" integer NOT NULL,
	"wrongAnswers" integer NOT NULL,
	"skippedAnswers" integer NOT NULL,
	"durationUsed" integer NOT NULL,
	"userAnswers" jsonb NOT NULL,
	"weakTopics" jsonb,
	"completedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Certificate" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"certificateNumber" text NOT NULL CONSTRAINT "Certificate_certificateNumber_key" UNIQUE,
	"programme" text NOT NULL,
	"issueDate" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expiryDate" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"qrCode" text,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "ContactCard" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"title" text NOT NULL,
	"description" text,
	"icon" text,
	"link" text NOT NULL,
	"linkType" text DEFAULT 'url' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"sectionId" text NOT NULL
);
CREATE TABLE "ContactSection" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"title" text NOT NULL,
	"slug" text NOT NULL CONSTRAINT "ContactSection_slug_key" UNIQUE,
	"order" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Document" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"fileUrl" text NOT NULL,
	"fileSize" integer,
	"mimeType" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reviewedBy" text,
	"reviewNote" text,
	"reviewedAt" timestamp,
	"uploadedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "EmailCampaign" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"targetType" text NOT NULL,
	"targetFilter" text,
	"recipientCount" integer DEFAULT 0 NOT NULL,
	"sentCount" integer DEFAULT 0 NOT NULL,
	"deliveredCount" integer DEFAULT 0 NOT NULL,
	"openedCount" integer DEFAULT 0 NOT NULL,
	"failedCount" integer DEFAULT 0 NOT NULL,
	"scheduledAt" timestamp,
	"sentAt" timestamp,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"createdById" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "EmailLog" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"recipient" text NOT NULL,
	"sender" text,
	"subject" text NOT NULL,
	"emailType" text NOT NULL,
	"status" text NOT NULL,
	"errorMsg" text,
	"metadata" jsonb,
	"sentAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Enrollment" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"courseName" text NOT NULL,
	"courseCode" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"startDate" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"endDate" timestamp,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Exam" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"title" text NOT NULL,
	"examType" text NOT NULL,
	"subject" text NOT NULL,
	"duration" integer NOT NULL,
	"totalMarks" integer NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "ExamQuestion" (
	"examId" text,
	"questionId" text,
	"order" integer NOT NULL,
	CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY("examId","questionId")
);
CREATE TABLE "Institution" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"name" text NOT NULL,
	"abbreviation" text,
	"type" text NOT NULL,
	"location" text,
	"state" text,
	"website" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "InstitutionCourse" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"institutionId" text NOT NULL,
	"name" text NOT NULL,
	"utmeCutoff" integer,
	"olevelRequirements" text,
	"jambSubjects" jsonb,
	"postUtmeRequired" boolean DEFAULT false NOT NULL,
	"postUtmeCutoff" double precision,
	"applicationFee" double precision,
	"deadline" timestamp,
	"isActive" boolean DEFAULT true NOT NULL
);
CREATE TABLE "Message" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"senderId" text,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "NewsArticle" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"title" text NOT NULL,
	"slug" text NOT NULL CONSTRAINT "NewsArticle_slug_key" UNIQUE,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"coverImage" text,
	"isPublished" boolean DEFAULT true NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"authorId" text,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"targetType" text DEFAULT 'ALL' NOT NULL,
	"targetFilter" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Notice" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" text NOT NULL,
	"targetType" text NOT NULL,
	"targetFilter" text,
	"isPinned" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"startDate" timestamp,
	"endDate" timestamp,
	"createdById" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Notification" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp,
	"link" text,
	"entityType" text,
	"entityId" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "ParentFeedback" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"authorName" text NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Payment" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"reference" text NOT NULL CONSTRAINT "Payment_reference_key" UNIQUE,
	"amount" double precision NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"paymentMethod" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"paidAt" timestamp,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Program" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"title" text NOT NULL,
	"slug" text NOT NULL CONSTRAINT "Program_slug_key" UNIQUE,
	"description" text NOT NULL,
	"features" text,
	"icon" text,
	"imageUrl" text,
	"price" double precision,
	"duration" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Question" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"subject" text NOT NULL,
	"examType" text NOT NULL,
	"institution" text,
	"year" integer NOT NULL,
	"topic" text,
	"difficulty" text DEFAULT 'MEDIUM' NOT NULL,
	"text" text NOT NULL,
	"imageUrl" text,
	"options" jsonb NOT NULL,
	"correctOption" integer NOT NULL,
	"explanation" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Referral" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"referrerId" text NOT NULL,
	"referredEmail" text NOT NULL,
	"referralCode" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"registeredAt" timestamp,
	"rewardGiven" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Scholarship" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"provider" text NOT NULL,
	"amount" double precision,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"eligibility" text NOT NULL,
	"deadline" timestamp,
	"applicationUrl" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Settings" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"key" text NOT NULL CONSTRAINT "Settings_key_key" UNIQUE,
	"value" text NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "SmsLog" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"recipient" text NOT NULL,
	"message" text NOT NULL,
	"smsType" text NOT NULL,
	"status" text NOT NULL,
	"errorMsg" text,
	"sentAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "StudentBadge" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"badgeId" text NOT NULL,
	"earnedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "StudentBadge_userId_badgeId_key" UNIQUE("userId","badgeId")
);
CREATE TABLE "StudyPlan" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "StudyResource" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"topicId" text NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'TEXT' NOT NULL,
	"content" text,
	"fileUrl" text,
	"fileSize" integer,
	"mimeType" text,
	"duration" integer,
	"order" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"textContent" text,
	"imageUrl" text
);
CREATE TABLE "StudySchedule" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"subject" text NOT NULL,
	"topic" text,
	"scheduledAt" timestamp NOT NULL,
	"durationMinutes" integer DEFAULT 30 NOT NULL,
	"reminderEnabled" boolean DEFAULT true NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"dayOfWeek" text DEFAULT 'Monday' NOT NULL,
	"time" text DEFAULT '08:00' NOT NULL
);
CREATE TABLE "StudySubject" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"name" text NOT NULL,
	"description" text,
	"code" text CONSTRAINT "StudySubject_code_key" UNIQUE,
	"gradeLevel" text,
	"icon" text,
	"imageUrl" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "StudyTask" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"planId" text NOT NULL,
	"subject" text NOT NULL,
	"topic" text NOT NULL,
	"dayNumber" integer NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "StudyTopic" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"subjectId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "TimetableEntry" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"day" text NOT NULL,
	"time" text NOT NULL,
	"subject" text NOT NULL,
	"instructor" text,
	"venue" text,
	"type" text DEFAULT 'CLASS' NOT NULL,
	"examType" text,
	"classLevel" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "Transcript" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"academicSession" text NOT NULL,
	"data" text NOT NULL,
	"generatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"pdfUrl" text
);
CREATE TABLE "User" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"portalId" text NOT NULL CONSTRAINT "User_portalId_key" UNIQUE,
	"parentAccessCode" text DEFAULT (gen_random_uuid()) NOT NULL CONSTRAINT "User_parentAccessCode_key" UNIQUE,
	"parentPhone" text,
	"fullName" text NOT NULL,
	"email" text NOT NULL CONSTRAINT "User_email_key" UNIQUE,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"phone" text NOT NULL,
	"passwordHash" text NOT NULL,
	"role" text DEFAULT 'STUDENT' NOT NULL,
	"avatar" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"lastLogin" timestamp,
	"studentEmail" text CONSTRAINT "User_studentEmail_key" UNIQUE,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"dateOfBirth" timestamp,
	"gender" text,
	"address" text,
	"state" text,
	"lga" text,
	"passportUrl" text,
	"currentSchool" text,
	"classLevel" text,
	"programme" text,
	"examTypes" jsonb,
	"jambSubjects" jsonb,
	"targetScore" text,
	"olevelResults" jsonb,
	"targetInstitution" text,
	"targetCourse" text,
	"secondChoiceInstitution" text,
	"secondChoiceCourse" text,
	"admissionYear" text,
	"preparationProgress" integer DEFAULT 0 NOT NULL,
	"mockAverage" integer DEFAULT 0 NOT NULL,
	"notificationPreferences" jsonb DEFAULT '{}',
	"lockedUntil" timestamp,
	"twoFactorEnabled" boolean DEFAULT false NOT NULL,
	"lastLoginIp" text,
	"lastLoginAt" timestamp
);
CREATE TABLE "VerificationCode" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text,
	"code" text NOT NULL CONSTRAINT "VerificationCode_code_key" UNIQUE,
	"type" text NOT NULL,
	"purpose" text NOT NULL,
	"studentName" text,
	"program" text,
	"grade" text,
	"issuedDate" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expiryDate" timestamp,
	"expiresAt" timestamp,
	"isValid" boolean DEFAULT true NOT NULL,
	"isUsed" boolean DEFAULT false NOT NULL,
	"usedAt" timestamp,
	"revokedAt" timestamp,
	"revokedBy" text,
	"metadata" text
);
CREATE TABLE "Wallet" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL CONSTRAINT "Wallet_userId_key" UNIQUE,
	"balance" double precision DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "WalletItem" (
	"id" text PRIMARY KEY DEFAULT (gen_random_uuid()),
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"fileUrl" text,
	"reference" text,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "neon_auth"."account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" uuid NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
CREATE TABLE "neon_auth"."invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"inviterId" uuid NOT NULL
);
CREATE TABLE "neon_auth"."jwks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"publicKey" text NOT NULL,
	"privateKey" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"expiresAt" timestamp with time zone
);
CREATE TABLE "neon_auth"."member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
CREATE TABLE "neon_auth"."organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL CONSTRAINT "organization_slug_key" UNIQUE,
	"logo" text,
	"createdAt" timestamp with time zone NOT NULL,
	"metadata" text
);
CREATE TABLE "neon_auth"."project_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"endpoint_id" text NOT NULL CONSTRAINT "project_config_endpoint_id_key" UNIQUE,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"trusted_origins" jsonb NOT NULL,
	"social_providers" jsonb NOT NULL,
	"email_provider" jsonb,
	"email_and_password" jsonb,
	"allow_localhost" boolean NOT NULL,
	"plugin_configs" jsonb,
	"webhook_config" jsonb
);
CREATE TABLE "neon_auth"."session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL CONSTRAINT "session_token_key" UNIQUE,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" uuid NOT NULL,
	"impersonatedBy" text,
	"activeOrganizationId" text
);
CREATE TABLE "neon_auth"."user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"email" text NOT NULL CONSTRAINT "user_email_key" UNIQUE,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"role" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" timestamp with time zone
);
CREATE TABLE "neon_auth"."verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX "AdmissionApplication_pkey" ON "AdmissionApplication" ("id");
CREATE INDEX "AdmissionApplication_status_idx" ON "AdmissionApplication" ("status");
CREATE INDEX "AdmissionApplication_userId_idx" ON "AdmissionApplication" ("userId");
CREATE INDEX "Assignment_createdById_idx" ON "Assignment" ("createdById");
CREATE INDEX "Assignment_isActive_idx" ON "Assignment" ("isActive");
CREATE INDEX "Assignment_isPublished_idx" ON "Assignment" ("isPublished");
CREATE UNIQUE INDEX "Assignment_pkey" ON "Assignment" ("id");
CREATE INDEX "Assignment_subject_idx" ON "Assignment" ("subject");
CREATE INDEX "AssignmentAttempt_assignmentId_idx" ON "AssignmentAttempt" ("assignmentId");
CREATE UNIQUE INDEX "AssignmentAttempt_pkey" ON "AssignmentAttempt" ("id");
CREATE INDEX "AssignmentAttempt_submittedAt_idx" ON "AssignmentAttempt" ("submittedAt");
CREATE INDEX "AssignmentAttempt_userId_idx" ON "AssignmentAttempt" ("userId");
CREATE INDEX "AssignmentQuestion_assignmentId_idx" ON "AssignmentQuestion" ("assignmentId");
CREATE UNIQUE INDEX "AssignmentQuestion_pkey" ON "AssignmentQuestion" ("id");
CREATE INDEX "AttendanceLog_date_idx" ON "AttendanceLog" ("date");
CREATE UNIQUE INDEX "AttendanceLog_pkey" ON "AttendanceLog" ("id");
CREATE INDEX "AttendanceLog_userId_idx" ON "AttendanceLog" ("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog" ("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog" ("createdAt");
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog" ("entityType");
CREATE UNIQUE INDEX "AuditLog_pkey" ON "AuditLog" ("id");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog" ("userId");
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge" ("name");
CREATE UNIQUE INDEX "Badge_pkey" ON "Badge" ("id");
CREATE INDEX "CampaignLog_campaignId_idx" ON "CampaignLog" ("campaignId");
CREATE UNIQUE INDEX "CampaignLog_pkey" ON "CampaignLog" ("id");
CREATE INDEX "CampaignLog_recipientId_idx" ON "CampaignLog" ("recipientId");
CREATE INDEX "Career_isActive_idx" ON "Career" ("isActive");
CREATE UNIQUE INDEX "Career_pkey" ON "Career" ("id");
CREATE UNIQUE INDEX "Career_title_key" ON "Career" ("title");
CREATE INDEX "CbtResult_examId_idx" ON "CbtResult" ("examId");
CREATE UNIQUE INDEX "CbtResult_pkey" ON "CbtResult" ("id");
CREATE INDEX "CbtResult_type_idx" ON "CbtResult" ("type");
CREATE INDEX "CbtResult_userId_idx" ON "CbtResult" ("userId");
CREATE INDEX "Certificate_certificateNumber_idx" ON "Certificate" ("certificateNumber");
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate" ("certificateNumber");
CREATE UNIQUE INDEX "Certificate_pkey" ON "Certificate" ("id");
CREATE INDEX "Certificate_userId_idx" ON "Certificate" ("userId");
CREATE INDEX "ContactCard_isActive_idx" ON "ContactCard" ("isActive");
CREATE UNIQUE INDEX "ContactCard_pkey" ON "ContactCard" ("id");
CREATE INDEX "ContactCard_sectionId_idx" ON "ContactCard" ("sectionId");
CREATE INDEX "ContactSection_isActive_idx" ON "ContactSection" ("isActive");
CREATE UNIQUE INDEX "ContactSection_pkey" ON "ContactSection" ("id");
CREATE INDEX "ContactSection_slug_idx" ON "ContactSection" ("slug");
CREATE UNIQUE INDEX "ContactSection_slug_key" ON "ContactSection" ("slug");
CREATE UNIQUE INDEX "Document_pkey" ON "Document" ("id");
CREATE INDEX "Document_status_idx" ON "Document" ("status");
CREATE INDEX "Document_type_idx" ON "Document" ("type");
CREATE INDEX "Document_userId_idx" ON "Document" ("userId");
CREATE UNIQUE INDEX "EmailCampaign_pkey" ON "EmailCampaign" ("id");
CREATE INDEX "EmailCampaign_scheduledAt_idx" ON "EmailCampaign" ("scheduledAt");
CREATE INDEX "EmailCampaign_status_idx" ON "EmailCampaign" ("status");
CREATE INDEX "EmailLog_emailType_idx" ON "EmailLog" ("emailType");
CREATE UNIQUE INDEX "EmailLog_pkey" ON "EmailLog" ("id");
CREATE INDEX "EmailLog_recipient_idx" ON "EmailLog" ("recipient");
CREATE INDEX "EmailLog_status_idx" ON "EmailLog" ("status");
CREATE UNIQUE INDEX "Enrollment_pkey" ON "Enrollment" ("id");
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment" ("userId");
CREATE INDEX "Exam_examType_idx" ON "Exam" ("examType");
CREATE INDEX "Exam_isPublished_idx" ON "Exam" ("isPublished");
CREATE UNIQUE INDEX "Exam_pkey" ON "Exam" ("id");
CREATE INDEX "Exam_subject_idx" ON "Exam" ("subject");
CREATE UNIQUE INDEX "ExamQuestion_pkey" ON "ExamQuestion" ("examId","questionId");
CREATE INDEX "Institution_name_idx" ON "Institution" ("name");
CREATE UNIQUE INDEX "Institution_pkey" ON "Institution" ("id");
CREATE INDEX "InstitutionCourse_institutionId_idx" ON "InstitutionCourse" ("institutionId");
CREATE UNIQUE INDEX "InstitutionCourse_pkey" ON "InstitutionCourse" ("id");
CREATE INDEX "Message_isRead_idx" ON "Message" ("isRead");
CREATE UNIQUE INDEX "Message_pkey" ON "Message" ("id");
CREATE INDEX "Message_recipient_idx" ON "Message" ("recipient");
CREATE INDEX "NewsArticle_category_idx" ON "NewsArticle" ("category");
CREATE INDEX "NewsArticle_isPublished_idx" ON "NewsArticle" ("isPublished");
CREATE UNIQUE INDEX "NewsArticle_pkey" ON "NewsArticle" ("id");
CREATE INDEX "NewsArticle_slug_idx" ON "NewsArticle" ("slug");
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle" ("slug");
CREATE INDEX "NewsArticle_targetType_idx" ON "NewsArticle" ("targetType");
CREATE INDEX "Notice_isActive_idx" ON "Notice" ("isActive");
CREATE INDEX "Notice_isPinned_idx" ON "Notice" ("isPinned");
CREATE UNIQUE INDEX "Notice_pkey" ON "Notice" ("id");
CREATE INDEX "Notice_type_idx" ON "Notice" ("type");
CREATE INDEX "Notification_isRead_idx" ON "Notification" ("isRead");
CREATE UNIQUE INDEX "Notification_pkey" ON "Notification" ("id");
CREATE INDEX "Notification_priority_idx" ON "Notification" ("priority");
CREATE INDEX "Notification_type_idx" ON "Notification" ("type");
CREATE INDEX "Notification_userId_idx" ON "Notification" ("userId");
CREATE UNIQUE INDEX "ParentFeedback_pkey" ON "ParentFeedback" ("id");
CREATE INDEX "ParentFeedback_userId_idx" ON "ParentFeedback" ("userId");
CREATE UNIQUE INDEX "Payment_pkey" ON "Payment" ("id");
CREATE INDEX "Payment_reference_idx" ON "Payment" ("reference");
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment" ("reference");
CREATE INDEX "Payment_status_idx" ON "Payment" ("status");
CREATE INDEX "Payment_userId_idx" ON "Payment" ("userId");
CREATE INDEX "Program_isActive_idx" ON "Program" ("isActive");
CREATE UNIQUE INDEX "Program_pkey" ON "Program" ("id");
CREATE INDEX "Program_slug_idx" ON "Program" ("slug");
CREATE UNIQUE INDEX "Program_slug_key" ON "Program" ("slug");
CREATE INDEX "Question_examType_idx" ON "Question" ("examType");
CREATE UNIQUE INDEX "Question_pkey" ON "Question" ("id");
CREATE INDEX "Question_subject_idx" ON "Question" ("subject");
CREATE INDEX "Question_topic_idx" ON "Question" ("topic");
CREATE INDEX "Question_year_idx" ON "Question" ("year");
CREATE UNIQUE INDEX "Referral_pkey" ON "Referral" ("id");
CREATE INDEX "Referral_referralCode_idx" ON "Referral" ("referralCode");
CREATE INDEX "Referral_referrerId_idx" ON "Referral" ("referrerId");
CREATE INDEX "Scholarship_isActive_idx" ON "Scholarship" ("isActive");
CREATE UNIQUE INDEX "Scholarship_pkey" ON "Scholarship" ("id");
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings" ("key");
CREATE UNIQUE INDEX "Settings_pkey" ON "Settings" ("id");
CREATE UNIQUE INDEX "SmsLog_pkey" ON "SmsLog" ("id");
CREATE INDEX "SmsLog_recipient_idx" ON "SmsLog" ("recipient");
CREATE INDEX "SmsLog_smsType_idx" ON "SmsLog" ("smsType");
CREATE UNIQUE INDEX "StudentBadge_pkey" ON "StudentBadge" ("id");
CREATE UNIQUE INDEX "StudentBadge_userId_badgeId_key" ON "StudentBadge" ("userId","badgeId");
CREATE INDEX "StudentBadge_userId_idx" ON "StudentBadge" ("userId");
CREATE UNIQUE INDEX "StudyPlan_pkey" ON "StudyPlan" ("id");
CREATE INDEX "StudyPlan_userId_idx" ON "StudyPlan" ("userId");
CREATE INDEX "StudyResource_isActive_idx" ON "StudyResource" ("isActive");
CREATE UNIQUE INDEX "StudyResource_pkey" ON "StudyResource" ("id");
CREATE INDEX "StudyResource_topicId_idx" ON "StudyResource" ("topicId");
CREATE UNIQUE INDEX "StudySchedule_pkey" ON "StudySchedule" ("id");
CREATE INDEX "StudySchedule_scheduledAt_idx" ON "StudySchedule" ("scheduledAt");
CREATE INDEX "StudySchedule_userId_idx" ON "StudySchedule" ("userId");
CREATE UNIQUE INDEX "StudySubject_code_key" ON "StudySubject" ("code");
CREATE INDEX "StudySubject_isActive_idx" ON "StudySubject" ("isActive");
CREATE INDEX "StudySubject_name_idx" ON "StudySubject" ("name");
CREATE UNIQUE INDEX "StudySubject_pkey" ON "StudySubject" ("id");
CREATE UNIQUE INDEX "StudyTask_pkey" ON "StudyTask" ("id");
CREATE INDEX "StudyTask_planId_idx" ON "StudyTask" ("planId");
CREATE INDEX "StudyTopic_isActive_idx" ON "StudyTopic" ("isActive");
CREATE UNIQUE INDEX "StudyTopic_pkey" ON "StudyTopic" ("id");
CREATE INDEX "StudyTopic_subjectId_idx" ON "StudyTopic" ("subjectId");
CREATE INDEX "TimetableEntry_day_idx" ON "TimetableEntry" ("day");
CREATE INDEX "TimetableEntry_examType_idx" ON "TimetableEntry" ("examType");
CREATE UNIQUE INDEX "TimetableEntry_pkey" ON "TimetableEntry" ("id");
CREATE UNIQUE INDEX "Transcript_pkey" ON "Transcript" ("id");
CREATE INDEX "Transcript_userId_idx" ON "Transcript" ("userId");
CREATE INDEX "User_email_idx" ON "User" ("email");
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");
CREATE INDEX "User_parentAccessCode_idx" ON "User" ("parentAccessCode");
CREATE UNIQUE INDEX "User_parentAccessCode_key" ON "User" ("parentAccessCode");
CREATE UNIQUE INDEX "User_pkey" ON "User" ("id");
CREATE INDEX "User_portalId_idx" ON "User" ("portalId");
CREATE UNIQUE INDEX "User_portalId_key" ON "User" ("portalId");
CREATE INDEX "User_programme_idx" ON "User" ("programme");
CREATE UNIQUE INDEX "User_studentEmail_key" ON "User" ("studentEmail");
CREATE INDEX "VerificationCode_code_idx" ON "VerificationCode" ("code");
CREATE UNIQUE INDEX "VerificationCode_code_key" ON "VerificationCode" ("code");
CREATE INDEX "VerificationCode_isValid_idx" ON "VerificationCode" ("isValid");
CREATE UNIQUE INDEX "VerificationCode_pkey" ON "VerificationCode" ("id");
CREATE INDEX "VerificationCode_type_idx" ON "VerificationCode" ("type");
CREATE INDEX "VerificationCode_userId_idx" ON "VerificationCode" ("userId");
CREATE UNIQUE INDEX "Wallet_pkey" ON "Wallet" ("id");
CREATE INDEX "Wallet_userId_idx" ON "Wallet" ("userId");
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet" ("userId");
CREATE UNIQUE INDEX "WalletItem_pkey" ON "WalletItem" ("id");
CREATE INDEX "WalletItem_type_idx" ON "WalletItem" ("type");
CREATE INDEX "WalletItem_userId_idx" ON "WalletItem" ("userId");
CREATE UNIQUE INDEX "account_pkey" ON "neon_auth"."account" ("id");
CREATE INDEX "account_userId_idx" ON "neon_auth"."account" ("userId");
CREATE INDEX "invitation_email_idx" ON "neon_auth"."invitation" ("email");
CREATE INDEX "invitation_organizationId_idx" ON "neon_auth"."invitation" ("organizationId");
CREATE UNIQUE INDEX "invitation_pkey" ON "neon_auth"."invitation" ("id");
CREATE UNIQUE INDEX "jwks_pkey" ON "neon_auth"."jwks" ("id");
CREATE INDEX "member_organizationId_idx" ON "neon_auth"."member" ("organizationId");
CREATE UNIQUE INDEX "member_pkey" ON "neon_auth"."member" ("id");
CREATE INDEX "member_userId_idx" ON "neon_auth"."member" ("userId");
CREATE UNIQUE INDEX "organization_pkey" ON "neon_auth"."organization" ("id");
CREATE UNIQUE INDEX "organization_slug_key" ON "neon_auth"."organization" ("slug");
CREATE UNIQUE INDEX "organization_slug_uidx" ON "neon_auth"."organization" ("slug");
CREATE UNIQUE INDEX "project_config_endpoint_id_key" ON "neon_auth"."project_config" ("endpoint_id");
CREATE UNIQUE INDEX "project_config_pkey" ON "neon_auth"."project_config" ("id");
CREATE UNIQUE INDEX "session_pkey" ON "neon_auth"."session" ("id");
CREATE UNIQUE INDEX "session_token_key" ON "neon_auth"."session" ("token");
CREATE INDEX "session_userId_idx" ON "neon_auth"."session" ("userId");
CREATE UNIQUE INDEX "user_email_key" ON "neon_auth"."user" ("email");
CREATE UNIQUE INDEX "user_pkey" ON "neon_auth"."user" ("id");
CREATE INDEX "verification_identifier_idx" ON "neon_auth"."verification" ("identifier");
CREATE UNIQUE INDEX "verification_pkey" ON "neon_auth"."verification" ("id");
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE;
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "AssignmentAttempt" ADD CONSTRAINT "AssignmentAttempt_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE;
ALTER TABLE "AssignmentAttempt" ADD CONSTRAINT "AssignmentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "AssignmentQuestion" ADD CONSTRAINT "AssignmentQuestion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE;
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "CampaignLog" ADD CONSTRAINT "CampaignLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE;
ALTER TABLE "CbtResult" ADD CONSTRAINT "CbtResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL;
ALTER TABLE "CbtResult" ADD CONSTRAINT "CbtResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "ContactCard" ADD CONSTRAINT "ContactCard_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ContactSection"("id") ON DELETE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE;
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE;
ALTER TABLE "InstitutionCourse" ADD CONSTRAINT "InstitutionCourse_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "ParentFeedback" ADD CONSTRAINT "ParentFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "StudentBadge" ADD CONSTRAINT "StudentBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE;
ALTER TABLE "StudentBadge" ADD CONSTRAINT "StudentBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "StudyResource" ADD CONSTRAINT "StudyResource_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "StudyTopic"("id") ON DELETE CASCADE;
ALTER TABLE "StudySchedule" ADD CONSTRAINT "StudySchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE;
ALTER TABLE "StudyTopic" ADD CONSTRAINT "StudyTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "StudySubject"("id") ON DELETE CASCADE;
ALTER TABLE "VerificationCode" ADD CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "neon_auth"."organization"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "neon_auth"."organization"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE;
ALTER TABLE "neon_auth"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE;