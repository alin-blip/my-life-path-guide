import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ListChecks, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { beliefChaptersService, type BeliefAudit } from "@/services/beliefChaptersService";
import { CHAPTER_META, classifyScore, type ChapterSlug } from "@/data/credinte-fundamentale";

export default function CredinteFundamentaleAuditResult() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [audit, setAudit] = useState<BeliefAudit | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    beliefChaptersService.getAudit(id).then(setAudit);
  }, [id]);

  if (!audit) return <div className="container max-w-3xl mx-auto p-6 text-sm text-muted-foreground">Se încarcă…</div>;

  const exportTasks = async () => {
    setExporting(true);
    try {
      const { error } = await supabase.functions.invoke("beliefs-audit-export-tasks", {
        body: { audit_id: audit.id },
      });
      if (error) throw error;
      toast({ title: "Sarcini adăugate în HIT List", description: "Verifică Domino Door." });
    } catch (e: any) {
      toast({ title: "Eroare", description: e?.message ?? "Reîncearcă", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const tasks: any[] = audit.strategic_plan?.tasks ?? [];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Helmet><title>Rezultat Audit Executiv | Cele 5 Credințe</title></Helmet>

      <Link to="/minte/credinte-fundamentale" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Înapoi
      </Link>

      <header className="space-y-2">
        <Badge>Audit Executiv</Badge>
        <h1 className="text-3xl font-bold">Diagnostic Credințe</h1>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold">{Math.round(audit.overall_score ?? 0)}</span>
          <span className="text-muted-foreground">/ 100 — scor general</span>
        </div>
      </header>

      {audit.ai_summary && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm whitespace-pre-wrap">{audit.ai_summary}</p>
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Scoruri pe credință</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(audit.scores).map(([slug, score]) => {
            const meta = CHAPTER_META[slug as ChapterSlug];
            const cls = classifyScore(score as number);
            if (!meta) return null;
            return (
              <Card key={slug}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold" style={{ color: meta.color }}>{meta.title}</h3>
                      <Badge variant="outline" style={{ borderColor: cls.color, color: cls.color }}>
                        {cls.label}
                      </Badge>
                    </div>
                    <span className="text-3xl font-bold tabular-nums">{score as number}</span>
                  </div>
                  <Progress value={score as number} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">{cls.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold">Plan Strategic de Acțiune</h2>
          {tasks.length > 0 && (
            <Button size="sm" onClick={exportTasks} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ListChecks className="h-4 w-4 mr-1" />}
              Trimite în HIT List
            </Button>
          )}
        </div>
        {tasks.length === 0 ? (
          <Card className="border-dashed"><CardContent className="p-4 text-sm text-muted-foreground">Plan în curs de generare…</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{t.chapter ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">{t.priority ?? "Mediu"}</span>
                  </div>
                  <h4 className="font-medium">{t.title}</h4>
                  {t.why && <p className="text-xs text-muted-foreground">De ce: {t.why}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Următorul audit: {audit.next_due_at ? new Date(audit.next_due_at).toLocaleDateString("ro-RO") : "—"}
        </CardContent>
      </Card>
    </div>
  );
}
