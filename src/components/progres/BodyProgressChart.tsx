import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Dumbbell, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ExerciseRow {
  id: string;
  session_id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  created_at: string;
  session_date?: string;
}

export const BodyProgressChart = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const since = format(subDays(new Date(), 180), 'yyyy-MM-dd');
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('id, date')
        .eq('user_id', user.id)
        .gte('date', since)
        .order('date', { ascending: true });

      if (!sessions || sessions.length === 0) { setRows([]); setLoading(false); return; }

      const ids = sessions.map(s => s.id);
      const { data: ex } = await supabase
        .from('workout_exercises')
        .select('*')
        .in('session_id', ids);

      const dateMap = new Map(sessions.map(s => [s.id, s.date]));
      const enriched: ExerciseRow[] = (ex || []).map((e: any) => ({
        ...e,
        session_date: dateMap.get(e.session_id) as string,
      }));
      setRows(enriched);
      setLoading(false);
    })();
  }, []);

  const exerciseNames = useMemo(() => {
    const set = new Set(rows.map(r => r.exercise_name).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  useEffect(() => {
    if (!selected && exerciseNames.length > 0) setSelected(exerciseNames[0]);
  }, [exerciseNames, selected]);

  const filtered = useMemo(() =>
    rows.filter(r => r.exercise_name === selected).sort((a, b) =>
      (a.session_date || '').localeCompare(b.session_date || '')
    ),
  [rows, selected]);

  // aggregate per session (max weight, total volume)
  const chartData = useMemo(() => {
    const perSession = new Map<string, { date: string; maxWeight: number; volume: number }>();
    for (const r of filtered) {
      const d = r.session_date || '';
      if (!d) continue;
      const w = Number(r.weight_kg) || 0;
      const s = Number(r.sets) || 0;
      const reps = Number(r.reps) || 0;
      const vol = s * reps * w;
      const prev = perSession.get(d);
      if (!prev) perSession.set(d, { date: d, maxWeight: w, volume: vol });
      else perSession.set(d, { date: d, maxWeight: Math.max(prev.maxWeight, w), volume: prev.volume + vol });
    }
    return Array.from(perSession.values()).map(v => ({
      ...v,
      label: format(new Date(v.date), 'd MMM', { locale: ro }),
    }));
  }, [filtered]);

  const delta = useMemo(() => {
    if (chartData.length < 2) return null;
    const last = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];
    return {
      weight: last.maxWeight - prev.maxWeight,
      volume: last.volume - prev.volume,
    };
  }, [chartData]);

  if (loading) {
    return <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă...</CardContent></Card>;
  }

  if (exerciseNames.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Dumbbell className="h-10 w-10 mx-auto mb-2 opacity-50" />
          Nu ai încă exerciții salvate. Începe un antrenament din tab-ul „Antrenament Azi".
        </CardContent>
      </Card>
    );
  }

  const DeltaBadge = ({ value, unit }: { value: number; unit: string }) => {
    const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
    const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-muted-foreground';
    return (
      <Badge variant="outline" className={`gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        {value > 0 ? '+' : ''}{value.toFixed(1)} {unit}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Progres pe exercițiu
            </CardTitle>
            <CardDescription>Greutate maximă și volum total per sesiune</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {delta && (
              <>
                <DeltaBadge value={delta.weight} unit="kg" />
                <DeltaBadge value={delta.volume} unit="vol" />
              </>
            )}
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Alege exercițiul" />
              </SelectTrigger>
              <SelectContent>
                {exerciseNames.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nu există date pentru acest exercițiu.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} label={{ value: 'kg', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} label={{ value: 'vol', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="maxWeight" name="Greutate max (kg)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="volume" name="Volum total" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Istoric sesiuni pentru „{selected}"</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Seturi</TableHead>
                <TableHead className="text-center">Reps</TableHead>
                <TableHead className="text-center">Greutate</TableHead>
                <TableHead className="text-center">Volum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice().reverse().map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.session_date ? format(new Date(r.session_date), 'd MMM yyyy', { locale: ro }) : '-'}</TableCell>
                  <TableCell className="text-center">{r.sets ?? '-'}</TableCell>
                  <TableCell className="text-center">{r.reps ?? '-'}</TableCell>
                  <TableCell className="text-center">{r.weight_kg ? `${r.weight_kg} kg` : '-'}</TableCell>
                  <TableCell className="text-center">
                    {(Number(r.sets) || 0) * (Number(r.reps) || 0) * (Number(r.weight_kg) || 0) || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
