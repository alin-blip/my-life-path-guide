-- Create lifebook_entries table for storing completed sections
CREATE TABLE public.lifebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL, -- 'body', 'being', 'balance', 'business'
  subcategory TEXT NOT NULL, -- 'health_fitness', 'intellectual_life', etc.
  section TEXT NOT NULL, -- 'premise', 'vision', 'purpose', 'strategy', 'notes'
  content JSONB NOT NULL DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  summary TEXT,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subcategory, section)
);

-- Create lifebook_drafts table for auto-saving in-progress work
CREATE TABLE public.lifebook_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subcategory TEXT NOT NULL,
  section TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  last_saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subcategory, section)
);

-- Enable RLS
ALTER TABLE public.lifebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifebook_drafts ENABLE ROW LEVEL SECURITY;

-- RLS policies for lifebook_entries
CREATE POLICY "Users can manage their own lifebook entries"
ON public.lifebook_entries
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for lifebook_drafts
CREATE POLICY "Users can manage their own lifebook drafts"
ON public.lifebook_drafts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for lifebook_entries
CREATE TRIGGER update_lifebook_entries_updated_at
BEFORE UPDATE ON public.lifebook_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for lifebook_drafts
CREATE TRIGGER update_lifebook_drafts_updated_at
BEFORE UPDATE ON public.lifebook_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();