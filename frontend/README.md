# PianoStudio Frontend

A modern React + TypeScript frontend for PianoStudio, a gamified piano practice tracking app.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - High-quality UI components
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **TanStack Query** - Data fetching and caching (optional)
- **Lucide React** - Icon library

## Features

- Google OAuth authentication
- Practice timer with localStorage persistence
- Real-time practice tracking
- Points and streak system
- Leaderboard
- Assignment management
- Community feed
- User profile
- Mobile-first responsive design

## Design System

### Colors
- **Piano Purple**: `#7B68EE` (Primary brand color)
- **Piano Pink**: `#FF6B9D` (Secondary accent)
- **Piano Teal**: `#4ECDC4` (Practice/action color)
- **Piano Gold**: `#FFD700` (Points/rewards)
- **Streak Orange**: `#F6AD55` (Streak indicators)

### Typography
- **Headings**: Fredoka (Google Fonts)
- **Body**: Inter (Google Fonts)
- **Base size**: 15px minimum

### Components
- Border radius: 12-16px for cards
- Touch targets: Minimum 48x48px
- Mobile-first approach

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Configuration

The frontend automatically connects to:
- **Development**: `http://localhost:8080` (local backend)
- **Production**: `https://pianostudio-api.fly.dev` (deployed backend)

This is configured in `src/services/api.ts` using `import.meta.env.PROD`.

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn components (button, card, avatar, etc.)
│   ├── layout/          # Header, BottomNav, Layout
│   ├── practice/        # PracticeTimer component
│   └── common/          # PointsDisplay, StreakBadge
├── pages/               # Route pages
│   ├── LoginPage.tsx
│   ├── HomePage.tsx
│   ├── PracticePage.tsx
│   ├── AssignmentsPage.tsx
│   ├── LeaderboardPage.tsx
│   ├── CommunityPage.tsx
│   └── ProfilePage.tsx
├── services/
│   └── api.ts          # Axios API client with JWT interceptor
├── context/
│   └── AuthContext.tsx # Authentication state management
├── hooks/
│   └── usePracticeTimer.ts # Practice timer logic
├── types/
│   └── index.ts        # TypeScript interfaces
├── lib/
│   └── utils.ts        # Utility functions (cn)
├── App.tsx             # Router and protected routes
└── main.tsx            # App entry point
```

## Key Components

### PracticeTimer
- Circular timer with progress animation
- localStorage persistence (resumes after page reload)
- Play/Pause/Stop controls
- Points earned counter
- Goal progress tracking

### AuthContext
- JWT token management
- Google OAuth integration
- Protected route wrapper
- User state management

### Layout
- Responsive header with logo and user avatar
- Mobile bottom navigation
- Desktop-friendly design

## Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:5173)

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint

# Type checking
npm run typecheck    # Run TypeScript compiler check
```

## Deployment

### Deploy to Fly.io

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login to Fly.io:
```bash
fly auth login
```

3. Create the app (first time only):
```bash
fly apps create pianostudio-frontend
```

4. Deploy:
```bash
./deploy.sh
```

Or manually:
```bash
npm run build
fly deploy --depot=false
```

The app will be available at: `https://pianostudio-frontend.fly.dev`

### Deployment Configuration

- **Dockerfile**: Multi-stage build with Node + Nginx
- **nginx.conf**: SPA routing, gzip compression, security headers
- **fly.toml**: Fly.io configuration (port 8080, auto-scaling)

## API Integration

The frontend connects to the backend API for:

- **Authentication**: Google OAuth, JWT tokens
- **User Profile**: Get current user, student profile
- **Practice Sessions**: Start/end practice, get history
- **Assignments**: Fetch student assignments
- **Leaderboard**: Get studio rankings
- **Studio**: Join studio by invite code

All API calls include JWT token in Authorization header (handled automatically by Axios interceptor).

## Development Notes

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Wrap with `<ProtectedRoute>` if authentication required
4. Add navigation link in `src/components/layout/BottomNav.tsx`

### Adding shadcn Components

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add dialog
```

### Custom Tailwind Classes

Custom utility classes are available in `src/index.css`:
- `.gradient-purple` - Purple gradient background
- `.gradient-teal` - Teal gradient background
- `.gradient-pink` - Pink gradient background
- `.card-rounded` - 12px border radius
- `.card-rounded-lg` - 16px border radius
- `.touch-target` - 48x48px minimum size

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 15+)
- Chrome Mobile (Android 10+)

## License

MIT
