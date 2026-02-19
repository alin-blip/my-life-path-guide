import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ExternalLink, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { TribeEvent, EventRsvp } from '@/hooks/useCoachTribeEvents';

interface EventDetailDialogProps {
  event: TribeEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rsvps: EventRsvp[];
  userRsvp: boolean;
  onToggleRsvp: () => void;
  isRo: boolean;
}

function buildGoogleCalendarUrl(event: TribeEvent) {
  const start = new Date(event.start_at);
  const end = event.end_at ? new Date(event.end_at) : new Date(start.getTime() + 3600000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: event.description || '',
    location: event.meeting_url || event.location || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const EventDetailDialog: React.FC<EventDetailDialogProps> = ({
  event, open, onOpenChange, rsvps, userRsvp, onToggleRsvp, isRo
}) => {
  if (!event) return null;
  const locale = isRo ? ro : enUS;
  const start = new Date(event.start_at);
  const goingCount = rsvps.filter(r => r.status === 'going').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{format(start, 'EEEE, d MMMM yyyy', { locale })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {format(start, 'h:mm a')}
              {event.end_at && ` - ${format(new Date(event.end_at), 'h:mm a')}`}
            </span>
          </div>

          {/* Location / Meeting URL */}
          {event.meeting_url && (
            <a
              href={event.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {isRo ? 'Link sesiune' : 'Meeting link'}
            </a>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{event.description}</p>
          )}

          {/* RSVP */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>{goingCount} {isRo ? 'participanți' : 'attending'}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant={userRsvp ? 'default' : 'outline'}
              className="flex-1"
              onClick={onToggleRsvp}
            >
              {userRsvp ? (isRo ? '✓ Participi' : '✓ Going') : (isRo ? 'Participă' : 'RSVP')}
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                {isRo ? 'Adaugă în Calendar' : 'ADD TO CALENDAR'}
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
