import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertTriangle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  PSDQ_ITEMS,
  scorePSDQ,
  TOXIC_PATTERN_LABELS,
  type PSDQScores,
} from '@/data/parentingPSDQ';
import { useParentingChildren, useParentingProfile } from '@/hooks/useParenting';
import { getAgeContext, parentingService } from '@/services/parentingService';

const LIKERT_RO = [
  { v: 1, label: 'Niciodată' },
  { v: 2, label: 'Rar' },
  { v: 3, label: 'Uneori' },
  { v: 4, label: 'Des' },
  { v: 5, label: 'Mereu' },
];
const LIKERT_EN = [
  { v: 1, label: 'Never' },
  { v: 2, label: 'Rarely' },
  { v: 3, label: 'Sometimes' },
  { v: 4, label: 'Often' },
  { v: 5, label: 'Always' },
];

const PAGE_SIZE = 6;

const STYLE_LABELS: Record<string, { ro: string; en: string; color: string }> = {
  authoritative: { ro: 'Autoritar-Democratic (Authoritative)', en: 'Authoritative', color: 'text-green-600' },
  authoritarian: { ro: 'Autoritarian', en: 'Authoritarian', color: 'text-red-600' },
  permissive:    { ro: 'Permisiv',      en: 'Permissive',    color: 'text-amber-600' },
  neglectful:    { ro: 'Neimplicat',    en: 'Neglectful',    color: 'text-red-700' },
  mixed:         { ro: 'Mixt',          en: 'Mixed',         color: 'text-muted-foreground' },
};

