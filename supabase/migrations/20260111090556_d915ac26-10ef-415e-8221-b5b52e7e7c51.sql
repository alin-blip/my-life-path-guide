-- Add is_favorite column to empowerment_meditations
ALTER TABLE public.empowerment_meditations 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Create index for faster sorting (favorites first, then by date)
CREATE INDEX IF NOT EXISTS idx_meditations_user_favorite 
ON public.empowerment_meditations(user_id, is_favorite DESC, created_at DESC);