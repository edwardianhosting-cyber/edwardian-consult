# Test Login Credentials

Use these credentials to test the application locally and on live deployment.

## Admin
- **Email:** `admin@edwardianconsult.com`
- **Password:** `Admin@123`
- **Login URL:** `/login?mode=credentials`
- **Dashboard:** `/admin/dashboard`

## Teacher / Tutor
- **Email:** `tutor@edwardianconsult.com`
- **Password:** `Tutor@123`
- **Login URL:** `/login?mode=credentials`
- **Dashboard:** `/teacher/dashboard`

## Student
- **Email:** `student@edwardianconsult.com`
- **Password:** `Student@123`
- **Login URL:** `/login?mode=credentials`
- **Dashboard:** `/student/dashboard`

## Parent
- **Portal ID:** `EIEC/2026/0001`
- **Access Code:** `PAR-STU-0001`
- **Login URL:** `/login?mode=parent`
- **Dashboard:** `/parent/dashboard`

## Neon Production Setup

```bash
cd backend

# Windows PowerShell
$env:DATABASE_URL="postgresql://neondb_owner:npg_NrjdLgA43DQy@ep-late-rain-axs61xfx-pooler.c-4.us-east-2.aws.neon.tech/edwardian_db?sslmode=require&channel_binding=require"
npx prisma db push
npx prisma db seed

# Git Bash
export DATABASE_URL="postgresql://neondb_owner:npg_NrjdLgA43DQy@ep-late-rain-axs61xfx-pooler.c-4.us-east-2.aws.neon.tech/edwardian_db?sslmode=require&channel_binding=require"
npx prisma db push
npx prisma db seed
```

## Vercel Environment Variables

Set these in your Vercel dashboard for the backend:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | A strong random string |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `EMAIL_SERVICE_URL` | Your email service URL |
| `EMAIL_API_KEY` | Your email API key |

## Notes

- The parent account is linked to the demo student above.
- All passwords are hashed in the database; use the plain text values above to log in.
- For local development, `DATABASE_URL` in `backend/.env` uses SQLite.
