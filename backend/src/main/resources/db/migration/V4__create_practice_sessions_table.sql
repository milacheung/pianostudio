-- Create practice_sessions table
CREATE TABLE practice_sessions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    minutes INTEGER NOT NULL,
    assignment_id BIGINT,
    points_earned INTEGER NOT NULL,
    CONSTRAINT fk_practice_sessions_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_practice_sessions_student_id ON practice_sessions(student_id);
CREATE INDEX idx_practice_sessions_start_time ON practice_sessions(start_time DESC);
CREATE INDEX idx_practice_sessions_assignment_id ON practice_sessions(assignment_id);
