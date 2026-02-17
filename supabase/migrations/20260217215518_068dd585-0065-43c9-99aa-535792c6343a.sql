
-- Create meal_plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  calorie_target INTEGER,
  protein_target INTEGER,
  carbs_target INTEGER,
  fats_target INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create meal_plan_days table
CREATE TABLE public.meal_plan_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_days ENABLE ROW LEVEL SECURITY;

-- RLS for meal_plans: coaches manage their own
CREATE POLICY "Coaches can manage their meal plans"
  ON public.meal_plans FOR ALL
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- RLS for meal_plans: tribe members can read
CREATE POLICY "Tribe members can view meal plans"
  ON public.meal_plans FOR SELECT
  USING (
    tribe_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.tribe_members WHERE tribe_id = meal_plans.tribe_id AND user_id = auth.uid())
  );

-- RLS for meal_plan_days: coaches manage via meal_plan
CREATE POLICY "Coaches can manage meal plan days"
  ON public.meal_plan_days FOR ALL
  USING (
    meal_plan_id IN (
      SELECT mp.id FROM public.meal_plans mp
      JOIN public.coach_profiles cp ON mp.coach_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

-- RLS for meal_plan_days: tribe members can read
CREATE POLICY "Tribe members can view meal plan days"
  ON public.meal_plan_days FOR SELECT
  USING (
    meal_plan_id IN (
      SELECT mp.id FROM public.meal_plans mp
      WHERE mp.tribe_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.tribe_members WHERE tribe_id = mp.tribe_id AND user_id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX idx_meal_plans_coach_id ON public.meal_plans(coach_id);
CREATE INDEX idx_meal_plans_tribe_id ON public.meal_plans(tribe_id);
CREATE INDEX idx_meal_plan_days_meal_plan_id ON public.meal_plan_days(meal_plan_id);

-- Updated_at triggers
CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plan_days_updated_at
  BEFORE UPDATE ON public.meal_plan_days
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
