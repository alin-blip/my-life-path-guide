import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Eye, MousePointer, Play, User, Trophy, BarChart3, ArrowDownRight, Activity } from 'lucide-react';

interface RealtimeEventsProps {
  leadMagnetFilter: string;
}

interface EventRow {
  id: string;
  created_at: string;
  lead_magnet: string;
  event_type: string;
  email: string | null;
  device_type: string | null;
  referrer: string | null;
  event_data: Record<string, unknown> | null;
}

const eventIcons: Record<string, React.ReactNode> = {
  page_view: <Eye className="h-4 w-4" />,
  cta_click: <MousePointer className="h-4 w-4" />,
  quiz_start: <Play className="h-4 w-4" />,
  lead_capture: <User className="h-4 w-4" />,
  quiz_complete: <Trophy className="h-4 w-4" />,
  results_view: <BarChart3 className="h-4 w-4" />,
  bounce: <ArrowDownRight className="h-4 w-4" />,
  step_complete: <Activity className="h-4 w-4" />
};

const eventColors: Record<string, string> = {
  page_view: 'bg-blue-100 text-blue-700',
  cta_click: 'bg-purple-100 text-purple-700',
  quiz_start: 'bg-indigo-100 text-indigo-700',
  lead_capture: 'bg-green-100 text-green-700',
  quiz_complete: 'bg-emerald-100 text-emerald-700',
  results_view: 'bg-cyan-100 text-cyan-700',
  bounce: 'bg-orange-100 text-orange-700',
  step_complete: 'bg-gray-100 text-gray-700'
};

export const RealtimeEvents = ({ leadMagnetFilter }: RealtimeEventsProps) => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('lead_magnet_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (leadMagnetFilter !== 'all') {
          query = query.eq('lead_magnet', leadMagnetFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching events:', error);
          return;
        }

        setEvents(data as EventRow[] || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [leadMagnetFilter]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('lead-magnet-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lead_magnet_events'
        },
        (payload) => {
          const newEvent = payload.new as EventRow;
          // Only add if matches filter
          if (leadMagnetFilter === 'all' || newEvent.lead_magnet === leadMagnetFilter) {
            setEvents(prev => [newEvent, ...prev.slice(0, 29)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadMagnetFilter]);

  const formatEventType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Realtime Events
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Realtime Events
          <Badge variant="secondary" className="ml-2">{events.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No events yet. Waiting for activity...
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${eventColors[event.event_type] || 'bg-gray-100'}`}>
                    {eventIcons[event.event_type] || <Activity className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatEventType(event.event_type)}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.lead_magnet === 'warrior_power' ? 'Warrior Power' : 'Vision 2026'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {event.email && <span>{event.email}</span>}
                      {event.device_type && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {event.device_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(parseISO(event.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
