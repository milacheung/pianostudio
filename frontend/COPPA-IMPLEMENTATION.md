# COPPA Compliance Implementation Guide

This document describes the COPPA-compliant age verification and parental consent flow implemented in PianoStudio.

## Overview

The Children's Online Privacy Protection Act (COPPA) requires parental consent for users under 13 years old. PianoStudio implements a comprehensive age verification and consent flow to ensure compliance.

## Flow Diagram

```
User Signs Up
    |
    v
Age Verification (AgeVerificationStep)
    |
    +-- User is 16+ → Continue normal onboarding
    |
    +-- User is 13-15 → Continue normal onboarding (consent recommended but not required)
    |
    +-- User is under 13 → Require Parental Consent
            |
            v
        Request Parent Email (ParentEmailStep)
            |
            v
        Show Pending Screen (PendingConsentScreen)
            |
            v
        Parent receives email with consent link
            |
            v
        Parent visits /consent/:token (ConsentFormPage)
            |
            +-- Parent Approves → User can continue
            |
            +-- Parent Rejects → User account suspended
```

## Components

### 1. AgeVerificationStep.tsx
**Location:** `/src/components/onboarding/AgeVerificationStep.tsx`

**Purpose:** Collects user's birth date using accessible month/day/year dropdowns.

**Features:**
- Month/Day/Year dropdowns (more accessible than date input)
- Validates minimum age (4 years old)
- Validates date is not in the future
- Friendly UI with clear messaging
- Calls `POST /api/age-verification/verify`

**Props:**
```typescript
interface AgeVerificationStepProps {
  onVerified: (result: AgeVerificationResponse) => void;
}
```

**Usage Example:**
```tsx
import { AgeVerificationStep } from '@/components/onboarding';

<AgeVerificationStep
  onVerified={(result) => {
    if (result.requiresConsent) {
      // Show ParentEmailStep
    } else {
      // Continue normal onboarding
    }
  }}
/>
```

### 2. ParentEmailStep.tsx
**Location:** `/src/components/onboarding/ParentEmailStep.tsx`

**Purpose:** Collects parent/guardian email for consent request.

**Features:**
- Email validation
- Clear explanation of consent process
- What happens next section
- Privacy assurance messaging
- Calls `POST /api/consent/request`

**Props:**
```typescript
interface ParentEmailStepProps {
  onConsentRequested: (result: ConsentRequestResponse) => void;
}
```

**Usage Example:**
```tsx
import { ParentEmailStep } from '@/components/onboarding';

<ParentEmailStep
  onConsentRequested={(result) => {
    // Show PendingConsentScreen with parent email
  }}
/>
```

### 3. PendingConsentScreen.tsx
**Location:** `/src/components/onboarding/PendingConsentScreen.tsx`

**Purpose:** Waiting screen while parent reviews consent request.

**Features:**
- Auto-polls consent status every 30 seconds
- Manual "Check Status" button
- "Resend Email" functionality
- Clear instructions for what parent needs to do
- Helpful troubleshooting tips
- Calls `GET /api/consent/status`

**Props:**
```typescript
interface PendingConsentScreenProps {
  parentEmail: string;
  onConsentApproved: () => void;
}
```

**Usage Example:**
```tsx
import { PendingConsentScreen } from '@/components/onboarding';

<PendingConsentScreen
  parentEmail="parent@example.com"
  onConsentApproved={() => {
    // Continue to rest of onboarding
  }}
/>
```

### 4. ConsentFormPage.tsx
**Location:** `/src/pages/ConsentFormPage.tsx`

**Purpose:** Public page for parents to review and approve consent.

**Features:**
- No authentication required (public route)
- Comprehensive COPPA disclosure
- Clear explanation of data collection
- Privacy protections section
- Electronic signature (typed name)
- Approve/Reject buttons
- Success/error states
- Token validation and expiration handling
- Calls `GET /api/public/consent/form/:token` and `POST /api/public/consent/respond`

**Route:** `/consent/:token`

**Usage:**
Parents receive an email with a link like:
```
https://pianostudio.com/consent/abc123xyz
```

## API Integration

### Types Added to `/src/types/index.ts`

```typescript
export type AgeRange = 'UNDER_13' | 'AGE_13_TO_15' | 'AGE_16_PLUS';
export type AccountStatus = 'ACTIVE' | 'PENDING_CONSENT' | 'SUSPENDED' | 'DELETED';
export type ConsentRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface AgeVerificationResponse {
  id: number;
  ageRange: AgeRange;
  isMinor: boolean;
  requiresConsent: boolean;
  verificationMethod: string;
}

export interface ConsentRequestResponse {
  id: number;
  parentEmail: string;
  status: ConsentRequestStatus;
  tokenExpiresAt: string;
  createdAt: string;
  respondedAt?: string;
  expired: boolean;
}

export interface ConsentFormData {
  childFirstName: string;
  parentEmail: string;
  valid: boolean;
  expired: boolean;
  message?: string;
}

export interface ConsentStatusResponse {
  accountStatus: AccountStatus;
  consentRequestStatus?: ConsentRequestStatus;
  hasActiveConsent: boolean;
  parentEmail?: string;
  message: string;
}
```

