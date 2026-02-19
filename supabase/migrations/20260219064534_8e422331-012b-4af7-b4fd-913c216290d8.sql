
CREATE TABLE public.challenge_intake (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  biggest_block text NOT NULL,
  win_30_days text NOT NULL,
  commitment_level text NOT NULL DEFAULT 'will_try',
  posted_to_community boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own intake"
  ON public.challenge_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own intake"
  ON public.challenge_intake FOR SELECT
  USING (auth.uid() = user_id);
