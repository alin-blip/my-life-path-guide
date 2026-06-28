import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, ListChecks, Grid3x3, RotateCcw, ArrowRight, Sparkles, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { mindQuizService, type MindAxisScoreRow } from "@/services/mindQuizService";

const AXIS_META: Record<
  string,
  { ro: string; en: string; hue: number }
> = {
  cognitiva: { ro: "Cognitivă", en: "Cognitive", hue: 220 },
  emotionala: { ro: "Emoțională", en: "Emotional", hue: 0 },
  afectiva: { ro: "Afectivă", en: "Affective", hue: 340 },
  volitiva: { ro: "Volitivă", en: "Volitional", hue: 270 },
  comportamentala: { ro: "Comportamentală", en: "Behavioral", hue: 30 },
  profesionala: { ro: "Profesională", en: "Professional", hue: 160 },
};

function statusLabel(s: string | null, lang: "ro" | "en") {
  const map: Record<string, { ro: string; en: string }> = {
    healthy: { ro: "Sănătoasă", en: "Healthy" },
    balanced: { ro: "Echilibrată", en: "Balanced" },
    warning: { ro: "Atenție", en: "Watch" },
    "needs-attention": { ro: "Distorsionată", en: "Needs attention" },
  };
  if (!s) return lang === "en" ? "Unassessed" : "Neevaluată";
  return map[s]?.[lang] ?? s;
}

