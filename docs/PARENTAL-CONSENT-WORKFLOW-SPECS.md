# Parental Consent Workflow - Technical Specifications

## Overview

This document outlines the technical implementation for COPPA-compliant parental consent workflow in PianoStudio. This feature ensures children under 16 have proper parental oversight and children under 13 have verified parental consent before data collection.

---

## User Flow Diagrams

### Flow 1: Adult User (16+) Signup
```
Google OAuth Login
       ↓
  Age Check Screen
       ↓
  "Are you 16 or older?" → YES
       ↓
  Standard Onboarding
  (Role Selection, Studio Join/Create)
       ↓
  Dashboard
```

### Flow 2: Minor (13-15) Signup
```
Google OAuth Login
       ↓
  Age Check Screen
       ↓
  "Are you 16 or older?" → NO → "Are you 13-15?"
       ↓
  Parent Email Required Screen
       ↓
  Enter Parent Email
       ↓
  "Account Pending" Screen
  (Email sent to parent)
       ↓
  [Parent clicks link in email]
       ↓
  Parent Consent Form (in app)
       ↓
  Parent Signs Consent
       ↓
  Child Account Activated
       ↓
  Child continues to Role Selection
```

### Flow 3: Child Under 13 Signup (Blocked)
```
Google OAuth Login
       ↓
  Age Check Screen
       ↓
  "Are you 16 or older?" → NO → "Are you 13 or older?" → NO
       ↓
  "Ask a Parent" Screen
  "Children under 13 need a parent to create an account for them."
       ↓
  [Logout - account not created]
```

### Flow 4: Parent Creating Child Account
```
Parent logged in (role: PARENT)
       ↓
  "Add Child" button
       ↓
  Enter Child Details
  (Name, Age/Birthdate)
       ↓
  Consent Checkboxes
  - Data collection consent
  - Media consent (optional)
       ↓
  Child Account Created
  (linked to parent)
       ↓
  Child Can Login (no re-consent needed)
```

---

## Database Schema Changes

### New Tables

```sql
-- Parental consent records
CREATE TABLE parental_consents (
    id BIGSERIAL PRIMARY KEY,
    child_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    parent_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    parent_email VARCHAR(255) NOT NULL,
    consent_type VARCHAR(50) NOT NULL, -- 'DATA_COLLECTION', 'MEDIA_SHARING'
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    consent_date TIMESTAMP,
    consent_ip VARCHAR(45),
    consent_method VARCHAR(50), -- 'ELECTRONIC', 'PHYSICAL_FORM'
    revoked_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pending consent requests (for minors 13-15 awaiting parent approval)
CREATE TABLE consent_requests (
    id BIGSERIAL PRIMARY KEY,
    child_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    parent_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    token_expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
);

-- Age verification records (for audit)
CREATE TABLE age_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    age_at_signup INT,
    is_minor BOOLEAN NOT NULL,
    requires_consent BOOLEAN NOT NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_method VARCHAR(50) -- 'SELF_DECLARED', 'PARENT_VERIFIED'
);
```

### Users Table Changes

```sql
-- Add columns to users table
ALTER TABLE users ADD COLUMN birth_date DATE;
ALTER TABLE users ADD COLUMN is_minor BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN parent_id BIGINT REFERENCES users(id);
ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'ACTIVE';
-- account_status: 'ACTIVE', 'PENDING_CONSENT', 'SUSPENDED', 'DELETED'

-- Index for parent-child lookups
CREATE INDEX idx_users_parent_id ON users(parent_id);
```

---

## API Endpoints

### Age Verification Endpoints

```
POST /api/auth/verify-age
Request:
{
  "birthDate": "2010-05-15"  // or
  "ageRange": "UNDER_13" | "13_TO_15" | "16_PLUS"
}
Response:
{
  "requiresConsent": true,
  "ageRange": "13_TO_15",
  "nextStep": "PARENT_EMAIL_REQUIRED" | "CONTINUE_SIGNUP" | "BLOCKED"
}
```

### Parent Consent Endpoints

```
POST /api/consent/request
Request:
{
  "parentEmail": "parent@example.com"
}
Response:
{
  "success": true,
  "message": "Consent request sent to parent"
}

GET /api/consent/verify/{token}
Response:
{
  "valid": true,
  "childName": "Johnny",
  "childEmail": "johnny@example.com",
  "expiresAt": "2024-12-20T00:00:00Z"
}

POST /api/consent/submit/{token}
Request:
{
  "dataCollectionConsent": true,
  "mediaConsent": false,
  "parentName": "Jane Doe",
  "signature": "Jane Doe"  // typed signature
}
Response:
{
  "success": true,
  "childAccountActivated": true
}
```

### Parent-Child Management Endpoints

```
POST /api/parent/children
Request:
{
  "name": "Johnny",
  "birthDate": "2015-03-20",
  "dataCollectionConsent": true,
  "mediaConsent": true
}
Response:
{
  "childId": 123,
  "name": "Johnny",
  "age": 9,
  "accountCreated": true
}

GET /api/parent/children
Response:
{
  "children": [
    {
      "id": 123,
      "name": "Johnny",
      "avatarUrl": null,
      "studioId": 1,
      "studioName": "Smith Piano Studio",
      "totalPoints": 150,
      "currentStreak": 5,
      "consents": {
        "dataCollection": true,
        "mediaSharing": false
      }
    }
  ]
}

PUT /api/parent/children/{childId}/consents
Request:
{
  "mediaConsent": true  // parent updating consent
}
Response:
{
  "success": true
}

DELETE /api/parent/children/{childId}
Response:
{
  "success": true,
  "message": "Child account and all data deleted"
}
```

