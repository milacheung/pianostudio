# PianoStudio Backend

Spring Boot 3 REST API for the PianoStudio piano teaching management application.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Security** with Google OAuth2
- **Spring Data JPA** with PostgreSQL
- **Flyway** for database migrations
- **JWT** for authentication
- **Cloudinary** for file uploads
- **Lombok** for boilerplate reduction
- **Maven** for build management

## Prerequisites

- Java 17 or higher
- PostgreSQL 14+
- Maven 3.9+
- Google OAuth2 credentials
- Cloudinary account (for file uploads)

## Local Development Setup

### 1. Create PostgreSQL Database

```bash
createdb pianostudio
```

Or using psql:
```sql
CREATE DATABASE pianostudio;
```

### 2. Set Environment Variables

Create a `.env` file in the backend directory (or set in your IDE):

```env
# Database
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your-256-bit-secret-key-change-this-in-production

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS (frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Run the Application

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### 4. Run Tests

```bash
mvn test
```

## Database Migrations

Flyway migrations are located in `src/main/resources/db/migration/`. They run automatically on application startup.

To see migration status:
```bash
mvn flyway:info
```

## API Endpoints

### Authentication

- `POST /oauth2/authorization/google` - Initiate Google OAuth login
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/complete-signup` - Complete user signup (set role, join/create studio)

### Studios

- `POST /api/studios` - Create studio (teachers only)
- `POST /api/studios/join` - Join studio with invite code (students)
- `GET /api/studios/{id}` - Get studio details
- `GET /api/studios/my-studios` - Get user's studios
- `GET /api/studios/code/{inviteCode}` - Get studio by invite code

### Users

- `GET /api/users/me` - Get current user profile
- `GET /api/users/{id}` - Get user by ID

## Authentication Flow

1. User clicks "Login with Google" on frontend
2. Frontend redirects to `/oauth2/authorization/google`
3. User authenticates with Google
4. Backend creates/updates user in database
5. Backend generates JWT token
6. Backend redirects to frontend with token: `/auth/callback?token=xxx`
7. Frontend stores token and uses it in Authorization header: `Bearer {token}`

## Project Structure

```
src/main/java/com/pianostudio/
├── PianoStudioApplication.java    # Main application class
├── config/                         # Configuration classes
│   ├── SecurityConfig.java         # Security & OAuth2 config
│   ├── CorsConfig.java             # CORS configuration
│   └── CloudinaryConfig.java       # Cloudinary setup
├── controller/                     # REST controllers
│   ├── AuthController.java
│   ├── StudioController.java
│   └── UserController.java
├── dto/                            # Data transfer objects
│   ├── UserDTO.java
│   ├── StudioDTO.java
│   ├── CreateStudioRequest.java
│   ├── JoinStudioRequest.java
│   ├── CompleteSignupRequest.java
│   └── AuthResponse.java
├── exception/                      # Exception handling
│   ├── GlobalExceptionHandler.java
│   └── ErrorResponse.java
├── model/                          # JPA entities
│   ├── User.java
│   ├── Studio.java
│   ├── StudentProfile.java
│   ├── PracticeSession.java
│   ├── Assignment.java
│   ├── StudentAssignment.java
│   ├── Badge.java
│   ├── StudentBadge.java
│   ├── Post.java
│   ├── Reaction.java
│   ├── Challenge.java
│   └── Message.java
├── repository/                     # Data access layer
│   └── (all repository interfaces)
├── security/                       # Security components
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── OAuth2SuccessHandler.java
└── service/                        # Business logic
    ├── UserService.java
    └── StudioService.java
```

## Database Schema

See Flyway migrations in `src/main/resources/db/migration/` for full schema.

Key entities:
- **users** - All users (teachers, students, parents)
- **studios** - Teaching studios with invite codes
- **student_profiles** - Student-specific data (points, streaks)
- **practice_sessions** - Individual practice logs
- **assignments** - Teacher-created assignments
- **student_assignments** - Student progress on assignments
- **badges** - Achievement badges
- **posts** - Social feed posts
- **challenges** - Studio-wide practice challenges
- **messages** - Direct messaging between users

## Deployment to Fly.io

### First-time Setup

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/

2. Login to Fly:
```bash
fly auth login
```

3. Create the app (from backend directory):
```bash
fly launch --no-deploy
```

4. Create PostgreSQL database:
```bash
fly postgres create
```

5. Attach database to app:
```bash
fly postgres attach <db-name>
```

6. Set secrets:
```bash
fly secrets set JWT_SECRET="your-secret-key"
fly secrets set GOOGLE_CLIENT_ID="your-google-client-id"
fly secrets set GOOGLE_CLIENT_SECRET="your-google-client-secret"
fly secrets set CLOUDINARY_CLOUD_NAME="your-cloud-name"
fly secrets set CLOUDINARY_API_KEY="your-api-key"
fly secrets set CLOUDINARY_API_SECRET="your-api-secret"
fly secrets set CORS_ALLOWED_ORIGINS="https://your-frontend-url.fly.dev"
```

7. Deploy:
```bash
./deploy.sh
```

### Subsequent Deployments

```bash
./deploy.sh
```

### Useful Fly.io Commands

```bash
fly status                          # Check app status
fly logs                            # View logs
fly ssh console                     # SSH into container
fly secrets list                    # View secrets
fly postgres connect -a <db-name>   # Connect to database
fly scale show                      # Show current scaling
fly scale vm shared-cpu-1x          # Change VM size
```

## Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - Local: `http://localhost:8080/login/oauth2/code/google`
   - Production: `https://your-app.fly.dev/login/oauth2/code/google`
6. Copy Client ID and Client Secret to environment variables

## Security Features

- Google OAuth2 authentication
- JWT token-based API authentication (24hr expiration)
- Role-based access control (TEACHER, STUDENT, PARENT)
- CORS protection
- SQL injection prevention (JPA parameterized queries)
- Input validation on all requests
- HTTPS enforcement in production

## Performance Optimizations

- Database connection pooling
- Indexed database queries
- Lazy loading for JPA relationships
- Multi-stage Docker build
- Optimized JVM settings in container

## Monitoring

Health check endpoint: `GET /actuator/health` (if enabled)

Logs: `fly logs` or check Fly.io dashboard

## Troubleshooting

### Database connection issues
```bash
fly postgres connect -a <db-name>
# Check if database is accessible
\l  # List databases
\c pianostudio  # Connect to pianostudio database
\dt  # List tables
```

### Check secrets
```bash
fly secrets list
```

### View application logs
```bash
fly logs --app pianostudio-backend
```

### SSH into container
```bash
fly ssh console
```

## Future Enhancements

- Add practice session tracking endpoints
- Implement assignment management
- Create leaderboard/ranking endpoints
- Add badge earning logic
- Implement social feed features
- Add messaging system
- Create parent dashboard endpoints
- Add analytics and reporting
- Implement file upload for assignments

## License

Proprietary - PianoStudio
