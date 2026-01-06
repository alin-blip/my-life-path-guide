-- Add category column to user_tasks for idea categorization
ALTER TABLE public.user_tasks ADD COLUMN IF NOT EXISTS category text DEFAULT 'personal';

-- Create idea_empowerment table for storing deep clarification metadata
CREATE TABLE public.idea_empowerment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.user_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  why_want text,
  why_exactly text,
  essence text,
  positive_impact text,
  feeling_achieved text,
  negative_impact text,
  obstacles text,
  how_overcome text,
  other_obstacles text,
  who_involved text,
  is_massive boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on idea_empowerment
ALTER TABLE public.idea_empowerment ENABLE ROW LEVEL SECURITY;

-- RLS policies for idea_empowerment
CREATE POLICY "Users can view their own empowerment data"
ON public.idea_empowerment
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own empowerment data"
ON public.idea_empowerment
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own empowerment data"
ON public.idea_empowerment
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own empowerment data"
ON public.idea_empowerment
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_idea_empowerment_updated_at
BEFORE UPDATE ON public.idea_empowerment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();