# AUT Exam Platform

An AI-powered learning and assessment platform for AUT (American University of Tajikistan) students. Upload course materials and automatically generate quizzes using AI to supercharge exam preparation.

## Features

- **Course Management** — Browse, enroll in, and access course materials (exam papers, textbooks, slides)
- **AI Quiz Generation** — Upload PDF, DOCX, or PPTX files and get auto-generated flashcards, MCQs, and open-ended questions powered by Groq LLaMA 3.3
- **Authentication** — Secure email-based auth with verification, restricted to `@aut-edu.uz` domain
- **Admin Panel** — Create courses, upload materials, and manage content
- **Student Dashboard** — Track enrolled courses and quiz progress

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | Next.js 16, React 19, TypeScript        |
| Styling    | Tailwind CSS 4                          |
| Database   | SQLite + Prisma ORM                     |
| Auth       | NextAuth.js (JWT)                       |
| AI         | Groq API (LLaMA 3.3 70B)               |
| State      | Zustand                                 |
| Email      | Nodemailer (Gmail)                      |
| Charts     | Recharts                                |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
GROQ_API_KEY="your-groq-api-key"
```

### 3. Set up the database

```bash
npm run db:push
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seeded Test Accounts

| Role    | Email               | Password   |
|---------|---------------------|------------|
| Admin   | admin@aut-edu.uz    | admin123   |
| Student | student@aut-edu.uz  | student123 |

## Scripts

| Command              | Description                   |
|----------------------|-------------------------------|
| `npm run dev`        | Start development server      |
| `npm run build`      | Build for production          |
| `npm run start`      | Start production server       |
| `npm run db:push`    | Push schema to database       |
| `npm run db:migrate` | Create a new migration        |
| `npm run db:seed`    | Seed database with sample data|
| `npm run db:studio`  | Open Prisma Studio GUI        |
| `npm run lint`       | Run ESLint                    |

## Project Structure

```
src/
├── app/
│   ├── (auth)/        # Login, register, email verification
│   ├── (main)/        # Protected routes
│   │   ├── dashboard/ # Student dashboard
│   │   ├── courses/   # Course browsing & enrollment
│   │   ├── quiz/      # Quiz dashboard & player
│   │   └── admin/     # Admin panel
│   └── api/           # REST API endpoints
├── components/        # Shared UI components
└── lib/               # Utilities (auth, AI, email, i18n, Prisma)

prisma/
├── schema.prisma      # Database schema
└── seed.ts            # Seed script
```

## How Quiz Generation Works

1. Student uploads a document (PDF, DOCX, or PPTX)
2. Server extracts text from the file
3. Text is sent to Groq LLaMA 3.3 70B with structured prompts
4. AI generates **10 flashcards**, **10 MCQs**, and **5 open-ended questions**
5. Results are saved to the database and displayed to the student
