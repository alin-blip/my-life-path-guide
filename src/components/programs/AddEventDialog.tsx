import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: {
    title: string;
    description?: string;
    event_type: string;
    start_at: string;
    end_at?: string;
    location?: string;
    meeting_url?: string;
    max_attendees?: number;
  }) => void;
  isRo: boolean;
}

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { label: `${h12}:${m} ${ampm}`, value: `${String(h).padStart(2, '0')}:${m}` };
});

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];

export const AddEventDialog: React.FC<AddEventDialogProps> = ({ open, onOpenChange, onAdd, isRo }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState(60);
  const [locationType, setLocationType] = useState('link');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [locationText, setLocationText] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [remindBefore, setRemindBefore] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSubmit = () => {
    if (!title || !date) return;
    const startDate = new Date(date);
    const [h, m] = time.split(':').map(Number);
    startDate.setHours(h, m, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    onAdd({
      title,
      description: description || undefined,
      event_type: locationType === 'link' ? 'online' : locationType === 'in_person' ? 'in_person' : 'call',
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
      location: locationType === 'in_person' ? locationText : undefined,
      meeting_url: locationType === 'link' ? meetingUrl : undefined,
    });

    // Reset
    setTitle(''); setDate(undefined); setTime('18:00'); setDuration(60);
    setMeetingUrl(''); setLocationText(''); setDescription('');
    setIsRecurring(false); setRemindBefore(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isRo ? 'Adaugă eveniment' : 'Add Event'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label>{isRo ? 'Titlu' : 'Title'}</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={isRo ? 'Numele evenimentului' : 'Event name'} />
          </div>

          {/* Date */}
          <div>
            <Label>{isRo ? 'Data' : 'Date'}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : (isRo ? 'Alege data' : 'Pick a date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{isRo ? 'Ora' : 'Time'}</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIMES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isRo ? 'Durată' : 'Duration'}</Label>
              <Select value={String(duration)} onValueChange={v => setDuration(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DURATIONS.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timezone */}
          <div className="text-xs text-muted-foreground">
            {isRo ? 'Fus orar' : 'Timezone'}: {timezone}
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-2">
            <Checkbox checked={isRecurring} onCheckedChange={v => setIsRecurring(v === true)} id="recurring" />
            <Label htmlFor="recurring" className="cursor-pointer text-sm font-normal">
              {isRo ? 'Eveniment recurent' : 'Recurring event'}
            </Label>
          </div>

          {/* Location type */}
          <div>
            <Label>{isRo ? 'Locație' : 'Location'}</Label>
            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="link">{isRo ? 'Link personalizat' : 'Custom link'}</SelectItem>
                <SelectItem value="call">{isRo ? 'Apel video' : 'Video call'}</SelectItem>
                <SelectItem value="in_person">{isRo ? 'În persoană' : 'In person'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {locationType === 'link' && (
            <div>
              <Label>URL</Label>
              <Input value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}
          {locationType === 'in_person' && (
            <div>
              <Label>{isRo ? 'Adresă' : 'Address'}</Label>
              <Input value={locationText} onChange={e => setLocationText(e.target.value)} />
            </div>
          )}

          {/* Description */}
          <div>
            <Label>{isRo ? 'Descriere' : 'Description'}</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 300))}
              placeholder={isRo ? 'Detalii despre eveniment...' : 'Event details...'}
              rows={3}
            />
            <span className="text-xs text-muted-foreground">{description.length}/300</span>
          </div>

          {/* Remind */}
          <div className="flex items-center gap-2">
            <Checkbox checked={remindBefore} onCheckedChange={v => setRemindBefore(v === true)} id="remind" />
            <Label htmlFor="remind" className="cursor-pointer text-sm font-normal">
              {isRo ? 'Reamintește membrii prin email cu 1 zi înainte' : 'Remind members by email 1 day before'}
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{isRo ? 'ANULEAZĂ' : 'CANCEL'}</Button>
          <Button onClick={handleSubmit} disabled={!title || !date}>{isRo ? 'ADAUGĂ' : 'ADD'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
