
-- Community settings table for welcome message and other global settings
CREATE TABLE public.community_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read community settings"
  ON public.community_settings FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert community settings"
  ON public.community_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update community settings"
  ON public.community_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete community settings"
  ON public.community_settings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default welcome message
INSERT INTO public.community_settings (setting_key, setting_value)
VALUES ('welcome_message', 'Bine ai venit in comunitatea Warrior OS! 🎯 Aici ne ajutam reciproc sa crestem. Reguli: 1) Fii respectuos 2) Impartaseste victoriile 3) Cere ajutor cand ai nevoie.');
