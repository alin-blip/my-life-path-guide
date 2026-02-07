-- Add missing columns to error_logs
ALTER TABLE public.error_logs ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE public.error_logs ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.error_logs ADD COLUMN IF NOT EXISTS component_stack text;
ALTER TABLE public.error_logs ADD COLUMN IF NOT EXISTS resolved boolean DEFAULT false;
ALTER TABLE public.error_logs ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

-- RLS: Admins can read all error logs
CREATE POLICY "Admins can read all error logs"
  ON public.error_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Admins can update error logs (mark resolved)
CREATE POLICY "Admins can update error logs"
  ON public.error_logs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for error_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.error_logs;