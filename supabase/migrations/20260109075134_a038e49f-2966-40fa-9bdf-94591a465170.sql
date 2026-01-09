-- Tabel pentru XP și nivele utilizator pentru rutină
CREATE TABLE public.routine_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_routine_date DATE,
  total_routines_completed INTEGER DEFAULT 0,
  total_meditation_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabel pentru achievements deblocate
CREATE TABLE public.routine_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.routine_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for routine_user_stats
CREATE POLICY "Users can view own routine stats" ON public.routine_user_stats 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own routine stats" ON public.routine_user_stats 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routine stats" ON public.routine_user_stats 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for routine_achievements
CREATE POLICY "Users can view own achievements" ON public.routine_achievements 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.routine_achievements 
  FOR INSERT WITH CHECK (auth.uid() = user_id);