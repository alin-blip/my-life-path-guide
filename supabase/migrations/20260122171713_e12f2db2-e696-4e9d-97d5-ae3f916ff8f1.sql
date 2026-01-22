-- Phase 1: Coach/Trainer Referral System Infrastructure

-- 1. Add coach and trainer roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'coach';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'trainer';

-- 2. Create coach_profiles table
CREATE TABLE public.coach_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  stripe_connect_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  commission_rate DECIMAL(3,2) NOT NULL DEFAULT 0.50,
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_payout DECIMAL(10,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index for referral_code lookups
CREATE INDEX idx_coach_profiles_referral_code ON public.coach_profiles(referral_code);
CREATE INDEX idx_coach_profiles_user_id ON public.coach_profiles(user_id);

-- 3. Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled')),
  first_payment_at TIMESTAMP WITH TIME ZONE,
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id)
);

CREATE INDEX idx_referrals_coach_id ON public.referrals(coach_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- 4. Create commissions table
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  original_payment DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  stripe_transfer_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_commissions_coach_id ON public.commissions(coach_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_referral_id ON public.commissions(referral_id);

-- 5. Add coach columns to tribes table
ALTER TABLE public.tribes 
ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES public.coach_profiles(id),
ADD COLUMN IF NOT EXISTS is_coach_tribe BOOLEAN DEFAULT false;

CREATE INDEX idx_tribes_coach_id ON public.tribes(coach_id) WHERE coach_id IS NOT NULL;

-- 6. Create coach_messages table for coach-client communication
CREATE TABLE public.coach_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('coach', 'client')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_coach_messages_coach_id ON public.coach_messages(coach_id);
CREATE INDEX idx_coach_messages_client_id ON public.coach_messages(client_id);
CREATE INDEX idx_coach_messages_created_at ON public.coach_messages(created_at DESC);

-- 7. Create payout_history table for tracking payouts
CREATE TABLE public.payout_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_transfer_id TEXT NOT NULL,
  commissions_included UUID[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_payout_history_coach_id ON public.payout_history(coach_id);

-- 8. Enable RLS on all new tables
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_history ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for coach_profiles
CREATE POLICY "Public can view verified coach profiles"
ON public.coach_profiles FOR SELECT
USING (is_verified = true);

CREATE POLICY "Users can view their own coach profile"
ON public.coach_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own coach profile"
ON public.coach_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their coach profile"
ON public.coach_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 10. RLS Policies for referrals
CREATE POLICY "Coaches can view their own referrals"
ON public.referrals FOR SELECT TO authenticated
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "System can insert referrals"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view referrals where they are the referred user"
ON public.referrals FOR SELECT TO authenticated
USING (referred_user_id = auth.uid());

-- 11. RLS Policies for commissions
CREATE POLICY "Coaches can view their own commissions"
ON public.commissions FOR SELECT TO authenticated
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);

-- 12. RLS Policies for coach_messages
CREATE POLICY "Coaches can view messages with their clients"
ON public.coach_messages FOR SELECT TO authenticated
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
  OR client_id = auth.uid()
);

CREATE POLICY "Coaches can send messages to their clients"
ON public.coach_messages FOR INSERT TO authenticated
WITH CHECK (
  (sender_type = 'coach' AND coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()))
  OR (sender_type = 'client' AND client_id = auth.uid())
);

CREATE POLICY "Users can mark messages as read"
ON public.coach_messages FOR UPDATE TO authenticated
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
  OR client_id = auth.uid()
)
WITH CHECK (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
  OR client_id = auth.uid()
);

-- 13. RLS Policies for payout_history
CREATE POLICY "Coaches can view their own payout history"
ON public.payout_history FOR SELECT TO authenticated
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);

-- 14. Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 15. Trigger to update updated_at on coach_profiles
CREATE TRIGGER update_coach_profiles_updated_at
BEFORE UPDATE ON public.coach_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 16. Trigger to update updated_at on referrals
CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Enable realtime for coach-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions;