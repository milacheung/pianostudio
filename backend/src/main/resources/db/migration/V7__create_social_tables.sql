-- Create posts table
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL,
    studio_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    media_url VARCHAR(500),
    media_type VARCHAR(20) CHECK (media_type IN ('IMAGE', 'VIDEO', 'AUDIO')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_studio FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE
);

-- Create reactions table
CREATE TABLE reactions (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    CONSTRAINT fk_reactions_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_post_emoji UNIQUE (post_id, user_id, emoji)
);

-- Create challenges table
CREATE TABLE challenges (
    id BIGSERIAL PRIMARY KEY,
    studio_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    goal_minutes INTEGER NOT NULL,
    current_minutes INTEGER NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CONSTRAINT fk_challenges_studio FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_studio_id ON posts(studio_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_challenges_studio_id ON challenges(studio_id);
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(recipient_id, read_at) WHERE read_at IS NULL;
