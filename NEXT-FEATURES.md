# PianoStudio - Next Features Brainstorm

> Last Updated: December 2024

This document outlines potential features for future development, organized by priority and complexity.

---

## Priority 1: Core Experience Improvements

### 1.1 Points & Streak System Enhancement
**Status:** Backend exists, needs frontend integration
**Effort:** Medium (1-2 days)

**Current State:**
- `student_profiles` table has `total_points`, `current_streak`, `longest_streak`
- Points awarded when ending practice sessions

**What's Needed:**
- [ ] Display streak prominently on home screen
- [ ] Streak loss warning (if approaching midnight)
- [ ] Points animation when earned
- [ ] Daily practice goal setting
- [ ] "Streak freeze" power-up (optional gamification)

**Value:** High - streaks are proven motivators for daily habits

---

### 1.2 Practice Timer API Integration
**Status:** Frontend timer exists, needs backend sync
**Effort:** Small (0.5-1 day)

**What's Needed:**
- [ ] Connect PracticePage timer to `/api/practice/start` and `/end`
- [ ] Persist session if app closes mid-practice
- [ ] Show practice history on practice page
- [ ] Link practice to specific assignment

**Value:** High - core feature for students

---

### 1.3 Badges System
**Status:** Database schema exists, needs implementation
**Effort:** Medium (2-3 days)

**Existing Tables:**
- `badges` (id, name, description, icon_url, criteria)
- `student_badges` (id, student_id, badge_id, earned_at)

**Badge Ideas:**
| Badge | Criteria | Icon |
|-------|----------|------|
| First Note | Complete first practice | 🎵 |
| Week Warrior | 7-day streak | 🔥 |
| Century | 100 total practice minutes | 💯 |
| Night Owl | Practice after 8pm | 🦉 |
| Early Bird | Practice before 8am | 🐦 |
| Perfect Week | 7 days, 30+ min each | ⭐ |
| Assignment Ace | Complete 10 assignments | 📝 |
| Social Butterfly | Post 5 times | 🦋 |

**What's Needed:**
- [ ] Badge check logic in PracticeService
- [ ] Badge notification when earned
- [ ] Badge display on profile page
- [ ] Badge showcase modal

---

### 1.4 Direct Messaging
**Status:** Database table exists (`messages`), needs full implementation
**Effort:** Medium-Large (3-4 days)

**What's Needed:**
- [ ] MessagesController endpoints (CRUD)
- [ ] MessagesPage frontend
- [ ] Real-time or polling for new messages
- [ ] Unread message count in nav
- [ ] Push notifications (optional)
- [ ] Parent-teacher messaging
- [ ] COPPA: Block student-to-student messaging for minors

**Value:** Medium - enables parent-teacher communication

---

## Priority 2: Engagement Features

### 2.1 Group Challenges
**Status:** Database table exists (`challenges`), needs implementation
**Effort:** Medium (2-3 days)

**Challenge Types:**
- **Studio Goal:** "Practice 500 minutes as a studio this week"
- **Individual Race:** "Who can practice most this week?"
- **Streak Challenge:** "Everyone maintain 7-day streak"

**What's Needed:**
- [ ] ChallengeController endpoints
- [ ] Challenge creation UI (teacher)
- [ ] Challenge progress bar
- [ ] Challenge leaderboard
- [ ] Completion celebration

---

### 2.2 Practice Audio Recording
**Status:** Not started
**Effort:** Large (4-5 days)

**Features:**
- Record practice snippets
- Upload to Cloudinary
- Teacher can listen and leave feedback
- Student can track improvement over time

**Technical Considerations:**
- MediaRecorder API for recording
- Audio compression before upload
- Storage costs (Cloudinary)

---

### 2.3 Repertoire Tracking
**Status:** Not started
**Effort:** Medium (2-3 days)

**Features:**
- List of pieces student is working on
- Status: Learning → Polishing → Performance Ready
- Link pieces to practice sessions
- Piece history (date started, mastered)

