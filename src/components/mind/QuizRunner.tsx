import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Cloud, CloudOff, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { MindQuiz, BandKey } from "@/data/mind-quizzes/types";
import { scoreMindQuiz } from "@/data/mind-quizzes";
import { mindQuizService } from "@/services/mindQuizService";
import { useToast } from "@/hooks/use-toast";

interface QuizRunnerProps {
  quiz: MindQuiz;
  onComplete?: (scoreHealthy: number, band: BandKey) => void;
}

export function QuizRunner({ quiz, onComplete }: QuizRunnerProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const lang = language === "en" ? "en" : "ro";

  const [answers, setAnswers] = useState<Record<string, BandKey>>({});
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [result, setResult] = useState<{
    scoreHealthy: number;
    band: BandKey;
  } | null>(null);

  // Hydrate from saved draft (DB-first, localStorage fallback)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const draft = await mindQuizService.loadDraft(quiz.slug);
        if (cancelled) return;
        if (draft && Object.keys(draft.answers ?? {}).length > 0) {
          setAnswers(draft.answers as Record<string, BandKey>);
          setIndex(Math.min(draft.current_index ?? 0, quiz.questions.length - 1));
          setResumed(true);
        } else {
          const raw = localStorage.getItem(`mind-quiz-draft-${quiz.slug}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.answers && Object.keys(parsed.answers).length > 0) {
              setAnswers(parsed.answers);
              setIndex(parsed.index ?? 0);
              setResumed(true);
            }
          }
        }
      } catch (e) {
        console.error("Hydrate quiz draft failed:", e);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quiz.slug, quiz.questions.length]);

  // Debounced auto-save (800ms)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated || result) return;
    if (Object.keys(answers).length === 0) return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        localStorage.setItem(
          `mind-quiz-draft-${quiz.slug}`,
          JSON.stringify({ answers, index, ts: Date.now() }),
        );
        const ok = await mindQuizService.saveDraft(quiz.slug, answers, index, lang);
        setSaveStatus(ok ? "saved" : "idle");
      } catch {
        setSaveStatus("idle");
      }
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [answers, index, hydrated, result, quiz.slug, lang]);

  const title = lang === "en" ? quiz.title_en : quiz.title_ro;
  const description = lang === "en" ? quiz.description_en : quiz.description_ro;
  const instructions = lang === "en" ? quiz.instructions_en : quiz.instructions_ro;
  const scaleLabel = lang === "en" ? quiz.scaleLabel_en : quiz.scaleLabel_ro;

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const current = quiz.questions[index];
  const currentAnswer = current ? answers[String(current.n)] : undefined;
  const isLast = index === totalQuestions - 1;
  const allAnswered = answeredCount === totalQuestions;

  const t = (en: string, ro: string) => (lang === "en" ? en : ro);

  const selectAnswer = (key: BandKey) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [String(current.n)]: key }));
    // Auto-advance to next unanswered question
    setTimeout(() => {
      if (!isLast) setIndex((i) => Math.min(i + 1, totalQuestions - 1));
    }, 180);
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast({
        title: t("Incomplete", "Incomplet"),
        description: t(
          "Please answer all questions.",
          "Răspunde la toate întrebările.",
        ),
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { result: r } = await mindQuizService.submitQuiz(quiz.slug, answers, lang);
      setResult({ scoreHealthy: r.scoreHealthy, band: r.band });
      // Clear draft on successful submit
      await mindQuizService.clearDraft(quiz.slug);
      localStorage.removeItem(`mind-quiz-draft-${quiz.slug}`);
      try {
        localStorage.setItem('onboarding-mind-test-done', '1');
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`mind_test_done_${today}`, '1');
      } catch {}
      onComplete?.(r.scoreHealthy, r.band);
    } catch (err) {
      console.error(err);
      // Compute locally as fallback so the user still sees a result
      const r = scoreMindQuiz(quiz, answers);
      setResult({ scoreHealthy: r.scoreHealthy, band: r.band });
      toast({
        title: t("Saved locally", "Salvat local"),
        description: t(
          "Couldn't sync to cloud — score shown is local.",
          "Nu am putut sincroniza — scorul afișat e local.",
        ),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const band = quiz.bands.find((b) => b.key === result.band);
    const label = band ? (lang === "en" ? band.label_en : band.label_ro) : "";
    const summary = band ? (lang === "en" ? band.summary_en : band.summary_ro) : "";
    const actions = band ? (lang === "en" ? band.actions_en : band.actions_ro) : [];
    const tone =
      result.band === "C"
        ? "text-emerald-500"
        : result.band === "B"
          ? "text-amber-500"
          : "text-rose-500";

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="secondary" className="mb-2">{title}</Badge>
                <h2 className="text-2xl font-bold">
                  {t("Your result", "Rezultatul tău")}
                </h2>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${tone}`}>
                  {result.scoreHealthy}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t("healthy", "sănătate")} / 100
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-4 space-y-2">
              <p className={`font-semibold ${tone}`}>{label}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("Next steps", "Pași concreți")}
              </p>
              <ul className="space-y-2">
                {actions.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => navigate("/minte/teste")}>
                {t("Back to tests", "Înapoi la teste")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/mind-shifting?tab=today")}>
                {t("Start Mind Shift", "Începe Mind Shift")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setAnswers({});
                  setIndex(0);
                  setResult(null);
                }}
              >
                {t("Retake", "Refă testul")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current) return null;

  const qText = lang === "en" ? current.text_en : current.text_ro;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Badge variant="secondary">{title}</Badge>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground/80">{instructions}</p>
            <p className="text-xs font-medium text-primary">{scaleLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {answeredCount}/{totalQuestions}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            {resumed ? (
              <span className="inline-flex items-center gap-1 text-primary">
                <RotateCcw className="h-3 w-3" />
                {t("Resumed where you left off", "Reluat de unde ai rămas")}
              </span>
            ) : <span />}
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              {saveStatus === "saving" && (
                <>
                  <Cloud className="h-3 w-3 animate-pulse" />
                  {t("Saving…", "Se salvează…")}
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {t("Saved", "Salvat")}
                </>
              )}
              {saveStatus === "idle" && answeredCount > 0 && (
                <>
                  <CloudOff className="h-3 w-3" />
                  {t("Offline", "Offline")}
                </>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground">
            {t("Question", "Întrebarea")} {index + 1} / {totalQuestions}
          </p>
          <h3 className="text-lg font-semibold leading-snug">{qText}</h3>

          <div className="grid gap-2">
            {current.options.map((opt) => {
              const optText = lang === "en" ? opt.text_en : opt.text_ro;
              const selected = currentAnswer === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => selectAnswer(opt.key)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-sm flex-1">{optText}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("Previous", "Înapoi")}
            </Button>

            {isLast ? (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
              >
                {submitting
                  ? t("Saving…", "Se salvează…")
                  : t("See result", "Vezi rezultatul")}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                disabled={!currentAnswer}
              >
                {t("Next", "Următoare")}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
