-- Migration 003: Supabase Storage Buckets & Storage Security Policies

-- 1. Create Buckets if not existing
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('notes', 'notes', true),
  ('course_thumbnails', 'course_thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for `avatars` bucket

CREATE POLICY "Public Read Avatars" 
ON storage.objects FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated User Upload Avatars" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars' AND owner = (select auth.uid()));

CREATE POLICY "Authenticated User Update Avatars" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars' AND owner = (select auth.uid()))
WITH CHECK (bucket_id = 'avatars' AND owner = (select auth.uid()));

CREATE POLICY "Authenticated User Delete Avatars" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'avatars' AND owner = (select auth.uid()));

-- 3. Storage Policies for `notes` bucket

CREATE POLICY "Public Read Notes" 
ON storage.objects FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'notes');

CREATE POLICY "Authenticated Upload Notes" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'notes' AND owner = (select auth.uid()));

-- 4. Storage Policies for `course_thumbnails` bucket

CREATE POLICY "Public Read Course Thumbnails" 
ON storage.objects FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'course_thumbnails');
