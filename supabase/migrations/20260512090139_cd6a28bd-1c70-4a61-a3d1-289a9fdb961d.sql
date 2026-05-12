
CREATE OR REPLACE FUNCTION public.notify_on_direct_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _sender_name text; _preview text;
BEGIN
  IF NEW.sender_id = NEW.receiver_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Cineva') INTO _sender_name FROM public.leaderboard_profiles WHERE user_id = NEW.sender_id;
  _preview := left(NEW.content, 80);
  INSERT INTO public.push_notifications (recipient_id, sender_id, title, message, notification_type)
  VALUES (NEW.receiver_id, NEW.sender_id, '✉️ Mesaj nou', COALESCE(_sender_name,'Cineva') || ': ' || _preview, 'message');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_on_wall_post_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _post_author_id uuid; _commenter_name text; _preview text;
BEGIN
  SELECT user_id INTO _post_author_id FROM public.wall_posts WHERE id = NEW.post_id;
  IF _post_author_id IS NULL OR _post_author_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Cineva') INTO _commenter_name FROM public.leaderboard_profiles WHERE user_id = NEW.user_id;
  _preview := left(NEW.content, 80);
  INSERT INTO public.push_notifications (recipient_id, sender_id, title, message, notification_type)
  VALUES (_post_author_id, NEW.user_id, '💬 Comentariu nou', COALESCE(_commenter_name,'Cineva') || ': ' || _preview, 'comment');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_on_wall_post_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _post_author_id uuid; _liker_name text;
BEGIN
  SELECT user_id INTO _post_author_id FROM public.wall_posts WHERE id = NEW.post_id;
  IF _post_author_id IS NULL OR _post_author_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Cineva') INTO _liker_name FROM public.leaderboard_profiles WHERE user_id = NEW.user_id;
  INSERT INTO public.push_notifications (recipient_id, sender_id, title, message, notification_type)
  VALUES (_post_author_id, NEW.user_id, '❤️ Like nou', COALESCE(_liker_name,'Cineva') || ' a apreciat postarea ta', 'like');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
