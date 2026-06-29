import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BeliefGratitudeAnchor() {
  const { toast } = useToast();
  const [items, setItems] = useState<string[]>(["", "", ""]);
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [todayId, setTodayId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("belief_gratitude_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(10);
      setHistory(data ?? []);
      const today = (data ?? []).find((r) => r.entry_date === todayISO());
      if (today) {
        setItems((today.items as string[]) ?? ["", "", ""]);
        setReflection(today.ai_reflection ?? "");
        setTodayId(today.id);
      }
    })();
  }, []);

  const submit = async () => {
    if (items.some((x) => !x.trim())) {
      toast({ title: "Scrie toate cele 3", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not auth");

      const { data: aiData, error: aiErr } = await supabase.functions.invoke("beliefs-coach", {
        body: { mode: "gratitude", payload: { items } },
      });
      if (aiErr) throw aiErr;
      const text = aiData?.text ?? "";
      setReflection(text);

      const payload = {
        user_id: user.id,
        entry_date: todayISO(),
        items,
        ai_reflection: text,
      };
      const { data: row, error } = await supabase
        .from("belief_gratitude_logs")
        .upsert(payload, { onConflict: "user_id,entry_date" })
        .select()
        .single();
      if (error) throw error;
      setTodayId(row.id);
      toast({ title: "Recunoștința salvată" });
    } catch (e: any) {
      toast({ title: "Eroare", description: e?.message ?? "—", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Helmet><title>Gratitude Anchor | Cele 5 Credințe</title></Helmet>
      <Link to="/minte/credinte-fundamentale/recunostinta" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Înapoi la Recunoștință
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: "#F59E0B" }}>Gratitude Anchor</h1>
        <p className="text-muted-foreground">
          Înainte să închizi ziua: 3 lucruri concrete pentru care ești recunoscător AZI. Fără clișee. Alin îți dă o reflecție scurtă.
        </p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          {items.map((v, i) => (
            <div key={i} className="space-y-1">
              <label className="text-sm font-medium">{i + 1}.</label>
              <Input
                value={v}
                onChange={(e) => setItems((s) => s.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder={i === 0 ? "Un om concret și pentru ce anume" : i === 1 ? "Un moment specific din ziua de azi" : "Ceva ce de obicei consideri „obișnuit”"}
              />
            </div>
          ))}
          <Button onClick={submit} disabled={loading}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            {loading ? "Salvez și reflectez…" : "Salvează și cere reflecția"}
          </Button>
        </CardContent>
      </Card>

      {reflection && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-sm">Reflecția lui Alin</h3>
            </div>
            <div className="text-sm whitespace-pre-wrap">{reflection}</div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Istoric (ultimele 10 zile)</h2>
          <div className="space-y-2">
            {history.map((row) => (
              <Card key={row.id} className="bg-card/50">
                <CardContent className="p-3 text-xs">
                  <div className="font-medium mb-1">{new Date(row.entry_date).toLocaleDateString("ro-RO")}</div>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    {(row.items as string[]).map((it: string, i: number) => <li key={i}>{it}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
