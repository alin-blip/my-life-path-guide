import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Brain,
  Sparkles,
  CheckCircle2,
  Target,
  AlertTriangle,
  RefreshCw,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  BLUEPRINT_PHASES,
  BLUEPRINT_QUESTIONS,
  AXIS_LABELS_RO,
  getBlueprintQuestion,
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

type ChatMsgKind =
  | 'coach-text'
  | 'coach-question'
  | 'coach-reflection'
  | 'coach-schedule'
  | 'coach-error'
  | 'coach-thinking'
  | 'user-text';

interface ChatMsg {
  id: string;
  kind: ChatMsgKind;
  content: string;
  meta?: { qIdx?: number };
}

const TOTAL = BLUEPRINT_QUESTIONS.length;

type DayCode = 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa';
const DAY_ORDER: DayCode[] = ['M', 'T', 'W', 'Th', 'F', 'Sa'];
const DAY_LABEL: Record<DayCode, string> = { M: 'Lu', T: 'Ma', W: 'Mi', Th: 'Jo', F: 'Vi', Sa: 'Sâ' };
const JS_TO_CODE: Record<number, DayCode | 'Su'> = { 0: 'Su', 1: 'M', 2: 'T', 3: 'W', 4: 'Th', 5: 'F', 6: 'Sa' };

function getDefaultDay(): DayCode {
  const now = new Date();
  const todayCode = JS_TO_CODE[now.getDay()];
  const useToday = now.getHours() < 18 && todayCode !== 'Su';
  if (useToday && (DAY_ORDER as string[]).includes(todayCode)) return todayCode as DayCode;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tCode = JS_TO_CODE[tomorrow.getDay()];
  if ((DAY_ORDER as string[]).includes(tCode)) return tCode as DayCode;
  return 'M';
}

