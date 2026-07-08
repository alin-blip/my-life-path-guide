import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Sparkles, Star } from 'lucide-react';

interface Meditation {
  id: string;
  title: string | null;
  duration_seconds: number | null;
  created_at: string;
  is_favorite: boolean | null;
  binaural_type: string | null;
}

export const SpiritualityProgressChart = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Meditation[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const since = subDays(new Date(), 60).toISOString();
      const { data } = await supabase
        .from('empowerment_meditations')
        .select('id, title, duration_seconds, created_at, is_favorite, binaural_type')
        .eq('user_id', user.id)
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      setItems((data || []) as Meditation[]);
      setLoading(false);
    })();
  }, []);

  const daily = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return days.map(d => {
      const dayStr = format(d, 'yyyy-MM-dd');
      const minutes = items
        .filter(i => i.created_at.startsWith(dayStr))
        .reduce((acc, i) => acc + Math.round((i.duration_seconds || 0) / 60), 0);
      return { label: format(d, 'd MMM', { locale: ro }), minutes };
    });
  }, [items]);

  const totalMinutes = useMemo(() => items.reduce((a, i) => a + Math.round((i.duration_seconds || 0) / 60), 0), [items]);
  const streak = useMemo(() => {
    let s = 0;
    for (let i = daily.length - 1; i >= 0; i--) {
      if (daily[i].minutes > 0) s++;
      else break;
    }
    return s;
  }, [daily]);

  if (loading) return <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă...</CardContent></Card>;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-50" />
          Nu ai încă meditații. Generează una din Empowerment Meditation.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{items.length}</div><div className="text-xs text-muted-foreground">Meditații</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{totalMinutes}</div><div className="text-xs text-muted-foreground">Minute totale</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-orange-500">{streak}🔥</div><div className="text-xs text-muted-foreground">Streak zile</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Minute pe zi (ultimele 30)</CardTitle>
          <CardDescription>Volumul practicii tale spirituale</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" fontSize={10} interval={2} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ultimele meditații</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {items.slice().reverse().slice(0, 10).map(m => (
            <div key={m.id} className="p-3 rounded-lg border bg-card/50 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate flex items-center gap-2">
                  {m.is_favorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                  {m.title || 'Meditație'}
                </p>
                <div className="flex gap-2 mt-1">
                  {m.binaural_type && <Badge variant="outline" className="text-[10px]">{m.binaural_type}</Badge>}
                  <span className="text-xs text-muted-foreground">{Math.round((m.duration_seconds || 0) / 60)} min</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(m.created_at), 'd MMM', { locale: ro })}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
