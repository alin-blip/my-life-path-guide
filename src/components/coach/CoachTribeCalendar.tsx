import React, { useState } from 'react';
import { useCoachTribeEvents, TribeEvent } from '@/hooks/useCoachTribeEvents';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle } from '@/components/ui/responsive-modal';
import { Calendar, Clock, MapPin, Video, Plus, Trash2, Users, CheckCircle } from 'lucide-react';
import { format, isPast, isToday, isFuture } from 'date-fns';

interface Props {
  tribeId: string;
  userId: string;
  isOwner: boolean;
}

const content = {
  ro: {
    title: 'Calendar & Evenimente',
    newEvent: 'Eveniment Nou',
    eventTitle: 'Titlu',
    description: 'Descriere',
    type: 'Tip',
    startAt: 'Început',
    endAt: 'Sfârșit (opțional)',
    location: 'Locație',
    meetingUrl: 'Link meeting',
    maxAttendees: 'Max participanți',
    create: 'Creează',
    cancel: 'Anulează',
    delete: 'Șterge',
    going: 'Particip',
    notGoing: 'Nu particip',
    attendees: 'participanți',
    noEvents: 'Niciun eveniment programat.',
    upcoming: 'Viitoare',
    past: 'Trecute',
    today: 'Azi',
    types: {
      session: 'Sesiune Live',
      call: 'Apel de Grup',
      deadline: 'Deadline',
      workshop: 'Workshop',
      other: 'Altele',
    },
  },
  en: {
    title: 'Calendar & Events',
    newEvent: 'New Event',
    eventTitle: 'Title',
    description: 'Description',
    type: 'Type',
    startAt: 'Start',
    endAt: 'End (optional)',
    location: 'Location',
    meetingUrl: 'Meeting link',
    maxAttendees: 'Max attendees',
    create: 'Create',
    cancel: 'Cancel',
    delete: 'Delete',
    going: 'Going',
    notGoing: 'Not going',
    attendees: 'attendees',
    noEvents: 'No events scheduled.',
    upcoming: 'Upcoming',
    past: 'Past',
    today: 'Today',
    types: {
      session: 'Live Session',
      call: 'Group Call',
      deadline: 'Deadline',
      workshop: 'Workshop',
      other: 'Other',
    },
  },
};

const eventTypeColors: Record<string, string> = {
  session: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  call: 'bg-green-500/10 text-green-600 border-green-500/30',
  deadline: 'bg-red-500/10 text-red-600 border-red-500/30',
  workshop: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  other: 'bg-muted text-muted-foreground',
};

export const CoachTribeCalendar: React.FC<Props> = ({ tribeId, userId, isOwner }) => {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  const { events, rsvps, loading, createEvent, deleteEvent, toggleRsvp } = useCoachTribeEvents(tribeId, userId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'session',
    start_at: '',
    end_at: '',
    location: '',
    meeting_url: '',
    max_attendees: '',
  });

  const handleCreate = async () => {
    if (!form.title || !form.start_at) return;
    await createEvent({
      title: form.title,
      description: form.description || undefined,
      event_type: form.event_type,
      start_at: new Date(form.start_at).toISOString(),
      end_at: form.end_at ? new Date(form.end_at).toISOString() : undefined,
      location: form.location || undefined,
      meeting_url: form.meeting_url || undefined,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : undefined,
    });
    setForm({ title: '', description: '', event_type: 'session', start_at: '', end_at: '', location: '', meeting_url: '', max_attendees: '' });
    setDialogOpen(false);
  };

  const upcomingEvents = events.filter(e => !isPast(new Date(e.start_at)) || isToday(new Date(e.start_at)));
  const pastEvents = events.filter(e => isPast(new Date(e.start_at)) && !isToday(new Date(e.start_at)));

  const userIsGoing = (eventId: string) => rsvps[eventId]?.some(r => r.user_id === userId);

  const renderEvent = (event: TribeEvent) => {
    const eventDate = new Date(event.start_at);
    const rsvpCount = rsvps[event.id]?.length || 0;
    const colorClass = eventTypeColors[event.event_type] || eventTypeColors.other;

    return (
      <Card key={event.id} className="border">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{event.title}</h3>
                <Badge variant="outline" className={colorClass}>
                  {(t.types as any)[event.event_type] || event.event_type}
                </Badge>
                {isToday(eventDate) && (
                  <Badge className="bg-primary text-primary-foreground">{t.today}</Badge>
                )}
              </div>

              {event.description && (
                <p className="text-sm text-muted-foreground">{event.description}</p>
              )}

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {format(eventDate, 'dd MMM yyyy, HH:mm')}
                  {event.end_at && ` – ${format(new Date(event.end_at), 'HH:mm')}`}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location}
                  </span>
                )}
                {event.meeting_url && (
                  <a href={event.meeting_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline">
                    <Video className="h-3.5 w-3.5" />
                    Link
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {rsvpCount} {t.attendees}
                  {event.max_attendees && ` / ${event.max_attendees}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={userIsGoing(event.id) ? 'default' : 'outline'}
                onClick={() => toggleRsvp(event.id)}
                className="gap-1"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {userIsGoing(event.id) ? t.going : t.notGoing}
              </Button>
              {isOwner && (
                <Button size="sm" variant="ghost" onClick={() => deleteEvent(event.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {t.title}
        </h2>
        {isOwner && (
          <>
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {t.newEvent}
            </Button>
            <ResponsiveModal open={dialogOpen} onOpenChange={setDialogOpen} className="max-w-md">
              <ResponsiveModalHeader>
                <ResponsiveModalTitle>{t.newEvent}</ResponsiveModalTitle>
              </ResponsiveModalHeader>
              <div className="space-y-3">
                <Input
                  placeholder={t.eventTitle}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
                <Textarea
                  placeholder={t.description}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                />
                <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.types).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <label className="text-sm text-muted-foreground">{t.startAt}</label>
                  <Input
                    type="datetime-local"
                    value={form.start_at}
                    onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t.endAt}</label>
                  <Input
                    type="datetime-local"
                    value={form.end_at}
                    onChange={e => setForm(f => ({ ...f, end_at: e.target.value }))}
                  />
                </div>
                <Input
                  placeholder={t.location}
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
                <Input
                  placeholder={t.meetingUrl}
                  value={form.meeting_url}
                  onChange={e => setForm(f => ({ ...f, meeting_url: e.target.value }))}
                />
                <Input
                  placeholder={t.maxAttendees}
                  type="number"
                  value={form.max_attendees}
                  onChange={e => setForm(f => ({ ...f, max_attendees: e.target.value }))}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
                  <Button onClick={handleCreate} disabled={!form.title || !form.start_at}>{t.create}</Button>
                </div>
              </div>
            </ResponsiveModal>
          </>
        )}

      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t.noEvents}</p>
      ) : (
        <div className="space-y-6">
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t.upcoming}</h3>
              {upcomingEvents.map(renderEvent)}
            </div>
          )}
          {pastEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t.past}</h3>
              {pastEvents.map(renderEvent)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
