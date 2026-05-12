import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Mail, ShoppingCart, Trophy, Eye, MousePointerClick, RefreshCw, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Lead {
  id: string; email: string; name?: string; language: string;
  quiz_at: string;
  book_purchased_at?: string | null;
  upsell_purchased_at?: string | null;
  challenge_subscribed: boolean;
  challenge_tier?: string | null;
  recoveries_sent: number; upsells_sent: number;
  opens: number; clicks: number;
  last_sequence?: any;
}

interface Summary {
  totalLeads: number; totalBookBuyers: number; totalChallengeSubs: number;
  sent: number; opened: number; clicked: number;
  recovery_sent: number; upsell_sent: number;
}

const fmt = (d?: string | null) => d ? format(new Date(d), 'dd MMM HH:mm') : '—';

export const FunnelLeadsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [history, setHistory] = useState<{ sequence: any[]; sends: any[] } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/funnel-leads-dashboard`;
      const opts = { headers: { Authorization: `Bearer ${session?.access_token}` } };
      const [l, s] = await Promise.all([
        fetch(`${url}?action=leads${search ? `&search=${encodeURIComponent(search)}` : ''}`, opts).then(r => r.json()),
        fetch(`${url}?action=summary`, opts).then(r => r.json()),
      ]);
      setLeads(l.leads || []);
      setSummary(s);
    } catch (e) {
      console.error('load failed', e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openHistory = async (lead: Lead) => {
    setSelected(lead);
    setHistory(null);
    const session = (await supabase.auth.getSession()).data.session;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/funnel-leads-dashboard?action=history&email=${encodeURIComponent(lead.email)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${session?.access_token}` } });
    setHistory(await r.json());
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => { setSelected(null); setHistory(null); }}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Înapoi la lista de leads
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{selected.email} {selected.name && <span className="text-muted-foreground text-sm">— {selected.name}</span>}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><div className="text-muted-foreground">Quiz</div><div>{fmt(selected.quiz_at)}</div></div>
            <div><div className="text-muted-foreground">Carte</div><div>{selected.book_purchased_at ? '✅ ' + fmt(selected.book_purchased_at) : '—'}</div></div>
            <div><div className="text-muted-foreground">Challenge</div><div>{selected.challenge_subscribed ? `✅ ${selected.challenge_tier || ''}` : '—'}</div></div>
            <div><div className="text-muted-foreground">Limba</div><div>{selected.language.toUpperCase()}</div></div>
          </CardContent>
        </Card>

        {!history ? <Loader2 className="animate-spin" /> : (
          <>
            <Card>
              <CardHeader><CardTitle className="text-base">Sequence emails (recovery + upsell)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Tip</TableHead><TableHead>Zi</TableHead><TableHead>Trimis</TableHead><TableHead>Deschis</TableHead><TableHead>Click</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {history.sequence.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.sequence_type}</TableCell>
                        <TableCell>{s.day_number}</TableCell>
                        <TableCell>{fmt(s.sent_at)}</TableCell>
                        <TableCell>{s.opened_at ? <Badge variant="default">✓ {fmt(s.opened_at)}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell>{s.clicked_at ? <Badge>✓ {fmt(s.clicked_at)}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                      </TableRow>
                    ))}
                    {history.sequence.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Niciun email de secvență trimis</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Toate emailurile (send log)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Template</TableHead><TableHead>Status</TableHead><TableHead>Trimis</TableHead><TableHead>Eroare</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {history.sends.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.template_name}</TableCell>
                        <TableCell><Badge variant={s.status === 'sent' ? 'default' : s.status === 'dlq' || s.status === 'failed' ? 'destructive' : 'secondary'}>{s.status}</Badge></TableCell>
                        <TableCell>{fmt(s.created_at)}</TableCell>
                        <TableCell className="text-xs text-destructive">{s.error_message || ''}</TableCell>
                      </TableRow>
                    ))}
                    {history.sends.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Niciun email logat</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Total leads</div><div className="text-2xl font-bold">{summary.totalLeads}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><ShoppingCart className="h-3 w-3"/>Cărți cumpărate</div><div className="text-2xl font-bold">{summary.totalBookBuyers}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3"/>Challenge active</div><div className="text-2xl font-bold">{summary.totalChallengeSubs}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3"/>Emails secvență</div><div className="text-2xl font-bold">{summary.sent}</div><div className="text-xs text-muted-foreground"><Eye className="h-3 w-3 inline"/> {summary.opened} · <MousePointerClick className="h-3 w-3 inline"/> {summary.clicked}</div></CardContent></Card>
        </div>
      )}

      <div className="flex gap-2">
        <Input placeholder="Caută email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
        <Button onClick={load} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Lang</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Recovery</TableHead>
                <TableHead>Carte</TableHead>
                <TableHead>Upsell</TableHead>
                <TableHead>Challenge</TableHead>
                <TableHead>Open / Click</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map(l => (
                <TableRow key={l.id} className="cursor-pointer" onClick={() => openHistory(l)}>
                  <TableCell className="font-medium">{l.email}{l.name && <div className="text-xs text-muted-foreground">{l.name}</div>}</TableCell>
                  <TableCell><Badge variant="outline">{l.language.toUpperCase()}</Badge></TableCell>
                  <TableCell className="text-xs">{fmt(l.quiz_at)}</TableCell>
                  <TableCell><Badge variant={l.recoveries_sent > 0 ? 'secondary' : 'outline'}>{l.recoveries_sent}/3</Badge></TableCell>
                  <TableCell>{l.book_purchased_at ? <Badge variant="default">✓</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell><Badge variant={l.upsells_sent > 0 ? 'secondary' : 'outline'}>{l.upsells_sent}/2</Badge></TableCell>
                  <TableCell>{l.challenge_subscribed ? <Badge variant="default">✓ {l.challenge_tier}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-xs"><Eye className="h-3 w-3 inline"/> {l.opens} · <MousePointerClick className="h-3 w-3 inline"/> {l.clicks}</TableCell>
                </TableRow>
              ))}
              {!loading && leads.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Niciun lead găsit</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
