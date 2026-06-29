import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

function detectBut(text: string): { hasButWord: boolean; matches: string[] } {
  const re = /\b(dar|însă|totuși|deși|cu toate astea|in schimb|în schimb|but|however|though)\b/gi;
  const matches = text.match(re) ?? [];
  return { hasButWord: matches.length > 0, matches };
}

export default function BeliefNoButValidator() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const detection = detectBut(text);

  const submit = async () => {
    if (!text.trim() || !detection.hasButWord) {
      toast({ title: "Nu detectez „DAR” în text", description: "Dacă deja e curat, nu ai nevoie de reformulare." });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("beliefs-coach", {
        body: { mode: "apreciere", payload: { text, target } },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      toast({ title: "Eroare", description: e?.message ?? "—", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Helmet><title>Apreciere fără DAR | Cele 5 Credințe</title></Helmet>
      <Link to="/minte/credinte-fundamentale/iubire-de-oameni" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Înapoi la Iubire de Oameni
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: "#EF4444" }}>Apreciere fără „DAR”</h1>
        <p className="text-muted-foreground">
          Aprecierile cu DAR sunt manipulare emoțională ascunsă. Lipește mesajul tău, iar Alin îți oferă variante PURE — apoi poți decide separat ce critică merită spusă.
        </p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Către cine? (partener, copil, coleg)</label>
            <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Ex: soția mea" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Mesajul tău original</label>
            <Textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Ex: „Apreciez că ai pregătit cina, dar carnea era prea fiartă."'
            />
            {text && (
              <div className="text-xs flex items-center gap-2">
                {detection.hasButWord ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-amber-600">
                      Detectat: {detection.matches.map((m, i) => (
                        <Badge key={i} variant="outline" className="ml-1 text-[10px]">{m}</Badge>
                      ))}
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-600">✓ Mesajul tău e deja curat</span>
                )}
              </div>
            )}
          </div>
          <Button onClick={submit} disabled={loading || !text.trim() || !detection.hasButWord}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            {loading ? "Reformulez…" : "Cere reformulare pură"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="p-4 space-y-3">
            {result.diagnosis && (
              <div>
                <h3 className="font-semibold text-sm mb-1">Ce făcea DAR în mesajul tău</h3>
                <p className="text-sm text-muted-foreground">{result.diagnosis}</p>
              </div>
            )}
            {result.reformulations && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Variante PURE</h3>
                <ul className="space-y-2">
                  {result.reformulations.map((r: string, i: number) => (
                    <li key={i} className="p-3 rounded-md bg-card border text-sm">{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.advice && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                💡 {result.advice}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
