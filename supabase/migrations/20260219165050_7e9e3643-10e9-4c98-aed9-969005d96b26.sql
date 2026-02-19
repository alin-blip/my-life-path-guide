
-- Allow authenticated users to SELECT their own contact profile
CREATE POLICY "Users can view own contact profile"
ON public.crm_contact_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow authenticated users to INSERT their own contact profile
CREATE POLICY "Users can create own contact profile"
ON public.crm_contact_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to UPDATE their own contact profile
CREATE POLICY "Users can update own contact profile"
ON public.crm_contact_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());