### Account Deletion Endpoint

```
DELETE /api/users/me
Request:
{
  "confirmation": "DELETE MY ACCOUNT"
}
Response:
{
  "success": true,
  "message": "Account scheduled for deletion within 30 days"
}
```

---

## Frontend Components

### New Components Required

```
src/components/
├── onboarding/
│   ├── AgeVerificationStep.tsx      # Age check questions
│   ├── ParentEmailStep.tsx          # Collect parent email (13-15)
│   ├── PendingConsentScreen.tsx     # "Waiting for parent" screen
│   ├── BlockedUnder13Screen.tsx     # "Ask a parent" message
│   └── ConsentForm.tsx              # Parent consent form
├── parent/
│   ├── AddChildForm.tsx             # Parent adding child
│   ├── ChildAccountCard.tsx         # Child account management
│   ├── ConsentManagement.tsx        # Update consents
│   └── ChildActivityView.tsx        # View child's activity
└── settings/
    ├── AccountDeletion.tsx          # Delete account feature
    └── DataExport.tsx               # Export data feature
```

### AgeVerificationStep Component

```tsx
interface AgeVerificationStepProps {
  onComplete: (result: AgeVerificationResult) => void;
}

interface AgeVerificationResult {
  ageRange: 'UNDER_13' | '13_TO_15' | '16_PLUS';
  birthDate?: string;
  requiresConsent: boolean;
}

// UI Flow:
// 1. "To get started, we need to verify your age"
// 2. "Are you 16 years or older?"
//    - YES → Continue to role selection
//    - NO → "Are you 13 years or older?"
//      - YES → Collect parent email
//      - NO → Show "Ask a parent" screen
```

### ConsentForm Component

```tsx
interface ConsentFormProps {
  token: string;
  childName: string;
}

// Displays:
// - Child's name and info
// - Privacy policy summary (collapsible)
// - Terms of service summary (collapsible)
// - Required checkboxes:
//   [ ] Account Creation consent
//   [ ] Data Collection consent
//   [ ] Terms acceptance
// - Optional checkboxes:
//   [ ] Media sharing consent
// - Parent name input
// - Signature input (typed)
// - Submit button
```

---

## Email Templates

### Consent Request Email (to parent)

```
Subject: Action Required: Approve {childName}'s PianoStudio Account

Hi,

{childName} ({childEmail}) would like to create a PianoStudio account.

Since {childName} is under 16, we need your permission before they can use PianoStudio.

What is PianoStudio?
PianoStudio is a practice management app for piano students. It tracks practice time, assignments, and lets students participate in their studio community.

What data we collect:
- First name (displayed to studio members)
- Practice session data
- Posts and reactions in the studio feed

Click below to review and approve:
[Approve Account Button - link to /consent/{token}]

This link expires in 7 days.

If you didn't expect this email, you can ignore it.

Questions? Contact us at [SUPPORT_EMAIL]

---
PianoStudio
```

### Account Approved Email (to child)

```
Subject: Your PianoStudio Account is Ready!

Hi {childName},

Great news! Your parent has approved your PianoStudio account.

You can now log in and start tracking your practice!

[Log In Button]

Happy practicing!
```

---

## Implementation Phases

### Phase 1: Age Verification (Required Before Launch)
- [ ] Add AgeVerificationStep to onboarding flow
- [ ] Add age_verifications table
- [ ] Add birth_date and is_minor columns to users
- [ ] Block under-13 direct signups
- [ ] Update signup API to handle age verification

### Phase 2: Parent Consent Flow (Required Before Launch)
- [ ] Add parental_consents and consent_requests tables
- [ ] Create consent request API endpoints
- [ ] Create ConsentForm page (public, accessed via token)
- [ ] Email integration for consent requests
- [ ] Update user account status based on consent

### Phase 3: Parent-Child Management
- [ ] Add parent_id column to users
- [ ] Create parent dashboard child management section
- [ ] AddChildForm component
- [ ] Consent management for existing children
- [ ] Child activity view for parents

### Phase 4: Account Management
- [ ] Account deletion endpoint
- [ ] Data export endpoint
- [ ] Settings page with deletion option
- [ ] 30-day deletion grace period logic
- [ ] Automated deletion job

---

## Security Considerations

1. **Token Security**
   - Consent tokens are single-use
   - Tokens expire after 7 days
   - Tokens are cryptographically secure (UUID v4 or similar)

2. **Parent Verification**
   - Email verification confirms parent controls email
   - Consider requiring parent to also have Google OAuth account (stronger verification)

3. **Child Data Protection**
   - Children cannot DM other users
   - Children's posts visible only within studio
   - No public profiles

4. **Audit Trail**
   - All consent actions logged with timestamp and IP
   - Consent records retained for compliance

---

## Testing Scenarios

1. **Adult user (16+)** - Should skip consent flow
2. **Teen (13-15)** - Should require parent email and consent
3. **Child under 13** - Should be blocked, shown "ask parent" message
4. **Parent approving consent** - Token works, account activates
5. **Expired consent token** - Shows error, offers to resend
6. **Parent revoking consent** - Child account deactivated
7. **Parent deleting child account** - All child data removed
8. **Account deletion by user** - Scheduled deletion works

---

*Document Version: 1.0*
*Created: December 2024*
