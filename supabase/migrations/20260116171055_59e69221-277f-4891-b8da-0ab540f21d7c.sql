-- CRM Contact Profiles - unified view of all leads and customers
CREATE TABLE public.crm_contact_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID, -- NULL pentru leads fără cont
  
  -- Profile info
  name TEXT,
  phone TEXT,
  gender TEXT,
  avatar_emoji TEXT,
  
  -- Funnel stage
  funnel_stage TEXT DEFAULT 'lead' CHECK (funnel_stage IN ('lead', 'engaged', 'customer')),
  lead_source TEXT, -- warrior_power, vision_2026, life_score, etc.
  
  -- Lead scoring
  lead_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  
  -- Important dates
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  lead_captured_at TIMESTAMPTZ DEFAULT now(),
  account_created_at TIMESTAMPTZ,
  first_purchase_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  
  -- Aggregated stats
  total_sessions INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  total_stack_sessions INTEGER DEFAULT 0,
  total_door_tasks INTEGER DEFAULT 0,
  door_completion_rate NUMERIC DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  email_opens INTEGER DEFAULT 0,
  email_clicks INTEGER DEFAULT 0,
  
  -- Financial
  lifetime_value INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  
  -- Warrior Power data
  warrior_power_score INTEGER,
  warrior_power_data JSONB,
  
  -- Tags & Notes
  tags TEXT[],
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_contact_profiles ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy (check is_admin in user metadata)
CREATE POLICY "Admins can view all contacts" 
ON public.crm_contact_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
  )
);

CREATE POLICY "Admins can manage contacts" 
ON public.crm_contact_profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
  )
);

-- CRM Activity Timeline - every action tracked
CREATE TABLE public.crm_activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES crm_contact_profiles(id) ON DELETE CASCADE,
  user_id UUID, -- for quick lookups
  
  -- Activity details
  activity_type TEXT NOT NULL,
  activity_title TEXT,
  activity_data JSONB,
  page_path TEXT,
  
  -- Context
  session_id TEXT,
  ip_address TEXT,
  device_type TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_activity_timeline ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view timeline" 
ON public.crm_activity_timeline 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
  )
);

CREATE POLICY "Anyone can insert activities" 
ON public.crm_activity_timeline 
FOR INSERT 
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_crm_timeline_contact ON crm_activity_timeline(contact_id);
CREATE INDEX idx_crm_timeline_user ON crm_activity_timeline(user_id);
CREATE INDEX idx_crm_timeline_type ON crm_activity_timeline(activity_type);
CREATE INDEX idx_crm_timeline_date ON crm_activity_timeline(created_at DESC);

-- CRM Admin Sessions - track admin impersonation
CREATE TABLE public.crm_admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  admin_email TEXT,
  target_contact_id UUID REFERENCES crm_contact_profiles(id),
  target_user_id UUID,
  target_email TEXT,
  
  session_type TEXT NOT NULL CHECK (session_type IN ('view_as', 'profile_view', 'edit', 'notes')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  
  actions_taken JSONB DEFAULT '[]'::jsonb,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.crm_admin_sessions ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage sessions" 
ON public.crm_admin_sessions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
  )
);

-- Index for contact profiles
CREATE INDEX idx_crm_contacts_email ON crm_contact_profiles(email);
CREATE INDEX idx_crm_contacts_user ON crm_contact_profiles(user_id);
CREATE INDEX idx_crm_contacts_stage ON crm_contact_profiles(funnel_stage);
CREATE INDEX idx_crm_contacts_score ON crm_contact_profiles(lead_score DESC);
CREATE INDEX idx_crm_contacts_activity ON crm_contact_profiles(last_activity_at DESC);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_crm_contact_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crm_contact_updated_at
BEFORE UPDATE ON crm_contact_profiles
FOR EACH ROW
EXECUTE FUNCTION update_crm_contact_updated_at();