-- Create goal reminders table for in-app notifications
CREATE TABLE public.goal_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_shown_at TIMESTAMP WITH TIME ZONE,
  next_reminder_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Enable RLS
ALTER TABLE public.goal_reminders ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own reminders
CREATE POLICY "Users can manage their own goal reminders"
ON public.goal_reminders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add parent_mission_id to missions for hierarchical linking
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS parent_mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_goal_reminders_next_reminder ON public.goal_reminders(user_id, next_reminder_at) WHERE is_active = true;
CREATE INDEX idx_missions_parent ON public.missions(parent_mission_id) WHERE parent_mission_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_goal_reminders_updated_at
BEFORE UPDATE ON public.goal_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();