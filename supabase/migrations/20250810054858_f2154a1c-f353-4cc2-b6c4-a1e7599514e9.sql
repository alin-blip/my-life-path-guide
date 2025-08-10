-- 1) Universal stack sessions table
CREATE TABLE IF NOT EXISTS public.stack_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  stack_type text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.stack_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for stack_sessions
CREATE POLICY "Users can manage their own stack sessions"
ON public.stack_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all stack sessions"
ON public.stack_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
CREATE TRIGGER update_stack_sessions_updated_at
BEFORE UPDATE ON public.stack_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_stack_sessions_user_type ON public.stack_sessions(user_id, stack_type, created_at DESC);

-- 2) Enhance hot_list_items to support Door lists and provenance
ALTER TABLE public.hot_list_items
ADD COLUMN IF NOT EXISTS list_type text NOT NULL DEFAULT 'hot',
ADD COLUMN IF NOT EXISTS week_key text,
ADD COLUMN IF NOT EXISTS day_of_week text,
ADD COLUMN IF NOT EXISTS source text;

-- Admin visibility for hot_list_items
CREATE POLICY "Admins can view all hot list items"
ON public.hot_list_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_hot_list_items_user_list ON public.hot_list_items(user_id, list_type, completed);

-- 3) Admin read access to key user-owned tables
-- missions
CREATE POLICY "Admins can view all missions"
ON public.missions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- objectives
CREATE POLICY "Admins can view all objectives"
ON public.objectives
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- daily_progress
CREATE POLICY "Admins can view all daily progress"
ON public.daily_progress
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- user_progress
CREATE POLICY "Admins can view all user progress"
ON public.user_progress
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- fact_maps
CREATE POLICY "Admins can view all fact maps"
ON public.fact_maps
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- notes
CREATE POLICY "Admins can view all notes"
ON public.notes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- knowledge_base_files
CREATE POLICY "Admins can view all knowledge base files"
ON public.knowledge_base_files
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- stack_library
CREATE POLICY "Admins can view all stack library entries"
ON public.stack_library
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- specialized stack tables (existing)
CREATE POLICY "Admins can view all anger stack sessions"
ON public.anger_stack_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all divine coaching sessions"
ON public.divine_coaching_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));