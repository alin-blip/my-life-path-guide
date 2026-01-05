-- Create table for premium widget purchases/access
CREATE TABLE public.user_widget_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.widget_templates(id) ON DELETE CASCADE,
  has_full_access BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- Enable RLS
ALTER TABLE public.user_widget_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
ON public.user_widget_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own purchases
CREATE POLICY "Users can insert their own purchases"
ON public.user_widget_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Give the specific user full access to all premium widgets
INSERT INTO public.user_widget_purchases (user_id, template_id, has_full_access)
VALUES ('74f5b904-95ba-4aaa-af7a-bee4c7ee6a98', NULL, true);