### API Service Functions Added to `/src/services/api.ts`

```typescript
// Age Verification
async verifyAge(birthDate: string): Promise<AgeVerificationResponse>
async getAgeVerificationStatus(): Promise<AgeVerificationResponse>

// Consent (Authenticated)
async requestParentalConsent(parentEmail: string): Promise<ConsentRequestResponse>
async getConsentStatus(): Promise<ConsentStatusResponse>

// Public Consent (No Auth)
async getConsentFormData(token: string): Promise<ConsentFormData>
async submitConsentResponse(token: string, approved: boolean, parentSignature?: string): Promise<ConsentRequestResponse>
```

## Integration Example

Here's how to integrate the COPPA flow into your onboarding process:

```tsx
import { useState } from 'react';
import {
  AgeVerificationStep,
  ParentEmailStep,
  PendingConsentScreen
} from '@/components/onboarding';
import type { AgeVerificationResponse, ConsentRequestResponse } from '@/types';

export function OnboardingFlow() {
  const [step, setStep] = useState<'age' | 'parentEmail' | 'pending' | 'complete'>('age');
  const [ageVerification, setAgeVerification] = useState<AgeVerificationResponse | null>(null);
  const [parentEmail, setParentEmail] = useState('');

  const handleAgeVerified = (result: AgeVerificationResponse) => {
    setAgeVerification(result);

    if (result.requiresConsent) {
      setStep('parentEmail');
    } else {
      // User is 13+ or has existing consent
      setStep('complete');
    }
  };

  const handleConsentRequested = (result: ConsentRequestResponse) => {
    setParentEmail(result.parentEmail);
    setStep('pending');
  };

  const handleConsentApproved = () => {
    setStep('complete');
  };

  return (
    <div>
      {step === 'age' && (
        <AgeVerificationStep onVerified={handleAgeVerified} />
      )}

      {step === 'parentEmail' && (
        <ParentEmailStep onConsentRequested={handleConsentRequested} />
      )}

      {step === 'pending' && (
        <PendingConsentScreen
          parentEmail={parentEmail}
          onConsentApproved={handleConsentApproved}
        />
      )}

      {step === 'complete' && (
        <div>Continue with rest of onboarding...</div>
      )}
    </div>
  );
}
```

## Design System Compliance

All components follow PianoStudio's design system:

- **Colors:** Uses `piano-purple`, `piano-purple-dark`, `piano-pink`, etc.
- **Typography:** Uses `font-heading` (Fredoka) and default body font (Inter)
- **Layout:** Consistent with existing onboarding components (RoleCard, etc.)
- **Touch Targets:** All buttons meet 48px minimum (12px height = 48px with padding)
- **Spacing:** Uses consistent padding and gaps
- **Shadows:** Uses `shadow-md` for cards
- **Rounded Corners:** Uses `rounded-2xl` for main containers

## Accessibility

All components meet WCAG 2.1 AA standards:

- **Keyboard Navigation:** All interactive elements are keyboard accessible
- **Focus Indicators:** Clear focus states on all inputs and buttons
- **Labels:** All form inputs have proper labels
- **Error Messages:** Clear, descriptive error messages
- **ARIA Attributes:** Proper role attributes for emojis
- **Screen Reader Support:** Meaningful text and proper semantic HTML

## Mobile-First Design

Components are fully responsive:

- **Mobile (default):** Optimized for small screens
- **Desktop (md:):** Enhanced layout for larger screens
- **Touch-Friendly:** Large tap targets (48px minimum)
- **Readable:** Minimum 15px font size for body text

## Testing Recommendations

### Unit Tests
- Test date validation logic in AgeVerificationStep
- Test email validation in ParentEmailStep
- Test consent status polling in PendingConsentScreen

### Integration Tests
- Test complete flow from age verification to consent approval
- Test error handling for expired/invalid tokens
- Test resend email functionality

### E2E Tests
- Test parent consent form submission
- Test approval and rejection flows
- Test token expiration handling

## Privacy and Security

- Birth dates are securely transmitted and stored
- Parent emails are only used for consent verification
- Consent tokens expire after a set period (configured in backend)
- No sensitive data is exposed in URLs or client-side storage
- All API calls use proper authentication except public consent endpoints

## Future Enhancements

Potential improvements for future iterations:

1. **SMS Consent:** Allow parents to respond via SMS
2. **Multi-Language:** Support for non-English speakers
3. **Consent History:** Show parents all active consents
4. **Batch Consent:** Allow parents to consent for multiple children at once
5. **Consent Revocation:** UI for parents to revoke consent
6. **Data Export:** Allow parents to download child's data
7. **Account Deletion:** Self-service account deletion for parents

## Support

For questions or issues with the COPPA implementation, contact:
- **Email:** privacy@pianostudio.com
- **Documentation:** See backend API docs for endpoint details
