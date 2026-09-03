# Database Seeder (Idempotent)

These scripts seed the live Neon PostgreSQL database for the Edwardian Educational Consult platform. They are **idempotent** — re-running them does not create duplicates and does not delete existing rows.

## Prerequisites

- Node 18+
- A `DATABASE_URL` environment variable pointing at the live database (already in `backend/.env`)

## Install

```sh
cd database/seed
npm install
```

## Run

```sh
node seed.js     # full seeder: subjects, topics, resources, questions, exams, courses, timetable, tutors, admin
node finish.js   # resumes/finishes: exams, courses, timetable, tutors, admin
```

## What gets seeded

| Table | Rows after seed | Notes |
|---|---|---|
| `StudySubject` | 41 | All SSS1–SSS3 subjects across Science/Commercial/Arts/ICT/Vocational |
| `StudyTopic` | ~250 | 4–10 topics per subject |
| `StudyResource` | ~750 | 3 resources per topic (notes + video + past questions) |
| `Question` | ~250 | 10 JAMB-style MCQs per subject (Physics has 10 hand-written) |
| `Exam` | 25 | One 30-min practice test per subject, published, with 20 questions each |
| `InstitutionCourse` | 21 | 3–5 courses per institution (UNILAG, UI, ABU, OAU, UNN, Covenant, Babcock, LASU) |
| `TimetableEntry` | 25 | Mon–Fri × 5 class periods for SSS3 |
| `User` (TUTOR) | 6 | tutor.{physics,chemistry,maths,english,biology,economics}@edwardian.ng / `Tutor@123` |
| `User` (ADMIN) | 1 | admin@edwardian.ng / `Admin@123` |

> Existing rows are never modified or deleted. Only missing rows are inserted.
