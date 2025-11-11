-- Add RLS policies to user_roles table to enable role-based authorization

-- Allow users to view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow the has_role function to check any user's roles (required for SECURITY DEFINER function)
CREATE POLICY "Service role can check all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update/delete roles
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));