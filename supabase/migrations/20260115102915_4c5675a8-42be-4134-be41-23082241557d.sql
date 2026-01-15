-- Add phone and gender columns to email_leads table
ALTER TABLE public.email_leads 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS gender text;

-- Create warrior_power_results table to store quiz results
CREATE TABLE public.warrior_power_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  phone text,
  gender text,
  scores jsonb NOT NULL DEFAULT '{}',
  total_score integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.warrior_power_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own results" 
ON public.warrior_power_results 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert results" 
ON public.warrior_power_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own results" 
ON public.warrior_power_results 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_warrior_power_results_email ON public.warrior_power_results(email);
CREATE INDEX idx_warrior_power_results_user_id ON public.warrior_power_results(user_id);