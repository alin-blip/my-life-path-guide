
-- Add coach-related columns to workout_programs
ALTER TABLE public.workout_programs 
  ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tribe_id UUID REFERENCES public.tribes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_coach_template BOOLEAN NOT NULL DEFAULT false;

-- Index for coach lookups
CREATE INDEX IF NOT EXISTS idx_workout_programs_coach_id ON public.workout_programs(coach_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_tribe_id ON public.workout_programs(tribe_id);

-- RLS: Coaches can manage their own coach templates
CREATE POLICY "Coaches can manage own workout templates"
ON public.workout_programs
FOR ALL
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);

-- RLS: Tribe members can read coach programs assigned to their tribe
CREATE POLICY "Tribe members can read coach workout programs"
ON public.workout_programs
FOR SELECT
USING (
  is_coach_template = true 
  AND tribe_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.tribe_members 
    WHERE tribe_members.tribe_id = workout_programs.tribe_id 
    AND tribe_members.user_id = auth.uid()
  )
);
