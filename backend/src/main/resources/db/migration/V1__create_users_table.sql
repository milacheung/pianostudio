-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL CHECK (role IN ('TEACHER', 'STUDENT', 'PARENT')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
