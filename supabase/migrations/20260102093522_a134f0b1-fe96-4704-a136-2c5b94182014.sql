-- Create daily_habits table for user-configurable habits
CREATE TABLE public.daily_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('body', 'being', 'balance', 'business')),
  habit_group TEXT NOT NULL DEFAULT 'custom' CHECK (habit_group IN ('core4', 'biz4', 'custom')),
  icon TEXT DEFAULT 'check',
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create daily_habit_completions table for tracking completions
CREATE TABLE public.daily_habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  habit_id UUID NOT NULL REFERENCES public.daily_habits(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_habits
CREATE POLICY "Users can manage their own daily habits"
ON public.daily_habits
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for daily_habit_completions
CREATE POLICY "Users can manage their own habit completions"
ON public.daily_habit_completions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_daily_habits_user_id ON public.daily_habits(user_id);
CREATE INDEX idx_daily_habit_completions_user_date ON public.daily_habit_completions(user_id, date);
CREATE INDEX idx_daily_habit_completions_habit_id ON public.daily_habit_completions(habit_id);

-- Create trigger for updated_at
CREATE TRIGGER update_daily_habits_updated_at
BEFORE UPDATE ON public.daily_habits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();