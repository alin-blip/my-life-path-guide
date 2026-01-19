-- Create history table for weekly planning versions
CREATE TABLE public.weekly_planning_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    week_key text NOT NULL,
    domino_title text,
    week_goal text,
    key_points jsonb DEFAULT '[]'::jsonb,
    review_data jsonb DEFAULT '{}'::jsonb,
    version_number integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    snapshot_reason text DEFAULT 'auto_save'
);

-- Enable RLS
ALTER TABLE public.weekly_planning_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own history" 
ON public.weekly_planning_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" 
ON public.weekly_planning_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history" 
ON public.weekly_planning_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_weekly_planning_history_user_week 
ON public.weekly_planning_history(user_id, week_key, created_at DESC);

-- Create trigger function to auto-save history before updates
CREATE OR REPLACE FUNCTION public.save_weekly_planning_history()
RETURNS TRIGGER AS $$
DECLARE
    next_version integer;
BEGIN
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM public.weekly_planning_history
    WHERE user_id = OLD.user_id AND week_key = OLD.week_key;
    
    -- Insert old version into history
    INSERT INTO public.weekly_planning_history (
        user_id, week_key, domino_title, week_goal, 
        key_points, review_data, version_number, snapshot_reason
    ) VALUES (
        OLD.user_id, OLD.week_key, OLD.domino_title, OLD.week_goal,
        OLD.key_points, OLD.review_data, next_version, 'auto_save'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to weekly_planning table
CREATE TRIGGER trigger_save_weekly_planning_history
BEFORE UPDATE ON public.weekly_planning
FOR EACH ROW
EXECUTE FUNCTION public.save_weekly_planning_history();