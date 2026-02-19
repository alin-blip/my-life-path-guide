
-- Add welcome_message column to tribes
ALTER TABLE public.tribes ADD COLUMN IF NOT EXISTS welcome_message text;

-- Create function to send welcome DM when a member joins a tribe
CREATE OR REPLACE FUNCTION public.send_tribe_welcome_dm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _welcome_msg text;
  _owner_id uuid;
BEGIN
  SELECT t.welcome_message, t.created_by
  INTO _welcome_msg, _owner_id
  FROM public.tribes t
  WHERE t.id = NEW.tribe_id;

  -- Only send if welcome message is set and member is not the owner
  IF _welcome_msg IS NOT NULL AND _welcome_msg != '' AND _owner_id IS NOT NULL AND _owner_id != NEW.user_id THEN
    INSERT INTO public.direct_messages (sender_id, receiver_id, content)
    VALUES (_owner_id, NEW.user_id, _welcome_msg);
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on tribe_members
CREATE TRIGGER on_tribe_member_joined_welcome
  AFTER INSERT ON public.tribe_members
  FOR EACH ROW
  EXECUTE FUNCTION public.send_tribe_welcome_dm();
