# AGENTS.md - Project Overview

## Project Structure
- **Frontend**: `frontend/` - Next.js 14 application (port 3000)
- **Backend**: `backend/` - Express/TypeScript API (port 5000 dev, port 10000 production)
- **Database**: PostgreSQL (local Docker: `localhost:5432/edwardian_local`, Live: Neon)

## Server Configuration

### Dev Environment (this sandbox)
- Frontend: `cd frontend && npm run dev` (port 3000)
- Backend: `cd backend && npm run dev` (port 5000, local DB)
- Backend (production build): `cd backend && node dist/index.js` (port 10000, local DB)

### Environment Variables (backend/.env)
```
DATABASE_URL="postgresql://postgres@localhost:5432/edwardian_local"
PORT=5000
NODE_ENV=development
JWT_SECRET="edwardianeducationalconsult"
```

### Live (Render.com) Deployment
- Build: `npm install && npm run prisma:generate && npm run prisma:migrate && npm run build`
- Start: `npx prisma migrate deploy && npm start`
- Env vars (set on Render): `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `TERMII_API_KEY`, Cloudinary vars

## Admin Mock Exam Review - Technical Details

### Problem Fixed
- The admin mock exam review page was calling `api.getCBTResult(attemptId)` which hit `/cbt/results/:id` and used `getCBTResultById(userId, id)`. This function filtered by the admin's `userId`, never matching student mock records — always returning 404.

### Solution
1. Created new endpoint `GET /cbt/admin/mock-results/:resultId` (cbt.routes.ts:430) using `getMockExamResultDetail(resultId)` (cbt.service.ts:1596)
2. The new function queries `CbtResult` by `id` and `type: 'MOCK'` (no userId filter)
3. Handles mock results without `examId` (fetches questions directly from `userAnswers` keys via `prisma.question.findMany`)
4. Returns `passage`, `groupTitle`, `groupInstructions` from `QuestionGroup` table

### Related Files
- `backend/src/services/cbt.service.ts` - `getMockExamResultDetail`
- `backend/src/routes/cbt.routes.ts` - `/cbt/admin/mock-results/:resultId` route
- `frontend/src/lib/api.ts` - `adminGetMockResultDetail` function
- `frontend/src/app/admin/mock-results/[attemptId]/page.tsx` - Admin review page

## Common Commands
From `backend/`:
- `npm run dev` - Start dev server (ts-node-dev, auto-restart)
- `npx tsc` - Compile TypeScript
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate deploy` - Apply migrations

From `frontend/`:
- `npm run dev` - Start Next.js dev server
