-- Create quests table for daily/weekly/monthly/special quests
CREATE TABLE public.quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'monthly', 'special')),
  xp_reward INTEGER NOT NULL DEFAULT 50,
  target_value INTEGER NOT NULL DEFAULT 1,
  action_type TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user quest progress table
CREATE TABLE public.user_quest_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_id, reset_at)
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create weekly scores table
CREATE TABLE public.weekly_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_key TEXT NOT NULL,
  daily_scores JSONB DEFAULT '[]'::jsonb,
  average_score NUMERIC(5,2) DEFAULT 0,
  objectives_completed INTEGER DEFAULT 0,
  objectives_total INTEGER DEFAULT 0,
  streak_bonus INTEGER DEFAULT 0,
  total_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_key)
);

-- Create monthly scores table
CREATE TABLE public.monthly_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_key TEXT NOT NULL,
  weekly_scores JSONB DEFAULT '[]'::jsonb,
  average_score NUMERIC(5,2) DEFAULT 0,
  perfect_days INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key)
);

-- Enable RLS
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_scores ENABLE ROW LEVEL SECURITY;

-- Quests policies (read-only for users, managed by system)
CREATE POLICY "Quests are viewable by everyone" ON public.quests FOR SELECT USING (true);

-- User quest progress policies
CREATE POLICY "Users can view own quest progress" ON public.user_quest_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quest progress" ON public.user_quest_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quest progress" ON public.user_quest_progress FOR UPDATE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weekly scores policies
CREATE POLICY "Users can view own weekly scores" ON public.weekly_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weekly scores" ON public.weekly_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weekly scores" ON public.weekly_scores FOR UPDATE USING (auth.uid() = user_id);

-- Monthly scores policies
CREATE POLICY "Users can view own monthly scores" ON public.monthly_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own monthly scores" ON public.monthly_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own monthly scores" ON public.monthly_scores FOR UPDATE USING (auth.uid() = user_id);

-- Insert default quests
INSERT INTO public.quests (title, description, quest_type, xp_reward, target_value, action_type, icon) VALUES
-- Daily Quests
('Complete 5 Tasks', 'Finish 5 tasks from your to-do list', 'daily', 50, 5, 'tasks_completed', '✅'),
('Morning Routine', 'Complete your champion routine', 'daily', 75, 1, 'routine_completed', '🌅'),
('Log Meals', 'Track all your meals for the day', 'daily', 25, 3, 'meals_logged', '🍽️'),
('Read 10 Pages', 'Read at least 10 pages', 'daily', 30, 10, 'pages_read', '📚'),
('Drink 8 Glasses', 'Stay hydrated with 8 glasses of water', 'daily', 20, 8, 'water_glasses', '💧'),

-- Weekly Quests
('Workout Warrior', 'Complete 5 workouts this week', 'weekly', 200, 5, 'workouts_completed', '💪'),
('Journal Master', 'Write in your journal 5 times', 'weekly', 150, 5, 'journal_entries', '📝'),
('Perfect Days', 'Achieve 3 perfect score days', 'weekly', 300, 3, 'perfect_days', '⭐'),
('Stack Champion', 'Complete 7 daily stacks', 'weekly', 250, 7, 'stacks_completed', '🧘'),

-- Monthly Quests
('Century Reader', 'Read 100 pages this month', 'monthly', 500, 100, 'pages_read', '📖'),
('Consistency King', 'Maintain a 21-day streak', 'monthly', 750, 21, 'streak_days', '🔥'),
('Goal Crusher', 'Complete all weekly objectives 4 weeks in a row', 'monthly', 1000, 4, 'weekly_objectives', '🎯'),

-- Special Quests
('30-Day Challenge', 'Complete the 30-day transformation challenge', 'special', 1500, 30, 'challenge_days', '🏆'),
('First Perfect Week', 'Achieve your first perfect week score', 'special', 500, 1, 'perfect_week', '🌟'),
('Level 10 Achievement', 'Reach level 10', 'special', 300, 10, 'level_reached', '🎖️');

-- Create trigger for updated_at
CREATE TRIGGER update_user_quest_progress_updated_at
BEFORE UPDATE ON public.user_quest_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_scores_updated_at
BEFORE UPDATE ON public.weekly_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_scores_updated_at
BEFORE UPDATE ON public.monthly_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();