-- Migration 002: Row Level Security (RLS) Enablement & Strict Access Control Policies

-- 1. Enable RLS on all public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- 2. Grants for Data API
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.exams, public.courses, public.subjects, public.chapters, public.lessons, public.e_notes, public.leaderboard_snapshots TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users, public.students, public.orders, public.payments, public.tool_quotas, public.quiz_attempts TO authenticated;

-- 3. Public / Catalog Policies (Read-Only)

CREATE POLICY "Public Read Active Exams" 
ON public.exams FOR SELECT 
TO anon, authenticated 
USING (is_active = true);

CREATE POLICY "Public Read Published Courses" 
ON public.courses FOR SELECT 
TO anon, authenticated 
USING (is_published = true);

CREATE POLICY "Public Read Course Subjects" 
ON public.subjects FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Read Course Chapters" 
ON public.chapters FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Read Course Lessons" 
ON public.lessons FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Read Free E-Notes" 
ON public.e_notes FOR SELECT 
TO anon, authenticated 
USING (is_free = true);

CREATE POLICY "Public Read Leaderboard Snapshots" 
ON public.leaderboard_snapshots FOR SELECT 
TO anon, authenticated 
USING (true);

-- 4. User Profile & Account RLS Policies

CREATE POLICY "User Select Own Profile" 
ON public.users FOR SELECT 
TO authenticated 
USING ((select auth.uid()) = auth_user_id OR (select auth.uid()) = id);

CREATE POLICY "User Insert Own Profile" 
ON public.users FOR INSERT 
TO authenticated 
WITH CHECK ((select auth.uid()) = auth_user_id OR (select auth.uid()) = id);

CREATE POLICY "User Update Own Profile" 
ON public.users FOR UPDATE 
TO authenticated 
USING ((select auth.uid()) = auth_user_id OR (select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = auth_user_id OR (select auth.uid()) = id);

CREATE POLICY "Student Select Own Student Data" 
ON public.students FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT student_id FROM public.users WHERE auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "Student Update Own Student Data" 
ON public.students FOR UPDATE 
TO authenticated 
USING (
  id IN (
    SELECT student_id FROM public.users WHERE auth_user_id = (select auth.uid())
  )
)
WITH CHECK (
  id IN (
    SELECT student_id FROM public.users WHERE auth_user_id = (select auth.uid())
  )
);

-- 5. User-Owned Data (Orders, Quotas, Quiz Attempts)

CREATE POLICY "User Select Own Orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = (select auth.uid()) OR id = (select auth.uid())
  )
);

CREATE POLICY "User Insert Own Orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = (select auth.uid()) OR id = (select auth.uid())
  )
);

CREATE POLICY "User Select Own Tool Quotas" 
ON public.tool_quotas FOR SELECT 
TO authenticated 
USING (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = (select auth.uid()) OR id = (select auth.uid())
  )
);

CREATE POLICY "User Manage Own Tool Quotas" 
ON public.tool_quotas FOR ALL 
TO authenticated 
USING (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = (select auth.uid()) OR id = (select auth.uid())
  )
)
WITH CHECK (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = (select auth.uid()) OR id = (select auth.uid())
  )
);

CREATE POLICY "User Select Own Quiz Attempts" 
ON public.quiz_attempts FOR SELECT 
TO authenticated 
USING (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = (select auth.uid()) OR id = (select auth.uid())
  )
);

CREATE POLICY "User Insert Own Quiz Attempts" 
ON public.quiz_attempts FOR INSERT 
TO authenticated 
WITH CHECK (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = (select auth.uid()) OR id = (select auth.uid())
  )
);
