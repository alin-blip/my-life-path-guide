-- Add content_preview column to knowledge_base_files table for storing text preview
ALTER TABLE public.knowledge_base_files 
ADD COLUMN IF NOT EXISTS content_preview TEXT;