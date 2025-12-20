-- Create student_profiles table
CREATE TABLE student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    studio_id BIGINT NOT NULL,
    parent_id BIGINT,
    total_points INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_practice_date DATE,
    CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_profiles_studio FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_profiles_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_studio_id ON student_profiles(studio_id);
CREATE INDEX idx_student_profiles_parent_id ON student_profiles(parent_id);
CREATE INDEX idx_student_profiles_total_points ON student_profiles(total_points DESC);
