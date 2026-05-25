
-- 1. Beliefs library
CREATE TABLE public.mind_shift_beliefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  activation_prompt TEXT NOT NULL,
  incantation TEXT NOT NULL,
  emotion_tags TEXT[] DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mind_shift_beliefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beliefs readable by authenticated users"
  ON public.mind_shift_beliefs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Beliefs manageable by admins"
  ON public.mind_shift_beliefs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Distortions library
CREATE TABLE public.mind_shift_distortions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  example TEXT,
  reframe_template TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mind_shift_distortions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Distortions readable by authenticated users"
  ON public.mind_shift_distortions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Distortions manageable by admins"
  ON public.mind_shift_distortions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. User sessions
CREATE TABLE public.mind_shift_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_key TEXT,
  emotion TEXT,
  intensity INTEGER CHECK (intensity BETWEEN 0 AND 100),
  situation TEXT,
  automatic_thought TEXT,
  distortion_slug TEXT,
  cognitive_reframe TEXT,
  positive_reframe TEXT,
  act_value TEXT,
  belief_slug TEXT,
  incantation_text TEXT,
  commitment_text TEXT,
  commitment_task_id UUID,
  ai_suggestions JSONB,
  completed_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'routine',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mind_shift_sessions_user_date ON public.mind_shift_sessions(user_id, date DESC);

ALTER TABLE public.mind_shift_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mind shift sessions"
  ON public.mind_shift_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own mind shift sessions"
  ON public.mind_shift_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own mind shift sessions"
  ON public.mind_shift_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own mind shift sessions"
  ON public.mind_shift_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_mind_shift_sessions_updated_at
  BEFORE UPDATE ON public.mind_shift_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_mind_shift_beliefs_updated_at
  BEFORE UPDATE ON public.mind_shift_beliefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_mind_shift_distortions_updated_at
  BEFORE UPDATE ON public.mind_shift_distortions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-set user_id + week_key
CREATE OR REPLACE FUNCTION public.auto_set_mind_shift_defaults()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NEW.user_id IS NULL THEN NEW.user_id := auth.uid(); END IF;
  IF NEW.week_key IS NULL THEN
    NEW.week_key := 'door-week-' || to_char(now(), 'IYYY-IW');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mind_shift_sessions_defaults
  BEFORE INSERT ON public.mind_shift_sessions
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_mind_shift_defaults();

-- 4. Add summary column to champion_routine_logs
ALTER TABLE public.champion_routine_logs
  ADD COLUMN IF NOT EXISTS mind_shift_summary JSONB;

