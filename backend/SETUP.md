# PianoStudio Backend - Quick Setup Guide

## Prerequisites

1. **Java 17** - Download from [Adoptium](https://adoptium.net/)
2. **PostgreSQL 14+** - Download from [PostgreSQL.org](https://www.postgresql.org/download/)
3. **Maven 3.9+** - Usually bundled with Java IDEs or install via package manager

## Quick Start (5 minutes)

### Step 1: Create Database

```bash
# Using createdb command
createdb pianostudio

# OR using psql
psql -U postgres
CREATE DATABASE pianostudio;
\q
```

### Step 2: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and set your database password:
```env
DATABASE_PASSWORD=your_postgres_password
```

For now, you can leave the other values as-is. The app will run with defaults.

### Step 3: Run the Application

```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080`

You should see output like:
```
Started PianoStudioApplication in X.XXX seconds
```

### Step 4: Verify It's Working

The application is now running! However, most endpoints require authentication.

You can verify the server is up by checking if it responds:
```bash
curl http://localhost:8080/api/auth/me
# Should return 401 Unauthorized (expected - needs authentication)
```

## Setting Up Google OAuth (Required for Login)

To actually log in, you need Google OAuth credentials:

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "PianoStudio")
3. Enable the **Google+ API** in APIs & Services

### 2. Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Configure consent screen if prompted:
   - User Type: External
   - App name: PianoStudio
   - User support email: your email
   - Developer contact: your email
4. Application type: **Web application**
5. Name: PianoStudio Local
6. Authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### 3. Update .env File

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 4. Restart the Application

```bash
# Press Ctrl+C to stop, then restart
mvn spring-boot:run
```

## Testing the OAuth Flow

1. Open browser to: `http://localhost:8080/oauth2/authorization/google`
2. You'll be redirected to Google login
3. After login, you'll be redirected back with a token
4. The token will be in the URL: `http://localhost:5173/auth/callback?token=xxx`

Note: The redirect goes to the frontend URL (which doesn't exist yet). For testing backend only, you can extract the token from the browser URL bar.

## Using the API with JWT Token

Once you have a token, use it in API requests:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:8080/api/auth/me
```

## Common Issues

### Issue: Database connection failed

**Solution:** Check PostgreSQL is running and credentials are correct:
```bash
psql -U postgres -d pianostudio
# If this works, your database is accessible
```

### Issue: Port 8080 already in use

**Solution:** Change the port in `application.yml` or stop the other service:
```bash
# Find what's using port 8080
lsof -i :8080
# Kill it if needed
kill -9 <PID>
```

### Issue: Flyway migration errors

**Solution:** Drop and recreate the database:
```bash
dropdb pianostudio
createdb pianostudio
# Then restart the app
```

## Development Workflow

### Run in IDE (Recommended)

**IntelliJ IDEA:**
1. Open the `backend` folder as a project
2. IntelliJ will auto-detect it's a Maven project
3. Set up environment variables in Run Configuration
4. Click Run/Debug

**VS Code:**
1. Install Java Extension Pack
2. Open the `backend` folder
3. Run > Start Debugging (F5)

### Database Migrations

Migrations run automatically on startup. To see status:
```bash
mvn flyway:info
```

To manually run migrations:
```bash
mvn flyway:migrate
```

To clean database (⚠️ deletes all data):
```bash
mvn flyway:clean
```

### Run Tests

```bash
mvn test
```

### Build JAR

```bash
mvn clean package
```

JAR will be in `target/pianostudio-backend-1.0.0.jar`

## Next Steps

1. Set up the frontend application
2. Configure Cloudinary for file uploads (optional for now)
3. Create your first studio and students
4. Build out additional features (practice tracking, assignments, etc.)

## API Documentation

See [README.md](README.md) for full API endpoint documentation.

## Need Help?

Check the main [README.md](README.md) for more detailed documentation.
