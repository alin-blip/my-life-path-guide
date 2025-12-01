-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.napoleon_hill_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  notification_day INTEGER DEFAULT 1, -- 1=Monday, 7=Sunday
  notification_time TEXT DEFAULT '09:00',
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.napoleon_hill_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own notification preferences"
  ON public.napoleon_hill_notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_napoleon_hill_notifications_updated_at
  BEFORE UPDATE ON public.napoleon_hill_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index
CREATE INDEX idx_napoleon_hill_notifications_user_id ON public.napoleon_hill_notifications(user_id);