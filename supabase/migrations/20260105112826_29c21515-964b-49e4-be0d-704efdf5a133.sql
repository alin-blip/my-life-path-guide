-- =============================================
-- PART 1: Weekly Workout Program System
-- =============================================

-- Workout programs (weekly plans)
CREATE TABLE public.workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Days within a program
CREATE TABLE public.workout_program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  name TEXT,
  is_rest_day BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises for each day
CREATE TABLE public.workout_day_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES public.workout_program_days(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  target_sets INTEGER DEFAULT 3,
  target_reps TEXT,
  target_weight_kg NUMERIC,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shareable workout templates
CREATE TABLE public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_program_id UUID REFERENCES public.workout_programs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  days_per_week INTEGER,
  creator_user_id UUID,
  is_official BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  program_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PART 2: Custom Widget System
-- =============================================

-- Custom widgets created by users
CREATE TABLE public.custom_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widget templates (shareable)
CREATE TABLE public.widget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  category TEXT,
  icon TEXT,
  is_official BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  creator_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data storage for custom widgets
CREATE TABLE public.widget_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID REFERENCES public.custom_widgets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(widget_id, user_id, date)
);

-- =============================================
-- RLS Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_day_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_data ENABLE ROW LEVEL SECURITY;

-- Workout Programs policies
CREATE POLICY "Users can view own programs" ON public.workout_programs
  FOR SELECT USING (auth.uid() = user_id OR is_public = true OR is_template = true);

CREATE POLICY "Users can create own programs" ON public.workout_programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs" ON public.workout_programs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own programs" ON public.workout_programs
  FOR DELETE USING (auth.uid() = user_id);

-- Workout Program Days policies
CREATE POLICY "Users can view program days" ON public.workout_program_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_programs wp 
      WHERE wp.id = program_id AND (wp.user_id = auth.uid() OR wp.is_public = true OR wp.is_template = true)
    )
  );

CREATE POLICY "Users can manage own program days" ON public.workout_program_days
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_programs wp WHERE wp.id = program_id AND wp.user_id = auth.uid())
  );

-- Workout Day Exercises policies
CREATE POLICY "Users can view day exercises" ON public.workout_day_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_program_days wpd
      JOIN public.workout_programs wp ON wp.id = wpd.program_id
      WHERE wpd.id = day_id AND (wp.user_id = auth.uid() OR wp.is_public = true OR wp.is_template = true)
    )
  );

CREATE POLICY "Users can manage own day exercises" ON public.workout_day_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_program_days wpd
      JOIN public.workout_programs wp ON wp.id = wpd.program_id
      WHERE wpd.id = day_id AND wp.user_id = auth.uid()
    )
  );

-- Workout Templates policies
CREATE POLICY "Anyone can view templates" ON public.workout_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can create templates" ON public.workout_templates
  FOR INSERT WITH CHECK (auth.uid() = creator_user_id);

CREATE POLICY "Users can update own templates" ON public.workout_templates
  FOR UPDATE USING (auth.uid() = creator_user_id);

CREATE POLICY "Users can delete own templates" ON public.workout_templates
  FOR DELETE USING (auth.uid() = creator_user_id);

-- Custom Widgets policies
CREATE POLICY "Users can view own or public widgets" ON public.custom_widgets
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own widgets" ON public.custom_widgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets" ON public.custom_widgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets" ON public.custom_widgets
  FOR DELETE USING (auth.uid() = user_id);

-- Widget Templates policies
CREATE POLICY "Anyone can view widget templates" ON public.widget_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can create widget templates" ON public.widget_templates
  FOR INSERT WITH CHECK (auth.uid() = creator_user_id);

CREATE POLICY "Users can update own widget templates" ON public.widget_templates
  FOR UPDATE USING (auth.uid() = creator_user_id);

CREATE POLICY "Users can delete own widget templates" ON public.widget_templates
  FOR DELETE USING (auth.uid() = creator_user_id);

-- Widget Data policies
CREATE POLICY "Users can view own widget data" ON public.widget_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own widget data" ON public.widget_data
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Triggers for updated_at
-- =============================================

CREATE TRIGGER update_workout_programs_updated_at
  BEFORE UPDATE ON public.workout_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at
  BEFORE UPDATE ON public.workout_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_widgets_updated_at
  BEFORE UPDATE ON public.custom_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_widget_templates_updated_at
  BEFORE UPDATE ON public.widget_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_widget_data_updated_at
  BEFORE UPDATE ON public.widget_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();