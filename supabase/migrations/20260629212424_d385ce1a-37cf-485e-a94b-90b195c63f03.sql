
-- 1. belief_chapters (catalog public pentru utilizatori autentificați)
CREATE TABLE public.belief_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  audio_url TEXT,
  audio_url_2 TEXT,
  pptx_url TEXT,
  fishbowl_url TEXT,
  color_hex TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  cheat_sheet JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.belief_chapters TO authenticated;
GRANT ALL ON public.belief_chapters TO service_role;
ALTER TABLE public.belief_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view published chapters"
ON public.belief_chapters FOR SELECT TO authenticated
USING (is_published = true);

CREATE POLICY "Admins can manage chapters"
ON public.belief_chapters FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_belief_chapters_updated_at
BEFORE UPDATE ON public.belief_chapters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. belief_chapter_progress
CREATE TABLE public.belief_chapter_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_slug TEXT NOT NULL,
  audio_percent NUMERIC NOT NULL DEFAULT 0,
  pptx_opened BOOLEAN NOT NULL DEFAULT false,
  fishbowl_completed BOOLEAN NOT NULL DEFAULT false,
  matrix_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, chapter_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_chapter_progress TO authenticated;
GRANT ALL ON public.belief_chapter_progress TO service_role;
ALTER TABLE public.belief_chapter_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own belief progress"
ON public.belief_chapter_progress FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_belief_chapter_progress_updated_at
BEFORE UPDATE ON public.belief_chapter_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. belief_fishbowl_responses
CREATE TABLE public.belief_fishbowl_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_slug TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_fishbowl_responses TO authenticated;
GRANT ALL ON public.belief_fishbowl_responses TO service_role;
ALTER TABLE public.belief_fishbowl_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own fishbowl responses"
ON public.belief_fishbowl_responses FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_belief_fishbowl_responses_updated_at
BEFORE UPDATE ON public.belief_fishbowl_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. belief_audits
CREATE TABLE public.belief_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  diagnosis_labels TEXT[] NOT NULL DEFAULT '{}',
  overall_score NUMERIC,
  strategic_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  next_due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_audits TO authenticated;
GRANT ALL ON public.belief_audits TO service_role;
ALTER TABLE public.belief_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own belief audits"
ON public.belief_audits FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_belief_audits_updated_at
BEFORE UPDATE ON public.belief_audits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed cele 5 capitole
INSERT INTO public.belief_chapters (slug, title, subtitle, description, color_hex, icon, order_index) VALUES
('bunatate', 'Bunătate', 'Credința #1', 'Bunătatea ca filtru de decizie — fundamentul leadership-ului uman.', '#10B981', 'Heart', 1),
('iubire-de-oameni', 'Iubire de Oameni', 'Credința #2', 'Liderul vede oamenii înainte de rezultate. Iubirea ca strategie pe termen lung.', '#EF4444', 'Users', 2),
('recunostinta', 'Recunoștință', 'Credința #3', 'Recunoștința ca antidot la autosabotaj și ancoră de claritate executivă.', '#F59E0B', 'Sparkles', 3),
('iertare', 'Iertare', 'Credința #4', 'Iertarea ca eliberare de greutatea trecutului — condiție pentru putere.', '#8B5CF6', 'Sun', 4),
('smerenia', 'Smerenia', 'Credința #5', 'Smerenia ca opus al aroganței — uşa către învăţare continuă.', '#3B82F6', 'Mountain', 5);
