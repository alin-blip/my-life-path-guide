
-- Create table for storing AI Coach conversations
CREATE TABLE public.challenge_coach_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  day_number integer NOT NULL DEFAULT 0,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX idx_challenge_coach_conv_user ON public.challenge_coach_conversations(user_id);
CREATE INDEX idx_challenge_coach_conv_session ON public.challenge_coach_conversations(session_id);
CREATE INDEX idx_challenge_coach_conv_day ON public.challenge_coach_conversations(day_number);
CREATE INDEX idx_challenge_coach_conv_created ON public.challenge_coach_conversations(created_at DESC);

-- Enable RLS
ALTER TABLE public.challenge_coach_conversations ENABLE ROW LEVEL SECURITY;

-- Users can read their own conversations
CREATE POLICY "Users can read own conversations"
  ON public.challenge_coach_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert own messages"
  ON public.challenge_coach_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all conversations (using has_role function)
CREATE POLICY "Admins can read all conversations"
  ON public.challenge_coach_conversations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
