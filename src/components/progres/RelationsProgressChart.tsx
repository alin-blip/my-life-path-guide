import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { format, startOfWeek, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Heart, Baby } from 'lucide-react';

interface Session { id: string; created_at: string; title: string | null; kind: 'marriage' | 'parenting'; axis?: string | null; }

export const RelationsProgressChart = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const since = subDays(new Date(), 90).toISOString();
      const [m, p] = await Promise.all([
        supabase.from('marriage_sessions').select('id, created_at, title, primary_destructured_axis').eq('user_id', user.id).gte('created_at', since),
        supabase.from('parenting_sessions').select('id, created_at, title, session_type').eq('user_id', user.id).gte('created_at', since),
      ]);
      const combined: Session[] = [
        ...((m.data || []).map((s: any) => ({ id: s.id, created_at: s.created_at, title: s.title, axis: s.primary_destructured_axis, kind: 'marriage' as const }))),
        ...((p.data || []).map((s: any) => ({ id: s.id, created_at: s.created_at, title: s.title, axis: s.session_type, kind: 'parenting' as const }))),
      ].sort((a, b) => a.created_at.localeCompare(b.created_at));
      setSessions(combined);
      setLoading(false);
    })();
  }, []);

  const weekly = useMemo(() => {
    const map = new Map<string, { week: string; marriage: number; parenting: number }>();
    for (const s of sessions) {
      const wk = format(startOfWeek(new Date(s.created_at), { weekStartsOn: 1 }), 'd MMM', { locale: ro });
      const cur = map.get(wk) || { week: wk, marriage: 0, parenting: 0 };
      cur[s.kind] += 1;
      map.set(wk, cur);
    }
    return Array.from(map.values());
  }, [sessions]);

  if (loading) return <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă...</CardContent></Card>;

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Heart className="h-10 w-10 mx-auto mb-2 opacity-50" />
          Nu ai încă sesiuni de relații. Rulează un Marriage Audit sau o sesiune Parenting.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary" /> Sesiuni pe săptămână</CardTitle>
          <CardDescription>Marriage vs Parenting</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="marriage" name="Marriage" fill="hsl(340, 82%, 60%)" />
              <Bar dataKey="parenting" name="Parenting" fill="hsl(200, 82%, 55%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ultimele sesiuni</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sessions.slice().reverse().slice(0, 10).map(s => (
            <div key={s.id} className="p-3 rounded-lg border bg-card/50 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                {s.kind === 'marriage' ? <Heart className="h-4 w-4 text-rose-500 mt-1 shrink-0" /> : <Baby className="h-4 w-4 text-blue-500 mt-1 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.title || (s.kind === 'marriage' ? 'Marriage session' : 'Parenting session')}</p>
                  {s.axis && <Badge variant="outline" className="mt-1 text-[10px]">{s.axis}</Badge>}
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(s.created_at), 'd MMM', { locale: ro })}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
