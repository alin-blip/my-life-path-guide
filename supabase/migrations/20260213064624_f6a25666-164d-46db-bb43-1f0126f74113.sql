
-- Create breathing_music table
CREATE TABLE public.breathing_music (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.breathing_music ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own music"
  ON public.breathing_music FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own music"
  ON public.breathing_music FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music"
  ON public.breathing_music FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('breathing-music', 'breathing-music', false);

-- Storage policies
CREATE POLICY "Users can upload breathing music"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'breathing-music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their breathing music"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'breathing-music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their breathing music"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'breathing-music' AND auth.uid()::text = (storage.foldername(name))[1]);
