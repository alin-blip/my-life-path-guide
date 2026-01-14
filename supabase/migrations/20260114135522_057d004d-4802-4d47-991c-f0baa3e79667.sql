-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.update_warriors_lesson_search() 
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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