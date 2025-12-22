-- Create user_xp table for tracking XP and levels
CREATE TABLE public.user_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own XP"
ON public.user_xp
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP"
ON public.user_xp
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own XP"
ON public.user_xp
FOR UPDATE
USING (auth.uid() = user_id);

-- Create XP history table for tracking XP gains
CREATE TABLE public.xp_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for history
CREATE POLICY "Users can view their own XP history"
ON public.xp_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP history"
ON public.xp_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_xp_updated_at
BEFORE UPDATE ON public.user_xp
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();