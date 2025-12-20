-- Create badges table
CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500) NOT NULL,
    icon_url VARCHAR(500) NOT NULL,
    criteria VARCHAR(100) NOT NULL
);

-- Create student_badges table
CREATE TABLE student_badges (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_badges_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    CONSTRAINT unique_student_badge UNIQUE (student_id, badge_id)
);

-- Create indexes
CREATE INDEX idx_student_badges_student_id ON student_badges(student_id);
CREATE INDEX idx_student_badges_badge_id ON student_badges(badge_id);
CREATE INDEX idx_student_badges_earned_at ON student_badges(earned_at DESC);

-- Insert default badges
INSERT INTO badges (name, description, icon_url, criteria) VALUES
('First Practice', 'Complete your first practice session', 'https://example.com/badges/first-practice.png', 'sessions_1'),
('Week Warrior', 'Practice 7 days in a row', 'https://example.com/badges/week-warrior.png', 'streak_7'),
('Month Master', 'Practice 30 days in a row', 'https://example.com/badges/month-master.png', 'streak_30'),
('Century Club', 'Log 100 hours of practice', 'https://example.com/badges/century-club.png', 'hours_100'),
('Practice Perfectionist', 'Complete 10 assignments', 'https://example.com/badges/perfectionist.png', 'assignments_10');
