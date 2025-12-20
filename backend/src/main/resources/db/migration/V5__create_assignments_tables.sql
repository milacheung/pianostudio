-- Create assignments table
CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    studio_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_minutes INTEGER NOT NULL,
    due_date DATE NOT NULL,
    attachments JSONB,
    points_value INTEGER NOT NULL DEFAULT 25,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignments_studio FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE
);

-- Add foreign key to practice_sessions
ALTER TABLE practice_sessions
ADD CONSTRAINT fk_practice_sessions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL;

-- Create student_assignments table
CREATE TABLE student_assignments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    assignment_id BIGINT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    progress_minutes INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP,
    CONSTRAINT fk_student_assignments_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_assignments_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT unique_student_assignment UNIQUE (student_id, assignment_id)
);

-- Create indexes
CREATE INDEX idx_assignments_studio_id ON assignments(studio_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_student_assignments_student_id ON student_assignments(student_id);
CREATE INDEX idx_student_assignments_assignment_id ON student_assignments(assignment_id);
CREATE INDEX idx_student_assignments_completed ON student_assignments(completed);
