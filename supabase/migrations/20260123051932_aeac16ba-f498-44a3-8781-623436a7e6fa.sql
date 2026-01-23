-- Create helper function to increment coach referrals
CREATE OR REPLACE FUNCTION public.increment_coach_referrals(coach_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE coach_profiles 
  SET total_referrals = COALESCE(total_referrals, 0) + 1
  WHERE id = coach_id;
END;
$$;

-- Create function to activate referral on first payment
CREATE OR REPLACE FUNCTION public.activate_referral_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a commission is created, activate the referral if pending
  UPDATE referrals 
  SET status = 'active',
      first_payment_at = COALESCE(first_payment_at, NOW())
  WHERE id = NEW.referral_id AND status = 'pending';
  
  RETURN NEW;
END;
$$;

-- Create trigger to activate referral when commission is created
DROP TRIGGER IF EXISTS activate_referral_trigger ON commissions;
CREATE TRIGGER activate_referral_trigger
  AFTER INSERT ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION activate_referral_on_payment();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_coach_referrals(UUID) TO authenticated;