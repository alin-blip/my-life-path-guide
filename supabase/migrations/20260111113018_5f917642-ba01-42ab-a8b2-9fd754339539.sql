-- Create user_goal_categories table for flexible category system
CREATE TABLE public.user_goal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_key TEXT NOT NULL,
  parent_category TEXT,
  display_name TEXT NOT NULL,
  display_name_ro TEXT,
  icon TEXT DEFAULT '📌',
  color TEXT DEFAULT 'blue',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_key)
);

-- Enable RLS
ALTER TABLE public.user_goal_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own categories"
ON public.user_goal_categories FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
ON public.user_goal_categories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON public.user_goal_categories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON public.user_goal_categories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_goal_categories_updated_at
BEFORE UPDATE ON public.user_goal_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();