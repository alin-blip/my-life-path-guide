import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mail, Eye, LogIn, Target, MessageSquare, CreditCard,
  FileText, Zap, User, CheckCircle, Calendar, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface TimelineEvent {
  id: string;
  activity_type: string;
  activity_title: string | null;
  activity_data: any;
  page_path: string | null;
  created_at: string;
}

interface ContactTimelineProps {
  contactId: string;
}

export const ContactTimeline: React.FC<ContactTimelineProps> = ({ contactId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [contactId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_activity_timeline')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'email_sent': <Mail className="h-4 w-4 text-blue-500" />,
      'email_opened': <Eye className="h-4 w-4 text-green-500" />,
      'email_clicked': <CheckCircle className="h-4 w-4 text-purple-500" />,
      'login': <LogIn className="h-4 w-4 text-gray-500" />,
      'page_view': <Eye className="h-4 w-4 text-gray-400" />,
      'door_task_created': <Target className="h-4 w-4 text-blue-500" />,
      'door_task_completed': <CheckCircle className="h-4 w-4 text-green-500" />,
      'stack_session': <MessageSquare className="h-4 w-4 text-purple-500" />,
      'purchase': <CreditCard className="h-4 w-4 text-yellow-500" />,
      'quiz_completed': <Zap className="h-4 w-4 text-orange-500" />,
      'account_created': <User className="h-4 w-4 text-green-500" />,
      'challenge_started': <Calendar className="h-4 w-4 text-blue-500" />,
      'challenge_day_completed': <CheckCircle className="h-4 w-4 text-green-500" />
    };
    return iconMap[type] || <FileText className="h-4 w-4 text-gray-400" />;
  };

  const getActivityLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      'email_sent': 'Email trimis',
      'email_opened': 'Email deschis',
      'email_clicked': 'Link accesat din email',
      'login': 'Autentificare',
      'page_view': 'Pagină vizitată',
      'door_task_created': 'Task creat în Door',
      'door_task_completed': 'Task completat',
      'stack_session': 'Sesiune Stack',
      'purchase': 'Achiziție',
      'quiz_completed': 'Quiz completat',
      'account_created': 'Cont creat',
      'challenge_started': 'Challenge început',
      'challenge_day_completed': 'Zi de challenge completată'
    };
    return labelMap[type] || type.replace(/_/g, ' ');
  };

  const getActivityColor = (type: string) => {
    if (type.includes('completed') || type.includes('opened') || type.includes('clicked')) {
      return 'border-green-500';
    }
    if (type.includes('purchase')) {
      return 'border-yellow-500';
    }
    if (type.includes('email')) {
      return 'border-blue-500';
    }
    return 'border-gray-300';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nu există activitate înregistrată
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 h-5 w-5 rounded-full bg-background border-2 flex items-center justify-center ${getActivityColor(event.activity_type)}`}>
                      {getActivityIcon(event.activity_type)}
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {event.activity_title || getActivityLabel(event.activity_type)}
                          </p>
                          {event.page_path && (
                            <p className="text-sm text-muted-foreground">
                              {event.page_path}
                            </p>
                          )}
                          {event.activity_data && Object.keys(event.activity_data).length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                              {JSON.stringify(event.activity_data, null, 2)}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.created_at), { 
                              addSuffix: true, 
                              locale: ro 
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.created_at), 'HH:mm', { locale: ro })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
