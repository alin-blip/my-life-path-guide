import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  BarChart, Bar,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Brain } from 'lucide-react';

interface MindSession {
  id: string;
  created_at: string;
  completed_at: string | null;
  emotion: string | null;
  intensity: number | null;
  intensity_before: number | null;
  intensity_after: number | null;
  distortion_slug: string | null;
  cognitive_reframe: string | null;
  situation: string | null;
  status: string | null;
}

export const MindProgressChart = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<MindSession[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const since = subDays(new Date(), 90).toISOString();
      const { data } = await supabase
        .from('mind_shift_sessions')
        .select('id, created_at, completed_at, emotion, intensity, intensity_before, intensity_after, distortion_slug, cognitive_reframe, situation, status')
        .eq('user_id', user.id)
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      setSessions((data || []) as MindSession[]);
      setLoading(false);
    })();
  }, []);

  const chartData = useMemo(() => sessions
    .filter(s => (s.intensity_before ?? s.intensity) != null)
    .map(s => ({
      label: format(new Date(s.created_at), 'd MMM', { locale: ro }),
      before: s.intensity_before ?? s.intensity ?? 0,
      after: s.intensity_after ?? 0,
    })), [sessions]);

  const distortions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of sessions) {
      if (!s.distortion_slug) continue;
      counts.set(s.distortion_slug, (counts.get(s.distortion_slug) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([slug, count]) => ({ slug, count }));
  }, [sessions]);

  if (loading) return <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă...</CardContent></Card>;

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Brain className="h-10 w-10 mx-auto mb-2 opacity-50" />
          Nu ai încă sesiuni Mind Shift. Deschide Mind Coach pentru a începe.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Intensitate Before → After</CardTitle>
            <CardDescription>Efectul sesiunilor de reframing pe emoții</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="before" name="Înainte" stroke="hsl(0, 84%, 60%)" strokeWidth={2} />
                <Line type="monotone" dataKey="after" name="După" stroke="hsl(142, 71%, 45%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top distorsiuni cognitive</CardTitle>
            <CardDescription>Ce tipare apar cel mai des</CardDescription>
          </CardHeader>
          <CardContent>
            {distortions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nu au fost detectate distorsiuni.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={distortions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="slug" fontSize={11} width={110} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Ultimele sesiuni</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sessions.slice().reverse().slice(0, 10).map(s => (
            <div key={s.id} className="p-3 rounded-lg border bg-card/50">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {s.emotion && <Badge variant="outline">{s.emotion}</Badge>}
                  {s.distortion_slug && <Badge variant="secondary">{s.distortion_slug}</Badge>}
                  {s.status && <Badge variant="outline" className="text-[10px]">{s.status}</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(s.created_at), 'd MMM yyyy, HH:mm', { locale: ro })}
                </span>
              </div>
              {s.situation && <p className="text-sm line-clamp-2">{s.situation}</p>}
              {s.cognitive_reframe && <p className="text-xs text-muted-foreground mt-1">→ {s.cognitive_reframe}</p>}
              {(s.intensity_before != null || s.intensity_after != null) && (
                <p className="text-xs mt-1">
                  <span className="text-red-500">{s.intensity_before ?? '-'}</span>
                  <span className="mx-1">→</span>
                  <span className="text-green-500">{s.intensity_after ?? '-'}</span>
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
