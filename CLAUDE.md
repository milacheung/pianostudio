# PianoStudio Project Documentation

A mobile-first web app for piano teaching studios that combines practice management with community features.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React + TypeScript | 19.x |
| **Build** | Vite | 7.x |
| **UI** | shadcn/ui + Tailwind | Latest |
| **Backend** | Spring Boot | 3.2.x |
| **Database** | PostgreSQL | 14+ |
| **Auth** | Google OAuth2 + JWT | - |
| **File Storage** | Cloudinary | - |
| **Hosting** | Fly.io | - |

## User Roles

- **Teacher** - Admin, manages studio, creates assignments, views all progress
- **Student** - Logs practice, views assignments, posts to feed, sees leaderboard
- **Parent** - Views child's progress, messages teacher, can post/react

## Project Structure

```
pianostudio/
├── backend/                 # Spring Boot API
│   ├── src/main/java/com/pianostudio/
│   │   ├── config/         # Security, CORS, JWT config
│   │   ├── controller/     # REST endpoints
│   │   ├── dto/            # Request/Response objects
│   │   ├── model/          # JPA entities
│   │   ├── repository/     # Data access
│   │   ├── security/       # OAuth2, JWT filters
│   │   └── service/        # Business logic
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/   # Flyway SQL scripts
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API client
│   │   ├── context/        # React context (Auth)
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # TypeScript types
│   └── public/
└── CLAUDE.md               # This file
```

## Quick Commands

### Local Development

```bash
# Backend (requires Java 17 + PostgreSQL)
cd pianostudio/backend
createdb pianostudio
mvn spring-boot:run          # Runs on :8080

# Frontend
cd pianostudio/frontend
npm install
npm run dev                  # Runs on :5173
```

### Deployment (Fly.io)

```bash
# Deploy backend
cd pianostudio/backend && ./deploy.sh

# Deploy frontend
cd pianostudio/frontend && ./deploy.sh
```

### Testing

```bash
# Backend
cd pianostudio/backend && mvn test

# Frontend type check
cd pianostudio/frontend && npm run typecheck

# Frontend build
cd pianostudio/frontend && npm run build
```

## Database Schema

```sql
-- Core
users (id, email, name, first_name, avatar_url, role, created_at)
studios (id, name, invite_code, teacher_id, created_at)
student_profiles (id, user_id, studio_id, parent_id, total_points, current_streak, longest_streak)

-- Practice
practice_sessions (id, student_id, start_time, end_time, minutes, assignment_id, points_earned)
assignments (id, studio_id, title, description, goal_minutes, due_date, attachments, points_value)
student_assignments (id, student_id, assignment_id, completed, progress_minutes, completed_at)

-- Gamification
badges (id, name, description, icon_url, criteria)
student_badges (id, student_id, badge_id, earned_at)
challenges (id, studio_id, title, goal_minutes, current_minutes, start_date, end_date)

-- Social
posts (id, author_id, studio_id, content, media_url, media_type, created_at)
reactions (id, post_id, user_id, emoji)
messages (id, sender_id, recipient_id, content, created_at, read_at)
```

## API Endpoints

### Authentication
- `GET /oauth2/authorization/google` - Initiate Google OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/complete-signup` - Set role, join/create studio

### Studios
- `POST /api/studios` - Create studio (teacher)
- `GET /api/studios/{id}` - Get studio details
- `POST /api/studios/join` - Join via invite code (student/parent)

### Practice (TODO)
- `POST /api/practice/start` - Start practice session
- `POST /api/practice/{id}/end` - End session
- `GET /api/practice/history` - Get practice history

### Assignments (TODO)
- `POST /api/assignments` - Create assignment (teacher)
- `GET /api/assignments` - Get assignments for studio
- `PUT /api/assignments/{id}/progress` - Update progress

### Leaderboard (TODO)
- `GET /api/leaderboard` - Get studio leaderboard

### Community (TODO)
- `GET /api/posts` - Get studio feed
- `POST /api/posts` - Create post
- `POST /api/posts/{id}/reactions` - React to post

## Environment Variables

### Backend (.env)
```
DATABASE_URL=jdbc:postgresql://localhost:5432/pianostudio
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
JWT_SECRET=your-256-bit-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend
- API URL configured in `src/services/api.ts`
- Production: `https://pianostudio-api.fly.dev`
- Local: `http://localhost:8080`

## Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Piano Purple | `#7B68EE` | Primary brand |
| Piano Purple Dark | `#5847C7` | Hover states |
| Piano Pink | `#FF6B9D` | Celebrations, badges |
| Piano Teal | `#4ECDC4` | Practice timer, focus |
| Gold | `#FFD700` | Achievements |
| Streak Orange | `#F6AD55` | Streaks |

### Typography
- **Headings**: Fredoka (rounded, friendly)
- **Body**: Inter (readable)
- **Minimum size**: 15px body text

### Touch Targets
- Minimum 48x48px for all interactive elements
- Practice timer button: 120x120px

## AI Agent Task Assignment

| Task Type | Agent | Model |
|-----------|-------|-------|
| Planning / Architecture | - | Claude Sonnet 4.5 |
| UI Design | `ui-designer` | gemini-2.5-pro |
| Frontend Coding | `frontend-developer` | gemini-2.5-pro |
| Backend Coding | `backend-developer` | Claude Sonnet 4.5 |
| Debugging | `mcp__zen__debug` | gemini-2.5-pro |

## MVP Features Checklist

### Phase 1 - Foundation
- [x] Project scaffolding
- [x] Database schema
- [x] Google OAuth setup (config ready)
- [x] Basic UI layout
- [ ] Google OAuth credentials (need to create)

### Phase 2 - Core Features
- [ ] Practice timer (frontend built, needs API)
- [ ] Assignment CRUD
- [ ] Student dashboard
- [ ] Teacher dashboard

### Phase 3 - Gamification
- [ ] Points system
- [ ] Streak tracking
- [ ] Badges
- [ ] Leaderboard

### Phase 4 - Community
- [ ] Studio feed
- [ ] Post creation with media
- [ ] Reactions
- [ ] Group challenges

### Phase 5 - Communication
- [ ] Direct messaging
- [ ] Studio announcements
