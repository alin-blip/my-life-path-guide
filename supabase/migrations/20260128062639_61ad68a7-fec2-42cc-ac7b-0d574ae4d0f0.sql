-- Create ideas_bank table for permanent idea storage
CREATE TABLE public.ideas_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    category TEXT DEFAULT 'work' CHECK (category IN ('work', 'personal', 'urgent', 'project')),
    priority INTEGER DEFAULT 1 CHECK (priority >= 0 AND priority <= 4),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'analyzed', 'approved', 'rejected', 'archived')),
    analysis_result JSONB DEFAULT NULL,
    linked_objective_id UUID DEFAULT NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX idx_ideas_bank_user_id ON public.ideas_bank(user_id);
CREATE INDEX idx_ideas_bank_status ON public.ideas_bank(user_id, status);

-- Enable RLS
ALTER TABLE public.ideas_bank ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own ideas
CREATE POLICY "Users can view their own ideas"
ON public.ideas_bank FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas"
ON public.ideas_bank FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
ON public.ideas_bank FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
ON public.ideas_bank FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_ideas_bank_updated_at
    BEFORE UPDATE ON public.ideas_bank
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing hot list items to ideas_bank (preserve history)
INSERT INTO public.ideas_bank (user_id, text, priority, status, created_at)
SELECT 
    user_id,
    title,
    COALESCE(priority, 1),
    'new',
    COALESCE(created_at, NOW())
FROM public.user_tasks
WHERE task_type = 'hot'
ON CONFLICT DO NOTHING;