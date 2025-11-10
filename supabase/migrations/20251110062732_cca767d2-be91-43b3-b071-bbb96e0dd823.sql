-- Create migration status table to track what has been migrated
CREATE TABLE IF NOT EXISTS public.migration_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  migration_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed
  items_total integer DEFAULT 0,
  items_migrated integer DEFAULT 0,
  error_message text,
  backup_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  UNIQUE(user_id, migration_type)
);

-- Enable RLS
ALTER TABLE public.migration_status ENABLE ROW LEVEL SECURITY;

-- Users can only see their own migration status
CREATE POLICY "Users can view their own migration status"
ON public.migration_status
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own migration status
CREATE POLICY "Users can insert their own migration status"
ON public.migration_status
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own migration status
CREATE POLICY "Users can update their own migration status"
ON public.migration_status
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all migration statuses
CREATE POLICY "Admins can view all migration statuses"
ON public.migration_status
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));