-- Add sentiment analysis column to voice_recordings table
ALTER TABLE public.voice_recordings 
ADD COLUMN sentiment_analysis jsonb DEFAULT NULL;

-- Add index for faster queries on sentiment data
CREATE INDEX idx_voice_recordings_sentiment ON public.voice_recordings USING gin(sentiment_analysis);

COMMENT ON COLUMN public.voice_recordings.sentiment_analysis IS 'AI-generated sentiment analysis containing emotions, intensity, insights, and key themes from the transcript';