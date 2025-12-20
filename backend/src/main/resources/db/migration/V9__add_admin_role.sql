-- V9: Add ADMIN role support
-- Update the role check constraint to include ADMIN

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('TEACHER', 'STUDENT', 'PARENT', 'ADMIN'));