export default function Minte() {
  const { language } = useLanguage();
  const lang: "ro" | "en" = language === "en" ? "en" : "ro";
  const [axes, setAxes] = useState<MindAxisScoreRow[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mindQuizService.getAxisScores(),
      mindQuizService.getAllLatestResponses(),
    ]).then(([rows, resp]) => {
      setAxes(rows);
      setResponses(resp);
      setLoading(false);
    });
  }, []);

  // Compute top PSA reason (priority = quiz in band C; fallback = weakest axis).
  const weakAxis = axes.length
    ? [...axes].sort((a, b) => a.score_healthy - b.score_healthy)[0]
    : null;
  const redQuizSlugs = Object.keys(responses).filter(
    (s) => responses[s]?.band === "C",
  );
  const hasPsaSignal = redQuizSlugs.length > 0 || !!weakAxis;

  const t = (en: string, ro: string) => (lang === "en" ? en : ro);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      <Helmet>
        <title>{t("Mind | CEO Mind OS", "Minte | CEO Mind OS")}</title>
        <meta
          name="description"
          content={t(
            "Brain map, cognitive tests and belief work for entrepreneurs.",
            "Harta creierului, teste cognitive și lucru cu credințele pentru antreprenori.",
          )}
        />
        <link rel="canonical" href="/minte" />
      </Helmet>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <Home className="w-4 h-4 mr-1" /> {t("Dashboard", "Acasă")}
          </Link>
        </Button>
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">{t("Mind", "Minte")}</h1>
          <Badge variant="secondary">NEW</Badge>
        </div>
        <p className="text-muted-foreground">
          {t(
            "Map your mind on 6 axes, identify destructive thinking patterns, and rebuild empowering beliefs.",
            "Cartografiază-ți mintea pe 6 axe, identifică tiparele de gândire distructivă și construiește credințe care te susțin.",
          )}
        </p>
      </header>

      {/* Featured: Mentalitate Stack */}
      <Link to="/minte/stack">
        <Card className="border-violet-500/40 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 hover:border-violet-500/60 transition-colors cursor-pointer">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-violet-500" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{t("Mental Reconstruction Stack", "Reconstrucția Mentală")}</h3>
                <Badge className="text-[10px] bg-violet-500/15 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20">
                  {t("New", "Nou")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Mental Blueprint in 5 phases, 14 questions. ~10-15 min. Repairs your command center and turns it into a concrete action in Domino Door.",
                  "Blueprint Mental în 5 faze, 14 întrebări. ~10-15 min. Repară centrul de comandă și se transformă într-o acțiune concretă în Domino Door.",
                )}
              </p>
              <span className="text-sm text-violet-600 dark:text-violet-400 inline-flex items-center gap-1 pt-1">
                {t("Start the daily stack", "Începe stack-ul zilnic")} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/minte/teste">
          <Card className="h-full hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-5 space-y-2">
              <ListChecks className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">{t("Mind Tests", "Teste de Minte")}</h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  "8 quizzes on destructive thinking patterns. 10 questions each, 3 minutes.",
                  "8 chestionare despre tiparele de gândire distructivă. Câte 10 întrebări, 3 minute.",
                )}
              </p>
              <span className="text-sm text-primary inline-flex items-center gap-1">
                {t("Open tests", "Deschide testele")} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/minte/credinte">
          <Card className="h-full hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-5 space-y-2">
              <Grid3x3 className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">{t("CEO Belief Matrix", "Matricea Credințelor CEO")}</h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  "10 fundamental beliefs of the leader with personal action plan.",
                  "10 credințe fundamentale ale liderului cu plan personal de acțiune.",
                )}
              </p>
              <span className="text-sm text-primary inline-flex items-center gap-1">
                {t("Open matrix", "Deschide matricea")} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/minte/psa">
          <Card className="h-full hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <RotateCcw className="h-6 w-6 text-primary" />
                {hasPsaSignal && (
                  <Badge className="text-[10px] bg-primary/15 text-primary hover:bg-primary/20">
                    {t("Recommended", "Recomandat")}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold">{t("PSA Reconstruction", "PSA Reconstrucție")}</h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Replace toxic CEO beliefs (perfectionism, impostor, scarcity) via Problem → Substitute → Action.",
                  "Substituie credințele toxice de CEO (perfecționism, impostor, scarcitate) prin Problemă → Substituție → Acțiune.",
                )}
              </p>

              {hasPsaSignal && (
                <div className="rounded-md bg-muted/50 border p-2 space-y-1">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {t("Why we recommend this", "De ce ți-am recomandat asta")}
                  </p>
                  {redQuizSlugs.length > 0 ? (
                    <p className="text-xs">
                      {t(
                        `${redQuizSlugs.length} mind test(s) landed in the red band.`,
                        `${redQuizSlugs.length} test(e) de minte au căzut în banda roșie.`,
                      )}
                    </p>
                  ) : weakAxis ? (
                    <p className="text-xs">
                      {t(
                        `Your weakest axis is ${
                          AXIS_META[weakAxis.axis]?.en ?? weakAxis.axis
                        } at ${Math.round(weakAxis.score_healthy)}/100.`,
                        `Cea mai slabă axă e ${
                          AXIS_META[weakAxis.axis]?.ro ?? weakAxis.axis
                        } la ${Math.round(weakAxis.score_healthy)}/100.`,
                      )}
                    </p>
                  ) : null}
                </div>
              )}

              <span className="text-sm text-primary inline-flex items-center gap-1">
                {hasPsaSignal
                  ? t("Open my personalized plan", "Deschide planul meu personalizat")
                  : t("Start reconstruction", "Începe reconstrucția")}{" "}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Brain Map */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("Brain Map — 6 axes", "Brain Map — 6 axe")}</h2>
          {axes.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {axes.length} {t("axes assessed", "axe evaluate")}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("Loading…", "Se încarcă…")}</p>
        ) : axes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {t(
                  "Take your first mind test to start your brain map.",
                  "Fă primul test ca să-ți activezi brain map-ul.",
                )}
              </p>
              <Link to="/minte/teste">
                <Button>{t("Start a test", "Începe un test")}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(AXIS_META).map(([id, meta]) => {
              const row = axes.find((a) => a.axis === id);
              const score = row?.score_healthy ?? null;
              const label = lang === "en" ? meta.en : meta.ro;
              const accent = `hsl(${meta.hue} 70% 50%)`;
              return (
                <Card key={id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm" style={{ color: accent }}>
                        {label}
                      </h3>
                      <span className="text-2xl font-bold tabular-nums">
                        {score != null ? score : "—"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${score ?? 0}%`,
                          background: accent,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{statusLabel(row?.status ?? null, lang)}</span>
                      {row && (
                        <span>
                          {row.contributing_quizzes} {t("quiz(s)", "test(e)")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
