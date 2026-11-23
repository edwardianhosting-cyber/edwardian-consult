const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config({ path: 'C:\\edpg\\dump.env' });

const neon = new PrismaClient({ datasources: { db: { url: process.env.NEON_URL } } });
const local = new PrismaClient({ datasources: { db: { url: process.env.LOCAL_URL } } });

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

    // Step 1: Create schema from Prisma DDL via db push is heavy; instead create tables
    // by reading schema from Neon and replaying CREATE TABLE IF NOT EXISTS
    log('Creating tables in local DB...');
    const createSQL = await neon.$queryRawUnsafe(
      `SELECT 'CREATE TABLE IF NOT EXISTS "' || table_name || '" (' ||
       string_agg('"' || column_name || '" ' ||
         CASE WHEN data_type = 'json' THEN 'json'
              WHEN data_type = 'uuid' THEN 'uuid'
              WHEN data_type = 'integer' THEN 'integer'
              WHEN data_type = 'bigint' THEN 'bigint'
              WHEN data_type = 'boolean' THEN 'boolean'
              WHEN data_type = 'timestamp without time zone' THEN 'timestamp'
              WHEN data_type = 'timestamp with time zone' THEN 'timestamptz'
              WHEN data_type = 'text' THEN 'text'
              WHEN data_type = 'character varying' THEN 'varchar'
              WHEN data_type = 'double precision' THEN 'double precision'
              WHEN data_type = 'numeric' THEN 'numeric'
              ELSE 'text' END ||
         CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
         ', ') || ');' as ddl
       FROM information_schema.columns
       WHERE table_schema = 'public'
       GROUP BY table_name`
    );
    for (const r of createSQL) {
      try { await local.$executeRawUnsafe(r.ddl); }
      catch (e) { log('CREATE ERR ' + e.message); }
    }
    log('Tables created');

    // Step 2: Add foreign keys and indexes from Neon
    const fkSQL = await neon.$queryRawUnsafe(
      `SELECT conname, conrelid::regclass::text AS tbl, pg_get_constraintdef(oid) AS def
       FROM pg_constraint
       WHERE contype IN ('f','p','u') AND connamespace = 'public'::regnamespace`
    );
    for (const c of fkSQL) {
      try { await local.$executeRawUnsafe(`ALTER TABLE "${c.tbl}" ADD CONSTRAINT "${c.conname}" ${c.def}`); }
      catch (e) { /* ignore dup */ }
    }

    // Step 3: Copy data
    for (const table of TABLES) {
      try {
        const rows = await neon.$queryRawUnsafe(`SELECT * FROM "${table}"`);
        if (rows.length === 0) { log(`${table}: 0 rows`); continue; }
        const columns = Object.keys(rows[0]);
        const colList = columns.map(c => `"${c}"`).join(', ');
        let inserted = 0;
        const BATCH = 500;
        for (let i = 0; i < rows.length; i += BATCH) {
          const batch = rows.slice(i, i + BATCH);
          const allParams = [];
          const valueStrings = batch.map(row => {
            const vals = columns.map(c => {
              const v = row[c];
              if (v !== null && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v)) {
                allParams.push(JSON.stringify(v));
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
            for (const row of batch) {
              const vals = columns.map(c => {
                const v = row[c];
                if (v !== null && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v)) {
                  return JSON.stringify(v);
                }
                return v;
              });
              const params = [];
              const ph = vals.map(v => { params.push(v); return `$${params.length}`; });
              try {
                await local.$executeRawUnsafe(`INSERT INTO "${table}" (${colList}) VALUES (${ph.join(', ')})`, ...params);
              } catch (e2) { log(`${table} ROW ERROR: ${e2.message}`); }
            }
          }
        }
        log(`${table}: ${inserted}/${rows.length} rows`);
        totalRows += inserted;
      } catch (e) { log(`${table} ERROR: ${e.message}`); }
    }
  } catch (e) { log('FATAL: ' + e.message); }
  finally {
    await neon.$disconnect();
    await local.$disconnect();
    log(`DONE. Total rows: ${totalRows}`);
  }
})();