const uid = () => `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const MentalitateStackFlow: React.FC<Props> = ({
  mode,
  deepDiveAxis,
  source = 'stack_page',
  onComplete,
  onSkip,
}) => {
  const [session, setSession] = useState<MentalitateSession | null>(null);
  const [starting, setStarting] = useState(false);

  // qIdx 0 = situation; 1..14 questions; TOTAL+1 = schedule; TOTAL+2 = done
  const [qIdx, setQIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState('');

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);

  // Synthesis result
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [synthesizing, setSynthesizing] = useState(false);

  // Schedule
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget>('door');
  const [scheduleDays, setScheduleDays] = useState<DayCode[]>([getDefaultDay()]);
  const [schedulePriority, setSchedulePriority] = useState<SchedulePriority>('important');

  // Suggestions
  const [distortionSuggestions, setDistortionSuggestions] = useState<{ label: string; why: string }[]>([]);
  const [loadingDistortions, setLoadingDistortions] = useState(false);
  const distortionsFetchedRef = useRef(false);
  const [answerSuggestions, setAnswerSuggestions] = useState<{ label: string; hint: string }[]>([]);
  const [loadingAnswerSuggestions, setLoadingAnswerSuggestions] = useState(false);
  const answerSuggestionsFetchedRef = useRef<Record<number, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const phaseAnswersForAI = useMemo(() => {
    const sit = answers['q0'];
    return { ...(sit ? { situation: sit, q0: sit } : {}), ...answers };
  }, [answers]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy, synthesizing, qIdx]);

  // Keep focus on textarea
  useEffect(() => {
    if (qIdx <= TOTAL && !synthesizing && !busy) {
      inputRef.current?.focus();
    }
  }, [qIdx, busy, synthesizing]);

  const pushMsg = useCallback((m: Omit<ChatMsg, 'id'>) => {
    setMessages((prev) => [...prev, { ...m, id: uid() }]);
  }, []);

  // ============ INIT: post intro message (guarded against StrictMode double-mount) ============
  const initedRef = useRef(false);
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    const introLines: string[] = [];
    introLines.push(
      '👋 Bună. Sunt coach-ul tău mental. Vom face împreună o **Reconstrucție** în 5 faze, ~15 întrebări (~10–15 min). La final ai un gând nou realist și o acțiune programată.'
    );
    if (mode === 'deep_dive' && deepDiveAxis) {
      introLines.push(
        `🎯 **Deep-Dive: ${AXIS_LABELS_RO[deepDiveAxis]?.name ?? deepDiveAxis}** — întrebările vor fi reformulate prin lentila acestei axe.`
      );
    }
    introLines.push('Hai să începem cu **contextul**: descrie pe scurt situația care te-a declanșat.');
    pushMsg({ kind: 'coach-text', content: introLines.join('\n\n') });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ Fetch distortion suggestions at Q5 ============
  useEffect(() => {
    if (!session || qIdx !== 5 || distortionsFetchedRef.current) return;
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
  }, [session, qIdx, mode, deepDiveAxis, phaseAnswersForAI]);

  // ============ Generic answer suggestions per question ============
  useEffect(() => {
    if (!session || qIdx < 1 || qIdx > TOTAL) return;
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
  }, [session, qIdx]);

  const ensureSession = async (): Promise<MentalitateSession | null> => {
    if (session) return session;
    setStarting(true);
    try {
      const s = await mentalitateStackService.startSession(mode, deepDiveAxis, source);
      setSession(s);
      return s;
    } catch (e) {
      console.error(e);
      toast.error('Nu am putut porni sesiunea.');
      return null;
    } finally {
      setStarting(false);
    }
  };

  const postNextQuestionMsg = (nextIdx: number) => {
    const q = getBlueprintQuestion(nextIdx, mode === 'deep_dive' ? deepDiveAxis : undefined);
    const phase = BLUEPRINT_PHASES.find((p) => p.id === q.phase)!;
    pushMsg({
      kind: 'coach-question',
      content: `**Faza ${phase.id} · ${phase.title}** — Întrebarea ${nextIdx}/${TOTAL}\n\n${q.text}\n\n_${q.helper}_`,
      meta: { qIdx: nextIdx },
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || busy || synthesizing) return;

    // Q0 = situation
    if (qIdx === 0) {
      pushMsg({ kind: 'user-text', content: text });
      setInput('');
      setBusy(true);
      const s = await ensureSession();
      if (!s) { setBusy(false); return; }
      const next = { ...answers, q0: text };
      setAnswers(next);
      try { await mentalitateStackService.saveAnswer(s.id, 0, text); } catch {}
      pushMsg({ kind: 'coach-text', content: '✅ Înțeles. Hai în **Faza 1**.' });
      postNextQuestionMsg(1);
      setQIdx(1);
      setBusy(false);
      return;
    }

    // Q1..TOTAL
    if (qIdx >= 1 && qIdx <= TOTAL) {
      pushMsg({ kind: 'user-text', content: text });
      setInput('');
      setBusy(true);
      const newAnswers = { ...answers, [`q${qIdx}`]: text };
      setAnswers(newAnswers);
      try {
        if (session) await mentalitateStackService.saveAnswer(session.id, qIdx, text);
      } catch {}

      if (qIdx >= TOTAL) {
        // Move to schedule
        pushMsg({
          kind: 'coach-schedule',
          content: text, // draft action (q14) for display
        });
        setQIdx(TOTAL + 1);
        setBusy(false);
        return;
      }

      // Get reflection
      try {
        const r = await mentalitateStackService.callCoach({
          step: 'reflect',
          sessionId: session!.id,
          mode,
          deepDiveAxis,
          phaseAnswers: { ...(newAnswers.q0 ? { situation: newAnswers.q0, q0: newAnswers.q0 } : {}), ...newAnswers },
          currentQuestionIndex: qIdx,
        });
        if (r?.reflection) {
          pushMsg({ kind: 'coach-reflection', content: r.reflection });
        }
      } catch {
        // silent
      }
      postNextQuestionMsg(qIdx + 1);
      setQIdx(qIdx + 1);
      setBusy(false);
    }
  };

  const runFinalize = async () => {
    if (!session) return;
    setSynthesizing(true);
    setScheduleError(null);
    pushMsg({ kind: 'coach-thinking', content: 'Procesez blueprint-ul tău...' });
    try {
      const result: Synthesis = await mentalitateStackService.callCoach({
        step: 'finalize',
        sessionId: session.id,
        mode,
        deepDiveAxis,
        phaseAnswers: phaseAnswersForAI,
      });
      setSynthesis(result);
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
      if (schedErr) {
        toast.error(`Acțiunea nu a fost salvată: ${schedErr}`);
      } else {
        toast.success('Sesiunea a fost salvată în istoric.');
      }
      // Remove the "thinking" message
      setMessages((prev) => prev.filter((m) => m.kind !== 'coach-thinking'));
      pushMsg({ kind: 'coach-text', content: '✨ Gata. Sinteza ta e mai jos.' });
      setQIdx(TOTAL + 2);
      onComplete?.(saved);
    } catch (e: any) {
      console.error('[mentalitate] finalize failed:', e);
      const msg = e?.message ?? String(e);
      setMessages((prev) => prev.filter((m) => m.kind !== 'coach-thinking'));
      let errText = `Nu am putut finaliza sinteza: ${msg}`;
      if (msg === 'credits_exhausted') errText = 'Credite AI epuizate. Adaugă credite din Settings → Workspace → Usage.';
      else if (msg === 'rate_limit') errText = 'Limită atinsă. Așteaptă puțin și reîncearcă.';
      pushMsg({ kind: 'coach-error', content: errText });
      toast.error(errText);
    } finally {
      setSynthesizing(false);
    }
  };

  const toggleDay = (d: DayCode) => {
    setScheduleDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  // ============ Render helpers ============

  const CoachAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
      <Brain className="w-4 h-4 text-violet-500" />
    </div>
  );
  const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
      <UserIcon className="w-4 h-4 text-primary-foreground" />
    </div>
  );

  const renderMessage = (m: ChatMsg) => {
    if (m.kind === 'user-text') {
      return (
        <div key={m.id} className="flex gap-2 justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2 text-sm whitespace-pre-wrap leading-relaxed">
            {m.content}
          </div>
          <UserAvatar />
        </div>
      );
    }

    if (m.kind === 'coach-thinking') {
      return (
        <div key={m.id} className="flex gap-2">
          <CoachAvatar />
          <div className="rounded-2xl rounded-tl-sm bg-violet-500/5 border border-violet-500/20 px-3.5 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-violet-500/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-violet-500/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-violet-500/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] text-muted-foreground ml-2">{m.content}</span>
            </div>
          </div>
        </div>
      );
    }

    if (m.kind === 'coach-error') {
      return (
        <div key={m.id} className="flex gap-2">
          <CoachAvatar />
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-rose-500/5 border border-rose-500/30 px-3.5 py-2.5 space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{m.content}</p>
            </div>
            <Button size="sm" variant="outline" onClick={runFinalize} className="h-7 text-xs">
              <RefreshCw className="w-3 h-3 mr-1" /> Reîncearcă sinteza
            </Button>
          </div>
        </div>
      );
    }

    if (m.kind === 'coach-schedule') {
      const draftAction = m.content;
      return (
        <div key={m.id} className="flex gap-2">
          <CoachAvatar />
          <div className="max-w-[90%] w-full rounded-2xl rounded-tl-sm bg-violet-500/5 border border-violet-500/20 px-4 py-3 space-y-3">
            <p className="text-sm leading-relaxed">
              Bun. Acțiunea ta este:
            </p>
            {draftAction && (
              <div className="rounded-lg border border-border/60 bg-background/60 p-2.5 text-sm font-medium">
                {draftAction}
              </div>
            )}
            <p className="text-sm leading-relaxed">**Unde o salvez?**</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                { id: 'door', label: 'Domino Door', sub: 'Task săptămâna asta' },
                { id: 'ideas', label: 'Ideas Bank', sub: 'Idee pentru mai târziu' },
                { id: 'none', label: 'Nu salva', sub: 'Doar reflecție' },
              ] as { id: ScheduleTarget; label: string; sub: string }[]).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setScheduleTarget(opt.id)}
                  disabled={synthesizing}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-left transition-colors',
                    scheduleTarget === opt.id
                      ? 'border-violet-500/70 bg-violet-500/15'
                      : 'border-border/60 bg-background/40 hover:border-violet-500/40'
                  )}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground">{opt.sub}</div>
                </button>
              ))}
            </div>

            {scheduleTarget === 'door' && (
              <>
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Pe ce zile?</div>
                  <div className="flex flex-wrap gap-1.5">
                    {DAY_ORDER.map((d) => {
                      const selected = scheduleDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(d)}
                          disabled={synthesizing}
                          className={cn(
                            'rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors',
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
                  <p className="text-[10px] text-muted-foreground italic">
                    Default: azi dacă e înainte de 18:00, altfel mâine.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Prioritate</div>
                  <div className="flex gap-1.5">
                    {(['hot', 'important', 'normal'] as SchedulePriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSchedulePriority(p)}
                        disabled={synthesizing}
                        className={cn(
                          'rounded-md border px-2.5 py-1 text-xs font-semibold capitalize transition-colors',
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

            <Button
              onClick={runFinalize}
              disabled={synthesizing || (scheduleTarget === 'door' && scheduleDays.length === 0)}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white"
              size="sm"
            >
              {synthesizing ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Procesez...</>
              ) : (
                <>Generează sinteza <Sparkles className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      );
    }

    // coach-text, coach-question, coach-reflection
    const isReflection = m.kind === 'coach-reflection';
    return (
      <div key={m.id} className="flex gap-2">
        <CoachAvatar />
        <div className={cn(
          'max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap',
          isReflection
            ? 'bg-violet-500/10 border border-violet-500/25'
            : 'bg-muted/60'
        )}>
          {isReflection && (
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 mb-1">
              <Sparkles className="w-3 h-3" /> Reflecție
            </div>
          )}
          {renderMarkdownLite(m.content)}
        </div>
      </div>
    );
  };

  // very small **bold** + _italic_ + paragraphs
  const renderMarkdownLite = (text: string) => {
    const parts = text.split('\n\n');
    return parts.map((p, i) => (
      <p key={i} className={i > 0 ? 'mt-2' : ''}>
        {p.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((seg, j) => {
          if (seg.startsWith('**') && seg.endsWith('**')) {
            return <strong key={j}>{seg.slice(2, -2)}</strong>;
          }
          if (seg.startsWith('_') && seg.endsWith('_')) {
            return <em key={j} className="text-muted-foreground">{seg.slice(1, -1)}</em>;
          }
          return <React.Fragment key={j}>{seg}</React.Fragment>;
        })}
      </p>
    ));
  };

  // ============ Composer placeholder per stage ============
  const composerPlaceholder = (() => {
    if (qIdx === 0) return 'Povestește pe scurt situația care te-a declanșat...';
    if (qIdx >= 1 && qIdx <= TOTAL) {
      const q = getBlueprintQuestion(qIdx, mode === 'deep_dive' ? deepDiveAxis : undefined);
      return q.placeholder || 'Scrie răspunsul tău...';
    }
    return '';
  })();

  const composerDisabled = busy || synthesizing || qIdx > TOTAL;

  // Suggestions to show above composer for current qIdx
  const showDistortions = qIdx === 5 && (loadingDistortions || distortionSuggestions.length > 0);
  const showAnswerSugg = qIdx >= 1 && qIdx <= TOTAL && qIdx !== 5 && (loadingAnswerSuggestions || answerSuggestions.length > 0);

  const progress = qIdx === 0 ? 0 : qIdx > TOTAL ? 100 : ((qIdx - 1) / TOTAL) * 100;

  return (
    <div className="space-y-3">
      {/* Sticky header */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-violet-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">Reconstrucția Mentală</h3>
                <p className="text-[11px] text-muted-foreground truncate">
                  {qIdx === 0 && 'Pasul 0 · Context'}
                  {qIdx >= 1 && qIdx <= TOTAL && (() => {
                    const q = getBlueprintQuestion(qIdx, mode === 'deep_dive' ? deepDiveAxis : undefined);
                    const phase = BLUEPRINT_PHASES.find((p) => p.id === q.phase)!;
                    return `Faza ${phase.id} · ${phase.title} — ${qIdx}/${TOTAL}`;
                  })()}
                  {qIdx === TOTAL + 1 && 'Programare acțiune'}
                  {qIdx === TOTAL + 2 && 'Finalizat'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'deep_dive' && deepDiveAxis && (
                <Badge variant="outline" className="text-[10px] border-violet-500/40 text-violet-600 dark:text-violet-400">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  {AXIS_LABELS_RO[deepDiveAxis]?.name ?? deepDiveAxis}
                </Badge>
              )}
              {onSkip && qIdx < TOTAL + 1 && (
                <Button size="sm" variant="ghost" onClick={onSkip}>Skip</Button>
              )}
            </div>
          </div>
          <div className="h-1 rounded-full bg-violet-500/10 overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat transcript */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div
            ref={scrollRef}
            className="px-3 py-4 space-y-3 overflow-y-auto"
            style={{ minHeight: '380px', maxHeight: '60vh' }}
          >
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {renderMessage(m)}
                </motion.div>
              ))}
            </AnimatePresence>

            {busy && (
              <div className="flex gap-2">
                <CoachAvatar />
                <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions strip */}
          {(showDistortions || showAnswerSugg) && (
            <div className="px-3 pb-2 border-t border-border/40 pt-2 space-y-2">
              {showDistortions && (
                <>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400">
                    <Sparkles className="w-3 h-3" />
                    {loadingDistortions ? 'Coach-ul analizează...' : 'Sugestii distorsiuni probabile'}
                  </div>
                  {loadingDistortions ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" /> Se identifică...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {distortionSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setInput((prev) => prev ? `${prev}${prev.endsWith(' ') ? '' : ' '}+ ${s.label}` : s.label)}
                          className="text-left rounded-md border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/15 hover:border-violet-500/60 transition-colors px-2.5 py-1.5 text-xs max-w-[260px]"
                          title={s.why}
                        >
                          <div className="font-semibold">{s.label}</div>
                          <div className="text-[10px] text-muted-foreground leading-snug">{s.why}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {showAnswerSugg && (
                <>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400">
                    <Sparkles className="w-3 h-3" />
                    {loadingAnswerSuggestions ? 'Coach-ul pregătește sugestii...' : 'Sugestii rapide'}
                  </div>
                  {loadingAnswerSuggestions ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" /> Se generează...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {answerSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setInput(s.label)}
                          className="text-left rounded-md border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/15 hover:border-violet-500/60 transition-colors px-2.5 py-1.5 text-xs max-w-[260px]"
                          title={s.hint}
                        >
                          <div className="font-medium">{s.label}</div>
                          {s.hint && <div className="text-[10px] text-muted-foreground leading-snug">{s.hint}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Composer */}
          <div className="p-3 border-t border-border bg-background/40">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={composerDisabled ? (qIdx > TOTAL ? 'Folosește butoanele de mai sus.' : 'Așteaptă...') : composerPlaceholder}
                disabled={composerDisabled}
                className="min-h-[52px] max-h-[160px] text-sm resize-none flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={composerDisabled || !input.trim() || starting}
                size="icon"
                className="bg-violet-500 hover:bg-violet-600 text-white h-[52px] w-[52px] shrink-0"
              >
                {busy || starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
              Enter = trimite · Shift+Enter = linie nouă
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Synthesis card (shown after completion) */}
      {synthesis && qIdx === TOTAL + 2 && (
        <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-violet-500/5">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Reconstrucție finalizată ✨</h2>
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
                    AI-ul nu a putut genera sinteza. Am folosit fallback. Poți reîncerca.
                  </p>
                  <Button size="sm" variant="outline" onClick={runFinalize} className="h-7 text-xs">
                    <RefreshCw className="w-3 h-3 mr-1" /> Reîncearcă sinteza AI
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400">Gândul nou — realist</div>
              <p className="text-sm leading-relaxed">{synthesis.reframe}</p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400">
                <Target className="w-3 h-3" /> Acțiunea programată
              </div>
              <p className="text-sm font-semibold leading-relaxed">{synthesis.action}</p>
              {scheduleError ? (
                <p className="text-xs text-rose-500">⚠ {scheduleError}</p>
              ) : scheduleTarget === 'door' ? (
                <p className="text-xs text-muted-foreground">
                  ✓ Adăugat în Domino Door · {scheduleDays.map((d) => DAY_LABEL[d]).join(', ')} · prioritate {schedulePriority}
                </p>
              ) : scheduleTarget === 'ideas' ? (
                <p className="text-xs text-muted-foreground">✓ Salvat în Ideas Bank</p>
              ) : (
                <p className="text-xs text-muted-foreground">Doar reflecție.</p>
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
      )}
    </div>
  );
};
