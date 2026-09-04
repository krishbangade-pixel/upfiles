-- Execute this SQL in your Supabase SQL Editor to configure Bucket RLS for private storage:

-- 1. Ensure private 'clouddrive' bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clouddrive', 'clouddrive', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload files into their own user folder (users/{user_id}/...)
DROP POLICY IF EXISTS "Allow users to upload to their own user folder" ON storage.objects;
CREATE POLICY "Allow users to upload to their own user folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'clouddrive' AND
  (storage.foldername(name))[1] = 'users' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 3. Allow authenticated users to read/download signed URLs from their own user folder
DROP POLICY IF EXISTS "Allow users to read their own user folder" ON storage.objects;
CREATE POLICY "Allow users to read their own user folder"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'clouddrive' AND
  (storage.foldername(name))[1] = 'users' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 4. Allow authenticated users to update files in their own user folder
DROP POLICY IF EXISTS "Allow users to update their own user folder" ON storage.objects;
CREATE POLICY "Allow users to update their own user folder"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'clouddrive' AND
  (storage.foldername(name))[1] = 'users' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 5. Allow authenticated users to delete files in their own user folder
DROP POLICY IF EXISTS "Allow users to delete their own user folder" ON storage.objects;
CREATE POLICY "Allow users to delete their own user folder"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'clouddrive' AND
  (storage.foldername(name))[1] = 'users' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
