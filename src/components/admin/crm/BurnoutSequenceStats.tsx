import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Mail, CheckCircle2, XCircle, Eye, MousePointerClick, StopCircle } from 'lucide-react';

interface DayStat {
  day: number;
  sent: number;
  delivered: number;
  rejected: number;
  pending: number;
  opened: number;
  clicked: number;
  stopped_unsubscribed: number;
  stopped_ebook: number;
  stopped_challenge: number;
}

interface Totals {
  unique_leads: number;
  sent: number;
  delivered: number;
  rejected: number;
  opened: number;
  clicked: number;
  stopped_unsubscribed: number;
  stopped_ebook: number;
  stopped_challenge: number;
}

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

export const BurnoutSequenceStats: React.FC = () => {
  const [days, setDays] = useState<DayStat[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('burnout-sequence-stats');
      if (error) throw error;
      setDays(data.days || []);
      setTotals(data.totals || null);
    } catch (e: any) {
      setError(e.message || 'Eroare la încărcare');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Burnout Story — statistici pe zi</h3>
          <p className="text-sm text-muted-foreground">Secvența de 10 emailuri pentru leadurile din burnout quiz</p>
        </div>
        <Button onClick={load} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Reîncarcă
        </Button>
      </div>

      {error && (
        <Card><CardContent className="pt-6 text-destructive text-sm">{error}</CardContent></Card>
      )}

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard icon={<Mail className="h-4 w-4" />} label="Leads unici" value={totals.unique_leads} />
          <StatCard icon={<Mail className="h-4 w-4" />} label="Trimise" value={totals.sent} />
          <StatCard icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} label="Livrate" value={totals.delivered} sub={`${pct(totals.delivered, totals.sent)}%`} />
          <StatCard icon={<XCircle className="h-4 w-4 text-destructive" />} label="Respinse" value={totals.rejected} sub={`${pct(totals.rejected, totals.sent)}%`} />
          <StatCard icon={<Eye className="h-4 w-4 text-blue-500" />} label="Deschise" value={totals.opened} sub={`${pct(totals.opened, totals.sent)}%`} />
          <StatCard icon={<MousePointerClick className="h-4 w-4 text-purple-500" />} label="Click-uri" value={totals.clicked} sub={`${pct(totals.clicked, totals.sent)}%`} />
          <StatCard icon={<StopCircle className="h-4 w-4 text-orange-500" />} label="Opriți" value={totals.stopped_unsubscribed + totals.stopped_ebook + totals.stopped_challenge} sub={`unsub ${totals.stopped_unsubscribed} / ebook ${totals.stopped_ebook} / challenge ${totals.stopped_challenge}`} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detaliu pe zi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ziua</TableHead>
                    <TableHead className="text-right">Trimise</TableHead>
                    <TableHead className="text-right">Livrate</TableHead>
                    <TableHead className="text-right">Respinse</TableHead>
                    <TableHead className="text-right">În așteptare</TableHead>
                    <TableHead className="text-right">Deschise</TableHead>
                    <TableHead className="text-right">Click</TableHead>
                    <TableHead className="text-right">Unsub</TableHead>
                    <TableHead className="text-right">Ebook</TableHead>
                    <TableHead className="text-right">Challenge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {days.map((d) => (
                    <TableRow key={d.day}>
                      <TableCell className="font-medium">Day {d.day}</TableCell>
                      <TableCell className="text-right">{d.sent}</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400">
                        {d.delivered} {d.sent > 0 && <span className="text-xs text-muted-foreground">({pct(d.delivered, d.sent)}%)</span>}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {d.rejected} {d.sent > 0 && d.rejected > 0 && <span className="text-xs text-muted-foreground">({pct(d.rejected, d.sent)}%)</span>}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{d.pending}</TableCell>
                      <TableCell className="text-right text-blue-600 dark:text-blue-400">
                        {d.opened} {d.sent > 0 && d.opened > 0 && <span className="text-xs text-muted-foreground">({pct(d.opened, d.sent)}%)</span>}
                      </TableCell>
                      <TableCell className="text-right text-purple-600 dark:text-purple-400">
                        {d.clicked} {d.sent > 0 && d.clicked > 0 && <span className="text-xs text-muted-foreground">({pct(d.clicked, d.sent)}%)</span>}
                      </TableCell>
                      <TableCell className="text-right">{d.stopped_unsubscribed}</TableCell>
                      <TableCell className="text-right">{d.stopped_ebook}</TableCell>
                      <TableCell className="text-right">{d.stopped_challenge}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-3">
                „Opriți" e atribuit ultimei zile primite de fiecare lead. Livrarea e corelată cu jurnalul de trimiteri pe fereastră de ±60 min.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; sub?: string }> = ({ icon, label, value, sub }) => (
  <Card>
    <CardContent className="pt-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </CardContent>
  </Card>
);

export default BurnoutSequenceStats;
