-- Create canvas_projects table for saving canvas projects
CREATE TABLE public.canvas_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'Untitled',
  canvas_data JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canvas_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own canvas projects"
  ON public.canvas_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own canvas projects"
  ON public.canvas_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canvas projects"
  ON public.canvas_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canvas projects"
  ON public.canvas_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_canvas_projects_updated_at
  BEFORE UPDATE ON public.canvas_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();