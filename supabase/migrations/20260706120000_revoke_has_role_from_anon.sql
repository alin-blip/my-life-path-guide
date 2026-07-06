-- Prevent unauthenticated callers from probing admin role assignments.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
