-- V10: Add age verification and parental consent tables for COPPA compliance

-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_minor BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'ACTIVE';

-- Create index for parent-child lookups
CREATE INDEX IF NOT EXISTS idx_users_parent_user_id ON users(parent_user_id);

-- Add check constraint for account_status
ALTER TABLE users ADD CONSTRAINT users_account_status_check
    CHECK (account_status IN ('ACTIVE', 'PENDING_CONSENT', 'SUSPENDED', 'DELETED'));

-- Create age_verifications table (audit trail for age verification)
CREATE TABLE age_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    age_at_signup INT,
    age_range VARCHAR(20) NOT NULL, -- 'UNDER_13', '13_TO_15', '16_PLUS'
    is_minor BOOLEAN NOT NULL,
    requires_consent BOOLEAN NOT NULL,
    verification_method VARCHAR(50) DEFAULT 'SELF_DECLARED', -- 'SELF_DECLARED', 'PARENT_VERIFIED'
    verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    CONSTRAINT age_verifications_age_range_check CHECK (age_range IN ('UNDER_13', '13_TO_15', '16_PLUS'))
);

CREATE INDEX idx_age_verifications_user_id ON age_verifications(user_id);

-- Create consent_requests table (pending consent requests sent to parents)
CREATE TABLE consent_requests (
    id BIGSERIAL PRIMARY KEY,
    child_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    token_expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    CONSTRAINT consent_requests_status_check CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'))
);

CREATE INDEX idx_consent_requests_child_user_id ON consent_requests(child_user_id);
CREATE INDEX idx_consent_requests_token ON consent_requests(token);
CREATE INDEX idx_consent_requests_status ON consent_requests(status);

-- Create parental_consents table (records of granted consents)
CREATE TABLE parental_consents (
    id BIGSERIAL PRIMARY KEY,
    child_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    parent_email VARCHAR(255) NOT NULL,
    consent_type VARCHAR(50) NOT NULL, -- 'ACCOUNT_CREATION', 'DATA_COLLECTION', 'MEDIA_SHARING', 'TERMS_ACCEPTANCE'
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    consent_date TIMESTAMP,
    consent_ip VARCHAR(45),
    consent_method VARCHAR(50) DEFAULT 'ELECTRONIC', -- 'ELECTRONIC', 'PHYSICAL_FORM'
    parent_signature VARCHAR(255), -- Typed signature
    revoked_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parental_consents_consent_type_check CHECK (consent_type IN ('ACCOUNT_CREATION', 'DATA_COLLECTION', 'MEDIA_SHARING', 'TERMS_ACCEPTANCE'))
);

CREATE INDEX idx_parental_consents_child_user_id ON parental_consents(child_user_id);
CREATE INDEX idx_parental_consents_parent_user_id ON parental_consents(parent_user_id);
CREATE INDEX idx_parental_consents_consent_type ON parental_consents(consent_type);

-- Add unique constraint for one consent type per child
CREATE UNIQUE INDEX idx_parental_consents_child_type ON parental_consents(child_user_id, consent_type);
