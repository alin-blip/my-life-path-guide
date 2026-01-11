-- Table for Day 1 challenge responses (Napoleon Hill style)
CREATE TABLE IF NOT EXISTS public.challenge_day1_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_1 TEXT, -- "De ce vrei să ai TOTUL?"
  question_2 TEXT, -- "Ce te-a adus aici?"
  question_3 TEXT, -- "Viața ideală peste 1 an?"
  question_4 TEXT, -- "Ce sacrificii ești dispus?"
  question_5 TEXT, -- "Ce te-ar opri?"
  vision_declaration TEXT,
  vision_body TEXT,
  vision_spirit TEXT,
  vision_relationships TEXT,
  vision_business TEXT,
  target_date DATE,
  commitment_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.challenge_day1_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own day1 responses"
ON public.challenge_day1_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own day1 responses"
ON public.challenge_day1_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own day1 responses"
ON public.challenge_day1_responses
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_challenge_day1_responses_updated_at
BEFORE UPDATE ON public.challenge_day1_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();