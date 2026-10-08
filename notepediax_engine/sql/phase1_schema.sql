-- =============================================================================
-- NotepediaX — Supabase PostgreSQL Database Setup
-- =============================================================================
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste & Run
-- =============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. students — Student Profile & Onboarding
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_level          TEXT        NOT NULL,
    exam_target             TEXT        NOT NULL,
    target_score            INT         NOT NULL DEFAULT 0,
    daily_available_minutes INT         NOT NULL DEFAULT 60,
    preferred_language      TEXT        NOT NULL DEFAULT 'en',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. topic_taxonomy — Knowledge Graph & Prerequisites
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topic_taxonomy (
    id                      TEXT PRIMARY KEY,
    subject                 TEXT    NOT NULL,
    chapter                 TEXT    NOT NULL,
    topic                   TEXT    NOT NULL,
    concept                 TEXT,
    prerequisite_topic_ids  TEXT[]  NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_taxonomy_subject_chapter ON topic_taxonomy (subject, chapter);

-- ---------------------------------------------------------------------------
-- 3. learner_states — Dynamic Mastery & Retention
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learner_states (
    student_id        UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    topic_mastery     JSONB       NOT NULL DEFAULT '{}'::jsonb,
    retention_scores  JSONB       NOT NULL DEFAULT '{}'::jsonb,
    last_updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 4. learning_events — Universal Event Stream (Immutable)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    event_type  TEXT        NOT NULL,
    topic_id    TEXT        NOT NULL,
    metadata    JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_student_topic ON learning_events (student_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON learning_events (created_at DESC);

-- ---------------------------------------------------------------------------
-- 5. learning_plans — Daily Adaptive Study Schedules
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_plans (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID    NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    plan_date   DATE    NOT NULL,
    activities  JSONB   NOT NULL DEFAULT '[]'::jsonb,
    status      TEXT    NOT NULL DEFAULT 'draft'
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_student_date ON learning_plans (student_id, plan_date);

-- ---------------------------------------------------------------------------
-- Initial Seed Data: Topic Taxonomy
-- ---------------------------------------------------------------------------
INSERT INTO topic_taxonomy (id, subject, chapter, topic, concept, prerequisite_topic_ids)
VALUES
    ('physics_vectors_basics', 'physics', 'mathematical_tools', 'vectors', 'vector_addition', '{}'),
    ('physics_kinematics_1d', 'physics', 'kinematics', 'rectilinear_motion', 'acceleration_velocity', '{"physics_vectors_basics"}'),
    ('physics_electrostatics_ef', 'physics', 'electrostatics', 'electric_field', 'coulombs_law_flux', '{"physics_vectors_basics"}'),
    ('physics_electrostatics_pot', 'physics', 'electrostatics', 'potential', 'electric_potential_energy', '{"physics_electrostatics_ef"}'),
    ('chemistry_mole_concept', 'chemistry', 'physical_chemistry', 'mole_concept', 'stoichiometry', '{}'),
    ('maths_calculus_limits', 'maths', 'calculus', 'limits_continuity', 'standard_limits', '{}')
ON CONFLICT (id) DO NOTHING;
