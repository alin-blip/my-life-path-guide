import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw } from "lucide-react";
import { Helmet } from "react-helmet-async";

type LogRow = {
  id: string;
  message_id: string | null;
  template_name: string | null;
  recipient_email: string | null;
  status: string;
  error_message: string | null;
  metadata: any;
  created_at: string;
};

const RANGES = { "24h": 1, "7d": 7, "30d": 30 } as const;
type RangeKey = keyof typeof RANGES;

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  dlq: "bg-red-500/15 text-red-500 border-red-500/30",
  failed: "bg-red-500/15 text-red-500 border-red-500/30",
  suppressed: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  bounced: "bg-red-500/15 text-red-500 border-red-500/30",
  complained: "bg-red-500/15 text-red-500 border-red-500/30",
};

function dedup(rows: LogRow[]): LogRow[] {
  const map = new Map<string, LogRow>();
  for (const r of rows) {
    const key = r.message_id ?? r.id;
    const prev = map.get(key);
    if (!prev || new Date(r.created_at) > new Date(prev.created_at)) map.set(key, r);
  }
  return Array.from(map.values()).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export default function EmailMonitoring() {
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("7d");
  const [template, setTemplate] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [state, setState] = useState<any>(null);
  const [triggering, setTriggering] = useState(false);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - RANGES[range] * 24 * 3600 * 1000).toISOString();
    const { data } = await supabase
      .from("email_send_log")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);
    setRows((data as LogRow[]) ?? []);
    const { data: st } = await supabase.from("email_send_state").select("*").maybeSingle();
    setState(st);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, range]);

  const latest = useMemo(() => dedup(rows), [rows]);
  const templates = useMemo(
    () => Array.from(new Set(latest.map((r) => r.template_name).filter(Boolean))).sort() as string[],
    [latest]
  );
  const filtered = useMemo(
    () =>
      latest.filter(
        (r) =>
          (template === "all" || r.template_name === template) &&
          (status === "all" || r.status === status)
      ),
    [latest, template, status]
  );

  const stats = useMemo(() => {
    const s = { total: filtered.length, sent: 0, failed: 0, suppressed: 0, pending: 0 };
    for (const r of filtered) {
      if (r.status === "sent") s.sent++;
      else if (r.status === "dlq" || r.status === "failed" || r.status === "bounced") s.failed++;
      else if (r.status === "suppressed" || r.status === "complained") s.suppressed++;
      else if (r.status === "pending") s.pending++;
    }
    return s;
  }, [filtered]);

  const triggerLifecycle = async () => {
    setTriggering(true);
    try {
      await supabase.functions.invoke("send-lifecycle-emails");
      await load();
    } finally {
      setTriggering(false);
    }
  };

  if (adminLoading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Layout>
    );
  }
  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-8 text-center text-muted-foreground">Acces restricționat — doar administratori.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Email Monitoring · CEO Mind OS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Email Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Ultimele trimiteri (dedup pe message_id) și starea cozii de retry.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={triggerLifecycle} disabled={triggering}>
              {triggering ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Rulează lifecycle
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, tone: "" },
            { label: "Sent", value: stats.sent, tone: "text-emerald-500" },
            { label: "Failed", value: stats.failed, tone: "text-red-500" },
            { label: "Suppressed", value: stats.suppressed, tone: "text-yellow-500" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</div>
                <div className={`text-2xl font-bold mt-1 ${s.tone}`}>{loading ? "—" : s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {state ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Coadă transactional_emails — retry state</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground">batch_size:</span> {state.batch_size}</div>
              <div><span className="text-muted-foreground">send_delay_ms:</span> {state.send_delay_ms}</div>
              <div><span className="text-muted-foreground">retry_after:</span> {state.retry_after_until ? new Date(state.retry_after_until).toLocaleString() : "—"}</div>
              <div><span className="text-muted-foreground">updated:</span> {state.updated_at ? new Date(state.updated_at).toLocaleString() : "—"}</div>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Template" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              {templates.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="dlq">Failed (DLQ)</SelectItem>
              <SelectItem value="suppressed">Suppressed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Log ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-4 space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 200).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.template_name ?? "—"}</TableCell>
                      <TableCell className="text-xs">{r.recipient_email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_STYLES[r.status] ?? ""}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-red-500 max-w-xs truncate" title={r.error_message ?? ""}>{r.error_message ?? ""}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Niciun email în intervalul selectat.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
