import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Moon, Activity, Apple, MonitorOff, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function BeliefSelfCare() {
  const { toast } = useToast();
  const [today, setToday] = useState<any>({
    sleep_hours: 7,
    sleep_ok: false,
    movement_done: false,
    food_clean: false,
    tech_break_done: false,
    notes: "",
  });
  const [last7, setLast7] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const { data } = await supabase
        .from("belief_self_care_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("log_date", since.toISOString().slice(0, 10))
        .order("log_date", { ascending: false });
      setLast7(data ?? []);
      const t = (data ?? []).find((r) => r.log_date === todayISO());
      if (t) setToday(t);
    })();
  }, []);

  const score = [today.sleep_ok, today.movement_done, today.food_clean, today.tech_break_done].filter(Boolean).length;
  const scorePct = (score / 4) * 100;

  const save = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not auth");
      const { error } = await supabase
        .from("belief_self_care_logs")
        .upsert({
          user_id: user.id,
          log_date: todayISO(),
          sleep_hours: today.sleep_hours,
          sleep_ok: today.sleep_ok,
          movement_done: today.movement_done,
          food_clean: today.food_clean,
          tech_break_done: today.tech_break_done,
          notes: today.notes,
        }, { onConflict: "user_id,log_date" });
      if (error) throw error;
      toast({ title: "Salvat" });
    } catch (e: any) {
      toast({ title: "Eroare", description: e?.message ?? "—", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const weekAvg = last7.length ? Math.round((last7.reduce((s, r) => s + (r.score ?? 0), 0) / last7.length) * 25) : 0;

  const toggleBtn = (key: string, label: string, Icon: any) => {
    const active = today[key];
    return (
      <button
        onClick={() => setToday((t: any) => ({ ...t, [key]: !t[key] }))}
        className={`p-4 rounded-lg border-2 transition-all text-left ${active ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-card hover:border-muted-foreground/40"}`}
      >
        <Icon className={`h-6 w-6 mb-2 ${active ? "text-emerald-600" : "text-muted-foreground"}`} />
        <div className="font-medium text-sm">{label}</div>
      </button>
    );
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Helmet><title>Grija de Sine | Cele 5 Credințe</title></Helmet>
      <Link to="/minte/credinte-fundamentale" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Înapoi la Cele 5 Credințe
      </Link>

      <header className="space-y-2">
        <Badge style={{ backgroundColor: "#10B981", color: "white" }}>Extensie Warrior Routine</Badge>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-7 w-7" style={{ color: "#10B981" }} /> Grija de Sine
        </h1>
        <p className="text-muted-foreground">
          Liderul care nu are grijă de sine își vinde echipa și familia în rate. 4 indicatori zilnici simpli.
        </p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-muted-foreground">Scor azi</div>
              <div className="text-4xl font-bold">{score}/4</div>
            </div>
            <div className="w-40">
              <Progress value={scorePct} className="h-2" />
              <div className="text-xs text-muted-foreground text-right mt-1">{Math.round(scorePct)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {toggleBtn("sleep_ok", "Somn ≥ 7h", Moon)}
            {toggleBtn("movement_done", "Mișcare 20+ min", Activity)}
            {toggleBtn("food_clean", "Hrană curată", Apple)}
            {toggleBtn("tech_break_done", "Pauză tehnologică", MonitorOff)}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Ore somn (efectiv)</label>
            <Input
              type="number"
              step="0.5"
              value={today.sleep_hours ?? ""}
              onChange={(e) => setToday((t: any) => ({ ...t, sleep_hours: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Note (opțional)</label>
            <Textarea
              rows={2}
              value={today.notes ?? ""}
              onChange={(e) => setToday((t: any) => ({ ...t, notes: e.target.value }))}
              placeholder="Ce te-a sabotat azi? Ce te-a susținut?"
            />
          </div>
          <Button onClick={save} disabled={loading}>
            <Save className="h-3.5 w-3.5 mr-1" />
            {loading ? "Salvez…" : "Salvează ziua"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Ultimele 7 zile</h2>
            <span className="text-xs text-muted-foreground">media: <strong>{weekAvg}%</strong></span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {last7.length === 0 && <span className="text-xs text-muted-foreground col-span-7">Nicio zi înregistrată încă.</span>}
            {last7.map((r) => (
              <div key={r.id} className="text-center">
                <div className="text-[10px] text-muted-foreground">{new Date(r.log_date).toLocaleDateString("ro-RO", { weekday: "short" }).slice(0, 2)}</div>
                <div className={`mt-1 h-10 rounded flex items-center justify-center text-xs font-bold ${
                  r.score >= 4 ? "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300" :
                  r.score >= 3 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" :
                  r.score >= 2 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" :
                  "bg-red-500/15 text-red-700 dark:text-red-300"
                }`}>{r.score}/4</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
