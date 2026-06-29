import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function BeliefAntiArrogance() {
  const { toast } = useToast();
  const [decision, setDecision] = useState("");
  const [why, setWhy] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('beliefs-arrogance-prefill');
      if (raw) {
        const { decision: d } = JSON.parse(raw);
        if (d) setDecision(d);
        sessionStorage.removeItem('beliefs-arrogance-prefill');
      }
    } catch {}
  }, []);

  const submit = async () => {
    if (!decision.trim() || !why.trim()) {
      toast({ title: "Completează decizia și motivul" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("beliefs-coach", {
        body: { mode: "arrogance", payload: { decision, why, context } },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      toast({ title: "Eroare", description: e?.message ?? "—", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const score = result?.score ?? 0;
  const verdictColor = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Helmet><title>Filtru Anti-Aroganță | Cele 5 Credințe</title></Helmet>
      <Link to="/minte/credinte-fundamentale/smerenia" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Înapoi la Smerenia
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: "#3B82F6" }}>Filtru Anti-Aroganță</h1>
        <p className="text-muted-foreground">
          Înainte să iei o decizie importantă, verifică: o iei pentru că vrei să demonstrezi (arrogant)
          sau pentru că vrei să servești și să înveți (smerit)?
        </p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Decizia pe care vrei s-o iei</label>
            <Input value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Ex: Lansez un nou produs / Concediez X / Vorbesc public la Y" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">De ce vrei s-o iei? (fii brutal sincer)</label>
            <Textarea
              rows={3}
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="Scrie tot — nu doar varianta &quot;corectă&quot;"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Context (opțional)</label>
            <Textarea rows={2} value={context} onChange={(e) => setContext(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={loading}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            {loading ? "Verifică…" : "Verifică decizia"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border" style={{ borderColor: verdictColor }}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge style={{ backgroundColor: verdictColor, color: "white" }}>
                {result.verdict === "smerenie" ? "🌱 Smerenie" : result.verdict === "arogana" || result.verdict === "aroganta" ? "⚠️ Aroganță" : "⚖️ Neutru"}
              </Badge>
              <span className="text-3xl font-bold tabular-nums" style={{ color: verdictColor }}>{score}</span>
            </div>
            <Progress value={score} className="h-2" />
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ce a văzut Alin</h3>
              <p className="text-sm">{result.evidence}</p>
            </div>
            {result.reframe && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cum ar suna din smerenie</h3>
                <p className="text-sm italic">{result.reframe}</p>
              </div>
            )}
            {result.question && (
              <div className="p-3 rounded-md bg-muted/40 text-sm">
                <strong>Întrebare:</strong> {result.question}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
