-- Create warriors_way_comments table for public module comments
CREATE TABLE public.warriors_way_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast module lookups
CREATE INDEX idx_warriors_comments_module ON public.warriors_way_comments(module_id);
CREATE INDEX idx_warriors_comments_user ON public.warriors_way_comments(user_id);
CREATE INDEX idx_warriors_comments_created ON public.warriors_way_comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.warriors_way_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read all comments (public)
CREATE POLICY "Anyone can read comments" 
  ON public.warriors_way_comments FOR SELECT 
  USING (true);

-- Authenticated users can post comments
CREATE POLICY "Authenticated users can post comments" 
  ON public.warriors_way_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" 
  ON public.warriors_way_comments FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" 
  ON public.warriors_way_comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_warriors_way_comments_updated_at
  BEFORE UPDATE ON public.warriors_way_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();