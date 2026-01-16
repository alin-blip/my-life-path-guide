-- Create course_purchases table to track purchases
CREATE TABLE public.course_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stripe_session_id TEXT,
  amount_paid INTEGER,
  currency TEXT DEFAULT 'eur',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
ON public.course_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_course_purchases_user_product ON public.course_purchases(user_id, product_id);
CREATE INDEX idx_course_purchases_stripe_session ON public.course_purchases(stripe_session_id);