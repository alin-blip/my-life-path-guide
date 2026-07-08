import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Briefcase } from 'lucide-react';

interface DailyMetric {
  date: string;
  content_pieces_count: number | null;
  engage_minutes: number | null;
  outreach_prospects_count: number | null;
  close_deals_won: number | null;
  close_conversations_count: number | null;
}

export const BusinessProgressChart = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DailyMetric[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const since = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('biz4_daily_metrics')
        .select('date, content_pieces_count, engage_minutes, outreach_prospects_count, close_deals_won, close_conversations_count')
        .eq('user_id', user.id)
        .gte('date', since)
        .order('date', { ascending: true });
      setRows((data || []) as DailyMetric[]);
      setLoading(false);
    })();
  }, []);

  const chartData = useMemo(() => rows.map(r => ({
    label: format(new Date(r.date), 'd MMM', { locale: ro }),
    content: r.content_pieces_count ?? 0,
    prospects: r.outreach_prospects_count ?? 0,
    deals: r.close_deals_won ?? 0,
    conversations: r.close_conversations_count ?? 0,
  })), [rows]);

  const totals = useMemo(() => rows.reduce((acc, r) => ({
    content: acc.content + (r.content_pieces_count || 0),
    engage: acc.engage + (r.engage_minutes || 0),
    prospects: acc.prospects + (r.outreach_prospects_count || 0),
    deals: acc.deals + (r.close_deals_won || 0),
  }), { content: 0, engage: 0, prospects: 0, deals: 0 }), [rows]);

  if (loading) return <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă...</CardContent></Card>;

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-50" />
          Nu ai încă KPI business înregistrați. Setează metricile zilnice din Business.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{totals.content}</div><div className="text-xs text-muted-foreground">Conținut</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{totals.engage}</div><div className="text-xs text-muted-foreground">Min. engage</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{totals.prospects}</div><div className="text-xs text-muted-foreground">Prospects</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-500">{totals.deals}</div><div className="text-xs text-muted-foreground">Deals</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> KPI-uri zilnice (30 zile)</CardTitle>
          <CardDescription>Content · Prospects · Conversații · Deals</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="content" name="Conținut" stroke="hsl(280, 70%, 60%)" strokeWidth={2} />
              <Line type="monotone" dataKey="prospects" name="Prospects" stroke="hsl(200, 82%, 55%)" strokeWidth={2} />
              <Line type="monotone" dataKey="conversations" name="Conv." stroke="hsl(30, 90%, 55%)" strokeWidth={2} />
              <Line type="monotone" dataKey="deals" name="Deals" stroke="hsl(142, 71%, 45%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
