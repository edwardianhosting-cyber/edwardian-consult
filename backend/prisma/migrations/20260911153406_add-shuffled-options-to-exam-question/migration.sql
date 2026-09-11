-- AlterTable
ALTER TABLE "ExamQuestion" ADD COLUMN "correctOption" INTEGER;
ALTER TABLE "ExamQuestion" ADD COLUMN "options" JSONB;
