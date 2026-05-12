CREATE TABLE IF NOT EXISTS public.ebook_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  language TEXT NOT NULL DEFAULT 'ro' CHECK (language IN ('ro','en')),
  stripe_session_id TEXT UNIQUE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_email_sent_at TIMESTAMPTZ,
  upsell_purchased_at TIMESTAMPTZ,
  upsell_email_1_sent_at TIMESTAMPTZ,
  upsell_email_2_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ebook_purchases_email ON public.ebook_purchases (lower(email));
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_purchased_at ON public.ebook_purchases (purchased_at);

ALTER TABLE public.ebook_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ebook purchases"
ON public.ebook_purchases FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ebook purchases"
ON public.ebook_purchases FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ebook_purchases_updated_at
BEFORE UPDATE ON public.ebook_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();