
-- ============================================================================
-- Executive Parenting Stack — Schema
-- ============================================================================

-- 1. PARENTING PROFILES (one per user)
CREATE TABLE public.parenting_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_style text CHECK (detected_style IN ('authoritative','authoritarian','permissive','neglectful','mixed','unknown')) DEFAULT 'unknown',
  co_parent_name text,
  onboarding_completed boolean DEFAULT false,
  daily_nudge_enabled boolean DEFAULT true,
  preferred_language text DEFAULT 'ro' CHECK (preferred_language IN ('ro','en')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parenting_profiles TO authenticated;
GRANT ALL ON public.parenting_profiles TO service_role;
ALTER TABLE public.parenting_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_parenting_profile" ON public.parenting_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. PARENTING CHILDREN (1..N per user, max 8)
CREATE TABLE public.parenting_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  birth_year integer NOT NULL CHECK (birth_year >= 1990 AND birth_year <= EXTRACT(YEAR FROM now())::int),
  birth_month integer CHECK (birth_month BETWEEN 1 AND 12),
  gender text CHECK (gender IN ('male','female','other','undisclosed')),
  nickname text,
  strengths text,
  challenges text,
  notes text,
  is_active boolean DEFAULT true,
  position integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parenting_children TO authenticated;
GRANT ALL ON public.parenting_children TO service_role;
ALTER TABLE public.parenting_children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_parenting_children" ON public.parenting_children
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_parenting_children_user ON public.parenting_children(user_id, position);

-- Enforce max 8 active children per user
CREATE OR REPLACE FUNCTION public.check_max_parenting_children()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_active = true AND (
    SELECT COUNT(*) FROM public.parenting_children
    WHERE user_id = NEW.user_id AND is_active = true AND id <> COALESCE(NEW.id, gen_random_uuid())
  ) >= 8 THEN
    RAISE EXCEPTION 'Maximum 8 active children per user';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_max_parenting_children
  BEFORE INSERT OR UPDATE ON public.parenting_children
  FOR EACH ROW EXECUTE FUNCTION public.check_max_parenting_children();

-- 3. PARENTING SESSIONS (AI coach sessions)
CREATE TABLE public.parenting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.parenting_children(id) ON DELETE SET NULL,
  session_type text NOT NULL DEFAULT 'coach' CHECK (session_type IN ('coach','crisis','reflection','planning')),
  title text,
  summary text,
  key_insights jsonb DEFAULT '[]'::jsonb,
  action_items jsonb DEFAULT '[]'::jsonb,
  completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parenting_sessions TO authenticated;
GRANT ALL ON public.parenting_sessions TO service_role;
ALTER TABLE public.parenting_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_parenting_sessions" ON public.parenting_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_parenting_sessions_user ON public.parenting_sessions(user_id, created_at DESC);

-- 4. PARENTING SESSION MESSAGES
CREATE TABLE public.parenting_session_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.parenting_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('system','user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parenting_session_messages TO authenticated;
GRANT ALL ON public.parenting_session_messages TO service_role;
ALTER TABLE public.parenting_session_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_parenting_messages" ON public.parenting_session_messages
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_parenting_msg_session ON public.parenting_session_messages(session_id, created_at);

-- 5. PARENTING TIMELINE EVENTS
CREATE TABLE public.parenting_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.parenting_children(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('rupture','repair','achievement','crisis','milestone','emotion_coaching','breakthrough','concern','note')),
  title text NOT NULL,
  description text,
  emotional_intensity integer CHECK (emotional_intensity BETWEEN 0 AND 10),
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  event_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parenting_timeline_events TO authenticated;
GRANT ALL ON public.parenting_timeline_events TO service_role;
ALTER TABLE public.parenting_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_parenting_timeline" ON public.parenting_timeline_events
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_parenting_timeline_child ON public.parenting_timeline_events(child_id, event_date DESC);

-- 6. PARENTING TOXICITY SCANS (Baumrind + 6 toxic patterns)
CREATE TABLE public.parenting_toxicity_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.parenting_children(id) ON DELETE SET NULL,
  raw_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  authoritative_score numeric CHECK (authoritative_score BETWEEN 0 AND 100),
  authoritarian_score numeric CHECK (authoritarian_score BETWEEN 0 AND 100),
  permissive_score numeric CHECK (permissive_score BETWEEN 0 AND 100),
  neglectful_score numeric CHECK (neglectful_score BETWEEN 0 AND 100),
  dominant_style text CHECK (dominant_style IN ('authoritative','authoritarian','permissive','neglectful','mixed')),
  toxic_patterns jsonb DEFAULT '{}'::jsonb,
  ai_interpretation text,
  action_plan jsonb DEFAULT '[]'::jsonb,
  completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parenting_toxicity_scans TO authenticated;
GRANT ALL ON public.parenting_toxicity_scans TO service_role;
ALTER TABLE public.parenting_toxicity_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_parenting_scans" ON public.parenting_toxicity_scans
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_parenting_scans_user ON public.parenting_toxicity_scans(user_id, created_at DESC);

-- 7. PARENTING DAILY TOOLS LOG
CREATE TABLE public.parenting_daily_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.parenting_children(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  tool_type text NOT NULL CHECK (tool_type IN ('positive_ratio','no_but_appreciation','emotion_coaching','repair_apology','serve_return')),
  positives_count integer DEFAULT 0,
  negatives_count integer DEFAULT 0,
  content text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parenting_daily_tools TO authenticated;
GRANT ALL ON public.parenting_daily_tools TO service_role;
ALTER TABLE public.parenting_daily_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_parenting_daily_tools" ON public.parenting_daily_tools
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_parenting_tools_user_date ON public.parenting_daily_tools(user_id, log_date DESC);

-- 8. PARENTING EVIDENCE SOURCES (shared bibliography)
CREATE TABLE public.parenting_evidence_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  author text NOT NULL,
  year integer,
  title text NOT NULL,
  url text,
  source_type text CHECK (source_type IN ('peer_review','meta_analysis','book','working_paper','guideline','longitudinal')),
  topic text[] DEFAULT ARRAY[]::text[],
  confidence text CHECK (confidence IN ('high','medium','low')) DEFAULT 'high',
  summary_ro text,
  summary_en text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parenting_evidence_sources TO authenticated, anon;
GRANT ALL ON public.parenting_evidence_sources TO service_role;
ALTER TABLE public.parenting_evidence_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_evidence_sources" ON public.parenting_evidence_sources
  FOR SELECT TO authenticated, anon USING (true);

-- updated_at triggers
CREATE TRIGGER trg_parenting_profiles_updated BEFORE UPDATE ON public.parenting_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_parenting_children_updated BEFORE UPDATE ON public.parenting_children
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_parenting_sessions_updated BEFORE UPDATE ON public.parenting_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_parenting_scans_updated BEFORE UPDATE ON public.parenting_toxicity_scans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED evidence sources (validated bibliography)
INSERT INTO public.parenting_evidence_sources (slug, author, year, title, url, source_type, topic, confidence, summary_ro, summary_en) VALUES
('piaget-1952', 'Piaget, J.', 1952, 'The Origins of Intelligence in Children', 'https://www.ncbi.nlm.nih.gov/books/NBK448206/', 'book', ARRAY['cognitive_development','stages'], 'high',
 'Cele 4 stadii cognitive: senzoriomotor (0-2), preoperațional (2-7), operațional-concret (7-11), formal (12+).',
 'Four cognitive stages: sensorimotor, preoperational, concrete operational, formal operational.'),
('erikson-1963', 'Erikson, E.H.', 1963, 'Childhood and Society (2nd ed.)', 'https://www.ncbi.nlm.nih.gov/books/NBK556096/', 'book', ARRAY['psychosocial','identity'], 'high',
 '8 stadii psihosociale — fiecare cu o criză de rezolvat. Neresolvarea revine ca vulnerabilitate.',
 'Eight psychosocial stages, each with a crisis to resolve; unresolved crises resurface later.'),
('malone-2016', 'Malone et al.', 2016, 'Longitudinal validation of Erikson stages', 'https://link.springer.com/article/10.1007/s10804-007-9026-3', 'longitudinal', ARRAY['psychosocial'], 'high',
 'Studiu longitudinal 34 ani, n=343 — confirmă că stadiile trust și identity prezic integritate ego mai târziu.',
 '34-year longitudinal study confirming Erikson sequence predicts adult ego integrity.'),
('baumrind-1967', 'Baumrind, D.', 1967, 'Child care practices anteceding three patterns of preschool behavior', 'https://files.eric.ed.gov/fulltext/ED427896.pdf', 'peer_review', ARRAY['parenting_styles'], 'high',
 'Cadrul original al stilurilor parentale — bază pentru cele 4 stiluri de mai târziu.',
 'Original framework for parenting styles, later expanded to four styles.'),
('maccoby-martin-1983', 'Maccoby & Martin', 1983, 'Socialization in the context of the family', NULL, 'book', ARRAY['parenting_styles'], 'high',
 'Extinde cadrul Baumrind la matrice 2×2: responsivitate × exigență → 4 stiluri.',
 'Extended Baumrind into 2×2 matrix: responsiveness × demandingness → 4 styles.'),
('lamborn-1991', 'Lamborn et al.', 1991, 'Patterns of Competence in Authoritative, Authoritarian, Indulgent, and Neglectful Families', 'https://www.jstor.org/stable/1131151', 'peer_review', ARRAY['parenting_styles','outcomes'], 'high',
 'n=2,353 adolescenți. Authoritative → cele mai bune rezultate psihosociale și academice. Neglectful → cele mai proaste.',
 'n=2,353. Authoritative style yields best outcomes; neglectful the worst.'),
('steinberg-1992', 'Steinberg et al.', 1992, 'Impact of Parenting Practices on Adolescent Achievement', 'https://doi.org/10.2307/1131532', 'peer_review', ARRAY['parenting_styles','achievement'], 'high',
 'Authoritative combină suport emoțional + control comportamental + autonomie psihologică → cele mai bune rezultate.',
 'Authoritative parenting combines warmth, behavioral control, and autonomy-granting for best outcomes.'),
('gottman-1997', 'Gottman & DeClaire', 1997, 'Raising an Emotionally Intelligent Child', 'https://www.simonandschuster.net/books/Raising-An-Emotionally-Intelligent-Child/John-Gottman/9780684838656', 'book', ARRAY['emotion_coaching'], 'medium',
 'Emotion Coaching în 5 pași: Aware → Recognize → Empathize → Label → Set limits. Copiii cu părinți emotion-coaches au competențe sociale mai bune, mai puțină reactivitate.',
 'Five-step Emotion Coaching: aware, recognize, empathize, label, set limits.'),
('lieberman-2007', 'Lieberman et al.', 2007, 'Putting Feelings Into Words: Affect Labeling Disrupts Amygdala Activity', 'https://journals.sagepub.com/doi/10.1111/j.1467-9280.2007.01916.x', 'peer_review', ARRAY['emotion_coaching','neuroscience'], 'high',
 'Etichetarea verbală a emoțiilor reduce reactivitatea amigdaliană — bază neurologică pentru pasul 4 Gottman.',
 'Naming an emotion reduces amygdala activity — neural basis for Gottman step 4.'),
('harvard-serve-return', 'Harvard Center on the Developing Child', 2020, 'Serve and Return', 'https://developingchild.harvard.edu/key-concept/serve-and-return/', 'working_paper', ARRAY['attachment','brain_architecture','0_5'], 'high',
 'Interacțiuni receptive back-and-forth între copil mic și adult modelează arhitectura creierului.',
 'Responsive back-and-forth interactions build brain architecture in young children.'),
('harvard-neglect-2012', 'Harvard Center on the Developing Child', 2012, 'The Science of Neglect (Working Paper 12)', 'https://developingchild.harvard.edu/', 'working_paper', ARRAY['neglect','brain_architecture'], 'high',
 'Absența serve-and-return este o formă de neglijare care afectează dezvoltarea creierului chiar fără abuz.',
 'Absence of serve-and-return is a form of neglect impacting brain development.'),
('shonkoff-2012', 'Shonkoff et al.', 2012, 'The Lifelong Effects of Early Childhood Adversity and Toxic Stress', 'https://publications.aap.org/pediatrics/article/129/1/e232/31628', 'peer_review', ARRAY['toxic_stress','development'], 'high',
 'Stresul toxic prelungit fără suport afectează prefrontal cortex, hipocamp, sistem imunitar. Un adult stabil buffează.',
 'Prolonged toxic stress without buffering disrupts prefrontal cortex, hippocampus, immune system.'),
('harvard-ef-2011', 'Harvard Center on the Developing Child', 2011, 'How Early Experiences Shape Executive Function', 'https://developingchild.harvard.edu/wp-content/uploads/2024/10/How-Early-Experiences-Shape-the-Development-of-Executive-Function.pdf', 'working_paper', ARRAY['executive_function'], 'high',
 'Funcția executivă (memorie de lucru, flexibilitate, control inhibitor) se construiește prin scaffolding — perioada critică 3-5 ani.',
 'Executive function builds via scaffolding; critical period ages 3-5.'),
('moffitt-2011', 'Moffitt et al.', 2011, 'A gradient of childhood self-control predicts health, wealth, and public safety', 'https://www.pnas.org/doi/10.1073/pnas.1010076108', 'longitudinal', ARRAY['executive_function','self_control'], 'high',
 'Auto-controlul în copilărie prezice sănătate, avere, siguranță ca adult mai bine decât IQ.',
 'Childhood self-control predicts adult health, wealth, and safety better than IQ.'),
('tronick-1989', 'Tronick & Cohn', 1989, 'Infant-Mother Face-to-Face Interaction', 'https://doi.org/10.2307/1131074', 'peer_review', ARRAY['attachment','rupture_repair'], 'high',
 'Diadele mamă-sugar sunt necoordonate 70% din timp — repararea repetată construiește reziliența, nu atașamentul perfect.',
 'Mother-infant dyads are miscoordinated 70% of time; repeated repair builds resilience.'),
('mesman-2009', 'Mesman, van IJzendoorn & Bakermans-Kranenburg', 2009, 'The many faces of the Still-Face Paradigm: A review and meta-analysis', 'https://doi.org/10.1016/j.dr.2009.02.001', 'meta_analysis', ARRAY['still_face','attachment'], 'high',
 'Meta-analiză 80+ studii Still-Face — efect robust; calitatea reparării prezice securitatea atașamentului (d=.5-.6).',
 'Meta-analysis of 80+ Still-Face studies; repair quality predicts attachment security.'),
('provenzi-2016', 'Provenzi et al.', 2016, 'Dyadic Repair Predicts Infant Cortisol Reactivity', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4698136/', 'peer_review', ARRAY['rupture_repair','stress'], 'high',
 'Sugarii cu mai puține reparări diadice au reactivitate cortizolică mai mare — cost fiziologic al rupturilor nereparate.',
 'Fewer dyadic repairs → higher infant cortisol reactivity.'),
('siegel-bryson-2020', 'Siegel & Bryson', 2020, 'The Power of Showing Up', 'https://www.penguinrandomhouse.com/books/569124/the-power-of-showing-up-by-daniel-j-siegel-md-and-tina-payne-bryson-phd/', 'book', ARRAY['attachment','presence'], 'medium',
 'Cei 4 „S" ai atașamentului: Safe, Seen, Soothed, Secure. Cere-ți scuze — reparație activă.',
 'Four Ss of attachment: Safe, Seen, Soothed, Secure. Parental apology as active repair.'),
('assor-roth-deci-2004', 'Assor, Roth & Deci', 2004, 'The emotional costs of parents'' conditional regard', 'https://doi.org/10.1111/j.0022-3506.2004.00256.x', 'peer_review', ARRAY['conditional_love','wellbeing'], 'high',
 'Considerarea condiționată produce internalizare introjectată — copilul performează din frică de pierdere a iubirii, cu resentiment și boală ulterioară.',
 'Conditional regard produces introjected internalization: performing from fear, with resentment and ill-being.'),
('assor-2009', 'Assor et al.', 2009, 'Parental conditional positive regard as a socialization tool', 'https://doi.org/10.1037/a0015272', 'peer_review', ARRAY['conditional_love','shame'], 'high',
 '„Iubirea condiționată pozitiv" produce cel mai mare nivel de rușine și supraestimare a sinelui — ego fragil, nu motivație sănătoasă.',
 'Conditional positive regard produces highest shame and self-aggrandizement.'),
('haines-2023', 'Haines et al.', 2023, 'Parental conditional regard and adolescent adjustment: meta-analysis', 'https://doi.org/10.1002/jad.12111', 'meta_analysis', ARRAY['conditional_love','anxiety'], 'high',
 'Meta-analiză — considerarea condiționată asociată cu autoreglare deficitară, bunăstare mai scăzută, anxietate/depresie crescute.',
 'Meta-analysis: conditional regard linked to poor self-regulation, low wellbeing, anxiety/depression.'),
('mcleod-2007', 'McLeod, Wood & Weisz', 2007, 'Examining the association between parenting and childhood anxiety: A meta-analysis', 'https://doi.org/10.1016/j.cpr.2006.09.002', 'meta_analysis', ARRAY['harsh_parenting','anxiety'], 'high',
 'Meta-analiză: critica și controlul excesiv sunt printre cei mai puternici predictori ai anxietății copilului (r=.33).',
 'Meta-analysis: parental criticism and overcontrol strongest predictors of child anxiety.'),
('frost-1991', 'Frost et al.', 1991, 'The development of perfectionism', 'https://doi.org/10.1207/s15327752jpa5701_9', 'peer_review', ARRAY['perfectionism'], 'high',
 'Așteptări înalte parentale + critică → perfecționism prescris social → anxietate, depresie, burnout.',
 'High parental expectations + criticism → socially prescribed perfectionism → anxiety, depression, burnout.'),
('gopnik-2009', 'Gopnik, A.', 2009, 'The Philosophical Baby', 'https://us.macmillan.com/books/9780312429843/', 'book', ARRAY['cognitive_development'], 'high',
 'Chiar și sugarii testează activ ipoteze și învață selectiv — nu sunt „descărcatori pasivi de programare".',
 'Even infants actively test hypotheses; they are not passive downloaders.'),
('aap-2016', 'AAP Council on Communications and Media', 2016, 'Media and Young Minds', 'https://publications.aap.org/pediatrics/article/138/5/e20162591', 'guideline', ARRAY['screen_time'], 'high',
 'AAP: 0-18 luni doar video-chat; 2-5 ani max 1 oră/zi conținut de calitate; 6+ ani limite consistente, prioritizează somn și activitate fizică.',
 'AAP: 0-18mo video-chat only; 2-5y max 1h/day quality content; 6+ consistent limits.'),
('who-2019-screen', 'WHO', 2019, 'Guidelines on Physical Activity, Sedentary Behaviour and Sleep for Children Under 5 Years', 'https://www.who.int/publications/i/item/9789241550536', 'guideline', ARRAY['screen_time','sleep'], 'high',
 'WHO: fără ecrane sub 1 an; max 1h/zi la 2-4 ani, sedentaritate limitată, somn adecvat.',
 'WHO: no screens under 1yo; max 1h/day at 2-4yo; limited sedentary time.'),
('gottman-levenson-1992', 'Gottman & Levenson', 1992, 'Marital processes predictive of later dissolution', 'https://doi.org/10.1037/0022-006X.60.1.94', 'peer_review', ARRAY['ratio_5_1','couples'], 'high',
 'Cupluri stabile: ≥5 interacțiuni pozitive pentru fiecare negativă. Ratio<1:1 prezice divorț cu ~90% acuratețe.',
 'Stable couples: ≥5 positives per 1 negative. Ratio<1:1 predicts divorce ~90%.'),
('armstrong-2012', 'Armstrong, A.', 2012, 'Assessing positive-to-negative interaction ratio in mother-child dyads', 'https://doi.org/10.1080/07317107.2012.707094', 'peer_review', ARRAY['ratio_5_1','parent_child'], 'medium',
 'Prima investigație preliminară a ratio-ului părinte-copil. Nu există studii care confirmă „5:1 magic" pentru părinte-copil.',
 'First preliminary study on parent-child ratio; no confirmation that "magic 5:1" transfers.'),
('robinson-2001-psdq', 'Robinson, Mandleco, Olsen & Hart', 2001, 'The Parenting Styles and Dimensions Questionnaire (PSDQ)', 'https://doi.org/10.4135/9781412985076.n17', 'peer_review', ARRAY['assessment','baumrind'], 'high',
 'Instrument validat cu 32 itemi pentru evaluarea stilurilor Baumrind. Standard de aur în cercetarea parentală.',
 'Validated 32-item instrument for assessing Baumrind styles. Gold standard.'),
('lipton-critique', 'Skeptical review (multiple)', 2020, 'On the "0-7 theta brainwaves = hypnosis" claim', 'https://rationalwiki.org/wiki/Bruce_Lipton', 'peer_review', ARRAY['pseudoscience_alert'], 'high',
 '⚠️ Nu există bază peer-review pentru „hipnoza 0-7 ani la 7Hz". Copiii AU theta mai ridicat, dar reflectă prefrontal imatur, nu trance. Folosim „fereastră de plasticitate" (Harvard CDev) în loc.',
 '⚠️ No peer-reviewed basis for "0-7 hypnosis at 7Hz". Use "plasticity window" (Harvard CDev) instead.');
