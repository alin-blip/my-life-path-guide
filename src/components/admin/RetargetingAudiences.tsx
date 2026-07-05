import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Users } from 'lucide-react';

type Stage =
  | 'viewed_landing'
  | 'signed_up_no_start'
  | 'started_no_complete'
  | 'completed_no_purchase'
  | 'abandoned_checkout'
  | 'paid';

interface Row {
  email: string;
  user_id: string;
  stage: Stage;
  last_seen_at: string;
  utm_source: string | null;
  utm_campaign: string | null;
  subscription_tier: string | null;
}

const STAGE_LABEL: Record<Stage, string> = {
  viewed_landing: 'Viewed landing',
  signed_up_no_start: 'Signed up, no Day 1',
  started_no_complete: 'Started, not finished',
  completed_no_purchase: 'Completed, no purchase',
  abandoned_checkout: 'Abandoned checkout',
  paid: 'Paid (lookalike seed)',
};

const STAGE_COLOR: Record<Stage, string> = {
  viewed_landing: 'bg-gray-100 text-gray-700',
  signed_up_no_start: 'bg-blue-100 text-blue-700',
  started_no_complete: 'bg-amber-100 text-amber-800',
  completed_no_purchase: 'bg-purple-100 text-purple-700',
  abandoned_checkout: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
};

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const RetargetingAudiences = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Stage>('abandoned_checkout');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('retargeting_audiences_v')
        .select('*')
        .order('last_seen_at', { ascending: false })
        .limit(5000);
      if (error) {
        toast({ title: 'Failed to load audiences', description: error.message, variant: 'destructive' });
      }
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
  }, [toast]);

  const counts = rows.reduce((acc, r) => {
    acc[r.stage] = (acc[r.stage] || 0) + 1;
    return acc;
  }, {} as Record<Stage, number>);

  const filtered = rows.filter(r => r.stage === selected);

  const exportCsv = async () => {
    const header = ['email', 'email_sha256', 'stage', 'last_seen_at', 'utm_source', 'utm_campaign'];
    const lines = [header.join(',')];
    for (const r of filtered) {
      const hash = await sha256Hex(r.email);
      lines.push([
        r.email,
        hash,
        r.stage,
        r.last_seen_at,
        r.utm_source || '',
        r.utm_campaign || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retargeting-${selected}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${filtered.length} rows`, description: `${STAGE_LABEL[selected]} — ready for Meta Custom Audience upload.` });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const stages: Stage[] = ['viewed_landing', 'signed_up_no_start', 'started_no_complete', 'completed_no_purchase', 'abandoned_checkout', 'paid'];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><Users className="h-5 w-5" /> Retargeting Audiences</h2>
        <p className="text-sm text-muted-foreground">Segmentare pentru Meta Custom Audiences. Emailurile sunt hash-uite SHA-256 la export (format cerut de Meta).</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {stages.map(s => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`text-left p-3 rounded-lg border transition-colors ${selected === s ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
          >
            <div className="text-2xl font-bold">{(counts[s] || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{STAGE_LABEL[s]}</div>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Badge className={STAGE_COLOR[selected]}>{STAGE_LABEL[selected]}</Badge>
            <span className="text-muted-foreground text-sm font-normal">{filtered.length} contacts</span>
          </CardTitle>
          <Button size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border text-muted-foreground text-xs uppercase">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Last seen</th>
                  <th className="py-2 pr-4">UTM source</th>
                  <th className="py-2 pr-4">Campaign</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((r) => (
                  <tr key={r.email} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 font-mono text-xs">{r.email}</td>
                    <td className="py-1.5 pr-4 text-muted-foreground">{r.last_seen_at ? new Date(r.last_seen_at).toLocaleDateString() : '-'}</td>
                    <td className="py-1.5 pr-4">{r.utm_source || <span className="text-muted-foreground">(direct)</span>}</td>
                    <td className="py-1.5 pr-4">{r.utm_campaign || '-'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">No contacts in this stage yet.</td></tr>
                )}
              </tbody>
            </table>
            {filtered.length > 50 && (
              <div className="text-xs text-muted-foreground text-center py-2">Showing 50 of {filtered.length}. Export CSV for full list.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetargetingAudiences;