const ParentingToxicityScan: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { children } = useParentingChildren();
  const { profile } = useParentingProfile();
  const lang: 'ro' | 'en' = profile?.preferred_language || 'ro';
  const likert = lang === 'en' ? LIKERT_EN : LIKERT_RO;

  const [childId, setChildId] = useState<string | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<'select' | 'questions' | 'submitting' | 'result'>(
    children.length > 0 ? 'select' : 'select',
  );
  const [scores, setScores] = useState<PSDQScores | null>(null);
  const [interpretation, setInterpretation] = useState('');
  const [actionPlan, setActionPlan] = useState<Array<{ title: string; why: string; how: string }>>([]);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const restoredRef = useRef(false);

  // ============= AUTOSAVE (localStorage draft per user+child) =============
  const draftKey = useMemo(() => `parenting-toxicity-draft:${childId || 'none'}`, [childId]);

  // Restore draft when childId changes / on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed.answers || {});
          setPageIdx(typeof parsed.pageIdx === 'number' ? parsed.pageIdx : 0);
          if (parsed.savedAt) setSavedAt(new Date(parsed.savedAt));
          restoredRef.current = true;
          return;
        }
      }
      // no draft — reset
      setAnswers({});
      setPageIdx(0);
      setSavedAt(null);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Autosave on any answer / page change while in questions phase
  useEffect(() => {
    if (phase !== 'questions') return;
    if (Object.keys(answers).length === 0 && pageIdx === 0 && !restoredRef.current) return;
    try {
      const now = new Date();
      localStorage.setItem(
        draftKey,
        JSON.stringify({ answers, pageIdx, savedAt: now.toISOString() }),
      );
      setSavedAt(now);
    } catch {
      // ignore quota errors
    }
  }, [answers, pageIdx, phase, draftKey]);


  const pages = useMemo(() => {
    const out: typeof PSDQ_ITEMS[] = [];
    for (let i = 0; i < PSDQ_ITEMS.length; i += PAGE_SIZE) {
      out.push(PSDQ_ITEMS.slice(i, i + PAGE_SIZE));
    }
    return out;
  }, []);

  const total = PSDQ_ITEMS.length;
  const answeredCount = Object.keys(answers).length;
  const currentPage = pages[pageIdx] || [];
  const currentAnswered = currentPage.every((it) => answers[it.id] != null);
  const isLastPage = pageIdx === pages.length - 1;

  const startScan = () => {
    // Keep any restored draft; only start fresh if there is none
    const hasDraft = Object.keys(answers).length > 0;
    if (!hasDraft) {
      setPageIdx(0);
      setAnswers({});
    }
    setPhase('questions');
  };

  const clearDraft = () => {
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    setAnswers({});
    setPageIdx(0);
    setSavedAt(null);
    restoredRef.current = false;
  };


  const submit = async () => {
    setPhase('submitting');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(lang === 'en' ? 'Not authenticated' : 'Nu ești autentificat');

      const computed = scorePSDQ(answers);
      setScores(computed);

      const saved = await parentingService.saveToxicityScan(user.id, {
        child_id: childId,
        raw_answers: answers,
        authoritative_score: computed.authoritative,
        authoritarian_score: computed.authoritarian,
        permissive_score: computed.permissive,
        neglectful_score: computed.neglectful,
        dominant_style: computed.dominant_style,
        toxic_patterns: computed.toxic_patterns,
      });

      let childCtx;
      if (childId) {
        const c = children.find((x) => x.id === childId);
        if (c) {
          const ctx = getAgeContext(c.birth_year, c.birth_month);
          childCtx = {
            name: c.name,
            age: ctx.age,
            piaget: ctx.piagetLabel[lang],
            erikson: ctx.eriksonLabel[lang],
          };
        }
      }

      const ai = await parentingService.analyzeToxicity({
        scan_id: saved.id,
        language: lang,
        child_context: childCtx,
      });

      setInterpretation(ai.interpretation || '');
      setActionPlan(ai.action_plan || []);
      setPhase('result');
      // Clear draft after successful submission
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      setSavedAt(null);
    } catch (e) {

      toast({
        title: lang === 'en' ? 'Scan failed' : 'Scanarea a eșuat',
        description: (e as Error).message,
        variant: 'destructive',
      });
      setPhase('questions');
    }
  };

  // ============= RENDER =============

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/parenting')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {lang === 'en' ? 'Back' : 'Înapoi'}
          </Button>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {lang === 'en' ? 'Toxicity Scan (PSDQ)' : 'Scanare Toxicitate (PSDQ)'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === 'en'
                ? 'Robinson et al. (1995) Parenting Styles Questionnaire + 6 validated toxic patterns. ~3 min. Honest answers only.'
                : 'Chestionar Robinson et al. (1995) + 6 tipare toxice validate. ~3 min. Răspunde onest.'}
            </p>
          </div>
        </div>

        {/* PHASE: select child */}
        {phase === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {lang === 'en' ? 'Which child is this scan about?' : 'Pentru ce copil este această scanare?'}
              </CardTitle>
              <CardDescription>
                {lang === 'en'
                  ? 'Optional. If you have multiple children, scan each separately — patterns often differ per child.'
                  : 'Opțional. Dacă ai mai mulți copii, scanează-i separat — tiparele diferă adesea pe copil.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup value={childId || 'none'} onValueChange={(v) => setChildId(v === 'none' ? null : v)}>
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  <RadioGroupItem value="none" id="child-none" />
                  <Label htmlFor="child-none" className="cursor-pointer flex-1">
                    {lang === 'en' ? 'General (no specific child)' : 'General (fără copil specific)'}
                  </Label>
                </div>
                {children.map((c) => {
                  const ctx = getAgeContext(c.birth_year, c.birth_month);
                  return (
                    <div key={c.id} className="flex items-center gap-2 p-3 rounded-lg border">
                      <RadioGroupItem value={c.id} id={`child-${c.id}`} />
                      <Label htmlFor={`child-${c.id}`} className="cursor-pointer flex-1 flex items-center justify-between">
                        <span>{c.name}</span>
                        <Badge variant="secondary">
                          {ctx.age} {lang === 'en' ? 'y' : 'ani'} · {ctx.ageBand}
                        </Badge>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              {answeredCount > 0 && phase === 'select' && (
                <div className="flex items-center justify-between text-xs bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                  <span className="text-primary flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'en'
                      ? `Draft saved — ${answeredCount}/${total} answered`
                      : `Draft salvat — ${answeredCount}/${total} răspunse`}
                  </span>
                  <button
                    type="button"
                    onClick={clearDraft}
                    className="text-muted-foreground hover:text-destructive underline"
                  >
                    {lang === 'en' ? 'Discard' : 'Șterge'}
                  </button>
                </div>
              )}
              <Button size="lg" className="w-full mt-2" onClick={startScan}>
                {answeredCount > 0
                  ? (lang === 'en' ? 'Resume scan' : 'Reia scanarea')
                  : (lang === 'en' ? 'Start the scan' : 'Începe scanarea')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

            </CardContent>
          </Card>
        )}

        {/* PHASE: questions */}
        {phase === 'questions' && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {lang === 'en' ? 'Question' : 'Întrebarea'} {pageIdx * PAGE_SIZE + 1}–
                  {Math.min((pageIdx + 1) * PAGE_SIZE, total)} / {total}
                </span>
                <span className="flex items-center gap-2">
                  {savedAt && (
                    <span className="text-primary/80 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {lang === 'en' ? 'Autosaved' : 'Salvat automat'}
                    </span>
                  )}
                  <span>{answeredCount}/{total}</span>
                </span>
              </div>
              <Progress value={(answeredCount / total) * 100} />
            </div>


            <div className="space-y-4">
              {currentPage.map((item, i) => {
                const num = pageIdx * PAGE_SIZE + i + 1;
                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium leading-relaxed">
                        <span className="text-muted-foreground mr-2">{num}.</span>
                        {lang === 'en' ? item.en : item.ro}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={answers[item.id]?.toString() || ''}
                        onValueChange={(v) => setAnswers((prev) => ({ ...prev, [item.id]: parseInt(v, 10) }))}
                        className="flex flex-wrap gap-3"
                      >
                        {likert.map((opt) => (
                          <div key={opt.v} className="flex items-center gap-1.5">
                            <RadioGroupItem value={opt.v.toString()} id={`${item.id}-${opt.v}`} />
                            <Label htmlFor={`${item.id}-${opt.v}`} className="text-xs cursor-pointer">
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                disabled={pageIdx === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> {lang === 'en' ? 'Previous' : 'Înapoi'}
              </Button>
              {!isLastPage ? (
                <Button onClick={() => setPageIdx((p) => p + 1)} disabled={!currentAnswered}>
                  {lang === 'en' ? 'Next' : 'Continuă'} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={answeredCount < total}>
                  {lang === 'en' ? 'See results' : 'Vezi rezultatele'} <CheckCircle2 className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </>
        )}

        {/* PHASE: submitting */}
        {phase === 'submitting' && (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                {lang === 'en'
                  ? 'Scoring PSDQ + generating your evidence-based interpretation…'
                  : 'Calculez scorul PSDQ + generez interpretarea evidence-based…'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* PHASE: result */}
        {phase === 'result' && scores && (
          <div className="space-y-5">
            {/* Dominant style */}
            <Card>
              <CardHeader>
                <CardDescription>{lang === 'en' ? 'Dominant style' : 'Stil dominant'}</CardDescription>
                <CardTitle className={`text-2xl ${STYLE_LABELS[scores.dominant_style].color}`}>
                  {STYLE_LABELS[scores.dominant_style][lang]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['authoritative', 'authoritarian', 'permissive', 'neglectful'] as const).map((s) => (
                  <div key={s}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{STYLE_LABELS[s][lang]}</span>
                      <span className="text-muted-foreground">{scores[s]}%</span>
                    </div>
                    <Progress value={scores[s]} className="h-2" />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  {lang === 'en'
                    ? 'Baumrind (1971) + Maccoby & Martin (1983). Authoritative style is consistently linked with best long-term outcomes (Lamborn et al. 1991, n=2,353).'
                    : 'Baumrind (1971) + Maccoby & Martin (1983). Stilul autoritar-democratic (authoritative) e consistent asociat cu cele mai bune rezultate pe termen lung (Lamborn et al. 1991, n=2.353).'}
                </p>
              </CardContent>
            </Card>

            {/* Toxic patterns */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <CardTitle className="text-base">
                    {lang === 'en' ? 'Toxic patterns detected' : 'Tipare toxice detectate'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.keys(scores.toxic_patterns) as Array<keyof typeof scores.toxic_patterns>).map((k) => {
                  const v = scores.toxic_patterns[k];
                  const meta = TOXIC_PATTERN_LABELS[k];
                  const color = v >= 75 ? 'text-red-600' : v >= 50 ? 'text-amber-600' : 'text-muted-foreground';
                  return (
                    <div key={k}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div>
                          <span className="font-medium">{meta[lang]}</span>
                          <span className="text-muted-foreground ml-2 text-[10px]">— {meta.source}</span>
                        </div>
                        <span className={`font-semibold ${color}`}>{v}%</span>
                      </div>
                      <Progress value={v} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI interpretation */}
            {interpretation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {lang === 'en' ? 'Interpretation (Alin)' : 'Interpretare (Alin)'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{interpretation}</div>
                </CardContent>
              </Card>
            )}

            {/* Action plan */}
            {actionPlan.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {lang === 'en' ? 'Action plan (this week)' : 'Plan de acțiune (săptămâna aceasta)'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {actionPlan.map((a, i) => (
                    <div key={i} className="rounded-lg border p-3 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{a.title}</div>
                          <div className="text-xs text-muted-foreground italic mt-0.5">{a.why}</div>
                          <div className="text-sm mt-2">{a.how}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Alert>
              <AlertTitle>{lang === 'en' ? 'Not a clinical diagnosis' : 'Nu e diagnostic clinic'}</AlertTitle>
              <AlertDescription className="text-xs">
                {lang === 'en'
                  ? 'PSDQ is a self-report screener, not a clinical assessment. If you suspect abuse, harm, or a mental health crisis, contact a licensed professional.'
                  : 'PSDQ este un chestionar de auto-evaluare, nu o evaluare clinică. Dacă suspectezi abuz, rănire sau criză de sănătate mentală, contactează un profesionist autorizat.'}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/parenting')} className="flex-1">
                {lang === 'en' ? 'Back to Hub' : 'Înapoi la Hub'}
              </Button>
              <Button onClick={startScan} className="flex-1">
                {lang === 'en' ? 'New scan' : 'Scanare nouă'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParentingToxicityScan;
