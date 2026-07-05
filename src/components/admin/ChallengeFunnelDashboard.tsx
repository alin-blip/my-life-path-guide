import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, MousePointerClick, PlayCircle, CheckCircle2, CreditCard, Mail } from 'lucide-react';

interface FunnelStats {
  leads: number;
  signups: number;
  day1Started: number;
  day7Completed: number;
  checkoutInitiated: number;
  checkoutCompleted: number;
  welcomeSent: number;
  welcomeFailed: number;
  recoveryEmails: number;
}

interface SourceRow {
  source: string;
  count: number;
}

export const ChallengeFunnelDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [utms, setUtms] = useState<SourceRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [
          leadsRes, subsRes, d1Res, d7Res,
          coInitRes, coDoneRes,
          welSentRes, welFailRes, recRes,
          leadsBySrcRes,
        ] = await Promise.all([
          supabase.from('email_leads').select('id', { count: 'exact', head: true }).ilike('source', 'challenge%'),
          supabase.from('subscribers').select('id', { count: 'exact', head: true }).ilike('subscription_tier', '%challenge%'),
          supabase.from('challenge_progress').select('user_id', { count: 'exact', head: true }).eq('day_number', 1),
          supabase.from('challenge_progress').select('id', { count: 'exact', head: true }).eq('day_number', 7).eq('completed', true),
          supabase.from('checkout_events').select('id', { count: 'exact', head: true }).eq('event_type', 'checkout_initiated'),
          supabase.from('checkout_events').select('id', { count: 'exact', head: true }).eq('event_type', 'session_created'),
          supabase.from('email_send_log').select('id', { count: 'exact', head: true }).eq('template_name', 'challenge-welcome').eq('status', 'sent'),
          supabase.from('email_send_log').select('id', { count: 'exact', head: true }).eq('template_name', 'challenge-welcome').in('status', ['failed', 'dlq']),
          supabase.from('challenge_recovery_emails').select('id', { count: 'exact', head: true }),
          supabase.from('email_leads').select('source').ilike('source', 'challenge%').limit(2000),
        ]);

        setStats({
          leads: leadsRes.count || 0,
          signups: subsRes.count || 0,
          day1Started: d1Res.count || 0,
          day7Completed: d7Res.count || 0,
          checkoutInitiated: coInitRes.count || 0,
          checkoutCompleted: coDoneRes.count || 0,
          welcomeSent: welSentRes.count || 0,
          welcomeFailed: welFailRes.count || 0,
          recoveryEmails: recRes.count || 0,
        });

        // Aggregate leads by source
        const bySrc: Record<string, number> = {};
        (leadsBySrcRes.data || []).forEach((r: any) => {
          const s = r.source || 'unknown';
          bySrc[s] = (bySrc[s] || 0) + 1;
        });
        setSources(Object.entries(bySrc).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count));

        // UTM sources from metadata
        const { data: utmRows } = await supabase.from('email_leads').select('metadata').ilike('source', 'challenge%').limit(2000);
        const byUtm: Record<string, number> = {};
        (utmRows || []).forEach((r: any) => {
          const src = r.metadata?.utm_source || '(direct)';
          byUtm[src] = (byUtm[src] || 0) + 1;
        });
        setUtms(Object.entries(byUtm).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const pct = (num: number, den: number) => den > 0 ? Math.round((num / den) * 1000) / 10 : 0;

  const cards = [
    { label: 'Leads', value: stats.leads, icon: Users, sub: '100%' },
    { label: 'Signups', value: stats.signups, icon: MousePointerClick, sub: `${pct(stats.signups, stats.leads)}%` },
    { label: 'Day 1 Started', value: stats.day1Started, icon: PlayCircle, sub: `${pct(stats.day1Started, stats.signups)}%` },
    { label: 'Day 7 Completed', value: stats.day7Completed, icon: CheckCircle2, sub: `${pct(stats.day7Completed, stats.day1Started)}%` },
    { label: 'Checkout Initiated', value: stats.checkoutInitiated, icon: CreditCard, sub: '-' },
    { label: 'Checkout Completed', value: stats.checkoutCompleted, icon: CreditCard, sub: `${pct(stats.checkoutCompleted, stats.checkoutInitiated)}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Challenge 7 Zile — Funnel</h2>
        <p className="text-muted-foreground text-sm">End-to-end conversion tracking for /challenge-7-zile</p>
      </div>

      {/* Funnel cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">{c.sub}</Badge>
                </div>
                <div className="text-2xl font-bold">{c.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Mail className="h-4 w-4" /> Emails</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.welcomeSent}</div>
            <div className="text-muted-foreground">Welcome sent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{stats.welcomeFailed}</div>
            <div className="text-muted-foreground">Welcome failed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{stats.recoveryEmails}</div>
            <div className="text-muted-foreground">Recovery sent</div>
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Leads by Source</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5 text-sm">
              {sources.slice(0, 10).map((s) => (
                <div key={s.source} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground truncate mr-2">{s.source}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
              ))}
              {sources.length === 0 && <div className="text-muted-foreground text-xs">No data</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Leads by UTM Source</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5 text-sm">
              {utms.slice(0, 10).map((s) => (
                <div key={s.source} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground truncate mr-2">{s.source}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
              ))}
              {utms.length === 0 && <div className="text-muted-foreground text-xs">No data</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChallengeFunnelDashboard;
