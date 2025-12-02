-- Create table for Napoleon Hill principle conversation drafts (auto-save)
CREATE TABLE IF NOT EXISTS public.napoleon_hill_principle_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.napoleon_hill_projects(id) ON DELETE CASCADE,
  principle_number INTEGER NOT NULL CHECK (principle_number >= 1 AND principle_number <= 14),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, principle_number)
);

-- Enable RLS
ALTER TABLE public.napoleon_hill_principle_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own principle drafts"
  ON public.napoleon_hill_principle_drafts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_napoleon_hill_principle_drafts_updated_at
  BEFORE UPDATE ON public.napoleon_hill_principle_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_principle_drafts_project_principle 
  ON public.napoleon_hill_principle_drafts(project_id, principle_number);

CREATE INDEX idx_principle_drafts_user_id 
  ON public.napoleon_hill_principle_drafts(user_id);