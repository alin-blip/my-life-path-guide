-- Tabel pentru meditații de empowerment generate cu AI
CREATE TABLE public.empowerment_meditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Meditație de Empowerment',
  meditation_script TEXT NOT NULL,
  audio_url TEXT,
  binaural_type TEXT DEFAULT 'theta',
  duration_seconds INTEGER,
  objectives_snapshot JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.empowerment_meditations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own meditations" ON public.empowerment_meditations 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meditations" ON public.empowerment_meditations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meditations" ON public.empowerment_meditations 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meditations" ON public.empowerment_meditations 
  FOR DELETE USING (auth.uid() = user_id);