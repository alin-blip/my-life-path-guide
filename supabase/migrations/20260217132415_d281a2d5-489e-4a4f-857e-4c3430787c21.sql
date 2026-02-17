
-- Coach Routine Templates: allows coaches to create routine templates for their tribes
CREATE TABLE public.coach_routine_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  routine_steps_order JSONB,
  active_steps JSONB,
  step_configs JSONB,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_routine_templates ENABLE ROW LEVEL SECURITY;

-- Coaches can CRUD their own templates
CREATE POLICY "Coaches can manage their own templates"
ON public.coach_routine_templates
FOR ALL
TO authenticated
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);

-- Tribe members can read templates assigned to their tribe
CREATE POLICY "Tribe members can read assigned templates"
ON public.coach_routine_templates
FOR SELECT
TO authenticated
USING (
  tribe_id IS NOT NULL AND public.is_tribe_member(auth.uid(), tribe_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_coach_routine_templates_updated_at
BEFORE UPDATE ON public.coach_routine_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure only one default template per coach
CREATE UNIQUE INDEX idx_one_default_per_coach 
ON public.coach_routine_templates (coach_id) 
WHERE is_default = true;
