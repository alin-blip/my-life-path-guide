-- Create table for storing lesson content (knowledge base for AI)
CREATE TABLE public.warriors_way_lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL UNIQUE,
  section_id TEXT NOT NULL,
  title TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  
  -- Full content
  full_script TEXT NOT NULL,
  summary TEXT,
  key_concepts JSONB DEFAULT '[]',
  action_prompts JSONB DEFAULT '[]',
  
  -- Search metadata
  tags TEXT[] DEFAULT '{}',
  searchable_content TSVECTOR,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for full-text search
CREATE INDEX idx_warriors_lesson_search ON public.warriors_way_lesson_content 
  USING GIN(searchable_content);

-- Index for section queries
CREATE INDEX idx_warriors_lesson_section ON public.warriors_way_lesson_content(section_id);

-- Trigger function to update searchable_content
CREATE OR REPLACE FUNCTION public.update_warriors_lesson_search() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.searchable_content := 
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.full_script, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.tags, ' '), '')), 'A');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER warriors_lesson_search_update
  BEFORE INSERT OR UPDATE ON public.warriors_way_lesson_content
  FOR EACH ROW EXECUTE FUNCTION public.update_warriors_lesson_search();

-- Enable RLS
ALTER TABLE public.warriors_way_lesson_content ENABLE ROW LEVEL SECURITY;

-- Public read policy (lessons are public content)
CREATE POLICY "Anyone can read warrior lessons" 
  ON public.warriors_way_lesson_content 
  FOR SELECT 
  USING (true);