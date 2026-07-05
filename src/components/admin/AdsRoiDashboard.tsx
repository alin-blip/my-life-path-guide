import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Loader2, Plus, TrendingUp } from 'lucide-react';

interface AttribRow {
  user_id: string;
  attribution_utm: { utm_source?: string; utm_campaign?: string; utm_medium?: string } | null;
  subscription_tier: string | null;
  subscribed: boolean | null;
  created_at: string;
}

interface LeadRow { metadata: any | null }
interface SpendRow {
  id: string;
  utm_source: string;
  utm_campaign: string;
  spend_amount: number;
  currency: string;
  period_start: string;
  period_end: string;
}

// Tier → estimated revenue (EUR) for ROAS calc
const TIER_REVENUE_EUR: Record<string, number> = {
  starter: 49,
  premium: 97,
  pro: 197,
  elite: 497,
  'challenge-pro': 97,
  'pro-challenge-3mo': 297,
};
const revenueForTier = (tier: string | null): number => {
  if (!tier) return 0;
  const key = tier.toLowerCase().trim();
  return TIER_REVENUE_EUR[key] ?? 0;
};

interface AggRow {
  utm_source: string;
  utm_campaign: string;
  leads: number;
  signups: number;
  paid: number;
  revenue: number;
  spend: number;
  currency: string;
}

