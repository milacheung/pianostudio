# Age Verification Flow - UI Design Specifications

## Overview

This document provides UI/UX design specifications for the age verification flow during PianoStudio onboarding. The flow ensures COPPA compliance while maintaining a friendly, non-intimidating experience.

---

## Design Principles

1. **Child-Friendly**: Use friendly language and illustrations
2. **Non-Intrusive**: Simple questions, not a "gated fortress" feel
3. **Clear Guidance**: Explain why we ask and what happens next
4. **Mobile-First**: Large touch targets, readable text

---

## Flow States

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ONBOARDING FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐                                                   │
│  │  Google OAuth    │                                                   │
│  │  Login Complete  │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  AGE CHECK STEP  │ ◄─── NEW STEP                                     │
│  │  "How old are    │                                                   │
│  │   you?"          │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│     ┌─────┼─────┐                                                       │
│     │     │     │                                                        │
│     ▼     ▼     ▼                                                        │
│  ┌─────┐ ┌─────┐ ┌─────┐                                                │
│  │Under│ │13-15│ │ 16+ │                                                │
│  │ 13  │ │     │ │     │                                                │
│  └──┬──┘ └──┬──┘ └──┬──┘                                                │
│     │       │       │                                                    │
│     ▼       ▼       ▼                                                    │
│  ┌─────┐ ┌─────┐ ┌─────────┐                                            │
│  │BLOCK│ │PARENT│ │  ROLE   │                                           │
│  │"Ask │ │EMAIL │ │SELECTION│                                           │
│  │adult"│ │STEP  │ │         │                                          │
│  └─────┘ └──┬──┘ └────┬────┘                                            │
│             │         │                                                  │
│             ▼         │                                                  │
│         ┌──────┐      │                                                  │
│         │PENDING│     │                                                  │
│         │CONSENT│     │                                                  │
│         └───┬───┘     │                                                  │
│             │         │                                                  │
│    [Parent  │         │                                                  │
│    approves]│         │                                                  │
│             │         │                                                  │
│             ▼         │                                                  │
│         ┌──────┐      │                                                  │
│         │ ROLE │◄─────┘                                                  │
│         │SELECT│                                                         │
│         └───┬──┘                                                         │
│             │                                                            │
│             ▼                                                            │
│         ┌──────┐                                                         │
│         │STUDIO│                                                         │
│         │ JOIN │                                                         │
│         └───┬──┘                                                         │
│             │                                                            │
│             ▼                                                            │
│         ┌──────┐                                                         │
│         │DASHBD│                                                         │
│         └──────┘                                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Screen Designs

### Screen 1: Age Verification Question

```
┌─────────────────────────────────────────────┐
│                                             │
│              🎹 PianoStudio                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │          [Piano Illustration]       │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│        Welcome! Let's get you set up.       │
│                                             │
│        First, a quick question:             │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │                                     │  │
│   │       Are you 16 or older?          │  │
│   │                                     │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │           ✓  Yes, I am 16+          │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │           No, I'm younger           │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   Why do we ask? We want to make sure       │
│   young musicians have a safe experience.   │
│                                             │
└─────────────────────────────────────────────┘
```

**Specifications:**
- **Background**: Light gradient (piano purple tint)
- **Illustration**: Friendly piano character or music notes
- **Buttons**: Full-width, 56px height, rounded corners
- **"Yes" button**: Primary style (piano purple)
- **"No" button**: Secondary/outline style
- **Helper text**: Small, muted color

---

### Screen 2: Minor Age Range (if "No" selected)

```
┌─────────────────────────────────────────────┐
│                                             │
│              🎹 PianoStudio                 │
│                                             │
│        Got it! One more question:           │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │                                     │  │
│   │       Are you 13 or older?          │  │
│   │                                     │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │     ✓  Yes, I'm between 13-15       │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │        No, I'm under 13             │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   ← Back                                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Specifications:**
- Similar layout to Screen 1
- Back button in bottom-left (text link style)

---

### Screen 3a: Under 13 - Blocked Screen

```
┌─────────────────────────────────────────────┐
│                                             │
│              🎹 PianoStudio                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │      [Adult & Child Illustration]   │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│         Ask a Grown-Up for Help!            │
│                                             │
│   For kids under 13, we need a parent       │
│   or guardian to set up your account.       │
│                                             │
│   Here's what to do:                        │
│                                             │
│   1. Ask your parent or guardian            │
│   2. They can create an account for you     │
│   3. Then you'll be ready to practice!      │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │     Show This to Your Parent →      │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   This button shows parent instructions     │
│                                             │
│   ← Start Over                              │
│                                             │
└─────────────────────────────────────────────┘
```

**Specifications:**
- **Tone**: Encouraging, not punishing
- **Illustration**: Friendly adult helping child
- **Button**: Opens a modal with parent instructions
- **No account created**: User session cleared on "Start Over"

---

### Screen 3b: Age 13-15 - Parent Email Required

```
┌─────────────────────────────────────────────┐
│                                             │
│              🎹 PianoStudio                 │
│                                             │
│          Almost There! 🎉                   │
│                                             │
│   Since you're under 16, we need your       │
│   parent or guardian's permission.          │
│                                             │
│   We'll send them a quick email to          │
│   approve your account.                     │
│                                             │
│   Parent/Guardian Email:                    │
│   ┌─────────────────────────────────────┐  │
│   │ parent@example.com                  │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   ℹ️ Make sure to use your parent's         │
│   actual email so they receive the request. │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │     Send Permission Request         │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   ← Back                                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Specifications:**
- **Email input**: Standard text input with email validation
- **Helper text**: Explains what will happen
- **Button**: Primary style, disabled until valid email

---

