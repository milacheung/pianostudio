-- V8: Support parent-created students
-- Students are now child profiles managed by parents, not separate user accounts

-- Make user_id nullable (new students won't have user accounts)
ALTER TABLE student_profiles ALTER COLUMN user_id DROP NOT NULL;

-- Drop the unique constraint on user_id (since it can be null now)
ALTER TABLE student_profiles DROP CONSTRAINT IF EXISTS student_profiles_user_id_key;

-- Add new columns for student info (previously came from User)
ALTER TABLE student_profiles ADD COLUMN name VARCHAR(255);
ALTER TABLE student_profiles ADD COLUMN age INTEGER;
ALTER TABLE student_profiles ADD COLUMN grade VARCHAR(50);

-- For existing data: copy name from linked user to student_profile
UPDATE student_profiles sp
SET name = u.name
FROM users u
WHERE sp.user_id = u.id AND sp.name IS NULL;

-- Make parent_id NOT NULL for new flow (parent manages the student)
-- But keep it nullable for backwards compatibility with existing data
-- ALTER TABLE student_profiles ALTER COLUMN parent_id SET NOT NULL;

-- Add index for parent lookups
CREATE INDEX IF NOT EXISTS idx_student_profiles_parent_id ON student_profiles(parent_id);
