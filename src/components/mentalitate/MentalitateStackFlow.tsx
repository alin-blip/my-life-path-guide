import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, Sparkles, ChevronRight, CheckCircle2, ArrowLeft, Target, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  BLUEPRINT_PHASES,
  BLUEPRINT_QUESTIONS,
  AXIS_LABELS_RO,
} from '@/data/mentalitate-stack/questions';
import {
  mentalitateStackService,
  MentalitateMode,
  MentalitateSession,
} from '@/services/mentalitateStackService';

interface Props {
  mode: MentalitateMode;
  deepDiveAxis?: string;
  source?: string;
  onComplete?: (session: MentalitateSession) => void;
  onSkip?: () => void;
}

type Stage = 'intro' | 'situation' | 'questions' | 'schedule' | 'synthesizing' | 'done';
type ScheduleTarget = 'door' | 'ideas' | 'none';
type SchedulePriority = 'hot' | 'important' | 'normal';

interface Synthesis {
  reframe: string;
  action: string;
  distortion_detected: string;
  axes_impacted: string[];
  vina_score?: number | null;
  control_score?: number | null;
  pattern_summary: string;
  ai_failed?: boolean;
}

const TOTAL = BLUEPRINT_QUESTIONS.length;

// Day chips (Mon-Sat) for the current ISO week
type DayCode = 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa';
const DAY_ORDER: DayCode[] = ['M', 'T', 'W', 'Th', 'F', 'Sa'];
const DAY_LABEL: Record<DayCode, string> = { M: 'Lu', T: 'Ma', W: 'Mi', Th: 'Jo', F: 'Vi', Sa: 'Sâ' };
const JS_TO_CODE: Record<number, DayCode | 'Su'> = { 0: 'Su', 1: 'M', 2: 'T', 3: 'W', 4: 'Th', 5: 'F', 6: 'Sa' };

function getDefaultDay(): DayCode {
  const now = new Date();
  const todayCode = JS_TO_CODE[now.getDay()];
  // "Today if before 18:00, otherwise tomorrow" — clamp to Mon-Sat.
  const useToday = now.getHours() < 18 && todayCode !== 'Su';
  if (useToday && (DAY_ORDER as string[]).includes(todayCode)) return todayCode as DayCode;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tCode = JS_TO_CODE[tomorrow.getDay()];
  if ((DAY_ORDER as string[]).includes(tCode)) return tCode as DayCode;
  return 'M';
}

