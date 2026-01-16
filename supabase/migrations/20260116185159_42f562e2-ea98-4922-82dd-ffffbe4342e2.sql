-- Drop existing faulty RLS policies that try to access auth.users directly
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.crm_contact_profiles;
DROP POLICY IF EXISTS "Admins can manage contacts" ON public.crm_contact_profiles;
DROP POLICY IF EXISTS "Admins can view timeline" ON public.crm_activity_timeline;
DROP POLICY IF EXISTS "Admins can manage timeline" ON public.crm_activity_timeline;
DROP POLICY IF EXISTS "Admins can view sessions" ON public.crm_admin_sessions;
DROP POLICY IF EXISTS "Admins can manage sessions" ON public.crm_admin_sessions;

-- Create new RLS policies using the has_role RPC function
CREATE POLICY "Admins can view all contacts" 
ON public.crm_contact_profiles 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage contacts" 
ON public.crm_contact_profiles 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can view timeline" 
ON public.crm_activity_timeline 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage timeline" 
ON public.crm_activity_timeline 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can view sessions" 
ON public.crm_admin_sessions 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage sessions" 
ON public.crm_admin_sessions 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin')
);