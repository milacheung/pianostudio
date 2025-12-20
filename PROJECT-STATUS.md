# PianoStudio Project Status

## Project Overview

**PianoStudio** is a mobile-first web application for piano teaching studios that combines practice management with community features. It helps teachers manage their studios, track student progress, and build an engaged learning community.

## Project Goals

1. **Streamline Practice Management** - Enable students to log practice sessions with a timer, track progress, and earn points
2. **Gamification for Motivation** - Implement points, streaks, badges, and leaderboards to keep students engaged
3. **Teacher Oversight** - Give teachers visibility into student practice habits and assignment completion
4. **Parent Involvement** - Allow parents to monitor their children's progress and communicate with teachers
5. **Community Building** - Create a studio feed where students can share achievements and celebrate progress
6. **Assignment Tracking** - Enable teachers to create assignments with due dates and track completion

---

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

---

## User Roles

| Role | Description |
|------|-------------|
| **Admin** | System administrator, manages all users |
| **Teacher** | Studio owner, creates assignments, views all student progress |
| **Student** | Logs practice, views assignments, posts to feed, sees leaderboard |
| **Parent** | Views child's progress, messages teacher, can post/react |

---

## Feature Status

### Phase 1 - Foundation

| Feature | Status | Notes |
|---------|--------|-------|
| Project scaffolding | Done | React + Spring Boot setup complete |
| Database schema | Done | Flyway migrations in place |
| Google OAuth setup | Done | Working in production |
| Basic UI layout | Done | Mobile-first design with shadcn/ui |
| JWT Authentication | Done | 24hr token expiration |
| User Onboarding Flow | Done | Role selection, studio creation/join |

### Phase 2 - Core Features

| Feature | Status | Notes |
|---------|--------|-------|
| Practice Timer | Partial | Frontend UI built, needs API integration |
| Student Dashboard | Done | Shows stats, assignments, practice history |
| Teacher Dashboard | Done | Shows studio stats, student list, activity feed |
| Parent Dashboard | Done | Views linked children's progress |
| Admin Dashboard | Done | User management, role changes, user deletion |
| Assignment CRUD | Done | Create, edit, delete assignments |
| Assignment Progress | Partial | Tracking structure in place |

### Phase 2.5 - COPPA Compliance (Required Before Public Launch)

| Feature | Status | Notes |
|---------|--------|-------|
| Age Verification | Not Started | Ask age during onboarding, block under-13 direct signups |
| Parental Consent Workflow | Not Started | Email-based consent for minors 13-15 |
| Parent-Child Account Linking | Partial | Schema exists, needs full implementation |
| Account Deletion | Not Started | User can request account deletion |
| Data Export | Not Started | Download personal data as JSON/PDF |

See [Parental Consent Workflow Specs](docs/PARENTAL-CONSENT-WORKFLOW-SPECS.md) for detailed implementation guide.

### Phase 3 - Gamification

| Feature | Status | Notes |
|---------|--------|-------|
| Points System | Partial | Schema exists, earning logic needed |
| Streak Tracking | Partial | Schema exists, calculation logic needed |
| Badges | Not Started | Schema exists |
| Leaderboard | Partial | API and UI exist, needs real data |

### Phase 4 - Community

| Feature | Status | Notes |
|---------|--------|-------|
| Studio Feed | Done | Posts with reactions |
| Post Creation | Done | Text posts with optional media |
| Reactions | Done | Emoji reactions on posts |
| Media Upload | Partial | Cloudinary configured |
| Group Challenges | Not Started | Schema exists |

### Phase 5 - Communication

| Feature | Status | Notes |
|---------|--------|-------|
| Direct Messaging | Not Started | Schema exists |
| Studio Announcements | Not Started | Planned |

---

## API Endpoints

