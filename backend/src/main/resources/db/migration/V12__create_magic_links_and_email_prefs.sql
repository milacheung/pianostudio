-- Phase 2: Magic Links for parent authentication
CREATE TABLE IF NOT EXISTS magic_links (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_id BIGINT REFERENCES users(id),  -- null if parent hasn't signed up yet
    student_id BIGINT REFERENCES student_profiles(id),  -- which student this link is for
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,  -- null if not yet used
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_magic_links_token ON magic_links(token);
CREATE INDEX idx_magic_links_email ON magic_links(email);

-- Phase 3: Email preferences for weekly reports
CREATE TABLE IF NOT EXISTS email_preferences (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id),  -- null if user hasn't signed up yet
    weekly_report BOOLEAN DEFAULT true,
    practice_reminders BOOLEAN DEFAULT false,
    achievement_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_preferences_email ON email_preferences(email);
CREATE INDEX idx_email_preferences_user_id ON email_preferences(user_id);

COMMENT ON TABLE magic_links IS 'Passwordless login tokens for parents';
COMMENT ON TABLE email_preferences IS 'Email notification settings per user/email';
