
-- 1) User SMS preferences (phone + consent)
CREATE TABLE public.user_sms_preferences (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_e164 TEXT,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  sms_consent BOOLEAN NOT NULL DEFAULT false,
  sms_consent_at TIMESTAMPTZ,
  sms_consent_ip TEXT,
  onboarding_opt_in BOOLEAN NOT NULL DEFAULT true,
  checkout_recovery_opt_in BOOLEAN NOT NULL DEFAULT true,
  routine_reminder_opt_in BOOLEAN NOT NULL DEFAULT true,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL DEFAULT 'ro',
  timezone TEXT NOT NULL DEFAULT 'Europe/Bucharest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sms_preferences TO authenticated;
GRANT ALL ON public.user_sms_preferences TO service_role;
ALTER TABLE public.user_sms_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sms prefs" ON public.user_sms_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all sms prefs" ON public.user_sms_preferences
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_user_sms_prefs_updated BEFORE UPDATE ON public.user_sms_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Sequences (templates for SMS flows)
CREATE TABLE public.sms_sequences (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,                 -- e.g. 'onboarding', 'checkout_recovery', 'routine_reminder'
  name TEXT NOT NULL,
  description TEXT,
  sequence_type TEXT NOT NULL,              -- 'onboarding' | 'checkout_recovery' | 'routine_reminder' | 'broadcast'
  trigger_event TEXT,                       -- 'signup' | 'checkout_abandoned' | 'daily_cron' | 'manual'
  language TEXT NOT NULL DEFAULT 'ro',
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_consent_type TEXT NOT NULL DEFAULT 'marketing_opt_in', -- column name in user_sms_preferences to check
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_sequences TO authenticated;
GRANT ALL ON public.sms_sequences TO service_role;
ALTER TABLE public.sms_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms sequences" ON public.sms_sequences
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_sms_sequences_updated BEFORE UPDATE ON public.sms_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Sequence steps
CREATE TABLE public.sms_sequence_steps (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES public.sms_sequences(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  day_number INT NOT NULL DEFAULT 0,        -- days after enrollment
  delay_hours INT NOT NULL DEFAULT 0,       -- fine-tune delay (added to day_number)
  message_ro TEXT NOT NULL,
  message_en TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sequence_id, step_order)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_sequence_steps TO authenticated;
GRANT ALL ON public.sms_sequence_steps TO service_role;
ALTER TABLE public.sms_sequence_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms steps" ON public.sms_sequence_steps
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_sms_steps_updated BEFORE UPDATE ON public.sms_sequence_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Enrollments
CREATE TABLE public.sms_sequence_enrollments (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES public.sms_sequences(id) ON DELETE CASCADE,
  phone_e164 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',    -- 'active' | 'paused' | 'completed' | 'unsubscribed' | 'failed'
  current_step INT NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_send_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sequence_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_sequence_enrollments TO authenticated;
GRANT ALL ON public.sms_sequence_enrollments TO service_role;
ALTER TABLE public.sms_sequence_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own enrollments" ON public.sms_sequence_enrollments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage enrollments" ON public.sms_sequence_enrollments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_sms_enroll_next_send ON public.sms_sequence_enrollments (next_send_at) WHERE status = 'active';
CREATE TRIGGER trg_sms_enroll_updated BEFORE UPDATE ON public.sms_sequence_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Send log
CREATE TABLE public.sms_send_log (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES public.sms_sequence_enrollments(id) ON DELETE SET NULL,
  sequence_id UUID REFERENCES public.sms_sequences(id) ON DELETE SET NULL,
  step_id UUID REFERENCES public.sms_sequence_steps(id) ON DELETE SET NULL,
  phone_e164 TEXT NOT NULL,
  message_body TEXT NOT NULL,
  twilio_message_sid TEXT,
  status TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'sent' | 'delivered' | 'failed' | 'undelivered'
  error_code TEXT,
  error_message TEXT,
  cost_usd NUMERIC(10,5),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sms_send_log TO authenticated;
GRANT ALL ON public.sms_send_log TO service_role;
ALTER TABLE public.sms_send_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sms log" ON public.sms_send_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all sms log" ON public.sms_send_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_sms_log_user ON public.sms_send_log (user_id, created_at DESC);
CREATE INDEX idx_sms_log_sid ON public.sms_send_log (twilio_message_sid);

-- 6) Suppression list
CREATE TABLE public.sms_suppression (
  phone_e164 TEXT NOT NULL PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT 'user_stop', -- 'user_stop' | 'invalid_number' | 'admin_block'
  suppressed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.sms_suppression TO authenticated;
GRANT ALL ON public.sms_suppression TO service_role;
ALTER TABLE public.sms_suppression ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage suppression" ON public.sms_suppression
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Settings row for Twilio config (from number)
CREATE TABLE public.sms_settings (
  id INT PRIMARY KEY DEFAULT 1,
  from_number TEXT,
  messaging_service_sid TEXT,
  daily_send_cap INT NOT NULL DEFAULT 5000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
GRANT SELECT ON public.sms_settings TO authenticated;
GRANT ALL ON public.sms_settings TO service_role;
ALTER TABLE public.sms_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sms settings" ON public.sms_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.sms_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Seed default sequences (RO)
INSERT INTO public.sms_sequences (key, name, sequence_type, trigger_event, description, requires_consent_type) VALUES
  ('onboarding_ro', 'Onboarding (RO)', 'onboarding', 'signup', 'Welcome + activare primele zile', 'onboarding_opt_in'),
  ('checkout_recovery_ro', 'Recuperare Checkout (RO)', 'checkout_recovery', 'checkout_abandoned', 'Recuperare users care nu au finalizat plata', 'checkout_recovery_opt_in'),
  ('routine_reminder_ro', 'Reminder Rutină (RO)', 'routine_reminder', 'daily_cron', 'Reminder zilnic Warrior Routine', 'routine_reminder_opt_in')
ON CONFLICT (key) DO NOTHING;

-- Seed onboarding steps
INSERT INTO public.sms_sequence_steps (sequence_id, step_order, day_number, message_ro, message_en)
SELECT id, 1, 0, 'Bine ai venit în CEO Mind OS! 🚀 Deschide app-ul acum: https://ceomindos.com/dashboard  Răspunde STOP pentru dezabonare.', 'Welcome to CEO Mind OS! 🚀 Open the app: https://ceomindos.com/dashboard  Reply STOP to unsubscribe.'
FROM public.sms_sequences WHERE key = 'onboarding_ro'
ON CONFLICT DO NOTHING;

INSERT INTO public.sms_sequence_steps (sequence_id, step_order, day_number, message_ro, message_en)
SELECT id, 2, 1, 'Ziua 1: Fă-ți primul Warrior Routine azi. 5 minute schimbă totul. https://ceomindos.com/routine STOP=off', 'Day 1: Do your first Warrior Routine today. 5 min changes everything. https://ceomindos.com/routine STOP=off'
FROM public.sms_sequences WHERE key = 'onboarding_ro'
ON CONFLICT DO NOTHING;

INSERT INTO public.sms_sequence_steps (sequence_id, step_order, day_number, message_ro, message_en)
SELECT id, 3, 3, 'Cum a fost până acum? Intră în comunitate: https://ceomindos.com/programs?tab=community STOP=off', 'How''s it going? Join the community: https://ceomindos.com/programs?tab=community STOP=off'
FROM public.sms_sequences WHERE key = 'onboarding_ro'
ON CONFLICT DO NOTHING;

-- Seed checkout recovery
INSERT INTO public.sms_sequence_steps (sequence_id, step_order, day_number, delay_hours, message_ro, message_en)
SELECT id, 1, 0, 1, 'Ai lăsat ceva în checkout la CEO Mind OS. Finalizează acum: https://ceomindos.com/pricing  STOP=off', 'You left something in checkout at CEO Mind OS. Complete it now: https://ceomindos.com/pricing STOP=off'
FROM public.sms_sequences WHERE key = 'checkout_recovery_ro'
ON CONFLICT DO NOTHING;

INSERT INTO public.sms_sequence_steps (sequence_id, step_order, day_number, message_ro, message_en)
SELECT id, 2, 1, 'Ultimă șansă azi: transformă-ți viața cu CEO Mind OS. https://ceomindos.com/pricing STOP=off', 'Last chance today: transform your life with CEO Mind OS. https://ceomindos.com/pricing STOP=off'
FROM public.sms_sequences WHERE key = 'checkout_recovery_ro'
ON CONFLICT DO NOTHING;

-- Seed routine reminder (single daily message, day_number 0 = triggered daily by cron)
INSERT INTO public.sms_sequence_steps (sequence_id, step_order, day_number, message_ro, message_en)
SELECT id, 1, 0, '🔥 Rutina ta Warrior te așteaptă. 5 min = 1% mai bun azi. https://ceomindos.com/routine STOP=off', '🔥 Your Warrior Routine awaits. 5 min = 1% better today. https://ceomindos.com/routine STOP=off'
FROM public.sms_sequences WHERE key = 'routine_reminder_ro'
ON CONFLICT DO NOTHING;
