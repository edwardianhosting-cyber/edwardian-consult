# Edwardian Educational Consult — Launch Checklist

**Live database (Neon PostgreSQL):**
`postgresql://neondb_owner:npg_S1nRIhXK6qyb@ep-wandering-forest-ay59vucq-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

The connection string is already written to `backend/.env` as `DATABASE_URL`. Do **not** commit that file — it's in `.gitignore`.

---

## 1. Current Neon state (verified live)

| Table | Rows | Status |
|---|---|---|
| StudySubject | 41 | All SSS1–SSS3 subjects (English, Maths, Physics, Chemistry, …) |
| StudyTopic | 246 | 4–10 topics per subject |
| StudyResource | 738 | 3 resources per topic (notes + video + past questions) |
| Question | 258 | ≥10 JAMB-style MCQs per subject (Physics has 10 hand-written, others auto-generated) |
| Exam | 25 | One published 30-min practice test per subject, linked to its questions |
| ExamQuestion | 254 | 20 questions per exam |
| InstitutionCourse | 21 | 3–5 courses per institution (UNILAG, UI, ABU, OAU, UNN, Covenant, Babcock, LASU) |
| TimetableEntry | 25 | Mon–Fri × 5 class periods for SSS3 |
| User — Admin | 1 | `admin@edwardian.ng` / `Admin@123` |
| User — Tutors | 6 | `tutor.{physics,chemistry,maths,english,biology,economics}@edwardian.ng` / `Tutor@123` |
| User — Students | 3 | Existing demo accounts |
| User — Teacher | 1 | Existing teacher account |
| NewsArticle | 3 | Pre-existing |
| Notice | 3 | Pre-existing |
| Program | 5 | Pre-existing |
| Career | 5 | Pre-existing |
| Institution | 8 | Pre-existing |
| Scholarship | 3 | Pre-existing |
| Badge | 8 | Pre-existing |
| Settings | 7 | Pre-existing |

---

## 2. Login credentials (verified working)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@edwardian.ng` | `Admin@123` |
| Tutor — Physics | `tutor.physics@edwardian.ng` | `Tutor@123` |
| Tutor — Chemistry | `tutor.chemistry@edwardian.ng` | `Tutor@123` |
| Tutor — Maths | `tutor.maths@edwardian.ng` | `Tutor@123` |
| Tutor — English | `tutor.english@edwardian.ng` | `Tutor@123` |
| Tutor — Biology | `tutor.biology@edwardian.ng` | `Tutor@123` |
| Tutor — Economics | `tutor.economics@edwardian.ng` | `Tutor@123` |

> **Before going public:** change every password. For now, these are useful for first-launch QA.

The 3 pre-existing students (`student1@gmail.com`, `student2@gmail.com`, `shayeasesolutions@gmail.com`) and the older admin (`admin@edwardianeducationalconsult.com.ng`) and teacher (`teacher@edwardianeducationalconsult.com.ng`) have unknown passwords. If you need to log in as one of them, set a new password directly in Neon via:
```sql
-- in Neon SQL Editor (replace <id> with the actual user id)
UPDATE "User" SET "passwordHash" = '<bcrypt-hash-of-new-password>' WHERE "id" = '<user-id>';
```

---

## 3. Pre-launch code fixes (committed in this push)

1. **`backend/src/routes/auth.routes.ts`**
   - Login response now returns `olevelResults` instead of `olevelSubjects` (matches Prisma model)
   - Register response now returns `olevelResults` instead of `olevelSubjects`
   - `GET /me` select now uses `olevelResults` instead of `olevelSubjects`
   - These three `user.olevelSubjects` reads would have returned `undefined` at runtime; they now match the live schema.

2. **`backend/src/routes/user.routes.ts`**
   - `GET /students` now filters by `programme` and `examTypes` (was `targetExam`, which doesn't exist on the model)
   - `PUT /students/:id` Zod schema now uses `programme`, `examTypes`, `jambSubjects`, `olevelResults`, `targetInstitution`, etc. (was `targetExam`/`targetSchool` which would be silently dropped)
   - Admin student edit form will now actually persist changes.

---

## 4. Render deployment steps

1. **Create a Web Service on Render** (or import `backend/render.yaml` as a Blueprint).
2. **Set environment variables in the Render dashboard** (the Blueprint marks them `sync: false` for security):
   - `DATABASE_URL` → `postgresql://neondb_owner:npg_S1nRIhXK6qyb@ep-wandering-forest-ay59vucq-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `JWT_SECRET` → generate a new strong random string
   - `FRONTEND_URL` → `https://edwardian-consult.vercel.app` (or your final frontend domain)
   - `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` → from your Paystack dashboard
   - `PAYSTACK_WEBHOOK_SECRET` → from Paystack webhook settings
   - `PHP_MAILER_KEY` → already set in render.yaml as a generated value; confirm it matches `eiec-mailer-2026`
   - `TERMII_API_KEY` → from Termii dashboard
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` → from Cloudinary dashboard
3. **Build command:** `npm install && npm run prisma:generate && npm run build`
4. **Start command:** `npm start`
5. **Health check path:** `/api/health`

## 5. Vercel (frontend) deployment

1. Import the repo in Vercel (or push to `master` if already connected).
2. Set `NEXT_PUBLIC_API_URL` to the Render backend URL (e.g. `https://edward-ian-backend.onrender.com`).
3. Set `NEXT_PUBLIC_FRONTEND_URL` to the Vercel URL (e.g. `https://edwardian-consult.vercel.app`).
4. Deploy.

## 6. Post-deploy verification

- [ ] Admin login at `/admin/login` works
- [ ] Tutor login at `/tutor/login` works
- [ ] Student login at `/student/login` works
- [ ] Student dashboard shows news, subjects, assignments
- [ ] CBT (`/student/cbt`) loads questions for at least one subject
- [ ] Mock exams (`/student/mock`) shows the 25 published exams
- [ ] Study materials (`/student/materials`) shows resources filtered to the user's JAMB subjects
- [ ] Admissions (`/student/admissions`) shows the 21 institution courses
- [ ] Timetable (`/student/timetable`) shows the 25 weekly entries
- [ ] Admin → Students list loads
- [ ] Admin → News/Notices/Notifications loads
- [ ] Email send works (test with a registration)

## 7. Optional follow-ups

- Replace bcrypt cost-8 admin/tutor passwords with stronger ones (`npm run seed:reset` in a future iteration, or update them in the Neon SQL Editor).
- Add a backup routine (Neon has automatic daily backups on paid plans).
- Add a "First Login: Change Password" flow before exposing the system publicly.
- Enable Render's "Auto-Deploy from GitHub" so future pushes to `master` redeploy automatically.
