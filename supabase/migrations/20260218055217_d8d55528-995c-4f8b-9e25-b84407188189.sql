
-- Tribe events table for calendar & events
CREATE TABLE public.tribe_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'session',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location TEXT,
  meeting_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event RSVPs
CREATE TABLE public.tribe_event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.tribe_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'going',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tribe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_event_rsvps ENABLE ROW LEVEL SECURITY;

-- Events policies: tribe members can view
CREATE POLICY "Tribe members can view events"
  ON public.tribe_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_members tm
      WHERE tm.tribe_id = tribe_events.tribe_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Coach can create events"
  ON public.tribe_events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update events"
  ON public.tribe_events FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete events"
  ON public.tribe_events FOR DELETE
  USING (auth.uid() = created_by);

-- RSVP policies
CREATE POLICY "Tribe members can view RSVPs"
  ON public.tribe_event_rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_events te
      JOIN public.tribe_members tm ON tm.tribe_id = te.tribe_id
      WHERE te.id = tribe_event_rsvps.event_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can RSVP"
  ON public.tribe_event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVP"
  ON public.tribe_event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVP"
  ON public.tribe_event_rsvps FOR DELETE
  USING (auth.uid() = user_id);
