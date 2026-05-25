-- Extend mind_shift_sessions with chat/draft/pattern fields
ALTER TABLE public.mind_shift_sessions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'complete',
  ADD COLUMN IF NOT EXISTS chat_step integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS intensity_before integer,
  ADD COLUMN IF NOT EXISTS intensity_after integer,
  ADD COLUMN IF NOT EXISTS recurrence text,
  ADD COLUMN IF NOT EXISTS perception_area text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS chat_history jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS title text;

-- Validation trigger for new columns (immutable check constraints would block restores)
CREATE OR REPLACE FUNCTION public.validate_mind_shift_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('draft','processing','complete') THEN
    RAISE EXCEPTION 'Invalid status %: must be draft|processing|complete', NEW.status;
  END IF;
  IF NEW.recurrence IS NOT NULL AND NEW.recurrence NOT IN ('Z','S','L') THEN
    RAISE EXCEPTION 'Invalid recurrence %: must be Z|S|L', NEW.recurrence;
  END IF;
  IF NEW.intensity_before IS NOT NULL AND (NEW.intensity_before < 0 OR NEW.intensity_before > 100) THEN
    RAISE EXCEPTION 'intensity_before must be 0..100';
  END IF;
  IF NEW.intensity_after IS NOT NULL AND (NEW.intensity_after < 0 OR NEW.intensity_after > 100) THEN
    RAISE EXCEPTION 'intensity_after must be 0..100';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mind_shift_sessions_validate ON public.mind_shift_sessions;
CREATE TRIGGER trg_mind_shift_sessions_validate
  BEFORE INSERT OR UPDATE ON public.mind_shift_sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_mind_shift_session();

-- Indexes for new query patterns
CREATE INDEX IF NOT EXISTS idx_mind_shift_sessions_user_status
  ON public.mind_shift_sessions (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mind_shift_sessions_user_category
  ON public.mind_shift_sessions (user_id, category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mind_shift_sessions_user_perception
  ON public.mind_shift_sessions (user_id, perception_area) WHERE perception_area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mind_shift_sessions_user_recurrence
  ON public.mind_shift_sessions (user_id, recurrence) WHERE recurrence IS NOT NULL;

-- Categories library
CREATE TABLE IF NOT EXISTS public.mind_shift_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  emoji text,
  description text,
  order_index integer DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mind_shift_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.mind_shift_categories;
CREATE POLICY "Anyone can view active categories"
  ON public.mind_shift_categories FOR SELECT
  TO authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.mind_shift_categories;
CREATE POLICY "Admins manage categories"
  ON public.mind_shift_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed 8 default categories
INSERT INTO public.mind_shift_categories (slug, name, emoji, description, order_index) VALUES
  ('bani', 'Bani & Abundență', '💰', 'Credințe despre bani, valoare proprie, succes financiar', 1),
  ('sanatate', 'Sănătate & Energie', '💪', 'Corp, energie, vitalitate, somn, mâncare', 2),
  ('relatii', 'Relații & Iubire', '❤️', 'Partener, familie, prietenii, conexiune', 3),
  ('cariera', 'Carieră & Business', '🚀', 'Muncă, echipă, clienți, antreprenoriat', 4),
  ('sine', 'Sine & Identitate', '🧬', 'Cine sunt, ce merit, încredere în sine', 5),
  ('misiune', 'Misiune & Sens', '🎯', 'Scop, contribuție, legacy, viziune', 6),
  ('timp', 'Timp & Energie', '⏳', 'Productivitate, prioritizare, focus, decizii', 7),
  ('spirit', 'Spirit & Credință', '🙏', 'Conexiune cu ceva mai mare, încredere, predare', 8)
ON CONFLICT (slug) DO NOTHING;