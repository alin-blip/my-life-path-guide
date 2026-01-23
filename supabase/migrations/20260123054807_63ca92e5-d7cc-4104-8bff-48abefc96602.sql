
-- Coach Content table for resources coaches can sell
CREATE TABLE public.coach_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'resource', -- resource, course, template, ebook
  price_cents INTEGER NOT NULL DEFAULT 0, -- 0 = free
  currency TEXT NOT NULL DEFAULT 'eur',
  thumbnail_url TEXT,
  content_url TEXT, -- URL to the actual content (PDF, video, etc.)
  is_published BOOLEAN DEFAULT false,
  total_sales INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0, -- in cents
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coach Content Purchases table
CREATE TABLE public.coach_content_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.coach_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id),
  amount_paid INTEGER NOT NULL, -- in cents
  coach_share INTEGER NOT NULL, -- 70% in cents
  platform_share INTEGER NOT NULL, -- 30% in cents
  currency TEXT NOT NULL DEFAULT 'eur',
  stripe_session_id TEXT,
  stripe_transfer_id TEXT, -- for coach payout
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, refunded
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_content_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_content
CREATE POLICY "Coaches can manage their own content"
  ON public.coach_content
  FOR ALL
  USING (
    coach_id IN (
      SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Published content is viewable by everyone"
  ON public.coach_content
  FOR SELECT
  USING (is_published = true);

-- RLS Policies for coach_content_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.coach_content_purchases
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Coaches can view purchases of their content"
  ON public.coach_content_purchases
  FOR SELECT
  USING (
    coach_id IN (
      SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert purchases"
  ON public.coach_content_purchases
  FOR INSERT
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_coach_content_updated_at
  BEFORE UPDATE ON public.coach_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for purchases
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_content_purchases;
