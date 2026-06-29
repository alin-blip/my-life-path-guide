
ALTER TABLE public.marriage_sessions
  ADD COLUMN IF NOT EXISTS repair_script jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS trigger_root jsonb,
  ADD COLUMN IF NOT EXISTS exploration_questions jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seven_day_plan jsonb DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.marriage_session_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.marriage_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marriage_session_messages TO authenticated;
GRANT ALL ON public.marriage_session_messages TO service_role;

ALTER TABLE public.marriage_session_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own marriage session messages"
ON public.marriage_session_messages
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_marriage_session_messages_session
  ON public.marriage_session_messages(session_id, created_at);
