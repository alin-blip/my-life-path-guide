-- Creează bucket pentru transcrieri
INSERT INTO storage.buckets (id, name, public)
VALUES ('transcripts', 'transcripts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies pentru transcripts bucket
CREATE POLICY "Users can read own transcripts"
ON storage.objects FOR SELECT
USING (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own transcripts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own transcripts"
ON storage.objects FOR DELETE
USING (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Adaugă coloană pentru transcript în stack_library
ALTER TABLE stack_library 
ADD COLUMN IF NOT EXISTS transcript_path TEXT,
ADD COLUMN IF NOT EXISTS has_transcript BOOLEAN DEFAULT false;