
-- 1. marriage_profiles
CREATE TABLE public.marriage_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_name text,
  partner_pronoun text,
  relationship_years numeric,
  children_count integer DEFAULT 0,
  partner_love_language text,
  relationship_context text,
  recurring_patterns jsonb DEFAULT '[]'::jsonb,
  axis_scores jsonb DEFAULT '{}'::jsonb,
  last_analysis_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marriage_profiles TO authenticated;
GRANT ALL ON public.marriage_profiles TO service_role;
ALTER TABLE public.marriage_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own marriage profile" ON public.marriage_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_marriage_profiles_updated_at
  BEFORE UPDATE ON public.marriage_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. marriage_sessions
CREATE TABLE public.marriage_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  conflict_summary text,
  user_context text,
  attachments jsonb DEFAULT '[]'::jsonb,
  attachment_types text[] DEFAULT ARRAY[]::text[],
  transcripts jsonb DEFAULT '{}'::jsonb,
  factual_situation text,
  fact_vs_interpretation text,
  perspective_husband text,
  perspective_wife text,
  perspective_coach text,
  detected_distortions jsonb DEFAULT '[]'::jsonb,
  axis_diagnosis jsonb DEFAULT '{}'::jsonb,
  primary_destructured_axis text,
  pattern_recurrence integer DEFAULT 0,
  task_title text,
  task_description text,
  task_id uuid,
  task_exported boolean DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_marriage_sessions_user_created ON public.marriage_sessions(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marriage_sessions TO authenticated;
GRANT ALL ON public.marriage_sessions TO service_role;
ALTER TABLE public.marriage_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own marriage sessions" ON public.marriage_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_marriage_sessions_updated_at
  BEFORE UPDATE ON public.marriage_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. marriage_timeline_events
CREATE TABLE public.marriage_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.marriage_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  axis_affected text,
  distortion text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_marriage_timeline_user_created ON public.marriage_timeline_events(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marriage_timeline_events TO authenticated;
GRANT ALL ON public.marriage_timeline_events TO service_role;
ALTER TABLE public.marriage_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own marriage timeline" ON public.marriage_timeline_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
