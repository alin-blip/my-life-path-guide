import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Globe, Monitor } from 'lucide-react';
import { format } from 'date-fns';

interface ErrorLog {
  id: string;
  user_id: string | null;
  error_message: string;
  stack_trace: string | null;
  component_name: string | null;
  url: string | null;
  user_agent: string | null;
  resolved: boolean | null;
  created_at: string | null;
}

export const AdminErrorMonitor: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');

  const fetchErrors = async () => {
    setLoading(true);
    let query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'unresolved') {
      query = query.or('resolved.is.null,resolved.eq.false');
    }

    const { data, error } = await query;
    if (!error && data) {
      setErrors(data as ErrorLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchErrors();
  }, [filter]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('error-logs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'error_logs' }, (payload) => {
        setErrors(prev => [payload.new as ErrorLog, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markResolved = async (id: string) => {
    await supabase
      .from('error_logs')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id);
    setErrors(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
  };

  const unresolvedCount = errors.filter(e => !e.resolved).length;

  const getDeviceType = (ua: string | null) => {
    if (!ua) return 'Unknown';
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold">Monitor Erori Client</h3>
          {unresolvedCount > 0 && (
            <Badge variant="destructive">{unresolvedCount} nerezolvate</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'unresolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unresolved')}
          >
            Nerezolvate
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Toate
          </Button>
          <Button variant="outline" size="sm" onClick={fetchErrors}>
            Reîncarcă
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Se încarcă...</p>
      ) : errors.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Nicio eroare {filter === 'unresolved' ? 'nerezolvată' : ''}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {errors.map((error) => (
            <Card key={error.id} className={`${error.resolved ? 'opacity-60' : 'border-destructive/30'}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={error.resolved ? 'secondary' : 'destructive'} className="text-xs">
                        {error.resolved ? 'Rezolvat' : 'Activ'}
                      </Badge>
                      {error.component_name && (
                        <Badge variant="outline" className="text-xs">{error.component_name}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {error.created_at ? format(new Date(error.created_at), 'dd MMM HH:mm') : 'N/A'}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-foreground truncate">{error.error_message}</p>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {error.url && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <Globe className="h-3 w-3 flex-shrink-0" />
                          {new URL(error.url).pathname}
                        </span>
                      )}
                      {error.user_agent && (
                        <span className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          {getDeviceType(error.user_agent)}
                        </span>
                      )}
                      {error.user_id && (
                        <span className="truncate max-w-[120px]">User: {error.user_id.slice(0, 8)}...</span>
                      )}
                    </div>
                  </div>
                  
                  {!error.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markResolved(error.id)}
                      className="flex-shrink-0"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Rezolvat
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
