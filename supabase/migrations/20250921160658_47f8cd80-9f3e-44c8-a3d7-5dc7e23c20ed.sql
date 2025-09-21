-- Add admin role for alinflorinradu@icloud.com
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get user ID from profiles table using email
    SELECT user_id INTO target_user_id 
    FROM profiles 
    WHERE email = 'alinflorinradu@icloud.com';
    
    -- If user exists, insert admin role
    IF target_user_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role) 
        VALUES (target_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;