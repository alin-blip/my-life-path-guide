import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Trophy, Flame, Zap, Target, TrendingDown, Mail, DollarSign } from 'lucide-react';
import { ACHIEVEMENT_MAP } from '@/data/achievements';
import { WARRIOR_TYPES } from '@/data/warriorTypes';

interface Metrics {
  generated_at: string;
  funnel?: { leads_captured: number; report_sent: number; checkout_started: number; trial_started: number; routine_activated: number; paid_converted: number };
  funnel_rates?: { lead_to_checkout_pct: number; checkout_to_trial_pct: number; trial_to_paid_pct: number; lead_to_paid_pct: number };
  dropoff_by_type?: Record<string, { leads: number; trials: number; paid: number }>;
  drip_emails?: Record<string, { sent: number; failed: number }>;
  quiz: { total: number; activated: number; activation_rate_pct: number; distribution: Record<string, number> };
  routine: { sessions_30d: number; completed_30d: number; completion_rate_pct: number; unique_users_30d: number; unique_users_7d: number };
  streaks: { buckets: Record<string, number>; longest_overall: number; total_users_tracked: number };
  features: Record<string, { total: number; free: number; paid: number }>;
  achievements: Record<string, number>;
}

const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
      </div>
    </CardContent>
  </Card>
);

