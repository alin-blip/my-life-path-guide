-- Fix infinite recursion in tribe_members RLS by removing self-referential policies
-- and ensuring helper functions bypass RLS.

-- 1) Recreate helper functions with row_security disabled (prevents recursion)
CREATE OR REPLACE FUNCTION public.is_tribe_member(_user_id uuid, _tribe_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
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
SET search_path = public, pg_temp
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tribe_members
    WHERE user_id = _user_id
      AND tribe_id = _tribe_id
      AND role = 'owner'
  )
$$;

-- 2) Drop buggy / recursive policies
-- tribe_members
DROP POLICY IF EXISTS "Members visible to tribe members" ON public.tribe_members;
DROP POLICY IF EXISTS "Users can join public tribes" ON public.tribe_members;
DROP POLICY IF EXISTS "Users can leave tribes" ON public.tribe_members;

-- tribes
DROP POLICY IF EXISTS "Public tribes visible to all" ON public.tribes;
DROP POLICY IF EXISTS "Authenticated users can create tribes" ON public.tribes;
DROP POLICY IF EXISTS "Tribe owners and admins can update" ON public.tribes;
DROP POLICY IF EXISTS "Tribe owners can delete" ON public.tribes;

-- wall_posts
DROP POLICY IF EXISTS "Posts visible to tribe members or public" ON public.wall_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.wall_posts;
DROP POLICY IF EXISTS "View posts policy" ON public.wall_posts;
DROP POLICY IF EXISTS "Create posts policy" ON public.wall_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.wall_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.wall_posts;

-- brotherhood_messages
DROP POLICY IF EXISTS "Messages visible to participants" ON public.brotherhood_messages;
DROP POLICY IF EXISTS "View messages policy" ON public.brotherhood_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.brotherhood_messages;
DROP POLICY IF EXISTS "Send messages policy" ON public.brotherhood_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.brotherhood_messages;

-- 3) Recreate clean, non-recursive policies

-- tribes
CREATE POLICY "Tribes: select"
ON public.tribes
FOR SELECT
TO authenticated
USING (
  is_public = true
  OR public.is_tribe_member(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Tribes: insert"
ON public.tribes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);

CREATE POLICY "Tribes: update"
ON public.tribes
FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by
  OR public.is_tribe_owner(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Tribes: delete"
ON public.tribes
FOR DELETE
TO authenticated
USING (
  auth.uid() = created_by
  OR public.is_tribe_owner(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- tribe_members
CREATE POLICY "Tribe members: select"
ON public.tribe_members
FOR SELECT
TO authenticated
USING (
  public.is_tribe_member(auth.uid(), tribe_id)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow join if tribe is public OR user is the tribe creator (auto-add owner)
CREATE POLICY "Tribe members: insert"
ON public.tribe_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.tribes t
      WHERE t.id = tribe_members.tribe_id
        AND (t.is_public = true OR t.created_by = auth.uid())
    )
  )
);

-- Allow owner/admin to change roles, etc.
CREATE POLICY "Tribe members: update"
ON public.tribe_members
FOR UPDATE
TO authenticated
USING (
  public.is_tribe_owner(auth.uid(), tribe_id)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow user to leave OR owner/admin to remove
CREATE POLICY "Tribe members: delete"
ON public.tribe_members
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_tribe_owner(auth.uid(), tribe_id)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- wall_posts
CREATE POLICY "Wall posts: select"
ON public.wall_posts
FOR SELECT
TO authenticated
USING (
  tribe_id IS NULL
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1
    FROM public.tribes t
    WHERE t.id = wall_posts.tribe_id
      AND (t.is_public = true OR public.is_tribe_member(auth.uid(), t.id))
  )
);

CREATE POLICY "Wall posts: insert"
ON public.wall_posts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    tribe_id IS NULL
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.is_tribe_member(auth.uid(), tribe_id)
  )
);

CREATE POLICY "Wall posts: update"
ON public.wall_posts
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Wall posts: delete"
ON public.wall_posts
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- brotherhood_messages
CREATE POLICY "Brotherhood messages: select"
ON public.brotherhood_messages
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR sender_id = auth.uid()
  OR receiver_id = auth.uid()
  OR (
    tribe_id IS NOT NULL
    AND public.is_tribe_member(auth.uid(), tribe_id)
  )
);

CREATE POLICY "Brotherhood messages: insert"
ON public.brotherhood_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND (
    tribe_id IS NULL
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.is_tribe_member(auth.uid(), tribe_id)
  )
);

CREATE POLICY "Brotherhood messages: delete"
ON public.brotherhood_messages
FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);
