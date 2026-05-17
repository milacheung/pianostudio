-- Knowledge Assistant: student pieces, lesson notes, and exam tracking fields
-- These tables power the pre-lesson brief feature: a RAG-generated summary
-- synthesizing practice logs + lesson note tags + syllabus context + exam timeline.

CREATE TABLE student_pieces (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id),
    title VARCHAR(255) NOT NULL,
    composer VARCHAR(255),
    exam_board VARCHAR(50),        -- ABRSM, RCM, AMEB, TRINITY, or null for non-exam pieces
    grade_level VARCHAR(20),       -- e.g. "Grade 2", "Level 3"
    status VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, completed, dropped
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE lesson_notes (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id),
    piece_id BIGINT REFERENCES student_pieces(id),   -- nullable: note may not be piece-specific
    teacher_id BIGINT NOT NULL REFERENCES users(id),
    lesson_date DATE NOT NULL,
    -- Tags for aggregation and RAG query enrichment (e.g. {"thumb_crossing","tempo_rushing"})
    observation_tags TEXT[],
    teacher_notes TEXT,
    -- Per-lesson scores (1-5, nullable — not all axes apply to every lesson)
    technical_score SMALLINT CHECK (technical_score BETWEEN 1 AND 5),
    musical_score SMALLINT CHECK (musical_score BETWEEN 1 AND 5),
    rhythm_score SMALLINT CHECK (rhythm_score BETWEEN 1 AND 5),
    memory_score SMALLINT CHECK (memory_score BETWEEN 1 AND 5),
    -- 1=resistance, 2=neutral, 3=positive — used for retention risk modeling
    student_engagement SMALLINT CHECK (student_engagement BETWEEN 1 AND 3),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Exam tracking fields on student_profiles
ALTER TABLE student_profiles ADD COLUMN exam_board VARCHAR(50);
ALTER TABLE student_profiles ADD COLUMN exam_grade VARCHAR(20);
ALTER TABLE student_profiles ADD COLUMN exam_date DATE;
ALTER TABLE student_profiles ADD COLUMN exam_session_deadline DATE;

-- Indexes for the common query patterns in the pre-lesson brief
CREATE INDEX idx_student_pieces_student_status ON student_pieces(student_id, status);
CREATE INDEX idx_lesson_notes_student_date ON lesson_notes(student_id, lesson_date DESC);
CREATE INDEX idx_lesson_notes_piece ON lesson_notes(piece_id);
