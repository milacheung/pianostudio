# Settings Components

COPPA-compliant components for account management and deletion.

## Components

### DeleteAccountDialog

A modal dialog that allows users to permanently delete their account with proper warnings and confirmation.

**Features:**
- Requires typing "DELETE" to confirm (prevents accidental deletion)
- Shows clear warnings about data loss
- Prevents teachers from deleting account if they have students
- Handles loading states during deletion
- Automatically logs out and redirects to login after successful deletion

**Props:**
```typescript
interface DeleteAccountDialogProps {
  open: boolean;           // Controls dialog visibility
  onClose: () => void;     // Callback when dialog is closed
  hasStudents?: boolean;   // For teachers - prevents deletion if true
}
```

**Usage:**
```tsx
import { DeleteAccountDialog } from '@/components/settings';

function MyComponent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasStudents = true; // For teachers, check if they have students

  return (
    <>
      <button onClick={() => setDialogOpen(true)}>
        Delete Account
      </button>

      <DeleteAccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        hasStudents={hasStudents}
      />
    </>
  );
}
```

### ProfileSettingsSection

A comprehensive profile settings card that displays user information and provides account management options.

**Features:**
- Shows user avatar, name, email, role badge
- Displays studio information (for teachers/students)
- Shows invite code (for teachers)
- Includes "Danger Zone" section with delete account option
- Responsive design with proper touch targets
- Integrates with DeleteAccountDialog

**Props:**
```typescript
interface ProfileSettingsSectionProps {
  user: User;              // Current user object
  hasStudents?: boolean;   // For teachers - affects delete account behavior
}
```

**Usage:**
```tsx
import { ProfileSettingsSection } from '@/components/settings';
import { useAuth } from '@/context/AuthContext';

function ProfilePage() {
  const { user } = useAuth();
  const hasStudents = false; // Fetch from API for teachers

  if (!user) return null;

  return (
    <div className="container max-w-2xl py-6">
      <ProfileSettingsSection
        user={user}
        hasStudents={hasStudents}
      />
    </div>
  );
}
```

## Integration Example

Here's how to integrate ProfileSettingsSection into the existing ProfilePage:

```tsx
// /Users/milacheung/code/pianostudio/frontend/src/pages/ProfilePage.tsx

import { ProfileSettingsSection } from '@/components/settings';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hasStudents, setHasStudents] = useState(false);

  // For teachers, check if they have students
  useEffect(() => {
    const checkStudents = async () => {
      if (user?.role === 'TEACHER') {
        try {
          const students = await apiService.getMyStudioStudents();
          setHasStudents(students.length > 0);
        } catch (error) {
          console.error('Failed to fetch students:', error);
        }
      }
    };

    checkStudents();
  }, [user]);

  // ... existing stats and profile header code ...

  return (
    <div className="container max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {/* Existing profile header and stats */}
        {/* ... */}

        {/* Replace Account Settings card with: */}
        {user && (
          <ProfileSettingsSection
            user={user}
            hasStudents={hasStudents}
          />
        )}
      </div>
    </div>
  );
}
```

## API Endpoint

The delete account functionality requires this backend endpoint:

```
DELETE /api/users/me
Response: { success: boolean, message: string }
```

**Backend Implementation Notes:**
- Verify user is authenticated (JWT token)
- For teachers: check if they have students and prevent deletion if true
- Soft delete or hard delete user data (consider data retention policies)
- Delete or anonymize:
  - User profile
  - Practice sessions
  - Posts and reactions
  - Studio memberships
  - Consent records (COPPA compliance)
- Return success/error response

## COPPA Compliance

These components support COPPA compliance by:

1. **Clear Communication**: Users see exactly what data will be deleted
2. **Parental Control**: Teachers (who may oversee minors) must remove students first
3. **Data Deletion**: Permanent removal of all personal data
4. **Confirmation**: Requires explicit confirmation to prevent accidents
5. **Audit Trail**: Backend should log deletion requests for compliance

## Styling

Components use the PianoStudio design system:
- **Primary color**: Piano Purple (#7B68EE)
- **Destructive actions**: Red destructive variant
- **Typography**: Fredoka for headings (font-heading)
- **Touch targets**: Minimum 48x48px for mobile
- **Responsive**: Mobile-first design with sm: breakpoints

## Dependencies

- `@radix-ui/react-alert-dialog` - AlertDialog primitive
- `lucide-react` - Icons
- `react-router-dom` - Navigation after deletion
- shadcn/ui components: Dialog, Button, Input, Label, Card, Avatar, Badge

All dependencies are already installed in the project.
