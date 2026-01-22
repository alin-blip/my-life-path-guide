-- Trigger care setează automat early_bird_expires_at la 3 zile pentru orice subscriber nou
CREATE OR REPLACE FUNCTION public.set_early_bird_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Dacă early_bird_expires_at nu este setat, setează 3 zile de la creare
  IF NEW.early_bird_expires_at IS NULL THEN
    NEW.early_bird_expires_at := NOW() + INTERVAL '3 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger dacă există deja
DROP TRIGGER IF EXISTS trigger_set_early_bird ON public.subscribers;

-- Creează trigger-ul
CREATE TRIGGER trigger_set_early_bird
  BEFORE INSERT ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_early_bird_on_signup();