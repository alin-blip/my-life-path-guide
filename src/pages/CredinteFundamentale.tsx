import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Heart, Users, Sparkles, Sun, Mountain } from "lucide-react";
import {
  beliefChaptersService,
  type BeliefChapter,
  type ChapterProgress,
  type BeliefAudit,
} from "@/services/beliefChaptersService";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

const ICONS: Record<string, any> = { Heart, Users, Sparkles, Sun, Mountain };

function chapterCompletion(p?: ChapterProgress): number {
  if (!p) return 0;
  let n = 0;
  if (p.audio_percent >= 80) n += 25;
  if (p.pptx_opened) n += 25;
  if (p.fishbowl_completed) n += 25;
  if (p.matrix_completed) n += 25;
  return n;
}

export default function CredinteFundamentale() {
  const [chapters, setChapters] = useState<BeliefChapter[]>([]);
  const [progress, setProgress] = useState<Record<string, ChapterProgress>>({});
  const [audits, setAudits] = useState<BeliefAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      beliefChaptersService.listChapters(),
      beliefChaptersService.listProgress(),
      beliefChaptersService.listAudits(),
    ])
      .then(([c, p, a]) => {
        setChapters(c);
        setProgress(p);
        setAudits(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const lastAudit = audits[0];
  const auditOverdue = lastAudit?.next_due_at
    ? new Date(lastAudit.next_due_at) < new Date()
    : false;
  const overall = chapters.length
    ? Math.round(
        chapters.reduce((acc, c) => acc + chapterCompletion(progress[c.slug]), 0) /
          chapters.length,
      )
    : 0;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Helmet>
        <title>Cele 5 Credințe ale Liderului | CEO Mind OS</title>
        <meta
          name="description"
          content="Bunătate, Iubire de Oameni, Recunoștință, Iertare, Smerenia — cele 5 credințe fundamentale ale liderului, cu audit executiv la 90 de zile."
        />
        <link rel="canonical" href="/minte/credinte-fundamentale" />
      </Helmet>

      <Link to="/minte" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Înapoi la Minte
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Compass className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Cele 5 Credințe ale Liderului</h1>
          <Badge variant="secondary">NEW</Badge>
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Cele 5 credințe fundamentale care separă liderul autentic de operator. Fiecare capitol conține
          audio, prezentare, întrebări de introspecție și o matrice personală. La final, fă auditul
          executiv ca să primești un Plan Strategic de Acțiune.
        </p>
      </header>

      {/* Progress + Audit CTA */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Progres total</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{overall}%</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <Progress value={overall} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Audio ascultat, prezentare deschisă, Fish Bowl completat, Matrice completată — pe fiecare capitol.
            </p>
          </CardContent>
        </Card>

        <Card className={auditOverdue ? "border-amber-500/40 bg-amber-500/5" : "border-primary/40 bg-primary/5"}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Audit Executiv</div>
              {auditOverdue && <Badge variant="destructive" className="text-[10px]">Restant</Badge>}
            </div>
            {lastAudit ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{Math.round(lastAudit.overall_score ?? 0)}%</span>
                  <span className="text-xs text-muted-foreground">
                    ultimul audit acum {formatDistanceToNow(new Date(lastAudit.created_at), { locale: ro })}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link to={`/minte/credinte-fundamentale/audit/${lastAudit.id}`}>
                    <Button size="sm" variant="secondary">Vezi rezultat</Button>
                  </Link>
                  <Link to="/minte/credinte-fundamentale/audit">
                    <Button size="sm">Refă auditul</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm">Diagnostichează cele 5 credințe în 5 minute. Primești scoruri,
                  etichete (Autentică / Formală / Mecanică / Falsă) și un Plan Strategic.</p>
                <Link to="/minte/credinte-fundamentale/audit">
                  <Button size="sm">Începe auditul <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chapters grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {chapters.map((ch) => {
          const pct = chapterCompletion(progress[ch.slug]);
          const Icon = ICONS[ch.icon ?? "Heart"] ?? Heart;
          return (
            <Link key={ch.slug} to={`/minte/credinte-fundamentale/${ch.slug}`}>
              <Card
                className="h-full hover:border-primary/40 transition-colors cursor-pointer overflow-hidden"
                style={{ borderColor: pct === 100 ? ch.color_hex : undefined }}
              >
                <div className="h-1.5" style={{ backgroundColor: ch.color_hex }} />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${ch.color_hex}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: ch.color_hex }} />
                    </div>
                    {pct === 100 && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{ch.subtitle}</p>
                    <h3 className="font-semibold text-lg">{ch.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ch.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-xs tabular-nums w-10 text-right text-muted-foreground">{pct}%</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {loading && <p className="text-xs text-center text-muted-foreground">Se încarcă…</p>}
    </div>
  );
}
