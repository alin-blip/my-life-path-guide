-- Create table for tracking daily book page reading progress
CREATE TABLE public.book_reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_number INTEGER NOT NULL,
  principle TEXT NOT NULL,
  chapter TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique page per user
  UNIQUE (user_id, page_number)
);

-- Enable Row Level Security
ALTER TABLE public.book_reading_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own reading progress" 
ON public.book_reading_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading progress" 
ON public.book_reading_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" 
ON public.book_reading_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress" 
ON public.book_reading_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_book_reading_progress_user_id ON public.book_reading_progress(user_id);
CREATE INDEX idx_book_reading_progress_principle ON public.book_reading_progress(principle);