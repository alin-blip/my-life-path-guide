-- Create vision_boards table for storing user vision boards
CREATE TABLE public.vision_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  
  -- Images per category (stored as URLs from storage or base64)
  body_image_url TEXT,
  being_image_url TEXT,
  balance_image_url TEXT,
  business_image_url TEXT,
  
  -- Vision text per category
  body_vision TEXT,
  being_vision TEXT,
  balance_vision TEXT,
  business_vision TEXT,
  
  -- Complete quiz answers
  quiz_answers JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  is_complete BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'lead_magnet',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vision_boards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own vision boards
CREATE POLICY "Users can manage own vision boards" 
ON public.vision_boards FOR ALL 
USING (auth.uid() = user_id);

-- Policy: Allow anonymous inserts for lead magnet (email-based)
CREATE POLICY "Anyone can create vision board for lead magnet" 
ON public.vision_boards FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_vision_boards_updated_at
BEFORE UPDATE ON public.vision_boards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();