### Authentication
- `GET /oauth2/authorization/google` - Initiate Google OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/complete-signup` - Set role, join/create studio

### Admin (Requires ADMIN role)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{id}/role` - Update user role
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/users/{id}/make-admin` - Promote to admin

### Studios
- `POST /api/studios` - Create studio (teacher)
- `GET /api/studios/{id}` - Get studio details
- `POST /api/studios/join` - Join via invite code

### Dashboard
- `GET /api/dashboard/student` - Student dashboard data
- `GET /api/dashboard/teacher` - Teacher dashboard data

### Practice
- `POST /api/practice/start` - Start practice session
- `POST /api/practice/{id}/end` - End session
- `GET /api/practice/me` - Get practice history
- `GET /api/practice/stats` - Get practice statistics

### Assignments
- `GET /api/assignments` - Get studio assignments
- `POST /api/assignments` - Create assignment (teacher)
- `PUT /api/assignments/{id}` - Update assignment
- `DELETE /api/assignments/{id}` - Delete assignment
- `PUT /api/assignments/{id}/progress` - Update progress

### Leaderboard
- `GET /api/leaderboard` - Get studio leaderboard

### Community
- `GET /api/posts` - Get studio feed
- `POST /api/posts` - Create post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/{id}/reactions` - Add reaction
- `DELETE /api/posts/{id}/reactions` - Remove reaction

---

## Database Schema

```
users (id, email, name, first_name, avatar_url, role, created_at)
studios (id, name, invite_code, teacher_id, created_at)
student_profiles (id, user_id, studio_id, parent_id, total_points, current_streak, longest_streak)

practice_sessions (id, student_id, start_time, end_time, minutes, assignment_id, points_earned)
assignments (id, studio_id, title, description, goal_minutes, due_date, attachments, points_value)
student_assignments (id, student_id, assignment_id, completed, progress_minutes, completed_at)

badges (id, name, description, icon_url, criteria)
student_badges (id, student_id, badge_id, earned_at)
challenges (id, studio_id, title, goal_minutes, current_minutes, start_date, end_date)

posts (id, author_id, studio_id, content, media_url, media_type, created_at)
reactions (id, post_id, user_id, emoji)
messages (id, sender_id, recipient_id, content, created_at, read_at)
```

---

## Production URLs

- **Frontend**: https://pianostudio-frontend.fly.dev
- **Backend API**: https://pianostudio-api.fly.dev
- **Database**: pianostudio-db (Fly.io PostgreSQL)

---

## Design System

| Element | Value | Usage |
|---------|-------|-------|
| Piano Purple | `#7B68EE` | Primary brand color |
| Piano Purple Dark | `#5847C7` | Hover states |
| Piano Pink | `#FF6B9D` | Celebrations, badges |
| Piano Teal | `#4ECDC4` | Practice timer, focus states |
| Gold | `#FFD700` | Achievements |
| Streak Orange | `#F6AD55` | Streak indicators |
| Heading Font | Fredoka | Rounded, friendly feel |
| Body Font | Inter | Readable at all sizes |
| Min Touch Target | 48x48px | Accessibility standard |

---

## Next Steps (Priority Order)

### Required Before Public Launch (COPPA Compliance)
1. **Age Verification Flow** - Ask age during onboarding, block under-13 direct signups
2. **Parental Consent Workflow** - Email-based consent for minors 13-15
3. **Account Deletion Feature** - Allow users to delete their accounts
4. **Parent-Child Account Linking** - Full implementation of parent managing child accounts

### Core Features
5. **Complete Practice Timer Integration** - Connect frontend timer to backend API
6. **Implement Points Earning Logic** - Award points for practice sessions
7. **Streak Calculation** - Track consecutive practice days

### Nice to Have
8. **Badge System** - Define badge criteria and award logic
9. **Data Export** - Allow users to download their data
10. **Direct Messaging** - Enable parent-teacher communication (adults only)
11. **Push Notifications** - Remind students to practice

---

## Legal Compliance

See [Legal Policies Document](pianostudio-legal-policies.md) for:
- Privacy Policy
- Terms of Service
- Children's Privacy (COPPA)
- Photo and Media Consent
- Parent/Guardian Consent Form

**Note:** Fill in all `[INSERT]` placeholders before public launch.

---

*Last Updated: December 2024*