**Value:** Medium - helps teachers track student progress

---

### 2.4 Practice Reminders / Push Notifications
**Status:** Not started
**Effort:** Medium (2-3 days)

**Types:**
- Daily practice reminder (configurable time)
- Streak at risk warning
- Assignment due soon
- New message from teacher
- Challenge ending soon

**Technical Options:**
- Web Push Notifications (PWA)
- Email notifications
- SMS (cost)

---

## Priority 3: Teacher Tools

### 3.1 Teacher Dashboard
**Status:** Partial
**Effort:** Medium (2-3 days)

**Features:**
- [ ] Overview of all students
- [ ] Who practiced today
- [ ] Streak leaderboard
- [ ] Assignment completion rates
- [ ] Quick actions (message, assign)

---

### 3.2 Lesson Notes
**Status:** Not started
**Effort:** Medium (2 days)

**Features:**
- Teacher writes notes after each lesson
- Linked to student and date
- Parent can view notes
- Exportable for records

---

### 3.3 Progress Reports
**Status:** Not started
**Effort:** Medium-Large (3-4 days)

**Features:**
- Weekly/monthly summary emails
- PDF export of student progress
- Practice trends over time
- Badge collection
- Comparison to studio average

---

### 3.4 Studio Announcements
**Status:** Not started
**Effort:** Small (1 day)

**Features:**
- Teacher posts announcement to all students/parents
- Pinned to top of feed
- Email notification option
- Recital dates, studio closures, etc.

---

## Priority 4: Nice-to-Have

### 4.1 Music Theory Games
**Status:** Not started
**Effort:** Large (5+ days)

**Ideas:**
- Note identification quiz
- Rhythm matching game
- Key signature quiz
- Interval training

---

### 4.2 Metronome / Tuner
**Status:** Not started
**Effort:** Medium (2-3 days)

**Features:**
- Built-in metronome with tap tempo
- Tempo marking presets (Allegro, etc.)
- Tuner using microphone
- Record with metronome click

---

### 4.3 Sheet Music Library
**Status:** Not started
**Effort:** Large (4-5 days)

**Features:**
- Upload sheet music (PDF)
- Organize by piece/student
- Annotation support
- Integration with assignments

---

### 4.4 Calendar / Scheduling
**Status:** Not started
**Effort:** Large (5+ days)

**Features:**
- Lesson scheduling
- Recital dates
- Google Calendar integration
- Availability management

---

## Technical Debt / Improvements

### Testing
- [ ] Add unit tests for services
- [ ] Add integration tests for controllers
- [ ] Frontend component tests
- [ ] E2E tests with Playwright

### Performance
- [ ] Add caching (Redis) for leaderboard
- [ ] Optimize database queries
- [ ] Image optimization
- [ ] Bundle size analysis

### Security
- [ ] Rate limiting
- [ ] Input sanitization audit
- [ ] Security headers
- [ ] Dependency updates

### DevOps
- [ ] CI/CD pipeline
- [ ] Automated deployments
- [ ] Monitoring (Sentry)
- [ ] Database backups

---

## Recommended Next Steps

Based on impact and effort, here's a suggested order:

1. **Practice Timer API Integration** (Small, High Value)
2. **Points & Streak Enhancement** (Medium, High Value)
3. **Badges System** (Medium, High Value)
4. **Teacher Dashboard** (Medium, High Value)
5. **Direct Messaging** (Medium-Large, Medium Value)
6. **Group Challenges** (Medium, Medium Value)

---

## Feature Request Template

When adding new features to this list, use this template:

```markdown
### Feature Name
**Status:** Not started / In progress / Complete
**Effort:** Small (< 1 day) / Medium (1-3 days) / Large (3+ days)

**Description:**
Brief description of the feature

**What's Needed:**
- [ ] Task 1
- [ ] Task 2

**Technical Notes:**
Any technical considerations

**Value:** High / Medium / Low - brief explanation
```
