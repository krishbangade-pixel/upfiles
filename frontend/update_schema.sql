-- Run this SQL in your Supabase SQL Editor to add any missing columns to your existing tables:

-- 1. Folders table column migration
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS is_trash BOOLEAN DEFAULT FALSE;
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE;
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS owner_id UUID;

-- 2. Files table column migration
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS extension TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS size_bytes BIGINT DEFAULT 0;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS formatted_size TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS storage_key TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ready';
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS is_trash BOOLEAN DEFAULT FALSE;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS version_id UUID;
