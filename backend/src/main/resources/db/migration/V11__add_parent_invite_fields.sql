-- Add parent invite fields to student_profiles for teacher-initiated onboarding
-- This allows teachers to create students and optionally invite parents via email

ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_invite_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS parent_invited_at TIMESTAMP;

-- parent_invite_status values:
-- 'none' - no parent email provided or parent not invited
-- 'invited' - invite email sent to parent
-- 'claimed' - parent has signed up and claimed this student

COMMENT ON COLUMN student_profiles.parent_email IS 'Email address for parent (for invites when no parent account exists)';
COMMENT ON COLUMN student_profiles.parent_invite_status IS 'Status of parent invitation: none, invited, claimed';
COMMENT ON COLUMN student_profiles.parent_invited_at IS 'When the parent invite was sent';

-- Index for looking up students by parent email (for claiming)
CREATE INDEX IF NOT EXISTS idx_student_profiles_parent_email ON student_profiles(parent_email);
