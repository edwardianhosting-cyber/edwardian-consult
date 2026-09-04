-- Add missing columns for the latest study materials and study schedule changes.
-- Run this against your production database if it was created before these fields were added.
--
-- Example usage:
--   psql "$DATABASE_URL" -f database/sql/add-missing-study-fields.sql

BEGIN;

-- StudyResource: support PDF image preview and extracted text
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'StudyResource'
      AND column_name  = 'imageUrl'
  ) THEN
    ALTER TABLE "StudyResource" ADD COLUMN "imageUrl" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'StudyResource'
      AND column_name  = 'textContent'
  ) THEN
    ALTER TABLE "StudyResource" ADD COLUMN "textContent" TEXT;
  END IF;
END $$;

-- StudySchedule: weekly recurrence fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'StudySchedule'
      AND column_name  = 'dayOfWeek'
  ) THEN
    ALTER TABLE "StudySchedule" ADD COLUMN "dayOfWeek" TEXT NOT NULL DEFAULT 'Monday';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'StudySchedule'
      AND column_name  = 'time'
  ) THEN
    ALTER TABLE "StudySchedule" ADD COLUMN "time" TEXT NOT NULL DEFAULT '08:00';
  END IF;
END $$;

-- If the table already has rows, make sure the new columns are backfilled with safe defaults
UPDATE "StudySchedule"
SET "dayOfWeek" = COALESCE(NULLIF("dayOfWeek", ''), 'Monday'),
    "time"      = COALESCE(NULLIF("time", ''), '08:00')
WHERE "dayOfWeek" IS NULL
   OR "time" IS NULL
   OR "dayOfWeek" = ''
   OR "time" = '';

COMMIT;
