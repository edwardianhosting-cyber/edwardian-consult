# Edwardian Educational Consult

A comprehensive educational portal and institutional web platform. The application is split into two separate deployments:

- **Frontend**: Next.js app hosted on Vercel
- **Backend**: Express API hosted on Render

## Architecture

```
edward-ian-consult/
├── frontend/          # Next.js frontend (Vercel)
│   ├── src/
│   │   ├── app/       # Pages and layouts
│   │   ├── components/# React components
│   │   └── lib/       # API client, auth, utils
│   ├── package.json
│   └── ...
│
├── backend/           # Express API (Render)
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── lib/       # Utilities, auth, email, SMS
│   │   └── middleware/# Express middleware
│   ├── prisma/        # Database schema
│   ├── package.json
│   └── ...
│
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon.tech or Supabase recommended)
- PHP Mailer hosted on Whogohost (for emails)
- Termii account (for SMS - optional)

---

## Quick Start (Local Development)

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@host:5432/edwardian?sslmode=require"
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
PHP_MAILER_URL="https://edwardianeducationalconsult.com.ng/mailer/send.php"
PHP_MAILER_KEY="eiec-mailer-2026"
FROM_EMAIL="registrar@edwardianeducationalconsult.com.ng"
TERMII_API_KEY="TL_..."
TERMII_SENDER_ID="EdwardIan"
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database

```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed  # Optional: adds demo data
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Deployment

### Backend → Render

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**:
    - Connect your GitHub repository
    - Root directory: `backend`
    - Runtime: Node
    - Build command: `npm install && npm run build`
    - Start command: `npm start`

3. **Set environment variables** in Render dashboard:
    ```
    DATABASE_URL=your_neon_postgres_url
    JWT_SECRET=generate_a_random_secret
    NODE_ENV=production
    FRONTEND_URL=https://your-frontend.vercel.app
    PHP_MAILER_URL=https://edwardianeducationalconsult.com.ng/mailer/send.php
    PHP_MAILER_KEY=your_mailer_key
    FROM_EMAIL=registrar@edwardianeducationalconsult.com.ng
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

4. **Deploy!**

5. **Note your Render URL**: `https://your-backend.onrender.com`

### Frontend → Vercel

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Import your GitHub repository**

3. **Configure project**:
    - Framework: Next.js
    - Root directory: `frontend`
    - Build command: `npm run build`
    - Output directory: `.next`

4. **Set environment variables**:
    ```
    NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
  ```

5. **Deploy!**

6. **Update Backend CORS**: Go to Render and update `FRONTEND_URL` to your Vercel URL

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/parent-login` | Parent portal login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users/students` | List students (admin) |
| GET | `/api/users/stats` | Dashboard stats |
| GET | `/api/cbt/exams` | List available exams |
| GET | `/api/cbt/exams/:id` | Get exam with questions |
| POST | `/api/cbt/submit` | Submit CBT exam |
| GET | `/api/cbt/results` | Get user's results |
| GET | `/api/news` | List news articles |
| POST | `/api/email/send-broadcast` | Send email broadcast |
| GET | `/api/verification/:code` | Verify certificate |

---

## Demo Credentials

After running `npm run seed`:

- **Admin**: admin@edwardianconsult.com / Admin@123
- **Student**: student@edwardianconsult.com / Student@123

---

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Axios
- Lucide React icons

**Backend:**
- Express.js
- Prisma ORM
- PostgreSQL
- JWT authentication
- Zod validation

**Integrations:**
- ERCAS (payments)
- PHP Mailer on Whogohost (emails)
- Termii (SMS)
- Cloudinary (file storage)

---

## License

Proprietary software for Edwardian Educational Consult.
