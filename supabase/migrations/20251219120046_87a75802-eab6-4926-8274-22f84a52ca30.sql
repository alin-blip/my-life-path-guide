-- Add challenge_day_number to stack_sessions to link sessions to challenge days
ALTER TABLE public.stack_sessions 
ADD COLUMN challenge_day_number integer;

-- Add stack_session_id to challenge_progress to reference the completed session
ALTER TABLE public.challenge_progress 
ADD COLUMN stack_session_id uuid REFERENCES public.stack_sessions(id);

-- Create index for faster lookups
CREATE INDEX idx_stack_sessions_challenge_day ON public.stack_sessions(user_id, challenge_day_number) WHERE challenge_day_number IS NOT NULL;