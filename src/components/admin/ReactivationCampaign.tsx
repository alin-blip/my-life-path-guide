import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, UserPlus, RefreshCw } from 'lucide-react';

interface Stats {
  totalChallengeLeads: number;
  enrolledManual: number;
  active: number;
  completed: number;
  sentToday: number;
  sentLast7: number;
  bySteps: Record<number, number>;
}

export const ReactivationCampaign: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [leadsRes, manualRes, logRes] = await Promise.all([
        supabase.from('email_leads').select('email', { count: 'exact', head: true }).like('source', 'challenge%').eq('subscribed', true),
        supabase.from('challenge_reactivation_manual' as any).select('email, completed_at'),
        supabase.from('email_sequence_log').select('day_number, sent_at').eq('sequence_type', 'challenge_reactivation'),
      ]);

      const manual = (manualRes.data as any[]) || [];
      const logs = (logRes.data as any[]) || [];
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      const bySteps: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const l of logs) {
        if (l.day_number && bySteps[l.day_number] !== undefined) bySteps[l.day_number]++;
      }

      setStats({
        totalChallengeLeads: leadsRes.count || 0,
        enrolledManual: manual.length,
        active: manual.filter(m => !m.completed_at).length,
        completed: manual.filter(m => !!m.completed_at).length,
        sentToday: logs.filter((l: any) => new Date(l.sent_at) >= today).length,
        sentLast7: logs.filter((l: any) => new Date(l.sent_at) >= sevenDaysAgo).length,
        bySteps,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const enrollOldLeads = async () => {
    if (!confirm('Enrollează TOȚI leadurile challenge care nu sunt încă în campanie? (Vor primi Email 1 mâine la 09:00)')) return;
    setEnrolling(true);
    try {
      // Fetch all challenge leads not already enrolled
      const { data: leads } = await supabase
        .from('email_leads')
        .select('email, source')
        .like('source', 'challenge%')
        .eq('subscribed', true);

      const { data: existing } = await supabase
        .from('challenge_reactivation_manual' as any)
        .select('email');

      const existingSet = new Set(((existing as any[]) || []).map(e => e.email.toLowerCase()));
      const uniqueNew = new Map<string, { email: string; source: string }>();
      for (const l of (leads || [])) {
        const key = l.email.toLowerCase();
        if (!existingSet.has(key) && !uniqueNew.has(key)) {
          uniqueNew.set(key, { email: l.email, source: l.source });
        }
      }

      if (uniqueNew.size === 0) {
        toast({ title: 'Nimic de adăugat', description: 'Toți leadurile sunt deja înrolați.' });
        setEnrolling(false);
        return;
      }

      const rows = Array.from(uniqueNew.values()).map(v => ({
        email: v.email,
        source: v.source,
        audience: 'no_start',
        enrolled_at: new Date().toISOString(),
      }));

      // Insert in batches of 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase.from('challenge_reactivation_manual' as any).insert(batch);
        if (error) throw error;
      }

      toast({ title: '✅ Înrolați', description: `${rows.length} leads adăugați. Email 1 pleacă mâine 09:00 (sau apasă "Rulează acum").` });
      await load();
    } catch (e: any) {
      toast({ title: 'Eroare', description: e.message, variant: 'destructive' });
    } finally {
      setEnrolling(false);
    }
  };

  const runNow = async () => {
    if (!confirm('Rulează secvența ACUM? Trimite emailurile pentru care e ziua potrivită (1, 3, 6, 10, 14).')) return;
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-challenge-reactivation', { body: { mode: 'manual' } });
      if (error) throw error;
      setLastRun(data);
      toast({ title: '✅ Rulat', description: `${data.emailsSent} emailuri trimise din ${data.candidateCount} candidați.` });
      await load();
    } catch (e: any) {
      toast({ title: 'Eroare', description: e.message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔥 Reactivation Campaign (5 emails)</CardTitle>
          <CardDescription>
            Secvență controlată de 5 emailuri (Ziua 1, 3, 6, 10, 14) pentru leadurile challenge care n-au început sau n-au terminat.
            Cronul auto-recovery vechi (Faza 2) e pauzat; păstrat ca fallback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Leads challenge total" value={stats?.totalChallengeLeads ?? 0} />
            <StatCard label="Înrolați manual" value={stats?.enrolledManual ?? 0} />
            <StatCard label="Activi în secvență" value={stats?.active ?? 0} tone="success" />
            <StatCard label="Terminați (email 5)" value={stats?.completed ?? 0} />
            <StatCard label="Trimise azi" value={stats?.sentToday ?? 0} />
            <StatCard label="Trimise ultimele 7 zile" value={stats?.sentLast7 ?? 0} />
            <StatCard label="Cron următor" value="Zilnic 09:00" tone="muted" />
            <StatCard label="Sursă emailuri" value="Resend direct" tone="muted" />
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground">Email {s}</div>
                <div className="text-lg font-bold">{stats?.bySteps[s] ?? 0}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button onClick={enrollOldLeads} disabled={enrolling}>
              {enrolling ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Enrollează leads vechi
            </Button>
            <Button onClick={runNow} disabled={running} variant="secondary">
              {running ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
              Rulează secvența ACUM
            </Button>
            <Button onClick={load} variant="ghost">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>

          {lastRun && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4 text-sm">
                <div className="font-semibold mb-2">Ultima rulare</div>
                <div>Candidați: {lastRun.candidateCount} • Trimise: {lastRun.emailsSent}</div>
                {lastRun.skipped && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Skipped: {Object.entries(lastRun.skipped).map(([k, v]) => `${k}=${v}`).join(' • ')}
                  </div>
                )}
                {lastRun.errors?.length > 0 && (
                  <div className="mt-2 text-xs text-destructive">Erori: {lastRun.errors.length}</div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">📋 Cum funcționează</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p><strong>Cadență:</strong> Email 1 (ziua 1), Email 2 (ziua 3), Email 3 (ziua 6), Email 4 (ziua 10), Email 5 (ziua 14) — calculat din data de enrollment sau signup.</p>
          <p><strong>Dedup:</strong> Fiecare email trimis o singură dată per user per step (via <code>email_sequence_log</code>).</p>
          <p><strong>Skip logic:</strong> Suppressed emails, useri care au completat Ziua 1, sau care sunt în afara ferestrei de 14 zile.</p>
          <p><strong>CTA:</strong> Leadurile fără cont → <code>/auth?redirect=/challenge/1</code>. Cu cont → direct la <code>/challenge/1</code>.</p>
          <p><strong>Limbă:</strong> Detectată automat din preferințe user (RO/EN).</p>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; tone?: 'success' | 'muted' }> = ({ label, value, tone }) => (
  <div className={`p-3 rounded-lg border ${tone === 'success' ? 'bg-green-500/5 border-green-500/20' : tone === 'muted' ? 'bg-muted/40' : 'bg-card'}`}>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-xl font-bold mt-1">{value}</div>
  </div>
);
