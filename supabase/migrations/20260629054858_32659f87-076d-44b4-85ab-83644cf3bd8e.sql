CREATE OR REPLACE FUNCTION public.get_user_language_by_email(_email text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT up.language
       FROM public.user_preferences up
       JOIN auth.users u ON u.id = up.user_id
      WHERE lower(u.email) = lower(_email)
      LIMIT 1),
    (SELECT NULLIF(u.raw_user_meta_data->>'language','')
       FROM auth.users u
      WHERE lower(u.email) = lower(_email)
      LIMIT 1),
    'ro'
  );
$$;

REVOKE ALL ON FUNCTION public.get_user_language_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_language_by_email(text) TO service_role;