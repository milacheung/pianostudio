# Assignment Feature Architecture

## Component Hierarchy

```
App.tsx
  └── Routes
      └── /assignments
          └── AssignmentsPage.tsx (Main Container)
              ├── AssignmentCard.tsx (List Item)
              │   ├── Teacher View: Edit + Delete buttons
              │   └── Student View: Log Progress button + Progress bar
              │
              ├── CreateAssignmentModal.tsx (Teacher Only)
              │   ├── Create Mode: Empty form
              │   └── Edit Mode: Pre-filled form
              │
              └── AssignmentProgressDialog.tsx (Student Only)
                  ├── Current progress display
                  ├── Minutes input field
                  └── New progress preview
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     AssignmentsPage                         │
│                                                              │
│  State:                                                      │
│  - assignments: Assignment[]                                │
│  - createModalOpen: boolean                                 │
│  - progressDialogOpen: boolean                              │
│  - editingAssignment: Assignment | null                     │
│  - selectedAssignment: Assignment | null                    │
│                                                              │
│  Effects:                                                    │
│  - Load assignments on mount (role-based)                   │
│                                                              │
│  Handlers:                                                   │
│  - handleCreateOrUpdate() → API → reload assignments        │
│  - handleDelete() → API → reload assignments                │
│  - handleLogProgress() → API → reload assignments           │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼──────┐    ┌──────▼──────┐
            │ apiService   │    │  useToast   │
            └──────────────┘    └─────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
┌───────▼──┐ ┌──────▼───┐ ┌────▼──────┐
│ GET      │ │ POST     │ │ PUT       │
│ /api/    │ │ /api/    │ │ /api/     │
│ assign.  │ │ assign.  │ │ assign.   │
└──────────┘ └──────────┘ └───────────┘
```

## API Endpoints by Role

### Teacher Endpoints
```
GET    /api/assignments              → All studio assignments
POST   /api/assignments              → Create new assignment
PUT    /api/assignments/{id}         → Update assignment
DELETE /api/assignments/{id}         → Delete assignment
```

### Student Endpoints
```
GET    /api/assignments/my-assignments  → Student's assignments with progress
PUT    /api/assignments/{id}/progress   → Log practice minutes
```

## State Management Flow

### Teacher: Create Assignment
```
1. User clicks "Create" button
2. AssignmentsPage sets createModalOpen = true
3. CreateAssignmentModal renders with empty form
4. User fills form and clicks "Create"
5. AssignmentsPage.handleCreateOrUpdate() calls apiService.createAssignment()
6. Success: toast notification, reload assignments, close modal
7. Error: toast error, keep modal open
```

### Teacher: Edit Assignment
```
1. User clicks "Edit" on AssignmentCard
2. AssignmentsPage sets editingAssignment and createModalOpen = true
3. CreateAssignmentModal renders with pre-filled form
4. User updates form and clicks "Update"
5. AssignmentsPage.handleCreateOrUpdate() calls apiService.updateAssignment()
6. Success: toast notification, reload assignments, close modal
7. Error: toast error, keep modal open
```

### Teacher: Delete Assignment
```
1. User clicks trash icon on AssignmentCard
2. AssignmentsPage.handleDelete() shows confirm dialog
3. User confirms deletion
4. API call to delete assignment
5. Success: toast notification, reload assignments
6. Error: toast error, keep modal open
```

### Student: Log Progress
```
1. User clicks "Log Progress" on AssignmentCard
2. AssignmentsPage sets selectedAssignment and progressDialogOpen = true
3. AssignmentProgressDialog renders with current progress
4. User enters practice minutes
5. Dialog shows preview of new progress
6. User clicks "Log Progress"
7. AssignmentsPage.handleProgressSubmit() calls apiService.updateAssignmentProgress()
8. Success: toast notification, reload assignments, close dialog
9. Error: toast error, keep dialog open
```

## Type System

```typescript
// Core assignment type from backend
interface Assignment {
  id: number;
  studioId: number;
  title: string;
  description: string;
  goalMinutes: number;
  dueDate: string;
  attachments?: string;
  pointsValue: number;
  createdAt?: string;
  studentProgress?: StudentAssignmentProgress;  // Only for students
}

// Student progress (nested in Assignment)
interface StudentAssignmentProgress {
  progressMinutes: number;
  completed: boolean;
  completedAt?: string;
  progressPercentage: number;  // Calculated on backend
}

// Form data for create/edit
interface AssignmentFormData {
  title: string;
  description: string;
  goalMinutes: number;
  dueDate: string;  // YYYY-MM-DD format
  pointsValue: number;
  attachments?: string;
}
```

## Component Props

### AssignmentCard
```typescript
interface AssignmentCardProps {
  assignment: Assignment;
  isTeacher?: boolean;
  onLogProgress?: (assignment: Assignment) => void;
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignment: Assignment) => void;
}
```

### CreateAssignmentModal
```typescript
interface CreateAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  assignment?: Assignment | null;  // For edit mode
}
```

### AssignmentProgressDialog
```typescript
interface AssignmentProgressDialogProps {
  open: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onSubmit: (minutes: number) => Promise<void>;
}
```

## Styling & Design System

### Colors (from tailwind.config.js)
```javascript
piano-purple: '#7B68EE'       // Primary actions, progress bars
piano-purple-dark: '#5847C7'  // Hover states
piano-pink: '#FF6B9D'         // Not used in assignments
piano-teal: '#4ECDC4'         // Completed badge
piano-gold: '#FFD700'         // Points badge
```

### Component Classes
```css
.card-rounded           → Border radius for cards
.bg-piano-purple        → Primary button background
.text-piano-purple      → Progress text color
.bg-piano-gold          → Points badge background
.bg-piano-teal          → Completed badge background
```

### Responsive Breakpoints
```
Mobile:  < 640px  (default)
Tablet:  640px - 1024px
Desktop: > 1024px
```

## Error Handling

### Form Validation
- Title: Required, non-empty
- Description: Required, non-empty
- Goal Minutes: Required, > 0
- Due Date: Required, valid date
- Points: Required, > 0
- Attachments: Optional, no validation

### API Error Handling
```typescript
try {
  await apiService.createAssignment(data);
  toast({ title: 'Success', description: '...' });
} catch (error) {
  console.error('Failed to save:', error);
  toast({ variant: 'destructive', title: 'Error', description: '...' });
  throw error;  // Prevent modal from closing
}
```

### Loading States
- Page load: Spinner centered on page
- Form submit: Button shows "Saving..." and is disabled
- Delete: No explicit loading state (quick operation)

## Accessibility Features

- Semantic HTML (form elements, labels)
- ARIA labels on icons
- Focus management in modals
- Keyboard navigation support
- Error messages announced
- Touch targets >= 48x48px
- Color contrast WCAG AA compliant

## Performance Optimizations

- Assignments sorted on client side (not re-fetched)
- Toast notifications don't trigger re-renders
- Modals unmount when closed
- Progress bars use CSS transforms (GPU accelerated)
- Images lazy-loaded (if avatars added)

## Future Considerations

1. **Pagination**: If assignments > 50, implement pagination
2. **Optimistic Updates**: Update UI before API response
3. **Real-time Updates**: WebSocket for live progress updates
4. **Caching**: Cache assignments with React Query or SWR
5. **Offline Support**: Queue progress updates for later sync
6. **Search/Filter**: Add search bar and filter dropdowns
7. **Bulk Operations**: Select multiple assignments for batch actions
