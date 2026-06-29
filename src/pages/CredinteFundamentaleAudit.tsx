import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { beliefChaptersService } from "@/services/beliefChaptersService";
import { AUDIT_QUESTIONS, LIKERT_LABELS, CHAPTER_META, classifyScore, type ChapterSlug } from "@/data/credinte-fundamentale";

export default function CredinteFundamentaleAudit() {
  const { toast } = useToast();
  const nav = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const answered = Object.keys(answers).length;
  const total = AUDIT_QUESTIONS.length;
  const pct = Math.round((answered / total) * 100);

  const submit = async () => {
    if (answered < total) {
      toast({ title: "Mai sunt întrebări", description: `${total - answered} rămase.` });
      return;
    }
    setSubmitting(true);
    try {
      // Compute scores per chapter
      const perChapter: Record<string, number[]> = {};
      for (const q of AUDIT_QUESTIONS) {
        perChapter[q.chapter] = perChapter[q.chapter] ?? [];
        perChapter[q.chapter].push(answers[q.id]);
      }
      const scores: Record<string, number> = {};
      for (const [k, arr] of Object.entries(perChapter)) {
        // arr values 1-5 -> map (v-1)/4 * 100
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        scores[k] = Math.round(((avg - 1) / 4) * 100);
      }
      const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length);
      const labels = Object.entries(scores).map(([k, v]) => `${CHAPTER_META[k as ChapterSlug].title}: ${classifyScore(v).label}`);

      // Call AI for strategic plan
      const { data, error } = await supabase.functions.invoke("beliefs-executive-audit", {
        body: { scores, overall, responses: answers },
      });
      if (error) throw error;

      const id = await beliefChaptersService.createAudit({
        responses: answers,
        scores,
        diagnosis_labels: labels,
        overall_score: overall,
        strategic_plan: data?.strategic_plan ?? {},
        ai_summary: data?.summary ?? "",
      });

      toast({ title: "Audit finalizat", description: "Iată Planul tău Strategic." });
      nav(`/minte/credinte-fundamentale/audit/${id}`);
    } catch (e: any) {
      toast({ title: "Eroare", description: e?.message ?? "Reîncearcă", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Helmet><title>Audit Executiv | Cele 5 Credințe</title></Helmet>

      <Link to="/minte/credinte-fundamentale" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Înapoi
      </Link>

      <header className="space-y-2">
        <Badge>Audit Executiv — 90 zile</Badge>
        <h1 className="text-3xl font-bold">Cât de autentice sunt credințele tale?</h1>
        <p className="text-muted-foreground">
          25 întrebări, ~5 minute. Răspunde sincer — nu cum ar trebui să fii, ci cum ești ACUM. La final
          primești scoruri pe fiecare credință și un Plan Strategic de Acțiune.
        </p>
      </header>

      <Card className="sticky top-2 z-10">
        <CardContent className="p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progres</span>
            <span className="font-semibold">{answered} / {total}</span>
          </div>
          <Progress value={pct} className="h-2" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {AUDIT_QUESTIONS.map((q, i) => {
          const meta = CHAPTER_META[q.chapter];
          return (
            <Card key={q.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" style={{ borderColor: meta.color, color: meta.color }}>
                    {meta.title}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{i + 1} / {total}</span>
                </div>
                <p className="font-medium">{q.text}</p>
                <div className="grid grid-cols-5 gap-1">
                  {LIKERT_LABELS.map((label, idx) => {
                    const value = idx + 1;
                    const selected = answers[q.id] === value;
                    return (
                      <button
                        key={value}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: value }))}
                        className={`p-2 rounded-md text-xs border transition-colors ${
                          selected ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-border"
                        }`}
                      >
                        <div className="font-semibold">{value}</div>
                        <div className="text-[10px] opacity-80">{label}</div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm">
            <strong>{answered}</strong> / {total} răspunsuri date
          </div>
          <Button onClick={submit} disabled={submitting || answered < total} size="lg">
            <Sparkles className="h-4 w-4 mr-1" />
            {submitting ? "AI generează planul…" : "Finalizează auditul"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
