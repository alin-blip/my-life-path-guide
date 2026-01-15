
-- Table to track completed action prompts per user per module
CREATE TABLE public.warriors_action_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  action_index INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id, action_index)
);

-- Enable RLS
ALTER TABLE public.warriors_action_completions ENABLE ROW LEVEL SECURITY;

-- Users can view their own completions
CREATE POLICY "Users can view own action completions"
  ON public.warriors_action_completions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert own action completions"
  ON public.warriors_action_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own completions
CREATE POLICY "Users can delete own action completions"
  ON public.warriors_action_completions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_warriors_action_completions_user_module 
  ON public.warriors_action_completions(user_id, module_id);
