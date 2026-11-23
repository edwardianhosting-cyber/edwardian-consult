const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config({ path: 'C:\\edpg\\dump.env' });

// Source: Neon (live)
const neon = new PrismaClient({
  datasources: { db: { url: process.env.NEON_URL } },
});

// Target: local Postgres
const local = new PrismaClient({
  datasources: { db: { url: process.env.LOCAL_URL } },
});

// Tables in FK-safe order (parents before children) — reverse of dependency order
const TABLES = [
  'User', 'Question', 'QuestionGroup', 'Exam', 'ExamQuestion', 'CbtResult',
  'MockExamAttempt', 'ParentFeedback', 'NewsArticle', 'Enrollment',
  'StudySubject', 'StudyTopic', 'StudyResource', 'Payment', 'VerificationCode',
  'EmailLog', 'SmsLog', 'AttendanceLog', 'Notification', 'Settings', 'Program',
  'ContactSection', 'ContactCard', 'AuditLog', 'EmailCampaign', 'CampaignLog',
  'Badge', 'StudentBadge', 'StudyPlan', 'StudyTask', 'Assignment',
  'AssignmentQuestion', 'AssignmentAttempt', 'Document', 'Certificate',
  'Institution', 'InstitutionCourse', 'AdmissionApplication',
  'AdmissionAnnouncement', 'Referral', 'Scholarship', 'Notice', 'WalletItem',
  'Wallet', 'Transcript', 'Career', 'StudySchedule', 'TimetableEntry',
  'JambDeadline', 'JambSubject', 'JambSyllabus', 'OnlineClass',
  'PushSubscription', 'DeviceToken', 'GameSession',
];

function log(msg) { fs.appendFileSync('C:\\edpg\\dump_progress.txt', msg + '\n'); }

(async () => {
  let totalRows = 0;
  try {
    await neon.$connect();
    await local.$connect();
    log('Connected to both databases');

    for (const table of TABLES) {
      try {
        // Read all rows from Neon
        const rows = await neon.$queryRawUnsafe(`SELECT * FROM "${table}"`);
        if (rows.length === 0) {
          log(`${table}: 0 rows`);
          continue;
        }

        // Get column names from first row
        const columns = Object.keys(rows[0]);
        const colList = columns.map(c => `"${c}"`).join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        // Build values and params
        let inserted = 0;
        const BATCH = 500;
        for (let i = 0; i < rows.length; i += BATCH) {
          const batch = rows.slice(i, i + BATCH);
          const allParams = [];
          const valueStrings = batch.map(row => {
            const vals = columns.map(c => {
              const v = row[c];
              // Handle JSON/Json columns — pass as string
              if (v !== null && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v)) {
                allParams.push(JSON.stringify(v));
              } else if (v instanceof Date) {
                allParams.push(v);
              } else {
                allParams.push(v);
              }
              return `$${allParams.length}`;
            });
            return `(${vals.join(', ')})`;
          });

          const sql = `INSERT INTO "${table}" (${colList}) VALUES ${valueStrings.join(', ')}`;
          try {
            await local.$executeRawUnsafe(sql, ...allParams);
            inserted += batch.length;
          } catch (e) {
            log(`${table} BATCH ERROR at ${i}: ${e.message}`);
            // Try row-by-row for this batch
            for (const row of batch) {
              const vals = columns.map(c => {
                const v = row[c];
                if (v !== null && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v)) {
                  return JSON.stringify(v);
                }
                return v;
              });
              const params = [];
              const ph = vals.map(v => {
                params.push(v);
                return `$${params.length}`;
              });
              try {
                await local.$executeRawUnsafe(`INSERT INTO "${table}" (${colList}) VALUES (${ph.join(', ')})`, ...params);
              } catch (e2) {
                log(`${table} ROW ERROR: ${e2.message}`);
              }
            }
          }
        }
        log(`${table}: ${inserted}/${rows.length} rows inserted`);
        totalRows += inserted;
      } catch (e) {
        log(`${table} ERROR: ${e.message}`);
      }
    }
  } catch (e) {
    log('FATAL: ' + e.message);
  } finally {
    await neon.$disconnect();
    await local.$disconnect();
    log(`DONE. Total rows: ${totalRows}`);
  }
})();