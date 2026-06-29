
-- Belief Reprogrammer — Protocolul Rădăcinii

-- 1) Sessions
CREATE TABLE public.belief_reprogrammer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  current_phase text NOT NULL DEFAULT 'audit' CHECK (current_phase IN ('audit','decupling','forgiveness','rewriting','completed')),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','abandoned')),
  axis text,
  root_belief text,
  source_event text,
  source_age_range text,
  source_who text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_reprogrammer_sessions TO authenticated;
GRANT ALL ON public.belief_reprogrammer_sessions TO service_role;
ALTER TABLE public.belief_reprogrammer_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own reprogrammer sessions"
  ON public.belief_reprogrammer_sessions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_brs_updated_at BEFORE UPDATE ON public.belief_reprogrammer_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Per-phase artifacts (chat transcripts + AI outputs + form payloads)
CREATE TABLE public.belief_reprogrammer_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.belief_reprogrammer_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('audit','decupling','forgiveness','rewriting')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_reprogrammer_artifacts TO authenticated;
GRANT ALL ON public.belief_reprogrammer_artifacts TO service_role;
ALTER TABLE public.belief_reprogrammer_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own reprogrammer artifacts"
  ON public.belief_reprogrammer_artifacts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_bra_session ON public.belief_reprogrammer_artifacts(session_id, phase);
CREATE TRIGGER trg_bra_updated_at BEFORE UPDATE ON public.belief_reprogrammer_artifacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Library of rewritten beliefs (before/after, sources, install progress)
CREATE TABLE public.belief_reprogrammer_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.belief_reprogrammer_sessions(id) ON DELETE SET NULL,
  old_belief text NOT NULL,
  new_belief text NOT NULL,
  source_event text,
  source_age_range text,
  parental_pattern text,
  axis text,
  mantra_morning text,
  mantra_evening text,
  weekly_task text,
  installation_status text NOT NULL DEFAULT 'active' CHECK (installation_status IN ('active','paused','installed')),
  days_target integer NOT NULL DEFAULT 66,
  times_repeated integer NOT NULL DEFAULT 0,
  last_repeated_at timestamptz,
  installed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_reprogrammer_library TO authenticated;
GRANT ALL ON public.belief_reprogrammer_library TO service_role;
ALTER TABLE public.belief_reprogrammer_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own reprogrammer library"
  ON public.belief_reprogrammer_library FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_brl_user ON public.belief_reprogrammer_library(user_id, installation_status);
CREATE TRIGGER trg_brl_updated_at BEFORE UPDATE ON public.belief_reprogrammer_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Mantras (active ones rotate into Warrior Routine Power Declaration)
CREATE TABLE public.belief_mantras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  library_id uuid REFERENCES public.belief_reprogrammer_library(id) ON DELETE CASCADE,
  text text NOT NULL,
  slot text NOT NULL DEFAULT 'morning' CHECK (slot IN ('morning','evening','both')),
  active boolean NOT NULL DEFAULT true,
  last_played_at timestamptz,
  play_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_mantras TO authenticated;
GRANT ALL ON public.belief_mantras TO service_role;
ALTER TABLE public.belief_mantras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own belief mantras"
  ON public.belief_mantras FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_bm_user_active ON public.belief_mantras(user_id, active);
CREATE TRIGGER trg_bm_updated_at BEFORE UPDATE ON public.belief_mantras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
