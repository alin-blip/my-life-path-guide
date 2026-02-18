
CREATE TABLE public.platform_course_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  user_id uuid NOT NULL,
  course_slug text NOT NULL CHECK (course_slug IN ('personal-power', 'ultimate-you', 'warrior-certified-coach', 'challenge')),
  commission_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  stripe_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_course_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view own referrals"
  ON public.platform_course_referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = coach_id);

CREATE POLICY "Admins can view all referrals"
  ON public.platform_course_referrals
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert referrals"
  ON public.platform_course_referrals
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update referrals"
  ON public.platform_course_referrals
  FOR UPDATE
  TO service_role
  USING (true);

CREATE INDEX idx_platform_referrals_coach ON public.platform_course_referrals(coach_id);
CREATE INDEX idx_platform_referrals_user ON public.platform_course_referrals(user_id);
