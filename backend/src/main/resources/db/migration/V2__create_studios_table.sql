-- Create studios table
CREATE TABLE studios (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    invite_code VARCHAR(6) NOT NULL UNIQUE,
    teacher_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_studios_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_studios_teacher_id ON studios(teacher_id);
CREATE INDEX idx_studios_invite_code ON studios(invite_code);