### Screen 4: Pending Consent Screen

```
┌─────────────────────────────────────────────┐
│                                             │
│              🎹 PianoStudio                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │       [Envelope Animation]          │   │
│  │           ✉️ → 📬                   │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│          Request Sent! ✓                    │
│                                             │
│   We've sent an email to:                   │
│   parent@example.com                        │
│                                             │
│   What happens next:                        │
│                                             │
│   1. Your parent checks their email         │
│   2. They click the approval link           │
│   3. You can start using PianoStudio!       │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │      Didn't receive it?             │  │
│   │      Resend Email                   │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   You can close this window.                │
│   We'll email you when approved!            │
│                                             │
└─────────────────────────────────────────────┘
```

**Specifications:**
- **Animation**: Simple envelope/checkmark animation
- **Resend**: Secondary button, 60-second cooldown
- **Status**: Could poll backend for approval status

---

### Screen 5: Parent Consent Form (accessed via email link)

```
┌─────────────────────────────────────────────┐
│                                             │
│              🎹 PianoStudio                 │
│         Parental Consent Form               │
│                                             │
│   ──────────────────────────────────────   │
│                                             │
│   Your child would like to join             │
│   PianoStudio:                              │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │  👤 Johnny Smith                    │  │
│   │     johnny@example.com              │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   By approving, you consent to:             │
│                                             │
│   ☑️ Account creation for your child        │
│   ☑️ Collection of practice data            │
│   ☑️ Display of first name to studio        │
│   ☑️ Terms of Service and Privacy Policy    │
│                                             │
│   Optional:                                 │
│   ☐ Allow photos/videos in studio feed      │
│                                             │
│   Your signature (type your name):          │
│   ┌─────────────────────────────────────┐  │
│   │                                     │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │      ✓ Approve Account              │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │        Decline                      │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   Questions? View our Privacy Policy        │
│                                             │
└─────────────────────────────────────────────┘
```

**Specifications:**
- **Accessible without login**: Public page, accessed via unique token
- **Required checkboxes**: Must all be checked to proceed
- **Signature field**: Text input, required
- **Decline button**: Secondary style, confirms before declining

---

## Component Specifications

### AgeVerificationStep.tsx

```typescript
interface AgeVerificationStepProps {
  onComplete: (result: AgeVerificationResult) => void;
  onBack?: () => void;
}

interface AgeVerificationResult {
  ageRange: 'UNDER_13' | '13_TO_15' | '16_PLUS';
  requiresParentConsent: boolean;
}

// State machine:
// 'initial' -> user sees "Are you 16+" question
// '16_plus' -> proceed to role selection
// 'under_16' -> user sees "Are you 13+" question
// '13_to_15' -> proceed to parent email step
// 'under_13' -> show blocked screen
```

### ParentEmailStep.tsx

```typescript
interface ParentEmailStepProps {
  childEmail: string;
  childName: string;
  onSubmit: (parentEmail: string) => Promise<void>;
  onBack: () => void;
}

// Validation:
// - Valid email format
// - Not same as child's email
// - Not a known spam/temp email domain (optional)
```

### PendingConsentScreen.tsx

```typescript
interface PendingConsentScreenProps {
  parentEmail: string;
  onResendEmail: () => Promise<void>;
}

// Features:
// - Resend button with cooldown
// - Optional polling for status updates
// - Clear next steps messaging
```

### BlockedUnder13Screen.tsx

```typescript
interface BlockedUnder13ScreenProps {
  onStartOver: () => void;
  onShowParentInfo: () => void;
}

// Features:
// - Friendly, encouraging messaging
// - Button to show parent information modal
// - Start over button clears session
```

### ConsentForm.tsx (public page)

```typescript
interface ConsentFormProps {
  token: string;
}

// States:
// - Loading: Validating token
// - Invalid: Token expired or invalid
// - Form: Show consent form
// - Success: Account approved
// - Declined: Account declined

// Required consents:
// - Account creation
// - Data collection
// - Terms & Privacy acceptance

// Optional consents:
// - Media sharing
```

---

## Color Palette for This Flow

| Element | Color | Usage |
|---------|-------|-------|
| Primary buttons | `#7B68EE` | Continue, Submit actions |
| Secondary buttons | `#E2E8F0` | Back, Alternative choices |
| Success state | `#10B981` | Approval confirmed |
| Warning text | `#F59E0B` | "Under 13" messaging |
| Error state | `#EF4444` | Invalid email, declined |
| Background | `#F8FAFC` | Page background |
| Card background | `#FFFFFF` | Content cards |

---

## Accessibility Requirements

1. **Keyboard Navigation**: All buttons focusable with tab
2. **Screen Reader**: Proper ARIA labels on all interactive elements
3. **Color Contrast**: Minimum 4.5:1 for text
4. **Touch Targets**: Minimum 48x48px
5. **Error Messages**: Clear, associated with input fields

---

## Implementation Checklist

### Frontend
- [ ] Create `AgeVerificationStep` component
- [ ] Create `ParentEmailStep` component
- [ ] Create `PendingConsentScreen` component
- [ ] Create `BlockedUnder13Screen` component
- [ ] Create `ConsentForm` page (public route)
- [ ] Add age verification to onboarding flow
- [ ] Add consent page route (`/consent/:token`)
- [ ] Style all components per design specs

### Backend
- [ ] Add `POST /api/auth/verify-age` endpoint
- [ ] Add `POST /api/consent/request` endpoint
- [ ] Add `GET /api/consent/verify/:token` endpoint
- [ ] Add `POST /api/consent/submit/:token` endpoint
- [ ] Create email template for consent request
- [ ] Add database tables per schema spec

---

*Document Version: 1.0*
*Created: December 2024*
