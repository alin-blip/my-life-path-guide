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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Save,
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowRight,
  History,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  PSA_PATTERNS,
  PSA_FIELD_KEYS,
  type PsaPattern,
} from "@/data/mind-psa/toxic-patterns";
import {
  psaService,
  psaProgress,
  type PsaData,
  type PsaRow,
  type PsaHistoryRow,
} from "@/services/psaService";
import {
  mindQuizService,
  type MindAxisScoreRow,
  type MindQuizResponseRow,
} from "@/services/mindQuizService";
import type { MindAxisId } from "@/data/mind-quizzes/types";
import {
  computeTrigger,
  personalizeSteps,
  weakestAxes,
  type RecommendationTrigger,
} from "@/services/psaPersonalization";

const AXIS_LABEL: Record<string, { ro: string; en: string }> = {
  cognitiva: { ro: "Cognitivă", en: "Cognitive" },
  emotionala: { ro: "Emoțională", en: "Emotional" },
  afectiva: { ro: "Afectivă", en: "Affective" },
  volitiva: { ro: "Volitivă", en: "Volitional" },
  comportamentala: { ro: "Comportamentală", en: "Behavioral" },
  profesionala: { ro: "Profesională", en: "Professional" },
};

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export default function MintePSA() {
  const { language } = useLanguage();
  const lang: "ro" | "en" = language === "en" ? "en" : "ro";
  const { toast } = useToast();
  const t = (en: string, ro: string) => (lang === "en" ? en : ro);

  const [rows, setRows] = useState<Record<string, PsaRow>>({});
  const [drafts, setDrafts] = useState<Record<string, PsaData>>({});
  const [axisScores, setAxisScores] = useState<MindAxisScoreRow[]>([]);
  const [responses, setResponses] = useState<Record<string, MindQuizResponseRow>>({});
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({});
  const [loading, setLoading] = useState(true);
  const [historyCache, setHistoryCache] = useState<Record<string, PsaHistoryRow[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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
      Object.values(savedTimers.current).forEach(clearTimeout);
    };
  }, []);

  const weakAxes = useMemo<MindAxisId[]>(
    () => weakestAxes(axisScores, 2),
    [axisScores],
  );

  /** Map: patternKey -> trigger info, memoized once per data change. */
  const triggers = useMemo<Record<string, RecommendationTrigger>>(() => {
    const out: Record<string, RecommendationTrigger> = {};
    for (const p of PSA_PATTERNS) {
      out[p.key] = computeTrigger(p, axisScores, responses);
    }
    return out;
  }, [axisScores, responses]);

  /** Sorted: recommended (by weight) first, then in-progress, then the rest. */
  const orderedPatterns = useMemo(() => {
    return [...PSA_PATTERNS].sort((a, b) => {
      const wa = triggers[a.key]?.weight ?? 0;
      const wb = triggers[b.key]?.weight ?? 0;
      if (wa !== wb) return wb - wa;
      const pa = psaProgress(drafts[a.key], PSA_FIELD_KEYS);
      const pb = psaProgress(drafts[b.key], PSA_FIELD_KEYS);
      return pb - pa;
    });
  }, [drafts, triggers]);

  function setStatus(key: string, status: SaveStatus) {
    setStatuses((prev) => ({ ...prev, [key]: status }));
  }

  function updateField(patternKey: string, fieldKey: string, value: string) {
    setDrafts((prev) => {
      const next: Record<string, PsaData> = { ...prev };
      next[patternKey] = { ...(next[patternKey] ?? {}), [fieldKey]: value };
      return next;
    });
    setStatus(patternKey, "pending");

    if (saveTimers.current[patternKey]) clearTimeout(saveTimers.current[patternKey]);
    saveTimers.current[patternKey] = setTimeout(() => {
      void persist(patternKey);
    }, 800);
  }

  async function persist(patternKey: string) {
    const data = drafts[patternKey] ?? {};
    const progress = psaProgress(data, PSA_FIELD_KEYS);
    try {
      setStatus(patternKey, "saving");
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
      // Invalidate cached history so next open re-fetches the new snapshot.
      setHistoryCache((prev) => {
        if (!(patternKey in prev)) return prev;
        const next = { ...prev };
        delete next[patternKey];
        return next;
      });
      setStatus(patternKey, "saved");
      if (savedTimers.current[patternKey]) clearTimeout(savedTimers.current[patternKey]);
      savedTimers.current[patternKey] = setTimeout(
        () => setStatus(patternKey, "idle"),
        2000,
      );
    } catch (e: any) {
      setStatus(patternKey, "error");
      toast({
        title: t("Save failed", "Salvare eșuată"),
        description: e?.message ?? "—",
        variant: "destructive",
      });
    }
  }

  async function openHistory(patternKey: string) {
    if (historyCache[patternKey]) return;
    setLoadingHistory(patternKey);
    const rows = await psaService.getHistory(patternKey, 10);
    setHistoryCache((prev) => ({ ...prev, [patternKey]: rows }));
    setLoadingHistory((cur) => (cur === patternKey ? null : cur));
  }

  function restoreSnapshot(patternKey: string, snap: PsaHistoryRow) {
    setDrafts((prev) => ({ ...prev, [patternKey]: { ...snap.data } }));
    // Persist immediately so "current" matches what the user sees.
    if (saveTimers.current[patternKey]) clearTimeout(saveTimers.current[patternKey]);
    void persist(patternKey);
    toast({
      title: t("Restored", "Restaurat"),
      description: t(
        `Restored snapshot from ${new Date(snap.created_at).toLocaleString()}`,
        `Versiune restaurată din ${new Date(snap.created_at).toLocaleString()}`,
      ),
    });
  }

  const totalProgress = useMemo(() => {
    if (PSA_PATTERNS.length === 0) return 0;
    const sum = PSA_PATTERNS.reduce(
      (acc, p) => acc + psaProgress(drafts[p.key], PSA_FIELD_KEYS),
      0,
    );
    return Math.round(sum / PSA_PATTERNS.length);
  }, [drafts]);

  function renderSaveStatus(status: SaveStatus) {
    switch (status) {
      case "pending":
        return (
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t("Unsaved changes…", "Modificări nesalvate…")}
          </span>
        );
      case "saving":
        return (
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> {t("Saving…", "Se salvează…")}
          </span>
        );
      case "saved":
        return (
          <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> {t("Saved", "Salvat")}
          </span>
        );
      case "error":
        return (
          <span className="text-xs text-destructive">{t("Save failed", "Salvare eșuată")}</span>
        );
      default:
        return (
          <span className="text-xs text-muted-foreground">
            {t("Auto-saves after 800ms", "Salvare automată la 800 ms")}
          </span>
        );
    }
  }

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
            "8 toxic beliefs entrepreneurs carry. Replace them through Problem → Substitute → Action. Steps below are tailored to your latest mind-test scores and Brain Map.",
            "8 credințe toxice pe care le ducem ca antreprenori. Le înlocuim prin Problemă → Substituție → Acțiune. Pașii de mai jos sunt personalizați pe ultimele tale scoruri și pe Brain Map.",
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
            const trig = triggers[p.key];
            const status = statuses[p.key] ?? "idle";
            const steps = personalizeSteps(p, trig, axisScores, lang);
            const history = historyCache[p.key];

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
                        {trig.weight >= 2 && (
                          <Badge className="text-[10px] bg-destructive/15 text-destructive hover:bg-destructive/20">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t("Priority", "Prioritar")}
                          </Badge>
                        )}
                        {trig.weight === 1 && (
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
                      {trig.kind && (
                        <p className="text-xs text-muted-foreground">
                          {t("Why: ", "De ce: ")}
                          {lang === "en" ? trig.reason_en : trig.reason_ro}
                        </p>
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
                  {/* Reason banner with explicit quiz CTA */}
                  {trig.kind === "quiz" && trig.quiz && (
                    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs">
                        <strong>{t("Why we surfaced this:", "De ce ți-am recomandat:")}</strong>{" "}
                        {lang === "en" ? trig.reason_en : trig.reason_ro}
                      </p>
                      <Link to={`/minte/teste/${trig.quiz.slug}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          {t("Re-take test", "Refă testul")}{" "}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Problem */}
                  <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
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
                    {steps.problemNotes.length > 0 && (
                      <div className="pt-2 border-t border-destructive/20 space-y-1.5">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {t("Personalized for you", "Personalizat pentru tine")}
                        </p>
                        {steps.problemNotes.map((s, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{s.label}: </span>
                            {s.action}
                            <div className="text-[11px] text-muted-foreground">{s.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {steps.substituteNotes.length > 0 && (
                      <div className="pt-2 border-t border-primary/20 space-y-1.5">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {t("Personalized for you", "Personalizat pentru tine")}
                        </p>
                        {steps.substituteNotes.map((s, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{s.label}: </span>
                            {s.action}
                            <div className="text-[11px] text-muted-foreground">{s.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {steps.actionNotes.length > 0 && (
                      <div className="pt-2 border-t border-accent/30 space-y-1.5">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {t("Personalized for you", "Personalizat pentru tine")}
                        </p>
                        {steps.actionNotes.map((s, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{s.label}: </span>
                            {s.action}
                            <div className="text-[11px] text-muted-foreground">{s.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm">
                        {t("Your reconstruction", "Reconstrucția ta")}
                      </h4>
                      <Popover onOpenChange={(o) => o && openHistory(p.key)}>
                        <PopoverTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            <History className="h-3.5 w-3.5 mr-1" />
                            {t("History", "Istoric")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80 p-0">
                          <div className="p-3 border-b">
                            <p className="text-sm font-semibold">
                              {t("Recent versions", "Versiuni recente")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t(
                                "Tap a version to restore it as your current draft.",
                                "Atinge o versiune ca să o restaurezi ca draft curent.",
                              )}
                            </p>
                          </div>
                          <div className="max-h-72 overflow-y-auto divide-y">
                            {loadingHistory === p.key && (
                              <div className="p-3 text-xs text-muted-foreground">
                                {t("Loading…", "Se încarcă…")}
                              </div>
                            )}
                            {history && history.length === 0 && (
                              <div className="p-3 text-xs text-muted-foreground">
                                {t("No saved versions yet.", "Nicio versiune salvată încă.")}
                              </div>
                            )}
                            {history?.map((h) => (
                              <button
                                key={h.id}
                                onClick={() => restoreSnapshot(p.key, h)}
                                className="w-full text-left p-3 hover:bg-muted/60 transition-colors"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span>{new Date(h.created_at).toLocaleString()}</span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {h.progress_percent}%
                                  </Badge>
                                </div>
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

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
                      {renderSaveStatus(status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => persist(p.key)}
                        disabled={status === "saving"}
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
