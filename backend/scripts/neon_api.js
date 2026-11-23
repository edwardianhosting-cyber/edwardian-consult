// Try using Neon's HTTP API to apply schema changes
const https = require('https');

const NEION_API_KEY = 'npg_S1nRIhXK6qyb';
const PROJECT_ID = 'ep-wandering-forest-ay59vucq-pooler';

const sql = `
CREATE TABLE IF NOT EXISTS "MockExamAttempt" (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS "MockExamAttempt_userId_examId_key" ON "MockExamAttempt"("userId", "examId");
CREATE INDEX IF NOT EXISTS "MockExamAttempt_userId_idx" ON "MockExamAttempt"("userId");
CREATE INDEX IF NOT EXISTS "MockExamAttempt_examId_idx" ON "MockExamAttempt"("examId");
CREATE INDEX IF NOT EXISTS "MockExamAttempt_isCompleted_idx" ON "MockExamAttempt"("isCompleted");
CREATE INDEX IF NOT EXISTS "MockExamAttempt_retakeApproved_idx" ON "MockExamAttempt"("retakeApproved");
`;

const data = JSON.stringify({
  database: 'neondb',
  query: sql,
});

const options = {
  hostname: 'api.neon.tech',
  port: 443,
  path: '/sql',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${NEION_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
  timeout: 30000,
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
});

req.write(data);
req.end();
