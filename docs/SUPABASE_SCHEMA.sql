-- NotepediaX Production Supabase (PostgreSQL + pgvector) Schema
-- Covers Users/Roles (Students, Teachers, Admins), Courses, Payments, E-Notes RAG Vector Search, Quotas, and Leaderboards.

-- 1. Extensions Setup
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Core Role Enumerations
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('student', 'teacher', 'instructor', 'parent', 'admin', 'school_admin', 'content_editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('created', 'pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Specialized Role Profiles Tables

-- A. Students Profile Table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  target_exam VARCHAR(100) DEFAULT 'JEE_MAIN',
  language_preference VARCHAR(10) DEFAULT 'hi',
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak INT DEFAULT 0,
  is_minor BOOLEAN DEFAULT false,
  parent_consent JSONB DEFAULT '{"status": "granted", "verifiedAt": null, "parentPhone": ""}',
  dpdp_consent JSONB DEFAULT '{"consentGiven": true, "consentedAt": "2026-09-20", "version": "v1.0"}',
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Teachers / Instructors Profile Table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  subjects_handled TEXT[] DEFAULT '{}',
  qualification VARCHAR(255),
  experience_years INT DEFAULT 0,
  bio TEXT,
  profile_picture_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Admin Profiles Table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) DEFAULT 'Academic Management',
  permissions TEXT[] DEFAULT '{"manage_courses", "manage_notes", "view_analytics"}',
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. Core Identity Mapping Table (`users`)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE, -- References Supabase auth.users(id) when integrated
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT,
  role user_role_type DEFAULT 'student',
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  tenant_id UUID, -- For B2B2C Multi-Tenancy (Schools/Coaching)
  cohort_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 4. Taxonomy & Courses Infrastructure

CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'JEE_MAIN', 'NEET_UG', 'NDA', 'CBSE_12'
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'Engineering', 'Medical', 'Defence', 'K12'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES public.teachers(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) DEFAULT 0.00,
  discount_price NUMERIC(10, 2) DEFAULT 0.00,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  tenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'video', -- 'video', 'pdf', 'quiz', 'text'
  video_url TEXT,
  duration_seconds INT DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0
);

-- 5. Payments, Subscriptions & Orders

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) UNIQUE NOT NULL, -- Razorpay / Cashfree order_id
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'course', 'note', 'subscription'
  item_id UUID NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  gst_amount NUMERIC(10, 2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'INR',
  status payment_status_type DEFAULT 'created',
  payment_gateway VARCHAR(50) DEFAULT 'razorpay',
  idempotency_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255) UNIQUE,
  upi_vpa VARCHAR(255),
  payment_method VARCHAR(50), -- 'upi', 'card', 'netbanking'
  status payment_status_type DEFAULT 'paid',
  raw_response JSONB,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'premium'
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  auto_renew BOOLEAN DEFAULT false
);

-- 6. E-Notes & Grounded RAG Vector Search (pgvector)

CREATE TABLE IF NOT EXISTS public.e_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  exam_id UUID REFERENCES public.exams(id),
  subject VARCHAR(100) NOT NULL,
  chapter VARCHAR(255) NOT NULL,
  is_free BOOLEAN DEFAULT false,
  file_url TEXT NOT NULL,
  page_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.note_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES public.e_notes(id) ON DELETE CASCADE,
  heading_path TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- 1536-dim vector for RAG similarity match
  exam_code VARCHAR(100) DEFAULT 'JEE_MAIN',
  subject VARCHAR(100) DEFAULT 'Physics',
  language VARCHAR(10) DEFAULT 'hi',
  page_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW Cosine Distance Index for High-Performance Vector Similarity Search
CREATE INDEX IF NOT EXISTS idx_note_chunks_embedding 
ON public.note_chunks 
USING hnsw (embedding vector_cosine_ops);

-- RAG Vector Search RPC Function
CREATE OR REPLACE FUNCTION match_note_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_exam_code text DEFAULT 'JEE_MAIN'
)
RETURNS TABLE (
  id UUID,
  note_id UUID,
  heading_path TEXT,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nc.id,
    nc.note_id,
    nc.heading_path,
    nc.content,
    1 - (nc.embedding <=> query_embedding) AS similarity
  FROM public.note_chunks nc
  WHERE 1 - (nc.embedding <=> query_embedding) > match_threshold
    AND (filter_exam_code IS NULL OR nc.exam_code = filter_exam_code)
  ORDER BY nc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. Quotas, Attempts & Leaderboards

CREATE TABLE IF NOT EXISTS public.tool_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tool_id VARCHAR(100) NOT NULL,
  date_string VARCHAR(10) NOT NULL, -- YYYY-MM-DD
  count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id, date_string)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  exam_code VARCHAR(100) DEFAULT 'JEE_MAIN',
  score INT NOT NULL,
  max_score INT NOT NULL,
  accuracy_percentage NUMERIC(5,2) NOT NULL,
  time_spent_seconds INT DEFAULT 0,
  weak_topics TEXT[] DEFAULT '{}',
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  exam_code VARCHAR(100) NOT NULL,
  score NUMERIC(10, 2) NOT NULL,
  rank INT NOT NULL,
  period VARCHAR(20) DEFAULT 'weekly',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Row Level Security (RLS) Enablement & Access Grants

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Public Read access for published courses & exams
CREATE POLICY "Public Read Active Exams" ON public.exams FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Published Courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Free Notes" ON public.e_notes FOR SELECT USING (is_free = true);

-- User Authenticated Ownership Policies
CREATE POLICY "User Select Own Profile" ON public.users FOR SELECT TO authenticated USING ((select auth.uid()) = auth_user_id);
CREATE POLICY "User Update Own Profile" ON public.users FOR UPDATE TO authenticated USING ((select auth.uid()) = auth_user_id) WITH CHECK ((select auth.uid()) = auth_user_id);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.exams, public.courses, public.e_notes TO anon, authenticated;
