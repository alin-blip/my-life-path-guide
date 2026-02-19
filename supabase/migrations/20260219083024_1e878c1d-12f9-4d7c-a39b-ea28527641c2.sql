
-- Function: notify on wall post like
CREATE OR REPLACE FUNCTION public.notify_on_wall_post_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _post_author_id uuid;
  _liker_name text;
BEGIN
  SELECT user_id INTO _post_author_id FROM public.wall_posts WHERE id = NEW.post_id;
  IF _post_author_id IS NULL OR _post_author_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Cineva') INTO _liker_name FROM public.leaderboard_profiles WHERE user_id = NEW.user_id;
  INSERT INTO public.push_notifications (user_id, title, body, type, related_id)
  VALUES (_post_author_id, '❤️ Like nou', _liker_name || ' a apreciat postarea ta', 'like', NEW.post_id::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_wall_post_like ON public.wall_post_likes;
CREATE TRIGGER trg_notify_wall_post_like AFTER INSERT ON public.wall_post_likes FOR EACH ROW EXECUTE FUNCTION public.notify_on_wall_post_like();

-- Function: notify on tribe post like
CREATE OR REPLACE FUNCTION public.notify_on_tribe_post_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _post_author_id uuid;
  _liker_name text;
BEGIN
  SELECT user_id INTO _post_author_id FROM public.tribe_posts WHERE id = NEW.post_id;
  IF _post_author_id IS NULL OR _post_author_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Cineva') INTO _liker_name FROM public.leaderboard_profiles WHERE user_id = NEW.user_id;
  INSERT INTO public.push_notifications (user_id, title, body, type, related_id)
  VALUES (_post_author_id, '❤️ Like nou', _liker_name || ' a apreciat postarea ta din grup', 'like', NEW.post_id::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_tribe_post_like ON public.tribe_post_likes;
CREATE TRIGGER trg_notify_tribe_post_like AFTER INSERT ON public.tribe_post_likes FOR EACH ROW EXECUTE FUNCTION public.notify_on_tribe_post_like();

-- Function: notify on wall post comment
CREATE OR REPLACE FUNCTION public.notify_on_wall_post_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _post_author_id uuid;
  _commenter_name text;
  _preview text;
BEGIN
  SELECT user_id INTO _post_author_id FROM public.wall_posts WHERE id = NEW.post_id;
  IF _post_author_id IS NULL OR _post_author_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Cineva') INTO _commenter_name FROM public.leaderboard_profiles WHERE user_id = NEW.user_id;
  _preview := left(NEW.content, 80);
  INSERT INTO public.push_notifications (user_id, title, body, type, related_id)
  VALUES (_post_author_id, '💬 Comentariu nou', _commenter_name || ': ' || _preview, 'comment', NEW.post_id::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_wall_post_comment ON public.wall_post_comments;
CREATE TRIGGER trg_notify_wall_post_comment AFTER INSERT ON public.wall_post_comments FOR EACH ROW EXECUTE FUNCTION public.notify_on_wall_post_comment();

-- Function: notify on tribe post comment
CREATE OR REPLACE FUNCTION public.notify_on_tribe_post_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _post_author_id uuid;
  _commenter_name text;
  _preview text;
BEGIN
  SELECT user_id INTO _post_author_id FROM public.tribe_posts WHERE id = NEW.post_id;
  IF _post_author_id IS NULL OR _post_author_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Cineva') INTO _commenter_name FROM public.leaderboard_profiles WHERE user_id = NEW.user_id;
  _preview := left(NEW.content, 80);
  INSERT INTO public.push_notifications (user_id, title, body, type, related_id)
  VALUES (_post_author_id, '💬 Comentariu nou', _commenter_name || ': ' || _preview, 'comment', NEW.post_id::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_tribe_post_comment ON public.tribe_post_comments;
CREATE TRIGGER trg_notify_tribe_post_comment AFTER INSERT ON public.tribe_post_comments FOR EACH ROW EXECUTE FUNCTION public.notify_on_tribe_post_comment();

-- Function: notify on direct message
CREATE OR REPLACE FUNCTION public.notify_on_direct_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _sender_name text;
  _preview text;
BEGIN
  IF NEW.sender_id = NEW.receiver_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Cineva') INTO _sender_name FROM public.leaderboard_profiles WHERE user_id = NEW.sender_id;
  _preview := left(NEW.content, 80);
  INSERT INTO public.push_notifications (user_id, title, body, type, related_id)
  VALUES (NEW.receiver_id, '✉️ Mesaj nou', _sender_name || ': ' || _preview, 'message', NEW.sender_id::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_direct_message ON public.direct_messages;
CREATE TRIGGER trg_notify_direct_message AFTER INSERT ON public.direct_messages FOR EACH ROW EXECUTE FUNCTION public.notify_on_direct_message();