export const MentalitateStackFlow: React.FC<Props> = ({
  mode,
  deepDiveAxis,
  source = 'stack_page',
  onComplete,
  onSkip,
}) => {
  const [stage, setStage] = useState<Stage>('intro');
  const [session, setSession] = useState<MentalitateSession | null>(null);
  const [qIdx, setQIdx] = useState(1); // 1..14
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [reflection, setReflection] = useState<string>('');
  const [reflecting, setReflecting] = useState(false);
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Q0 — situation
  const [situation, setSituation] = useState('');

  // Schedule panel (Q14 → schedule stage)
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget>('door');
  const [scheduleDays, setScheduleDays] = useState<DayCode[]>([getDefaultDay()]);
  const [schedulePriority, setSchedulePriority] = useState<SchedulePriority>('important');

  // Quick-button suggestions
  const [distortionSuggestions, setDistortionSuggestions] = useState<{ label: string; why: string }[]>([]);
  const [loadingDistortions, setLoadingDistortions] = useState(false);
  const distortionsFetchedRef = useRef(false);
  const [answerSuggestions, setAnswerSuggestions] = useState<{ label: string; hint: string }[]>([]);
  const [loadingAnswerSuggestions, setLoadingAnswerSuggestions] = useState(false);
  const answerSuggestionsFetchedRef = useRef<Record<number, boolean>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQ = BLUEPRINT_QUESTIONS.find((q) => q.idx === qIdx)!;
  const phase = BLUEPRINT_PHASES.find((p) => p.id === currentQ.phase)!;
  // +1 step for situation, +1 for schedule
  const progress = ((qIdx - 1) / TOTAL) * 100;

  // Build phaseAnswers including situation (as q0/situation) for the AI
  const phaseAnswersForAI = useMemo(
    () => ({ ...(situation ? { situation, q0: situation } : {}), ...answers }),
    [answers, situation]
  );

  // Autosave debounce for questions
  useEffect(() => {
    if (!session || !currentAnswer || stage !== 'questions') return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      mentalitateStackService.saveAnswer(session.id, qIdx, currentAnswer).catch(() => {});
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [currentAnswer, qIdx, session, stage]);

  // Fetch distortion suggestions when arriving at Q5
  useEffect(() => {
    if (stage !== 'questions' || qIdx !== 5 || !session) return;
    if (distortionsFetchedRef.current) return;
    distortionsFetchedRef.current = true;
    setLoadingDistortions(true);
    mentalitateStackService
      .callCoach({
        step: 'suggest_distortions',
        sessionId: session.id,
        mode,
        deepDiveAxis,
        phaseAnswers: phaseAnswersForAI,
      })
      .then((r) => setDistortionSuggestions(r?.suggestions ?? []))
      .catch(() => setDistortionSuggestions([]))
      .finally(() => setLoadingDistortions(false));
  }, [stage, qIdx, session, mode, deepDiveAxis, phaseAnswersForAI]);

  // Fetch generic answer suggestions for the current question (any question except Q5)
  useEffect(() => {
    if (stage !== 'questions' || !session) return;
    if (qIdx === 5) { setAnswerSuggestions([]); return; }
    if (answerSuggestionsFetchedRef.current[qIdx]) return;
    answerSuggestionsFetchedRef.current[qIdx] = true;
    setAnswerSuggestions([]);
    setLoadingAnswerSuggestions(true);
    mentalitateStackService
      .callCoach({
        step: 'suggest_answers',
        sessionId: session.id,
        mode,
        deepDiveAxis,
        phaseAnswers: phaseAnswersForAI,
        targetQuestionIndex: qIdx,
      })
      .then((r) => setAnswerSuggestions(r?.suggestions ?? []))
      .catch(() => setAnswerSuggestions([]))
      .finally(() => setLoadingAnswerSuggestions(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, qIdx, session]);

  const beginSession = async () => {
    try {
      const s = await mentalitateStackService.startSession(mode, deepDiveAxis, source);
      setSession(s);
      setStage('situation');
    } catch (e: any) {
      console.error(e);
      toast.error('Nu am putut porni sesiunea.');
    }
  };

  const submitSituation = async () => {
    if (!situation.trim()) {
      toast.error('Scrie pe scurt situația înainte să continui.');
      return;
    }
    if (!session) return;
    try {
      await mentalitateStackService.saveAnswer(session.id, 0, situation.trim());
    } catch {}
    setStage('questions');
  };

  const runFinalize = async (currentAnswers: Record<string, string>) => {
    if (!session) return;
    setStage('synthesizing');
    try {
      const result = await mentalitateStackService.callCoach({
        step: 'finalize',
        sessionId: session.id,
        mode,
        deepDiveAxis,
        phaseAnswers: { ...(situation ? { situation, q0: situation } : {}), ...currentAnswers },
      });
      setSynthesis(result);
      // Persist + schedule
      const schedule = scheduleTarget === 'none'
        ? { target: 'none' as const }
        : scheduleTarget === 'door'
          ? { target: 'door' as const, days: scheduleDays as string[], priority: schedulePriority }
          : { target: 'ideas' as const };
      const { session: saved, scheduleError: schedErr } = await mentalitateStackService.completeSession(
        session.id,
        result,
        { schedule }
      );
      setScheduleError(schedErr ?? null);
      if (schedErr) toast.error(`Acțiunea nu a fost salvată: ${schedErr}`);
      setStage('done');
      onComplete?.(saved);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message;
      if (msg === 'credits_exhausted') {
        toast.error('Credite AI epuizate. Adaugă credite din Settings → Workspace → Usage.');
      } else if (msg === 'rate_limit') {
        toast.error('Limită atinsă. Așteaptă puțin și reîncearcă.');
      } else {
        toast.error('Nu am putut finaliza sinteza. Reîncearcă.');
      }
      setStage('schedule');
    }
  };

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Răspunde scurt înainte să continui.');
      return;
    }
    if (!session) return;
    const newAnswers = { ...answers, [`q${qIdx}`]: currentAnswer.trim() };
    setAnswers(newAnswers);
    try {
      await mentalitateStackService.saveAnswer(session.id, qIdx, currentAnswer.trim());
    } catch {}

    if (qIdx >= TOTAL) {
      // Move to scheduling stage instead of finalizing immediately
      setStage('schedule');
      return;
    }

    // Get reflection for the answer just given
    setReflecting(true);
    setReflection('');
    try {
      const r = await mentalitateStackService.callCoach({
        step: 'reflect',
        sessionId: session.id,
        mode,
        deepDiveAxis,
        phaseAnswers: { ...(situation ? { situation, q0: situation } : {}), ...newAnswers },
        currentQuestionIndex: qIdx,
      });
      setReflection(r?.reflection ?? '');
    } catch (e) {
      // silent — reflection is optional
    } finally {
      setReflecting(false);
    }

    setQIdx(qIdx + 1);
    setCurrentAnswer('');
  };

  const handleBack = () => {
    if (qIdx <= 1) {
      // Back to situation
      setStage('situation');
      return;
    }
    const prevIdx = qIdx - 1;
    setQIdx(prevIdx);
    setCurrentAnswer(answers[`q${prevIdx}`] ?? '');
    setReflection('');
  };

  const toggleDay = (d: DayCode) => {
    setScheduleDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  // ============ INTRO ============
  if (stage === 'intro') {
    return (
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-violet-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Reconstrucția Mentală</h2>
              <p className="text-sm text-muted-foreground">
                Blueprint Mental în 5 faze, 14 întrebări. ~10-15 min. Termini cu un gând nou
                realist și o acțiune concretă pe care o programezi în calendar.
              </p>
              {mode === 'deep_dive' && deepDiveAxis && (
                <Badge variant="outline" className="mt-2 border-violet-500/40 text-violet-600 dark:text-violet-400">
                  Deep-Dive: {AXIS_LABELS_RO[deepDiveAxis]?.name ?? deepDiveAxis}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {BLUEPRINT_PHASES.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-1"
              >
                <div className="text-[10px] font-mono text-muted-foreground">FAZA {p.id}</div>
                <div className="text-sm font-semibold">{p.title}</div>
                <div className="text-[11px] text-muted-foreground leading-snug">{p.subtitle}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            {onSkip && (
              <Button variant="outline" onClick={onSkip} className="flex-1">
                Skip pentru azi
              </Button>
            )}
            <Button
              onClick={beginSession}
              className="flex-[2] bg-violet-500 hover:bg-violet-600 text-white"
            >
              Începe sesiunea <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============ SITUATION (Q0) ============
  if (stage === 'situation') {
    return (
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Reconstrucția Mentală</h3>
              <p className="text-[11px] text-muted-foreground">Pasul 0 · Contextul situației</p>
            </div>
          </div>
          <Progress value={0} className="h-1.5" indicatorClassName="bg-violet-500" />

          <div className="space-y-1">
            <h4 className="text-base font-semibold leading-snug">
              Descrie pe scurt situația care te-a declanșat
            </h4>
            <p className="text-xs text-muted-foreground italic">
              Povestește liber ce s-a întâmplat — orice context care te ajută să intri în problemă.
              Coach-ul folosește asta ca să facă întrebările și sugestiile relevante pentru tine.
            </p>
          </div>

          <Textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="ex: „Clientul X nu mi-a răspuns la propunere de 3 zile, iar azi am văzut că a postat pe LinkedIn ceva care mă face să cred că lucrează cu altcineva..."
            className="min-h-[140px] text-sm"
            autoFocus
          />

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setStage('intro')} size="sm">
              <ArrowLeft className="w-3 h-3 mr-1" /> Înapoi
            </Button>
            <Button
              onClick={submitSituation}
              disabled={!situation.trim()}
              className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
            >
              Continuă către Faza 1 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============ SCHEDULE PANEL (after Q14, before AI synth) ============
  if (stage === 'schedule') {
    const draftAction = answers['q14'] ?? '';
    return (
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Programează acțiunea</h3>
              <p className="text-[11px] text-muted-foreground">Pasul final · Unde și când execuți</p>
            </div>
          </div>

          {draftAction && (
            <div className="rounded-lg border border-border/50 bg-background/40 p-3 text-sm">
              <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Acțiunea ta (Q14)</div>
              <div className="font-medium">{draftAction}</div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Unde salvez?</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                { id: 'door', label: 'Domino Door', sub: 'Task săptămâna asta' },
                { id: 'ideas', label: 'Ideas Bank', sub: 'Idee pentru mai târziu' },
                { id: 'none', label: 'Nu salva', sub: 'Doar pentru reflecție' },
              ] as { id: ScheduleTarget; label: string; sub: string }[]).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setScheduleTarget(opt.id)}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-left transition-colors',
                    scheduleTarget === opt.id
                      ? 'border-violet-500/70 bg-violet-500/15'
                      : 'border-border/60 bg-background/40 hover:border-violet-500/40'
                  )}
                >
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="text-[11px] text-muted-foreground">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {scheduleTarget === 'door' && (
            <>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  Pe ce zile o pun în calendar?
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DAY_ORDER.map((d) => {
                    const selected = scheduleDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                          selected
                            ? 'border-violet-500/70 bg-violet-500 text-white'
                            : 'border-border/60 bg-background/40 hover:border-violet-500/40'
                        )}
                      >
                        {DAY_LABEL[d]}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  Default: azi dacă e înainte de 18:00, altfel mâine. Poți alege mai multe zile.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Prioritate</div>
                <div className="flex gap-1.5">
                  {(['hot', 'important', 'normal'] as SchedulePriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSchedulePriority(p)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                        schedulePriority === p
                          ? 'border-violet-500/70 bg-violet-500/15'
                          : 'border-border/60 bg-background/40 hover:border-violet-500/40'
                      )}
                    >
                      {p === 'hot' ? '🔥 Hot' : p === 'important' ? '⭐ Important' : '· Normal'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => { setStage('questions'); setQIdx(TOTAL); setCurrentAnswer(answers[`q${TOTAL}`] ?? ''); }}>
              <ArrowLeft className="w-3 h-3 mr-1" /> Înapoi la Q14
            </Button>
            <Button
              onClick={() => runFinalize(answers)}
              disabled={scheduleTarget === 'door' && scheduleDays.length === 0}
              className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
            >
              Finalizează sinteza <Sparkles className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============ SYNTHESIZING ============
  if (stage === 'synthesizing') {
    return (
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground">Coach-ul procesează blueprint-ul tău...</p>
          <p className="text-xs text-muted-foreground">Identificăm pattern-ul, distorsiunea și acțiunea.</p>
        </CardContent>
      </Card>
    );
  }

  // ============ DONE ============
  if (stage === 'done' && synthesis) {
    const dayLabels = scheduleDays.map((d) => DAY_LABEL[d]).join(', ');
    return (
      <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-violet-500/5">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reconstrucție finalizată ✨</h2>
              <p className="text-xs text-muted-foreground">
                Distorsiune: <span className="font-medium text-foreground">{synthesis.distortion_detected}</span>
              </p>
            </div>
          </div>

          {synthesis.ai_failed && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-xs leading-relaxed">
                  AI-ul nu a putut genera sinteza. Am folosit răspunsurile tale (Q13 + Q14) ca punct
                  de plecare. Poți reîncerca sinteza AI sau o lași așa.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runFinalize(answers)}
                  className="h-7 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Reîncearcă sinteza AI
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-2">
            <div className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400">Gândul nou — realist</div>
            <p className="text-base leading-relaxed">{synthesis.reframe}</p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400">
              <Target className="w-3 h-3" /> Acțiunea programată
            </div>
            <p className="text-base font-semibold leading-relaxed">{synthesis.action}</p>
            {scheduleError ? (
              <p className="text-xs text-rose-500">⚠ {scheduleError}</p>
            ) : scheduleTarget === 'door' ? (
              <p className="text-xs text-muted-foreground">
                ✓ Adăugat în Domino Door · {dayLabels} · prioritate {schedulePriority}
              </p>
            ) : scheduleTarget === 'ideas' ? (
              <p className="text-xs text-muted-foreground">✓ Salvat în Ideas Bank</p>
            ) : (
              <p className="text-xs text-muted-foreground">Doar reflecție — nu a fost programată.</p>
            )}
          </div>

          {synthesis.pattern_summary && (
            <div className="rounded-lg bg-muted/30 p-3 text-sm">
              <span className="font-semibold">Pattern:</span> {synthesis.pattern_summary}
            </div>
          )}

          {synthesis.axes_impacted?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Axe afectate:</div>
              <div className="flex flex-wrap gap-1.5">
                {synthesis.axes_impacted.map((a) => (
                  <Badge key={a} variant="outline" className="border-violet-500/40">
                    {AXIS_LABELS_RO[a]?.name ?? a}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => onComplete?.(session!)}
            className="w-full bg-violet-500 hover:bg-violet-600 text-white"
          >
            Continuă
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ============ QUESTIONS ============
  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Reconstrucția Mentală</h3>
              <p className="text-[11px] text-muted-foreground">
                Faza {phase.id} · {phase.title} — Întrebarea {qIdx}/{TOTAL}
              </p>
            </div>
          </div>
          {onSkip && (
            <Button size="sm" variant="ghost" onClick={onSkip}>Skip</Button>
          )}
        </div>

        <Progress value={progress} className="h-1.5" indicatorClassName="bg-violet-500" />

        <AnimatePresence mode="wait">
          <motion.div
            key={qIdx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] border-violet-500/40">
                  Faza {phase.id}: {phase.title}
                </Badge>
              </div>
              <h4 className="text-base font-semibold leading-snug pt-1">
                {currentQ.text}
              </h4>
              <p className="text-xs text-muted-foreground italic">{currentQ.helper}</p>
            </div>

            {currentQ.type === 'number' ? (
              <input
                type="number"
                min={0}
                max={10}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={currentQ.placeholder}
                className="w-full bg-background border border-border rounded-md px-3 py-3 text-lg font-semibold text-center"
                autoFocus
              />
            ) : (
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={currentQ.placeholder}
                className="min-h-[110px] text-sm"
                autoFocus
              />
            )}

            {/* Q5: AI-suggested distortion quick-buttons */}
            {qIdx === 5 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-violet-600 dark:text-violet-400">
                  <Sparkles className="w-3 h-3" />
                  {loadingDistortions ? 'Coach-ul analizează ce pare a fi...' : 'Sugestii pe baza răspunsurilor tale'}
                </div>
                {loadingDistortions && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" /> Se identifică distorsiunile probabile...
                  </div>
                )}
                {!loadingDistortions && distortionSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {distortionSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentAnswer(currentAnswer ? `${currentAnswer}${currentAnswer.endsWith(' ') ? '' : ' '}+ ${s.label}` : s.label)}
                        className={cn(
                          'text-left rounded-lg border border-violet-500/30 bg-violet-500/5',
                          'hover:bg-violet-500/15 hover:border-violet-500/60 transition-colors',
                          'px-3 py-2 text-xs max-w-full'
                        )}
                        title={s.why}
                      >
                        <div className="font-semibold text-foreground">{s.label}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{s.why}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Generic answer suggestions (any question except Q5) */}
            {qIdx !== 5 && (loadingAnswerSuggestions || answerSuggestions.length > 0) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-violet-600 dark:text-violet-400">
                  <Sparkles className="w-3 h-3" />
                  {loadingAnswerSuggestions ? 'Coach-ul pregătește sugestii…' : 'Sugestii rapide bazate pe context'}
                </div>
                {loadingAnswerSuggestions && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" /> Se generează exemple personalizate…
                  </div>
                )}
                {!loadingAnswerSuggestions && answerSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {answerSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentAnswer(s.label)}
                        className={cn(
                          'text-left rounded-lg border border-violet-500/30 bg-violet-500/5',
                          'hover:bg-violet-500/15 hover:border-violet-500/60 transition-colors',
                          'px-3 py-2 text-xs max-w-full'
                        )}
                        title={s.hint}
                      >
                        <div className="font-medium text-foreground leading-snug">{s.label}</div>
                        {s.hint && (
                          <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{s.hint}</div>
                        )}
                      </button>
                    ))}
                    <p className="w-full text-[10px] text-muted-foreground italic">
                      Apasă o sugestie ca să o folosești ca punct de start — apoi editează în text.
                    </p>
                  </div>
                )}
              </div>
            )}

            {reflection && qIdx > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 rounded-lg bg-violet-500/10 border border-violet-500/20 p-3"
              >
                <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">{reflection}</p>
              </motion.div>
            )}
            {reflecting && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Coach-ul reflectează...
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleBack}
                size="sm"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Înapoi
              </Button>
              <Button
                onClick={handleNext}
                disabled={!currentAnswer.trim() || reflecting}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
              >
                {qIdx >= TOTAL ? (
                  <>Programează acțiunea <ChevronRight className="w-4 h-4 ml-1" /></>
                ) : (
                  <>Continuă <ChevronRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