-- 5. Seed beliefs
INSERT INTO public.mind_shift_beliefs (slug, name, short_description, activation_prompt, incantation, emotion_tags, order_index) VALUES
('bunatate', 'Bunătate', 'Acționez cu blândețe față de mine și ceilalți.', 'Care e un act mic de bunătate pe care îl pot oferi azi (mie sau cuiva)?', 'EU SUNT BLÂND. EU OFER LUMII CEEA CE VREAU SĂ PRIMESC.', ARRAY['angry','stressed','overwhelmed'], 1),
('iubirea-de-oameni', 'Iubirea de Oameni', 'Văd valoarea în fiecare om pe care îl întâlnesc.', 'Pe cine vreau să fac să se simtă văzut și iubit azi?', 'EU IUBESC OAMENII. EU CONSTRUIESC PUNȚI, NU ZIDURI.', ARRAY['sad','conflicted'], 2),
('recunostinta', 'Recunoștință', 'Văd binele care există deja în viața mea.', 'Pentru ce 3 lucruri sunt recunoscător chiar acum, în acest moment?', 'EU SUNT RECUNOSCĂTOR. EU CREEZ ABUNDENȚĂ DIN CE AM DEJA.', ARRAY['sad','anxious','overwhelmed','stuck'], 3),
('iertare', 'Iertare', 'Mă eliberez de greutatea trecutului.', 'Pe cine (inclusiv pe mine) am de iertat ca să mă eliberez azi?', 'EU IERT. EU MĂ ELIBEREZ. EU MERG ÎNAINTE UȘOR.', ARRAY['angry','sad','conflicted'], 4),
('smerenie', 'Smerenie', 'Învăț continuu și recunosc ce nu știu.', 'Ce am de învățat din situația actuală, chiar dacă rănește ego-ul?', 'EU SUNT SMERIT. EU CRESC PRIN LECȚIE, NU PRIN APĂRARE.', ARRAY['angry','conflicted','procrastinating'], 5),
('grija-de-sine', 'Grija de Sine', 'Mă respect și îmi onorez nevoile.', 'Ce nevoie a mea reală am ignorat? Cum o pot onora azi?', 'EU MĂ RESPECT. EU AM GRIJĂ DE MINE PRIMUL.', ARRAY['overwhelmed','stressed','stuck'], 6),
('gandire-pozitiva', 'Gândire Pozitivă', 'Aleg să văd posibilitatea în orice provocare.', 'Care e cea mai puternică interpretare pozitivă a situației?', 'EU GÂNDESC POZITIV. EU GĂSESC OPORTUNITATEA ÎN ORICE.', ARRAY['sad','anxious','procrastinating','stuck'], 7),
('intelepciune', 'Înțelepciune', 'Acționez din cunoaștere, nu din reactivitate.', 'Ce ar face cel mai înțelept "eu" în această situație?', 'EU SUNT ÎNȚELEPT. EU ACȚIONEZ CU CLARITATE, NU CU FRICĂ.', ARRAY['distracted','overwhelmed','conflicted'], 8),
('moralitate', 'Moralitate', 'Acționez aliniat cu valorile mele.', 'Care e acțiunea pe care o respect cel mai mult moral, acum?', 'EU TRĂIESC PRINCIPIILE MELE. EU FAC CE E CORECT.', ARRAY['conflicted','procrastinating'], 9),
('curaj', 'Curaj', 'Fac ce e greu pentru că merită.', 'Ce acțiune mică, dar curajoasă pot face în următoarele 60 min?', 'EU SUNT CURAJOS. EU ACȚIONEZ ÎN CIUDA FRICII.', ARRAY['anxious','stuck','procrastinating','overwhelmed'], 10);

-- 6. Seed distortions
INSERT INTO public.mind_shift_distortions (slug, name, short_description, example, reframe_template, order_index) VALUES
('catastrofizare', 'Catastrofizare', 'Văd cel mai rău scenariu posibil ca cel mai probabil.', '"Dacă pierd clientul ăsta, e gata tot business-ul."', 'Care e cel mai realist scenariu, nu cel mai rău?', 1),
('filtrare', 'Filtrare', 'Reduc întreaga zi la o singură întâmplare negativă.', 'Am avut 5 wins și 1 fail — îmi amintesc doar fail-ul.', 'Ce a mers BINE azi, chiar și mic?', 2),
('victimizare', 'Victimizare', 'Eu sunt cauza/sursa neputinței mele.', '"Mi se întâmplă mereu mie."', 'Ce parte din situație POT controla?', 3),
('comparare', 'Comparare', 'Mă măsor cu alții și ies mereu mai jos.', '"X are deja milionul, eu sunt încă la zero."', 'Cu cine de acum 1 an mă pot compara — eu?', 4),
('autosabotaj', 'Autosabotaj', 'Mă convingem că nu merit sau nu pot.', '"Oricum nu o să iasă, de ce să încep?"', 'Ce dovadă concretă am că NU pot?', 5),
('rusine-vinovatie', 'Rușine & Vinovăție', 'Mă pedepsesc pentru o greșeală mult după ce s-a întâmplat.', '"Sunt un om groaznic pentru că am țipat ieri."', 'Ce ar spune un prieten bun despre asta?', 6),
('pesimism', 'Pesimism', 'Aștept eșecul ca rezultat default.', '"Nu o să mă vrea nimeni."', 'Care e dovada că e adevărat — și că nu e?', 7),
('despre-sine', 'Gânduri Distructive Despre Sine', 'Mă identific cu cel mai aspru critic interior.', '"Sunt prost. Nu valorez nimic."', 'Aș vorbi așa cu cineva pe care îl iubesc?', 8),
('generalizare', 'Generalizare', 'Iau un eveniment și îl extind la "mereu/niciodată".', '"Niciodată nu reușesc să termin un proiect."', 'De câte ori AM terminat ceva? Listează 3.', 9),
('etichetare', 'Etichetare', 'Lipesc o etichetă fixă pe mine sau pe alții.', '"Sunt un ratat. El e un toxic."', 'Acțiunea ≠ identitate. Ce comportament specific descriu?', 10);
