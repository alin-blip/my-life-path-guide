import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCoachTribeEvents, TribeEvent } from '@/hooks/useCoachTribeEvents';
import { CalendarGrid } from './CalendarGrid';
import { AddEventDialog } from './AddEventDialog';
import { EventDetailDialog } from './EventDetailDialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const MAIN_TRIBE_ID = '07825fb0-4d6c-4716-b2f3-27a1708cf680';

export const CalendarTab: React.FC = () => {
  const { language } = useLanguage();
  const isRo = language === 'ro';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TribeEvent | null>(null);

  // Get current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  const userId = session?.user?.id;

  // Check admin
  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    },
    enabled: !!userId,
  });

  const { events, rsvps, createEvent, toggleRsvp } = useCoachTribeEvents(MAIN_TRIBE_ID, userId);

  const handleEventClick = (event: TribeEvent) => setSelectedEvent(event);

  const selectedRsvps = selectedEvent ? (rsvps[selectedEvent.id] || []) : [];
  const userHasRsvp = selectedEvent ? selectedRsvps.some(r => r.user_id === userId) : false;

  return (
    <div className="w-full">
      <CalendarGrid
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        events={events}
        onEventClick={handleEventClick}
        onAddEvent={() => setAddOpen(true)}
        isAdmin={!!isAdmin}
        isRo={isRo}
      />

      <AddEventDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={createEvent}
        isRo={isRo}
      />

      <EventDetailDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={open => { if (!open) setSelectedEvent(null); }}
        rsvps={selectedRsvps}
        userRsvp={userHasRsvp}
        onToggleRsvp={() => selectedEvent && toggleRsvp(selectedEvent.id)}
        isRo={isRo}
      />
    </div>
  );
};
