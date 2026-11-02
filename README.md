# 🎓 BTECHBUDDY

### Your Engineering Journey, Simplified.

A full-stack learning platform built for B.Tech students across all 4 years and 8 engineering branches.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## 📖 Overview

BTECHBUDDY is a responsive, deployable EdTech and LMS platform that gives Indian engineering students one place for notes, video lectures, live classes, and quizzes. Content is organised by year, semester, and branch, and administrators can manage everything from a built-in control panel without touching code.

## ✨ Features

### 📚 Academic Content Management
- Structured hierarchy: **B.Tech → Year (1st–4th) → Semester (1–8) → Branch → Subject → Unit → Resource**
- Supported branches: CSE, IT, AIML, DS, ECE, EE, ME, Civil
- Fully editable from the admin panel

### 📝 Study Materials
- Topper handwritten notes and solved previous 5-year question papers (PYQs)
- In-app PDF previewer with download tracking, fullscreen mode, and printing

### 🎥 Recorded Video Lectures
- Streaming via YouTube, Vimeo, or direct MP4
- Watch progress tracking, completion badges, and resume playback
- Playback speeds: 0.75x, 1x, 1.25x, 1.5x, 2x

### 📡 Live Classes
- Doubt-clearing sessions scheduled in India Standard Time (IST)
- Real-time countdown that switches to **LIVE NOW** automatically
- Embedded conferencing: Jitsi Meet (default), Zoom, or YouTube Live

### 🧪 Quizzes & Assessments
- Timed multiple-choice chapter tests with auto-submit on expiry
- Question palette showing attempted and unattempted counts
- **Secure server-side grading**: answer keys are never sent to the client, and solutions are revealed only after submission

### 🔐 Authentication & Access Control
- Roles: `SUPER_ADMIN`, `ADMIN`, `INSTRUCTOR`, `STUDENT`
- Passwords hashed with bcrypt (10 salt rounds)
- Signed JWT sessions in secure HTTP-only cookies
- Server-side route protection and API permission checks

### 🧑‍🎓 Student Portal (10 pages)
Dashboard, My Courses, My Notes, Bookmarks, Learning Progress Analytics, Watch History, Live Classes, Quiz Scorecards, Notifications, and Profile Settings.

### 🛠️ Admin Control Suite (16 pages)
Dashboard (live DB analytics), Manage Students, Staff Provisioning, Courses, Academic Taxonomy, Upload Notes & PDFs, Videos, Live Classes, Quizzes, Announcements, Homepage Customization, Categories, Analytics, Feedback Inbox, Settings, and Subscription Plans.

## 🧰 Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React |
| Backend | Next.js API Routes, Server Actions, Jose (JWT), BcryptJS |
| Database | Prisma ORM with SQLite (zero-config), PostgreSQL ready |
| Live video | Jitsi Meet (embedded), Zoom integration |
| Theme | White and deep navy (`#0B132B`, `#1C2541`) with blue and violet accents, light and dark mode |

## 📁 Project Structure

```
BTECHBUDDY.com/
├── prisma/            # Prisma schema and seed data
├── public/            # Static assets
├── scripts/           # Sample notes generator, verification and API tests
├── src/               # Application source (pages, API routes, components)
├── .env.example       # Template for environment variables
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vineetfit32/BTECHBUDDY.com.git
   cd BTECHBUDDY.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and set your own values (see [Environment Variables](#-environment-variables)).

4. **Set up the database**
   ```bash
   # Push the schema to the database
   npx prisma db push

   # Generate sample PDF notes
   node scripts/create-sample-notes.js

   # Seed branches, subjects, notes, videos, quizzes, and demo users
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Demo Credentials

These accounts are created by the seed script for local development.

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| Super Admin | Set `ADMIN_EMAIL` | Set `ADMIN_PASSWORD` | `/admin/dashboard`, full control. Not shown on the login page. |
| Student | `student@btechbuddy.in` | `Student@12345` | `/student/dashboard` |
| Instructor | `instructor@btechbuddy.in` | `Instructor@12345` | Course and quiz management |

> ⚠️ **Change or delete these accounts before deploying to production.**

## 🌐 Environment Variables

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Database connection string |
| `JWT_SECRET` | Long, random secret used to sign session tokens |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (e.g. `http://localhost:3000`) |

Never commit your real `.env` file. Only `.env.example` should be tracked.

## 🧪 Testing & Verification

Run the checks for database integrity, auth hashing, taxonomy, notes, videos, and quizzes:

```bash
npx tsx scripts/verify-platform.ts
npx tsx scripts/test-api.ts
```

Verify that the production build succeeds:

```bash
npm run build
```

## ☁️ Production Deployment

1. **Switch to PostgreSQL** by updating `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set environment variables** (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`) on your platform, such as Vercel, Railway, AWS, or Docker.

3. **Build and start**
   ```bash
   npx prisma migrate deploy
   npm run build
   npm run start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a pull request



<div align="center">

© 2026 BTECHBUDDY. Engineered for B.Tech students across India.

</div>
