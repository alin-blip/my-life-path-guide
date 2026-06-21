import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Save,
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  PSA_PATTERNS,
  PSA_FIELD_KEYS,
  type PsaPattern,
} from "@/data/mind-psa/toxic-patterns";
import { psaService, psaProgress, type PsaData, type PsaRow } from "@/services/psaService";
import {
  mindQuizService,
  type MindAxisScoreRow,
  type MindQuizResponseRow,
} from "@/services/mindQuizService";
import type { MindAxisId } from "@/data/mind-quizzes/types";

const AXIS_LABEL: Record<string, { ro: string; en: string }> = {
  cognitiva: { ro: "Cognitivă", en: "Cognitive" },
  emotionala: { ro: "Emoțională", en: "Emotional" },
  afectiva: { ro: "Afectivă", en: "Affective" },
  volitiva: { ro: "Volitivă", en: "Volitional" },
  comportamentala: { ro: "Comportamentală", en: "Behavioral" },
  profesionala: { ro: "Profesională", en: "Professional" },
};

export default function MintePSA() {
  const { language } = useLanguage();
  const lang: "ro" | "en" = language === "en" ? "en" : "ro";
  const { toast } = useToast();
  const t = (en: string, ro: string) => (lang === "en" ? en : ro);

  const [rows, setRows] = useState<Record<string, PsaRow>>({});
  const [drafts, setDrafts] = useState<Record<string, PsaData>>({});
  const [axisScores, setAxisScores] = useState<MindAxisScoreRow[]>([]);
  const [responses, setResponses] = useState<Record<string, MindQuizResponseRow>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    Promise.all([
      psaService.getAll(),
      mindQuizService.getAxisScores(),
      mindQuizService.getAllLatestResponses(),
    ])
      .then(([r, a, q]) => {
        setRows(r);
        setAxisScores(a);
        setResponses(q);
        const seeded: Record<string, PsaData> = {};
        for (const k of Object.keys(r)) seeded[k] = { ...r[k].data };
        setDrafts(seeded);
      })
      .finally(() => setLoading(false));
    return () => {
      Object.values(saveTimers.current).forEach(clearTimeout);
    };
  }, []);

  /** Lowest 2 brain axes — used to compute recommended patterns. */
  const weakAxes = useMemo<MindAxisId[]>(() => {
    if (axisScores.length === 0) return [];
    const sorted = [...axisScores].sort((a, b) => a.score_healthy - b.score_healthy);
    return sorted.slice(0, 2).map((r) => r.axis as MindAxisId);
  }, [axisScores]);

  /** Quiz slugs scored in band C (worst) — direct toxic-pattern signal. */
  const lowQuizSlugs = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    for (const slug of Object.keys(responses)) {
      if (responses[slug]?.band === "C") set.add(slug);
    }
    return set;
  }, [responses]);

  function recommendationReason(p: PsaPattern): { reason: string; weight: number } | null {
    const axisHit = p.axes.find((a) => weakAxes.includes(a));
    const quizHit = p.relatedQuizSlugs.find((s) => lowQuizSlugs.has(s));
    if (quizHit) {
      return {
        reason: t(
          `Triggered by a low score on the "${quizHit}" test`,
          `Declanșat de scor scăzut la testul «${quizHit}»`,
        ),
        weight: 2,
      };
    }
    if (axisHit) {
      return {
        reason: t(
          `Weak axis: ${AXIS_LABEL[axisHit]?.en ?? axisHit}`,
          `Axă slabă: ${AXIS_LABEL[axisHit]?.ro ?? axisHit}`,
        ),
        weight: 1,
      };
    }
    return null;
  }

  /** Sorted: recommended (by weight) first, then started, then the rest. */
  const orderedPatterns = useMemo(() => {
    return [...PSA_PATTERNS].sort((a, b) => {
      const ra = recommendationReason(a)?.weight ?? 0;
      const rb = recommendationReason(b)?.weight ?? 0;
      if (ra !== rb) return rb - ra;
      const pa = psaProgress(drafts[a.key], PSA_FIELD_KEYS);
      const pb = psaProgress(drafts[b.key], PSA_FIELD_KEYS);
      return pb - pa;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts, weakAxes, lowQuizSlugs]);

  function updateField(patternKey: string, fieldKey: string, value: string) {
    setDrafts((prev) => {
      const next: Record<string, PsaData> = { ...prev };
      next[patternKey] = { ...(next[patternKey] ?? {}), [fieldKey]: value };
      return next;
    });

    if (saveTimers.current[patternKey]) clearTimeout(saveTimers.current[patternKey]);
    saveTimers.current[patternKey] = setTimeout(() => {
      void persist(patternKey);
    }, 800);
  }

  async function persist(patternKey: string) {
    const data = drafts[patternKey] ?? {};
    const progress = psaProgress(data, PSA_FIELD_KEYS);
    try {
      setSaving(patternKey);
      await psaService.save(patternKey, data, progress);
      setRows((prev) => ({
        ...prev,
        [patternKey]: {
          id: prev[patternKey]?.id ?? patternKey,
          belief_key: patternKey,
          data,
          progress_percent: progress,
          updated_at: new Date().toISOString(),
        },
      }));
    } catch (e: any) {
      toast({
        title: t("Save failed", "Salvare eșuată"),
        description: e?.message ?? "—",
        variant: "destructive",
      });
    } finally {
      setSaving((cur) => (cur === patternKey ? null : cur));
    }
  }

  const totalProgress = useMemo(() => {
    if (PSA_PATTERNS.length === 0) return 0;
    const sum = PSA_PATTERNS.reduce(
      (acc, p) => acc + psaProgress(drafts[p.key], PSA_FIELD_KEYS),
      0,
    );
    return Math.round(sum / PSA_PATTERNS.length);
  }, [drafts]);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Helmet>
        <title>
          {t("PSA Reconstruction | CEO Mind OS", "PSA Reconstrucție | CEO Mind OS")}
        </title>
        <meta
          name="description"
          content={t(
            "Replace toxic CEO beliefs with empowering ones using the Problem - Substitute - Action framework.",
            "Substituie credințele toxice de CEO cu unele care te susțin, prin metoda Problemă - Substituție - Acțiune.",
          )}
        />
        <link rel="canonical" href="/minte/psa" />
      </Helmet>

      <header className="space-y-3">
        <Link
          to="/minte"
          className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("Back to Mind", "Înapoi la Minte")}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <RotateCcw className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">
            {t("PSA Reconstruction", "PSA Reconstrucție")}
          </h1>
          <Badge variant="secondary">{t("Toxic CEO patterns", "Tipare toxice CEO")}</Badge>
        </div>
        <p className="text-muted-foreground">
          {t(
            "8 toxic beliefs entrepreneurs carry. Replace them through Problem → Substitute → Action and train the new voice for 30 days.",
            "8 credințe toxice pe care le ducem ca antreprenori. Le înlocuim prin Problemă → Substituție → Acțiune și antrenăm vocea nouă 30 de zile.",
          )}
        </p>

        <div className="flex items-center gap-3">
          <Progress value={totalProgress} className="h-2 flex-1" />
          <span className="text-sm font-semibold tabular-nums">{totalProgress}%</span>
        </div>

        {weakAxes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("Recommended for your weak axes:", "Recomandate pentru axele tale slabe:")}
            {weakAxes.map((a) => (
              <Badge key={a} variant="outline" className="text-xs">
                {AXIS_LABEL[a]?.[lang] ?? a}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("Loading…", "Se încarcă…")}</p>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {orderedPatterns.map((p) => {
            const draft = drafts[p.key] ?? {};
            const progress = psaProgress(draft, PSA_FIELD_KEYS);
            const rec = recommendationReason(p);
            const isSaving = saving === p.key;

            return (
              <AccordionItem
                key={p.key}
                value={p.key}
                className="border rounded-lg overflow-hidden bg-card"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex flex-1 items-center justify-between gap-3 pr-2">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          {lang === "en" ? p.title_en : p.title_ro}
                        </span>
                        {rec && (
                          <Badge className="text-[10px] bg-primary/15 text-primary hover:bg-primary/20">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t("Recommended", "Recomandat")}
                          </Badge>
                        )}
                        {progress === 100 && (
                          <Badge variant="outline" className="text-[10px]">
                            ✓ {t("Complete", "Complet")}
                          </Badge>
                        )}
                      </div>
                      {rec && (
                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="tabular-nums w-9 text-right">{progress}%</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4 space-y-5">
                  {/* Problem */}
                  <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-1">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide">
                        {t("Problem", "Problemă")}
                      </h3>
                    </div>
                    <p className="font-medium italic">
                      {lang === "en" ? p.problem_en : p.problem_ro}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>{t("Cost:", "Preț:")}</strong>{" "}
                      {lang === "en" ? p.cost_en : p.cost_ro}
                    </p>
                  </section>

                  {/* Substitute */}
                  <section className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Lightbulb className="h-4 w-4" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide">
                        {t("Substitute", "Substituție")}
                      </h3>
                    </div>
                    <p className="font-semibold">
                      {lang === "en" ? p.substitute_en : p.substitute_ro}
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      {(lang === "en" ? p.reframes_en : p.reframes_ro).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </section>

                  {/* Action */}
                  <section className="rounded-lg border border-accent/40 bg-accent/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Target className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide">
                        {t("Action", "Acțiune")}
                      </h3>
                    </div>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      {(lang === "en" ? p.actions_en : p.actions_ro).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ol>
                  </section>

                  {/* Axes */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">
                      {t("Trains axes:", "Antrenează axe:")}
                    </span>
                    {p.axes.map((a) => (
                      <Badge key={a} variant="outline" className="text-[10px]">
                        {AXIS_LABEL[a]?.[lang] ?? a}
                      </Badge>
                    ))}
                  </div>

                  {/* Reflection fields */}
                  <div className="space-y-4 pt-2 border-t">
                    <h4 className="font-semibold text-sm">
                      {t("Your reconstruction", "Reconstrucția ta")}
                    </h4>
                    {p.fields.map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-sm font-medium">
                          {lang === "en" ? f.label_en : f.label_ro}
                        </label>
                        <Textarea
                          value={draft[f.key] ?? ""}
                          onChange={(e) => updateField(p.key, f.key, e.target.value)}
                          placeholder={lang === "en" ? f.placeholder_en : f.placeholder_ro}
                          rows={2}
                          className="resize-y"
                        />
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        {isSaving
                          ? t("Saving…", "Se salvează…")
                          : t("Auto-saves after you stop typing", "Se salvează automat după ce te oprești din scris")}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => persist(p.key)}
                        disabled={isSaving}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        {t("Save now", "Salvează acum")}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <Card className="border-dashed">
        <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">
              {t("Need to assess first?", "Vrei să te evaluezi întâi?")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t(
                "Take the mind tests to see exactly which toxic patterns to prioritize.",
                "Fă testele de minte ca să vezi exact ce tipare să prioritizezi.",
              )}
            </p>
          </div>
          <Link to="/minte/teste">
            <Button size="sm" variant="outline">
              {t("Take tests", "Fă testele")}{" "}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
