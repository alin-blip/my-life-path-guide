import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, ListChecks, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

function currentWeekKey(): string {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - yearStart.getTime()) / 86400000);
  const week = Math.ceil((days + yearStart.getDay() + 1) / 7);
  return `door-week-${now.getFullYear()}-${String(week).padStart(2, "0")}`;
}

export default function BeliefForgiveness() {
  const { toast } = useToast();
  const [target, setTarget] = useState("");
  const [what, setWhat] = useState("");
  const [cost, setCost] = useState("");
  const [release, setRelease] = useState("");
  const [task, setTask] = useState("");
  const [logId, setLogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("belief_forgiveness_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setHistory(data ?? []);
    })();
  }, []);

  const submit = async () => {
    if (!target.trim() || !what.trim() || !release.trim()) {
      toast({ title: "Completează țintă, ce s-a întâmplat, și declarația de eliberare" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not auth");

      const { data: aiData, error: aiErr } = await supabase.functions.invoke("beliefs-coach", {
        body: { mode: "forgiveness", payload: { target_name: target, what_happened: what, current_cost: cost, release_declaration: release } },
      });
      if (aiErr) throw aiErr;
      const t = aiData?.text ?? "";
      setTask(t);

      const { data: row, error } = await supabase
        .from("belief_forgiveness_logs")
        .insert({
          user_id: user.id,
          target_name: target,
          what_happened: what,
          current_cost: cost,
          release_declaration: release,
          ai_weekly_task: t,
        })
        .select()
        .single();
      if (error) throw error;
      setLogId(row.id);
      toast({ title: "Iertarea înregistrată", description: "Alin ți-a dat o sarcină." });
    } catch (e: any) {
      toast({ title: "Eroare", description: e?.message ?? "—", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const exportToHit = async () => {
    if (!task || !logId) return;
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not auth");
      const { error } = await supabase.from("hot_list_items").insert({
        user_id: user.id,
        week_key: currentWeekKey(),
        list_type: "hit",
        item_id: crypto.randomUUID(),
        title: `[Iertare → ${target}] ${task}`,
      });
      if (error) throw error;
      await supabase.from("belief_forgiveness_logs").update({ exported_to_hit: true }).eq("id", logId);
      toast({ title: "Adăugat în HIT List" });
    } catch (e: any) {
      toast({ title: "Eroare", description: e?.message ?? "—", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Helmet><title>Forgiveness Protocol | Cele 5 Credințe</title></Helmet>
      <Link to="/minte/credinte-fundamentale/iertare" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Înapoi la Iertare
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: "#8B5CF6" }}>Forgiveness Protocol</h1>
        <p className="text-muted-foreground">
          Numește, recunoaște costul, eliberează. Alin îți dă o sarcină comportamentală pentru săptămâna asta —
          pentru că iertarea declarată dar netrăită e doar suprimare.
        </p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Pe cine iert?</label>
            <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Nume (persoană, eveniment, instituție, sau „pe mine însumi”)" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Ce s-a întâmplat?</label>
            <Textarea rows={3} value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Faptele, fără justificări — ce s-a întâmplat concret." />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Cât mă costă acum că port asta cu mine?</label>
            <Textarea rows={2} value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Energetic, relațional, financiar — ce-ți răpește această povară?" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Declarația mea de eliberare</label>
            <Textarea rows={3} value={release} onChange={(e) => setRelease(e.target.value)} placeholder='Scrie cu vocea ta: „Aleg să eliberez…", „Renunț la dreptul de a…", etc.' />
          </div>
          <Button onClick={submit} disabled={loading}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            {loading ? "Generez sarcina…" : "Eliberez și cer sarcina"}
          </Button>
        </CardContent>
      </Card>

      {task && (
        <Card className="border-violet-500/40 bg-violet-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <h3 className="font-semibold">Sarcina ta de iertare săptămâna asta</h3>
            </div>
            <p className="text-base">{task}</p>
            <Button size="sm" onClick={exportToHit} disabled={exporting}>
              {exporting ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <ListChecks className="h-4 w-4 mr-1" />}
              Trimite în HIT List
            </Button>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Iertări trecute</h2>
          {history.map((h) => (
            <Card key={h.id} className="bg-card/50">
              <CardContent className="p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">{h.target_name}</span>
                  <span className="text-muted-foreground">{new Date(h.created_at).toLocaleDateString("ro-RO")}</span>
                </div>
                {h.ai_weekly_task && <p className="text-muted-foreground">→ {h.ai_weekly_task}</p>}
                {h.exported_to_hit && <Badge variant="outline" className="text-[10px]">În HIT</Badge>}
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