export const AdsRoiDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [agg, setAgg] = useState<AggRow[]>([]);
  const [spends, setSpends] = useState<SpendRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    utm_source: '',
    utm_campaign: '(all)',
    spend_amount: '',
    currency: 'EUR',
    period_start: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    period_end: new Date().toISOString().slice(0, 10),
  });

  const load = async () => {
    setLoading(true);
    try {
      const [leadsRes, subsRes, spendRes] = await Promise.all([
        supabase.from('email_leads').select('metadata').ilike('source', 'challenge%').limit(5000),
        supabase.from('subscribers').select('user_id, attribution_utm, subscription_tier, subscribed, created_at').limit(5000),
        (supabase as any).from('ads_spend_manual').select('*').order('period_end', { ascending: false }),
      ]);

      const acc = new Map<string, AggRow>();
      const key = (s: string, c: string) => `${s}||${c}`;
      const bump = (s: string, c: string, patch: Partial<AggRow>) => {
        const k = key(s, c);
        if (!acc.has(k)) acc.set(k, { utm_source: s, utm_campaign: c, leads: 0, signups: 0, paid: 0, revenue: 0, spend: 0, currency: 'EUR' });
        const row = acc.get(k)!;
        row.leads += patch.leads || 0;
        row.signups += patch.signups || 0;
        row.paid += patch.paid || 0;
        row.revenue += patch.revenue || 0;
      };

      ((leadsRes.data as LeadRow[]) || []).forEach(l => {
        const src = l.metadata?.utm_source || '(direct)';
        const camp = l.metadata?.utm_campaign || '(none)';
        bump(src, camp, { leads: 1 });
      });

      ((subsRes.data as AttribRow[]) || []).forEach(s => {
        const src = s.attribution_utm?.utm_source || '(direct)';
        const camp = s.attribution_utm?.utm_campaign || '(none)';
        const isPaid = !!s.subscription_tier && !['free', 'trial', ''].includes(s.subscription_tier.toLowerCase());
        bump(src, camp, {
          signups: 1,
          paid: isPaid ? 1 : 0,
          revenue: isPaid ? revenueForTier(s.subscription_tier) : 0,
        });
      });

      // Merge in spend
      const spendData = (spendRes.data as SpendRow[]) || [];
      spendData.forEach(sp => {
        const k = key(sp.utm_source, sp.utm_campaign);
        if (!acc.has(k)) acc.set(k, { utm_source: sp.utm_source, utm_campaign: sp.utm_campaign, leads: 0, signups: 0, paid: 0, revenue: 0, spend: 0, currency: sp.currency });
        const row = acc.get(k)!;
        row.spend += Number(sp.spend_amount) || 0;
        row.currency = sp.currency;
      });

      setAgg(Array.from(acc.values()).sort((a, b) => b.revenue - a.revenue || b.leads - a.leads));
      setSpends(spendData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveSpend = async () => {
    if (!form.utm_source || !form.spend_amount) {
      toast({ title: 'Missing fields', description: 'UTM source and spend amount are required.', variant: 'destructive' });
      return;
    }
    const { error } = await (supabase as any).from('ads_spend_manual').upsert({
      utm_source: form.utm_source.trim(),
      utm_campaign: form.utm_campaign.trim() || '(all)',
      spend_amount: parseFloat(form.spend_amount),
      currency: form.currency,
      period_start: form.period_start,
      period_end: form.period_end,
    }, { onConflict: 'utm_source,utm_campaign,period_start,period_end' });
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Spend recorded' });
    setDialogOpen(false);
    setForm({ ...form, spend_amount: '' });
    load();
  };

  const totals = agg.reduce((t, r) => ({
    leads: t.leads + r.leads,
    signups: t.signups + r.signups,
    paid: t.paid + r.paid,
    revenue: t.revenue + r.revenue,
    spend: t.spend + r.spend,
  }), { leads: 0, signups: 0, paid: 0, revenue: 0, spend: 0 });

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const pct = (n: number, d: number) => d > 0 ? `${Math.round((n / d) * 1000) / 10}%` : '-';
  const roas = totals.spend > 0 ? (totals.revenue / totals.spend).toFixed(2) : '-';
  const cac = totals.paid > 0 && totals.spend > 0 ? (totals.spend / totals.paid).toFixed(0) : '-';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Ads ROI Dashboard</h2>
          <p className="text-sm text-muted-foreground">CAC + ROAS per UTM source × campaign. Introdu manual bugetul cheltuit per canal pentru calcul precis.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Spend</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Ad Spend</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>UTM source *</Label>
                <Input value={form.utm_source} onChange={e => setForm({ ...form, utm_source: e.target.value })} placeholder="facebook / google / tiktok" />
              </div>
              <div>
                <Label>UTM campaign</Label>
                <Input value={form.utm_campaign} onChange={e => setForm({ ...form, utm_campaign: e.target.value })} placeholder="challenge_ro_v1" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Amount *</Label>
                  <Input type="number" value={form.spend_amount} onChange={e => setForm({ ...form, spend_amount: e.target.value })} placeholder="500" />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Period start</Label>
                  <Input type="date" value={form.period_start} onChange={e => setForm({ ...form, period_start: e.target.value })} />
                </div>
                <div>
                  <Label>Period end</Label>
                  <Input type="date" value={form.period_end} onChange={e => setForm({ ...form, period_end: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={saveSpend}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Leads', value: totals.leads.toLocaleString() },
          { label: 'Signups', value: totals.signups.toLocaleString(), sub: pct(totals.signups, totals.leads) },
          { label: 'Paid', value: totals.paid.toLocaleString(), sub: pct(totals.paid, totals.signups) },
          { label: 'Revenue', value: `€${totals.revenue.toFixed(0)}` },
          { label: 'Spend / ROAS', value: `€${totals.spend.toFixed(0)}`, sub: `ROAS ${roas} · CAC €${cac}` },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase">{c.label}</div>
              <div className="text-2xl font-bold mt-1">{c.value}</div>
              {c.sub && <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" /> Performance by campaign</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2 pr-3">Campaign</th>
                  <th className="py-2 pr-3 text-right">Leads</th>
                  <th className="py-2 pr-3 text-right">Signups</th>
                  <th className="py-2 pr-3 text-right">Paid</th>
                  <th className="py-2 pr-3 text-right">CR</th>
                  <th className="py-2 pr-3 text-right">Revenue</th>
                  <th className="py-2 pr-3 text-right">Spend</th>
                  <th className="py-2 pr-3 text-right">CAC</th>
                  <th className="py-2 pr-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {agg.map(r => {
                  const rowRoas = r.spend > 0 ? (r.revenue / r.spend).toFixed(2) : '-';
                  const rowCac = r.paid > 0 && r.spend > 0 ? `€${(r.spend / r.paid).toFixed(0)}` : '-';
                  const isProfitable = r.spend > 0 && r.revenue > r.spend;
                  return (
                    <tr key={`${r.utm_source}-${r.utm_campaign}`} className="border-b border-border/50">
                      <td className="py-1.5 pr-3 font-medium">{r.utm_source}</td>
                      <td className="py-1.5 pr-3 text-muted-foreground text-xs">{r.utm_campaign}</td>
                      <td className="py-1.5 pr-3 text-right">{r.leads}</td>
                      <td className="py-1.5 pr-3 text-right">{r.signups}</td>
                      <td className="py-1.5 pr-3 text-right">{r.paid}</td>
                      <td className="py-1.5 pr-3 text-right text-muted-foreground text-xs">{pct(r.paid, r.leads)}</td>
                      <td className="py-1.5 pr-3 text-right">€{r.revenue.toFixed(0)}</td>
                      <td className="py-1.5 pr-3 text-right">€{r.spend.toFixed(0)}</td>
                      <td className="py-1.5 pr-3 text-right">{rowCac}</td>
                      <td className={`py-1.5 pr-3 text-right font-semibold ${isProfitable ? 'text-green-600' : r.spend > 0 ? 'text-red-600' : ''}`}>{rowRoas}</td>
                    </tr>
                  );
                })}
                {agg.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-6 text-muted-foreground">No attribution data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent spend entries */}
      {spends.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recorded spend</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {spends.slice(0, 10).map(s => (
                <div key={s.id} className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground">{s.utm_source} / {s.utm_campaign}</span>
                  <span className="font-mono">{s.currency} {Number(s.spend_amount).toFixed(0)} <span className="text-xs text-muted-foreground ml-2">{s.period_start} → {s.period_end}</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdsRoiDashboard;
