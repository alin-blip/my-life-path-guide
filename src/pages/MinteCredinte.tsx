import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
import { Grid3x3, ArrowLeft, Sparkles, CheckCircle2, Save } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { CEO_BELIEFS } from "@/data/mind-beliefs/ceo-beliefs";
import type { MindAxisId } from "@/data/mind-quizzes/types";
import {
  beliefMatrixService,
  beliefProgress,
  type BeliefData,
  type BeliefRow,
} from "@/services/beliefMatrixService";
import { mindQuizService, type MindAxisScoreRow } from "@/services/mindQuizService";

const AXIS_LABEL: Record<string, { ro: string; en: string }> = {
  cognitiva: { ro: "Cognitivă", en: "Cognitive" },
  emotionala: { ro: "Emoțională", en: "Emotional" },
  afectiva: { ro: "Afectivă", en: "Affective" },
  volitiva: { ro: "Volitivă", en: "Volitional" },
  comportamentala: { ro: "Comportamentală", en: "Behavioral" },
  profesionala: { ro: "Profesională", en: "Professional" },
};

export default function MinteCredinte() {
  const { language } = useLanguage();
  const lang: "ro" | "en" = language === "en" ? "en" : "ro";
  const { toast } = useToast();
  const t = (en: string, ro: string) => (lang === "en" ? en : ro);

  const [beliefs, setBeliefs] = useState<Record<string, BeliefRow>>({});
  const [axisScores, setAxisScores] = useState<MindAxisScoreRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, BeliefData>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    Promise.all([beliefMatrixService.getAll(), mindQuizService.getAxisScores()])
      .then(([b, a]) => {
        setBeliefs(b);
        setAxisScores(a);
        // seed drafts with saved data
        const seeded: Record<string, BeliefData> = {};
        for (const k of Object.keys(b)) seeded[k] = { ...b[k].data };
        setDrafts(seeded);
      })
      .finally(() => setLoading(false));

    return () => {
      Object.values(saveTimers.current).forEach(clearTimeout);
    };
  }, []);

  /** Lowest 2 axes — used to highlight recommended beliefs. */
  const weakAxes = useMemo<MindAxisId[]>(() => {
    if (axisScores.length === 0) return [];
    const sorted = [...axisScores].sort((a, b) => a.score_healthy - b.score_healthy);
    return sorted.slice(0, 2).map((r) => r.axis as MindAxisId);
  }, [axisScores]);

  const recommendedKeys = useMemo(() => {
    if (weakAxes.length === 0) return new Set<string>();
    const set = new Set<string>();
    for (const b of CEO_BELIEFS) {
      if (b.axes.some((a) => weakAxes.includes(a))) set.add(b.key);
    }
    return set;
  }, [weakAxes]);

  const handleField = useCallback(
    (beliefKey: string, fieldKey: string, value: string) => {
      setDrafts((prev) => {
        const next = { ...prev, [beliefKey]: { ...(prev[beliefKey] ?? {}), [fieldKey]: value } };
        // debounce autosave
        if (saveTimers.current[beliefKey]) clearTimeout(saveTimers.current[beliefKey]);
        saveTimers.current[beliefKey] = setTimeout(async () => {
          try {
            setSaving(beliefKey);
            await beliefMatrixService.save(beliefKey, next[beliefKey]);
            setBeliefs((b) => ({
              ...b,
              [beliefKey]: {
                ...(b[beliefKey] ?? { id: "", belief_key: beliefKey, updated_at: "" }),
                belief_key: beliefKey,
                data: next[beliefKey],
                updated_at: new Date().toISOString(),
              } as BeliefRow,
            }));
          } catch (e) {
            console.error(e);
          } finally {
            setSaving(null);
          }
        }, 800);
        return next;
      });
    },
    [],
  );

  const forceSave = async (beliefKey: string) => {
    try {
      setSaving(beliefKey);
      await beliefMatrixService.save(beliefKey, drafts[beliefKey] ?? {});
      toast({ title: t("Saved", "Salvat"), description: t("Belief saved.", "Credință salvată.") });
    } catch (e: any) {
      toast({ title: t("Error", "Eroare"), description: e?.message ?? "—", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const totalProgress = useMemo(() => {
    if (CEO_BELIEFS.length === 0) return 0;
    const sum = CEO_BELIEFS.reduce((acc, b) => {
      const d = drafts[b.key] ?? beliefs[b.key]?.data ?? {};
      return acc + beliefProgress(d, b.fields.map((f) => f.key));
    }, 0);
    return Math.round(sum / CEO_BELIEFS.length);
  }, [drafts, beliefs]);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Helmet>
        <title>{t("CEO Belief Matrix | CEO Mind OS", "Matricea Credințelor CEO | CEO Mind OS")}</title>
        <meta
          name="description"
          content={t(
            "Install 10 empowering CEO beliefs with personal action plans.",
            "Instalează 10 credințe puternice de CEO cu plan personal de acțiune.",
          )}
        />
        <link rel="canonical" href="/minte/credinte" />
      </Helmet>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link to="/minte" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("Back to Mind", "Înapoi la Minte")}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <Grid3x3 className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">{t("CEO Belief Matrix", "Matricea Credințelor CEO")}</h1>
          </div>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {t(
              "Ten fundamental beliefs that separate operators from leaders. Fill each one — drafts auto-save.",
              "Zece credințe fundamentale care separă operatorul de lider. Completează — răspunsurile se salvează automat.",
            )}
          </p>
        </div>
        <Card className="min-w-[200px]">
          <CardContent className="p-3 space-y-1">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t("Matrix progress", "Progres matrice")}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{totalProgress}%</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <Progress value={totalProgress} className="h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendedKeys.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">
                {t("Recommended for you", "Recomandate pentru tine")}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {t(
                `Based on your Brain Map, your weakest axes are: ${weakAxes
                  .map((a) => AXIS_LABEL[a]?.en ?? a)
                  .join(", ")}. Start with the highlighted beliefs.`,
                `Pe baza Brain Map, cele mai slabe axe sunt: ${weakAxes
                  .map((a) => AXIS_LABEL[a]?.ro ?? a)
                  .join(", ")}. Începe cu credințele marcate.`,
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {axisScores.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="p-4 text-sm text-muted-foreground flex items-center justify-between gap-3 flex-wrap">
            <span>
              {t(
                "Take a Mind test first to get personalized belief recommendations.",
                "Fă întâi un test de minte ca să primești recomandări personalizate.",
              )}
            </span>
            <Link to="/minte/teste">
              <Button size="sm" variant="secondary">{t("Open tests", "Deschide testele")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Beliefs accordion */}
      <Accordion type="multiple" className="space-y-3">
        {CEO_BELIEFS.map((belief) => {
          const data = drafts[belief.key] ?? beliefs[belief.key]?.data ?? {};
          const pct = beliefProgress(data, belief.fields.map((f) => f.key));
          const isRecommended = recommendedKeys.has(belief.key);
          const isComplete = pct === 100;
          return (
            <AccordionItem
              key={belief.key}
              value={belief.key}
              className={
                "border rounded-lg overflow-hidden bg-card " +
                (isRecommended ? "border-primary/40 ring-1 ring-primary/20" : "")
              }
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{lang === "en" ? belief.title_en : belief.title_ro}</span>
                      {isRecommended && (
                        <Badge variant="secondary" className="text-[10px]">
                          {t("Recommended", "Recomandat")}
                        </Badge>
                      )}
                      {isComplete && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {lang === "en" ? belief.statement_en : belief.statement_ro}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16">
                      <Progress value={pct} className="h-1.5" />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-sm">
                  <p className="font-medium">
                    {lang === "en" ? belief.statement_en : belief.statement_ro}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    {lang === "en" ? belief.why_en : belief.why_ro}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {belief.axes.map((a) => (
                      <Badge key={a} variant="outline" className="text-[10px]">
                        {AXIS_LABEL[a]?.[lang]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {belief.fields.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-xs font-medium">
                        {lang === "en" ? f.label_en : f.label_ro}
                      </label>
                      <Textarea
                        rows={2}
                        value={data[f.key] ?? ""}
                        placeholder={lang === "en" ? f.placeholder_en : f.placeholder_ro}
                        onChange={(e) => handleField(belief.key, f.key, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-muted-foreground">
                    {saving === belief.key
                      ? t("Saving…", "Se salvează…")
                      : beliefs[belief.key]?.updated_at
                      ? t(
                          `Last saved ${new Date(beliefs[belief.key].updated_at).toLocaleString()}`,
                          `Ultima salvare ${new Date(beliefs[belief.key].updated_at).toLocaleString()}`,
                        )
                      : t("Not saved yet", "Nesalvat încă")}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => forceSave(belief.key)}
                    disabled={saving === belief.key}
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {t("Save now", "Salvează acum")}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {loading && (
        <p className="text-xs text-muted-foreground text-center">{t("Loading…", "Se încarcă…")}</p>
      )}
    </div>
  );
}
