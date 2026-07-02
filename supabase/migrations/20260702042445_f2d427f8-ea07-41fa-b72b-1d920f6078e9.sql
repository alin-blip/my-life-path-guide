
CREATE TABLE public.kill_it_today_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  state_before TEXT,
  win_of_day TEXT,
  anchor_phrase TEXT,
  tasks_snapshot JSONB DEFAULT '[]'::jsonb,
  workout_plan TEXT,
  spiritual_anchor TEXT,
  power_phrase TEXT,
  current_phase TEXT DEFAULT 'mentalitate',
  messages JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kill_it_today_sessions TO authenticated;
GRANT ALL ON public.kill_it_today_sessions TO service_role;

ALTER TABLE public.kill_it_today_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own kill_it_today sessions"
  ON public.kill_it_today_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_kill_it_today_user_date
  ON public.kill_it_today_sessions(user_id, session_date DESC);

CREATE TRIGGER update_kill_it_today_updated_at
  BEFORE UPDATE ON public.kill_it_today_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
