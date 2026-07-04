REVOKE EXECUTE ON FUNCTION public.get_user_language_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_language_by_email(text) TO service_role;