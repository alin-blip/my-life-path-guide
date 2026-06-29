
-- 1. Gratitude Anchor
CREATE TABLE public.belief_gratitude_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_reflection TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_gratitude_logs TO authenticated;
GRANT ALL ON public.belief_gratitude_logs TO service_role;
ALTER TABLE public.belief_gratitude_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gratitude" ON public.belief_gratitude_logs
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_belief_gratitude_logs_updated_at
BEFORE UPDATE ON public.belief_gratitude_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Forgiveness Protocol
CREATE TABLE public.belief_forgiveness_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_name TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  current_cost TEXT,
  release_declaration TEXT NOT NULL,
  ai_weekly_task TEXT,
  exported_to_hit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_forgiveness_logs TO authenticated;
GRANT ALL ON public.belief_forgiveness_logs TO service_role;
ALTER TABLE public.belief_forgiveness_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own forgiveness" ON public.belief_forgiveness_logs
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_belief_forgiveness_logs_updated_at
BEFORE UPDATE ON public.belief_forgiveness_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Self-Care Daily (Grija de Sine)
CREATE TABLE public.belief_self_care_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC,
  sleep_ok BOOLEAN NOT NULL DEFAULT false,
  movement_done BOOLEAN NOT NULL DEFAULT false,
  food_clean BOOLEAN NOT NULL DEFAULT false,
  tech_break_done BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  score INTEGER GENERATED ALWAYS AS (
    (CASE WHEN sleep_ok THEN 1 ELSE 0 END) +
    (CASE WHEN movement_done THEN 1 ELSE 0 END) +
    (CASE WHEN food_clean THEN 1 ELSE 0 END) +
    (CASE WHEN tech_break_done THEN 1 ELSE 0 END)
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.belief_self_care_logs TO authenticated;
GRANT ALL ON public.belief_self_care_logs TO service_role;
ALTER TABLE public.belief_self_care_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own self care" ON public.belief_self_care_logs
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_belief_self_care_logs_updated_at
BEFORE UPDATE ON public.belief_self_care_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
