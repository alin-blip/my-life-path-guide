-- First create the security definer functions
CREATE OR REPLACE FUNCTION public.is_tribe_member(_user_id uuid, _tribe_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tribe_members
    WHERE user_id = _user_id
      AND tribe_id = _tribe_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_tribe_owner(_user_id uuid, _tribe_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tribe_members
    WHERE user_id = _user_id
      AND tribe_id = _tribe_id
      AND role = 'owner'
  )
$$;

-- Drop and recreate wall_posts policies
DROP POLICY IF EXISTS "View posts policy" ON public.wall_posts;
DROP POLICY IF EXISTS "Create posts policy" ON public.wall_posts;

CREATE POLICY "View posts policy"
ON public.wall_posts FOR SELECT
TO authenticated
USING (
  tribe_id IS NULL 
  OR public.is_tribe_member(auth.uid(), tribe_id)
);

CREATE POLICY "Create posts policy"
ON public.wall_posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (tribe_id IS NULL OR public.is_tribe_member(auth.uid(), tribe_id))
);

-- Drop and recreate brotherhood_messages policies
DROP POLICY IF EXISTS "View messages policy" ON public.brotherhood_messages;
DROP POLICY IF EXISTS "Send messages policy" ON public.brotherhood_messages;

CREATE POLICY "View messages policy"
ON public.brotherhood_messages FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid()
  OR receiver_id = auth.uid()
  OR (tribe_id IS NOT NULL AND public.is_tribe_member(auth.uid(), tribe_id))
);

CREATE POLICY "Send messages policy"
ON public.brotherhood_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND (tribe_id IS NULL OR public.is_tribe_member(auth.uid(), tribe_id))
);