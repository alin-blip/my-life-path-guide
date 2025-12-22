-- Add admin role for alinflorinradu@icloud.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'alinflorinradu@icloud.com'
ON CONFLICT (user_id, role) DO NOTHING;