-- Enable realtime for hot_list_items table
ALTER TABLE hot_list_items REPLICA IDENTITY FULL;

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE hot_list_items;

-- Create daily_progress table for tracking user statistics
CREATE TABLE IF NOT EXISTS public.daily_progress_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  hot_list_items INTEGER DEFAULT 0,
  hit_list_items INTEGER DEFAULT 0,
  do_list_items INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_progress_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_progress_stats
CREATE POLICY "Users can view their own progress stats"
ON public.daily_progress_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress stats"
ON public.daily_progress_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress stats"
ON public.daily_progress_stats
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress stats"
ON public.daily_progress_stats
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_progress_stats_updated_at
BEFORE UPDATE ON public.daily_progress_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update daily progress
CREATE OR REPLACE FUNCTION public.update_daily_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily progress statistics
  INSERT INTO public.daily_progress_stats (
    user_id,
    date,
    total_tasks,
    completed_tasks,
    hot_list_items,
    hit_list_items,
    do_list_items,
    completion_rate
  )
  SELECT 
    NEW.user_id,
    CURRENT_DATE,
    COALESCE(hot_count, 0) + COALESCE(hit_count, 0) + COALESCE(do_count, 0) as total_tasks,
    COALESCE(completed_count, 0) as completed_tasks,
    COALESCE(hot_count, 0) as hot_list_items,
    COALESCE(hit_count, 0) as hit_list_items,
    COALESCE(do_count, 0) as do_list_items,
    CASE 
      WHEN (COALESCE(hot_count, 0) + COALESCE(hit_count, 0) + COALESCE(do_count, 0)) > 0
      THEN (COALESCE(completed_count, 0) * 100.0) / (COALESCE(hot_count, 0) + COALESCE(hit_count, 0) + COALESCE(do_count, 0))
      ELSE 0
    END as completion_rate
  FROM (
    SELECT 
      COUNT(CASE WHEN list_type = 'hot' THEN 1 END) as hot_count,
      COUNT(CASE WHEN list_type = 'hit' THEN 1 END) as hit_count,
      COUNT(CASE WHEN list_type = 'do' THEN 1 END) as do_count,
      COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
    FROM hot_list_items 
    WHERE user_id = NEW.user_id 
      AND week_key = NEW.week_key
  ) stats
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    total_tasks = EXCLUDED.total_tasks,
    completed_tasks = EXCLUDED.completed_tasks,
    hot_list_items = EXCLUDED.hot_list_items,
    hit_list_items = EXCLUDED.hit_list_items,
    do_list_items = EXCLUDED.do_list_items,
    completion_rate = EXCLUDED.completion_rate,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update daily progress when hot_list_items changes
CREATE TRIGGER trigger_update_daily_progress
  AFTER INSERT OR UPDATE OR DELETE ON hot_list_items
  FOR EACH ROW EXECUTE FUNCTION update_daily_progress();