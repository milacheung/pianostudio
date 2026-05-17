# PianoStudio

A mobile-first web app for piano teaching studios. Students log practice, earn points, and stay motivated. Teachers track progress, create assignments, and manage their studio. Parents stay in the loop.

**Live:** [pianostudio-frontend.fly.dev](https://pianostudio-frontend.fly.dev) · API: [pianostudio-api.fly.dev](https://pianostudio-api.fly.dev)

---

## What it does

### For students
- **Practice timer** — start a session, stop when done, minutes and points logged automatically
- **Assignments** — see what the teacher assigned, mark progress, hit goals
- **Leaderboard** — compete with studimates on points and practice streaks
- **Studio feed** — share wins, react to posts, stay connected with the studio community

### For teachers
- **Studio dashboard** — see every student's recent practice, streaks, and assignment completion at a glance
- **Assignment builder** — create assignments with goals, due dates, and point values
- **Student management** — add students directly or invite parents to onboard their child
- **Weekly email reports** — automated summaries of studio activity sent to the teacher

### For parents
- **Child progress view** — see practice history, streaks, and points for linked students
- **Studio feed** — react to posts and stay involved in the studio community
- **COPPA-compliant onboarding** — parental consent workflow for students under 13

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS |
| Backend | Spring Boot 3.2 + Java 17 |
| Database | PostgreSQL 14 + Flyway migrations |
| Auth | Google OAuth2 + JWT (magic link alternative) |
| File storage | Cloudinary |
| Email | Mailgun |
| Hosting | Fly.io (frontend + backend + DB) |

---

## User roles

| Role | What they can do |
|---|---|
| **Teacher** | Create/manage studio, create assignments, view all student activity |
| **Student** | Log practice, complete assignments, post to feed, see leaderboard |
| **Parent** | View child's progress, post/react in feed, message teacher |
| **Admin** | System-level user management |

---

## Project structure

```
pianostudio/
├── backend/                  # Spring Boot API
│   ├── src/main/java/com/pianostudio/
│   │   ├── controller/       # REST endpoints
│   │   ├── service/          # Business logic
│   │   ├── model/            # JPA entities
│   │   ├── repository/       # Spring Data repositories
│   │   ├── dto/              # Request/response objects
│   │   ├── config/           # Security, CORS, JWT
│   │   └── security/         # OAuth2, JWT filters
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/     # Flyway SQL (V1–V13)
├── frontend/                 # React SPA
│   └── src/
│       ├── components/       # UI components
│       ├── pages/            # Route pages
│       ├── services/         # API client
│       ├── hooks/            # Custom React hooks
│       └── types/            # TypeScript types
└── rag-cli/                  # AI knowledge assistant (Phase 1 CLI)
```

---

## Running locally

### Prerequisites
- Java 17+
- Node 20+
- PostgreSQL 14+

### Backend

```bash
cd backend
createdb pianostudio
cp .env.example .env   # fill in credentials
mvn spring-boot:run    # starts on :8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # starts on :5173
```

### Environment variables

**Backend `.env`:**
```
DATABASE_URL=jdbc:postgresql://localhost:5432/pianostudio
DATABASE_USERNAME=
DATABASE_PASSWORD=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
```

---

## AI Knowledge Assistant (rag-cli)

`rag-cli/` is a Python RAG pipeline that powers the upcoming **pre-lesson brief** feature — a teacher opens a student's page before a lesson and sees an AI-generated summary synthesizing practice logs, lesson note tags, and exam syllabus context.

Phase 1 is a standalone CLI for validating retrieval quality before integrating into the app.

```bash
cd rag-cli
pip install -r requirements.txt
python ingest.py
python ask.py "What pieces develop left-hand independence at Grade 2?"
python ask.py --no-rag "same question"   # compare with/without RAG
python eval.py                           # run quality evaluation
```

See [`rag-cli/README.md`](rag-cli/README.md) for full setup.

---

## Design system

| Token | Value | Usage |
|---|---|---|
| Piano Purple | `#7B68EE` | Primary brand |
| Piano Pink | `#FF6B9D` | Celebrations, badges |
| Piano Teal | `#4ECDC4` | Practice timer |
| Gold | `#FFD700` | Achievements |
| Streak Orange | `#F6AD55` | Streak indicators |
| Heading | Fredoka | Rounded, friendly |
| Body | Inter | Readable |

---

## Deployment

```bash
# Backend
cd backend && ./deploy.sh

# Frontend
cd frontend && ./deploy.sh

# If Fly.io depot builder times out:
fly deploy --depot=false
```
