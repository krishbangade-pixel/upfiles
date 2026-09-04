-- Complete RLS Policy Script for Supabase Database & Storage
-- Execute this SQL in your Supabase SQL Editor to grant full RLS access to authenticated users

-- 1. FOLDERS TABLE RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folders" ON public.folders;
CREATE POLICY "Users can view own folders" ON public.folders 
FOR SELECT TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own folders" ON public.folders;
CREATE POLICY "Users can insert own folders" ON public.folders 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own folders" ON public.folders;
CREATE POLICY "Users can update own folders" ON public.folders 
FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own folders" ON public.folders;
CREATE POLICY "Users can delete own folders" ON public.folders 
FOR DELETE TO authenticated USING (auth.uid() = owner_id);


-- 2. FILES TABLE RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own files" ON public.files;
CREATE POLICY "Users can view own files" ON public.files 
FOR SELECT TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own files" ON public.files;
CREATE POLICY "Users can insert own files" ON public.files 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own files" ON public.files;
CREATE POLICY "Users can update own files" ON public.files 
FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own files" ON public.files;
CREATE POLICY "Users can delete own files" ON public.files 
FOR DELETE TO authenticated USING (auth.uid() = owner_id);


-- 3. SHARES TABLE RLS
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view shares" ON public.shares;
CREATE POLICY "Users can view shares" ON public.shares 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners can insert shares" ON public.shares;
CREATE POLICY "Owners can insert shares" ON public.shares 
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can update shares" ON public.shares;
CREATE POLICY "Owners can update shares" ON public.shares 
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners can delete shares" ON public.shares;
CREATE POLICY "Owners can delete shares" ON public.shares 
FOR DELETE TO authenticated USING (true);


-- 4. LINK SHARES TABLE RLS
ALTER TABLE public.link_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active link shares" ON public.link_shares;
CREATE POLICY "Anyone can view active link shares" ON public.link_shares 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can insert link shares" ON public.link_shares;
CREATE POLICY "Owners can insert link shares" ON public.link_shares 
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can update link shares" ON public.link_shares;
CREATE POLICY "Owners can update link shares" ON public.link_shares 
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners can delete link shares" ON public.link_shares;
CREATE POLICY "Owners can delete link shares" ON public.link_shares 
FOR DELETE TO authenticated USING (true);


-- 5. STORAGE BUCKET & OBJECTS RLS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clouddrive', 'clouddrive', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Users can upload to own storage folder" ON storage.objects;
CREATE POLICY "Users can upload to own storage folder" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'clouddrive' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view own storage files" ON storage.objects;
CREATE POLICY "Users can view own storage files" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'clouddrive' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own storage files" ON storage.objects;
CREATE POLICY "Users can update own storage files" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'clouddrive' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own storage files" ON storage.objects;
CREATE POLICY "Users can delete own storage files" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'clouddrive' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text
);