const Bar = ({ value, max, className = 'bg-primary' }: { value: number; max: number; className?: string }) => (
  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
    <div className={`h-full ${className}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
  </div>
);

export function WarriorRoutineDashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: err } = await supabase.functions.invoke('admin-warrior-metrics', { body: {} });
      if (err) throw err;
      setData(res as Metrics);
    } catch (e: any) {
      setError(e?.message ?? 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !data) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (error) {
    return <Card><CardContent className="pt-6 text-destructive">{error} <Button variant="outline" size="sm" onClick={load} className="ml-2">Retry</Button></CardContent></Card>;
  }
  if (!data) return null;

  const maxQuiz = Math.max(1, ...Object.values(data.quiz.distribution));
  const maxAch = Math.max(1, ...Object.values(data.achievements));
  const maxFeat = Math.max(1, ...Object.values(data.features).map(f => f.total));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">⚔️ Warrior Routine Dashboard</h2>
          <p className="text-sm text-muted-foreground">Actualizat: {new Date(data.generated_at).toLocaleString('ro-RO')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      {/* Top row: Quiz + Routine + Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Quiz submissions" value={data.quiz.total} sub={`${data.quiz.activated} activate (${data.quiz.activation_rate_pct}%)`} />
        <StatCard icon={Users} label="Utilizatori activi 7d" value={data.routine.unique_users_7d} sub={`${data.routine.unique_users_30d} în 30d`} />
        <StatCard icon={Flame} label="Rutini complete 30d" value={data.routine.completed_30d} sub={`${data.routine.completion_rate_pct}% completion rate`} />
        <StatCard icon={Trophy} label="Longest streak" value={data.streaks.longest_overall} sub={`${data.streaks.total_users_tracked} useri tracked`} />
      </div>

      {/* Conversion Funnel */}
      {data.funnel && data.funnel_rates && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><TrendingDown className="h-5 w-5" /> Funnel Conversie Warrior</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const steps: Array<[string, number]> = [
                ['Leads capturate', data.funnel!.leads_captured],
                ['Raport trimis', data.funnel!.report_sent],
                ['Checkout inițiat', data.funnel!.checkout_started],
                ['Trial pornit', data.funnel!.trial_started],
                ['Rutină activată', data.funnel!.routine_activated],
                ['Convertiți plătiți', data.funnel!.paid_converted],
              ];
              const max = Math.max(1, ...steps.map(([, v]) => v));
              return steps.map(([label, v], i) => {
                const prev = i > 0 ? steps[i - 1][1] : v;
                const dropPct = prev > 0 ? Math.round(((prev - v) / prev) * 1000) / 10 : 0;
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{i + 1}. {label}</span>
                      <span className="text-muted-foreground">
                        {v}
                        {i > 0 && dropPct > 0 && <Badge variant="outline" className="ml-2 text-xs text-destructive">-{dropPct}%</Badge>}
                      </span>
                    </div>
                    <Bar value={v} max={max} className={i === steps.length - 1 ? 'bg-green-500' : 'bg-primary'} />
                  </div>
                );
              });
            })()}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
              <div><div className="text-xs text-muted-foreground">Lead → Checkout</div><div className="text-lg font-bold">{data.funnel_rates.lead_to_checkout_pct}%</div></div>
              <div><div className="text-xs text-muted-foreground">Checkout → Trial</div><div className="text-lg font-bold">{data.funnel_rates.checkout_to_trial_pct}%</div></div>
              <div><div className="text-xs text-muted-foreground">Trial → Paid</div><div className="text-lg font-bold">{data.funnel_rates.trial_to_paid_pct}%</div></div>
              <div><div className="text-xs text-muted-foreground">Lead → Paid</div><div className="text-lg font-bold text-green-600">{data.funnel_rates.lead_to_paid_pct}%</div></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drop-off per warrior type */}
      {data.dropoff_by_type && Object.keys(data.dropoff_by_type).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5" /> Conversie per Warrior Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.dropoff_by_type)
              .sort(([, a], [, b]) => b.leads - a.leads)
              .map(([type, v]) => {
                const def = WARRIOR_TYPES?.[type as keyof typeof WARRIOR_TYPES];
                const trialRate = v.leads > 0 ? Math.round((v.trials / v.leads) * 100) : 0;
                const paidRate = v.leads > 0 ? Math.round((v.paid / v.leads) * 100) : 0;
                return (
                  <div key={type} className="flex items-center justify-between gap-4 text-sm border-b pb-2 last:border-0">
                    <span className="font-medium min-w-0 flex-1 truncate">{def?.emoji ?? '⚔️'} {def?.name ?? type}</span>
                    <div className="flex gap-4 text-xs">
                      <span><span className="text-muted-foreground">Leads:</span> <b>{v.leads}</b></span>
                      <span><span className="text-muted-foreground">Trials:</span> <b>{v.trials}</b> ({trialRate}%)</span>
                      <span className="text-green-600"><span className="text-muted-foreground">Paid:</span> <b>{v.paid}</b> ({paidRate}%)</span>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Drip email metrics */}
      {data.drip_emails && Object.keys(data.drip_emails).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-5 w-5" /> Drip Emails Warrior (30d)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.drip_emails)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([tpl, v]) => (
                <div key={tpl} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{tpl}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Sent {v.sent}</Badge>
                    {v.failed > 0 && <Badge variant="destructive">Failed {v.failed}</Badge>}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}


      {/* Quiz distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" /> Distribuție Warrior Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(data.quiz.distribution).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nicio submission încă.</p>
          ) : (
            Object.entries(data.quiz.distribution)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const def = WARRIOR_TYPES?.[type as keyof typeof WARRIOR_TYPES];
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{def?.emoji ?? '⚔️'} {def?.name ?? type}</span>
                      <span className="text-muted-foreground">{count} ({Math.round((count / data.quiz.total) * 100)}%)</span>
                    </div>
                    <Bar value={count} max={maxQuiz} />
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>

      {/* Streak buckets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Flame className="h-5 w-5" /> Distribuție Streak-uri Curente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(data.streaks.buckets).map(([label, count]) => {
            const max = Math.max(1, ...Object.values(data.streaks.buckets));
            const color = label === '30+' ? 'bg-yellow-500' : label === '14-29' ? 'bg-orange-500' : label === '7-13' ? 'bg-red-500' : label === '3-6' ? 'bg-amber-400' : 'bg-muted-foreground/40';
            return (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{label} zile</span>
                  <span className="text-muted-foreground">{count} useri</span>
                </div>
                <Bar value={count} max={max} className={color} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Feature usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5" /> Feature Usage (30d)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(data.features).length === 0 ? (
            <p className="text-sm text-muted-foreground">Fără usage logat.</p>
          ) : (
            Object.entries(data.features)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([key, v]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">
                      {v.total} <Badge variant="outline" className="ml-2 text-xs">Free {v.free}</Badge> <Badge variant="secondary" className="ml-1 text-xs">Paid {v.paid}</Badge>
                    </span>
                  </div>
                  <Bar value={v.total} max={maxFeat} />
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* Achievement funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Trophy className="h-5 w-5" /> Achievement Unlocks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(data.achievements).length === 0 ? (
            <p className="text-sm text-muted-foreground">Niciun achievement deblocat încă.</p>
          ) : (
            Object.entries(data.achievements)
              .sort(([, a], [, b]) => b - a)
              .map(([key, count]) => {
                const def = ACHIEVEMENT_MAP[key];
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{def?.icon ?? '🏆'} {def?.title ?? key}</span>
                      <span className="text-muted-foreground">{count} useri</span>
                    </div>
                    <Bar value={count} max={maxAch} />
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default WarriorRoutineDashboard;
