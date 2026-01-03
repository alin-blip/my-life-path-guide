
-- Table for storing configured people (relationships)
CREATE TABLE public.champion_routine_people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'partner',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for user settings
CREATE TABLE public.champion_routine_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  is_configured BOOLEAN DEFAULT false,
  default_autosuggestion TEXT DEFAULT 'Every day, in every way, I am getting better and better.',
  routine_steps_order JSONB DEFAULT '[]'::jsonb,
  active_steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for daily logs
CREATE TABLE public.champion_routine_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_drunk BOOLEAN DEFAULT false,
  light_exposure BOOLEAN DEFAULT false,
  breathing_completed BOOLEAN DEFAULT false,
  meditation_duration_seconds INTEGER DEFAULT 0,
  gratitude_items JSONB DEFAULT '[]'::jsonb,
  autosuggestion_text TEXT,
  autosuggestion_completed BOOLEAN DEFAULT false,
  visualization_completed BOOLEAN DEFAULT false,
  reading_completed BOOLEAN DEFAULT false,
  journaling_completed BOOLEAN DEFAULT false,
  exercise_completed BOOLEAN DEFAULT false,
  priorities JSONB DEFAULT '[]'::jsonb,
  relationship_actions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Table for activity sessions (running, cycling, walking)
CREATE TABLE public.activity_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  distance_km NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.champion_routine_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.champion_routine_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.champion_routine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own champion routine people"
ON public.champion_routine_people FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own champion routine settings"
ON public.champion_routine_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own champion routine logs"
ON public.champion_routine_logs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activity sessions"
ON public.activity_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_champion_routine_people_updated_at
BEFORE UPDATE ON public.champion_routine_people
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_champion_routine_settings_updated_at
BEFORE UPDATE ON public.champion_routine_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_champion_routine_logs_updated_at
BEFORE UPDATE ON public.champion_routine_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
