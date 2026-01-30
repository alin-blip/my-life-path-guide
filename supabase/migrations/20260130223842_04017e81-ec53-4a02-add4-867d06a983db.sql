-- =====================================================
-- PERFORMANCE INDEXES FOR SCALING TO 7000+ USERS
-- =====================================================

-- Index pentru user_tasks - cel mai folosit tabel
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_week 
ON public.user_tasks(user_id, week_key);

CREATE INDEX IF NOT EXISTS idx_user_tasks_user_date 
ON public.user_tasks(user_id, day);

-- Index pentru missions (doar user_id + mission_type)
CREATE INDEX IF NOT EXISTS idx_missions_user_type 
ON public.missions(user_id, mission_type);

-- Index pentru weekly_planning
CREATE INDEX IF NOT EXISTS idx_weekly_planning_user_week 
ON public.weekly_planning(user_id, week_key);

-- Index pentru hot_list_items (foarte folosit în Door)
CREATE INDEX IF NOT EXISTS idx_hot_list_user_week_type 
ON public.hot_list_items(user_id, week_key, list_type);

-- Index pentru challenge_progress
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_day 
ON public.challenge_progress(user_id, day_number);

-- Index pentru stack_sessions
CREATE INDEX IF NOT EXISTS idx_stack_sessions_user_type 
ON public.stack_sessions(user_id, stack_type);

-- Index pentru champion_routine_logs
CREATE INDEX IF NOT EXISTS idx_champion_routine_user_date 
ON public.champion_routine_logs(user_id, date);

-- =====================================================
-- NOTES TABLE FOR CLOUD SYNC
-- =====================================================

-- Creare tabel notes pentru persistență cloud
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_pinned ON public.notes(user_id, pinned DESC, updated_at DESC);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies - utilizatorii pot doar propriile notițe
CREATE POLICY "Users can view own notes"
ON public.notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
ON public.notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
ON public.notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
ON public.notes FOR DELETE
USING (auth.uid() = user_id);

-- Trigger pentru updated_at
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();