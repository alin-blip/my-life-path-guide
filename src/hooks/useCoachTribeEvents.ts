import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TribeEvent {
  id: string;
  tribe_id: string;
  created_by: string;
  title: string;
  description: string | null;
  event_type: string;
  start_at: string;
  end_at: string | null;
  location: string | null;
  meeting_url: string | null;
  is_recurring: boolean;
  max_attendees: number | null;
  created_at: string;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
}

export function useCoachTribeEvents(tribeId: string | undefined, userId: string | undefined) {
  const [events, setEvents] = useState<TribeEvent[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, EventRsvp[]>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    if (!tribeId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tribe_events')
      .select('*')
      .eq('tribe_id', tribeId)
      .order('start_at', { ascending: true });

    if (!error && data) {
      setEvents(data as TribeEvent[]);
      // Fetch RSVPs for all events
      const eventIds = data.map((e: any) => e.id);
      if (eventIds.length > 0) {
        const { data: rsvpData } = await supabase
          .from('tribe_event_rsvps')
          .select('*')
          .in('event_id', eventIds);
        if (rsvpData) {
          const grouped: Record<string, EventRsvp[]> = {};
          rsvpData.forEach((r: any) => {
            if (!grouped[r.event_id]) grouped[r.event_id] = [];
            grouped[r.event_id].push(r as EventRsvp);
          });
          setRsvps(grouped);
        }
      }
    }
    setLoading(false);
  }, [tribeId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    event_type: string;
    start_at: string;
    end_at?: string;
    location?: string;
    meeting_url?: string;
    max_attendees?: number;
  }) => {
    if (!tribeId || !userId) return;
    const { error } = await supabase.from('tribe_events').insert({
      tribe_id: tribeId,
      created_by: userId,
      ...eventData,
    });
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Eveniment creat!' });
      fetchEvents();
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<typeof events[0]>) => {
    const { error } = await supabase
      .from('tribe_events')
      .update(updates)
      .eq('id', eventId);
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Eveniment actualizat!' });
      fetchEvents();
    }
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('tribe_events').delete().eq('id', eventId);
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Eveniment șters!' });
      fetchEvents();
    }
  };

  const toggleRsvp = async (eventId: string) => {
    if (!userId) return;
    const existing = rsvps[eventId]?.find(r => r.user_id === userId);
    if (existing) {
      await supabase.from('tribe_event_rsvps').delete().eq('id', existing.id);
    } else {
      await supabase.from('tribe_event_rsvps').insert({
        event_id: eventId,
        user_id: userId,
        status: 'going',
      });
    }
    fetchEvents();
  };

  return { events, rsvps, loading, createEvent, updateEvent, deleteEvent, toggleRsvp, refetch: fetchEvents };
}
