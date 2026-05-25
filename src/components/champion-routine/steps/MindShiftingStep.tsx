import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Sparkles, Target, ChevronRight, Wind, Lightbulb, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ExtendedEmotionPicker, MindCoachEmotion } from '@/components/mind-coach/ExtendedEmotionPicker';
import {
  mindShiftService,
  MindShiftBelief,
  MindShiftDistortion,
  MindShiftSession,
  AISuggestions,
} from '@/services/mindShiftService';

type Phase = 'state' | 'observe' | 'reframe' | 'activate' | 'commit' | 'done';

interface MindShiftingStepProps {
  onComplete?: (session: MindShiftSession) => void;
  onSkip?: () => void;
  initialSituation?: string;
  source?: string;
}

export const MindShiftingStep: React.FC<MindShiftingStepProps> = ({
  onComplete,
  onSkip,
  initialSituation,
  source = 'routine',
}) => {
  const [phase, setPhase] = useState<Phase>('state');
  const [beliefs, setBeliefs] = useState<MindShiftBelief[]>([]);
  const [distortions, setDistortions] = useState<MindShiftDistortion[]>([]);
  const [loadingLibs, setLoadingLibs] = useState(true);

  const [emotion, setEmotion] = useState<MindCoachEmotion | null>(null);
  const [intensity, setIntensity] = useState(50);

  const [situation, setSituation] = useState(initialSituation ?? '');
  const [automaticThought, setAutomaticThought] = useState('');
  const [distortionSlug, setDistortionSlug] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [ai, setAi] = useState<AISuggestions | null>(null);

  const [cognitiveReframe, setCognitiveReframe] = useState('');
  const [positiveReframe, setPositiveReframe] = useState('');
  const [actValue, setActValue] = useState('');

  const [beliefSlug, setBeliefSlug] = useState<string | null>(null);
  const [incantation, setIncantation] = useState('');

  const [commitment, setCommitment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [b, d] = await Promise.all([
          mindShiftService.loadBeliefs(),
          mindShiftService.loadDistortions(),
        ]);
        setBeliefs(b);
        setDistortions(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLibs(false);
      }
    })();
  }, []);

  const selectedBelief = beliefs.find((b) => b.slug === beliefSlug);
  const selectedDistortion = distortions.find((d) => d.slug === distortionSlug);

  const requestAI = async () => {
    setAiLoading(true);
    try {
      const result = await mindShiftService.fetchAISuggestions({
        emotion: emotion ?? undefined,
        intensity,
        situation,
        automatic_thought: automaticThought,
        distortion_slug: distortionSlug ?? undefined,
      });
      if (!result) {
        toast.error('AI indisponibil acum. Completează manual.');
        return;
      }
      setAi(result);
      setCognitiveReframe(result.cognitive_reframe);
      setPositiveReframe(result.positive_reframe);
      setActValue(result.act_value);
      if (!distortionSlug && result.suggested_distortion_slug) {
        setDistortionSlug(result.suggested_distortion_slug);
      }
      setBeliefSlug(result.recommended_belief_slug);
      setIncantation(result.personalized_incantation);
    } catch (e: any) {
      console.error(e);
      toast.error('Nu am putut obține sugestii AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const goReframe = async () => {
    if (!automaticThought.trim()) {
      toast.error('Scrie gândul automat care te apasă acum.');
      return;
    }
    setPhase('reframe');
    if (!ai) requestAI();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await mindShiftService.saveSession(
        {
          emotion,
          intensity,
          situation: situation.trim() || null,
          automatic_thought: automaticThought.trim() || null,
          distortion_slug: distortionSlug,
          cognitive_reframe: cognitiveReframe.trim() || null,
          positive_reframe: positiveReframe.trim() || null,
          act_value: actValue.trim() || null,
          belief_slug: beliefSlug,
          incantation_text: incantation.trim() || null,
          commitment_text: commitment.trim() || null,
          ai_suggestions: ai,
          source,
        },
        { createTask: !!commitment.trim() }
      );
      toast.success('Mind Shift salvat ✨', {
        description: commitment.trim() ? 'Acțiunea a fost adăugată în Door.' : undefined,
      });
      setPhase('done');
      onComplete?.(saved);
    } catch (e: any) {
      console.error(e);
      toast.error('Eroare la salvare.');
    } finally {
      setSaving(false);
    }
  };

  const phases: Phase[] = ['state', 'observe', 'reframe', 'activate', 'commit'];
  const currentIdx = phases.indexOf(phase);

  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Mind Shifting</h3>
              <p className="text-xs text-muted-foreground">Observe · Name · Reframe · Activate · Commit</p>
            </div>
          </div>
          {phase !== 'done' && onSkip && (
            <Button size="sm" variant="ghost" onClick={onSkip}>Skip</Button>
          )}
        </div>

        {/* Progress dots */}
        {phase !== 'done' && (
          <div className="flex gap-1.5">
            {phases.map((p, i) => (
              <div
                key={p}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i <= currentIdx ? 'bg-violet-500' : 'bg-violet-500/15'
                )}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* PHASE 1: STATE */}
          {phase === 'state' && (
            <motion.div key="state" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wind className="w-4 h-4 text-violet-500" />
                <span>1. State — Cum te simți acum?</span>
              </div>
              <ExtendedEmotionPicker
                selectedEmotion={emotion}
                onSelect={setEmotion}
              />
              {emotion && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Intensitate</span>
                    <span className="font-semibold text-foreground">{intensity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>
              )}
              <Button
                disabled={!emotion}
                onClick={() => setPhase('observe')}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white"
              >
                Continuă <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* PHASE 2: OBSERVE & NAME */}
          {phase === 'observe' && (
            <motion.div key="observe" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4 text-violet-500" />
                <span>2. Observe & Name — Ce gând te apasă?</span>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Situația (opțional)</label>
                <Textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder='ex: „M-am certat cu partenerul de business."'
                  className="min-h-[60px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Gândul automat *</label>
                <Textarea
                  value={automaticThought}
                  onChange={(e) => setAutomaticThought(e.target.value)}
                  placeholder='ex: „Nimic nu o să mai meargă fără el."'
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Numește distorsiunea (opțional — AI o poate sugera)</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {loadingLibs ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    distortions.map((d) => (
                      <Badge
                        key={d.slug}
                        variant={distortionSlug === d.slug ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer text-xs',
                          distortionSlug === d.slug && 'bg-violet-500 hover:bg-violet-600'
                        )}
                        onClick={() => setDistortionSlug(distortionSlug === d.slug ? null : d.slug)}
                      >
                        {d.name}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPhase('state')} className="flex-1">Înapoi</Button>
                <Button onClick={goReframe} className="flex-[2] bg-violet-500 hover:bg-violet-600 text-white">
                  Reframe cu AI <Sparkles className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: REFRAME */}
          {phase === 'reframe' && (
            <motion.div key="reframe" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>3. Reframe — Răspunde gândului</span>
              </div>
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-xs">Coach-ul tău procesează...</p>
                </div>
              ) : (
                <>
                  {selectedDistortion && (
                    <div className="text-xs rounded-md bg-violet-500/10 px-3 py-2 border border-violet-500/20">
                      <span className="font-semibold">{selectedDistortion.name}:</span> {selectedDistortion.short_description}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Cognitive Reframe (rațional)</label>
                    <Textarea value={cognitiveReframe} onChange={(e) => setCognitiveReframe(e.target.value)} className="min-h-[70px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Positive Reframe (constructiv)</label>
                    <Textarea value={positiveReframe} onChange={(e) => setPositiveReframe(e.target.value)} className="min-h-[60px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Valoarea ACT (ghidează acțiunea)</label>
                    <input
                      value={actValue}
                      onChange={(e) => setActValue(e.target.value)}
                      placeholder="ex: curaj, integritate, conexiune"
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={requestAI} disabled={aiLoading}>
                      <Sparkles className="w-4 h-4 mr-1" /> Re-sugestii
                    </Button>
                    <Button onClick={() => setPhase('activate')} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
                      Continuă <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* PHASE 4: ACTIVATE */}
          {phase === 'activate' && (
            <motion.div key="activate" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Brain className="w-4 h-4 text-violet-500" />
                <span>4. Activate — Credința zilei</span>
              </div>
              {selectedBelief && (
                <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-violet-600 dark:text-violet-400">{selectedBelief.name}</h4>
                    <Badge variant="outline" className="text-[10px]">Recomandat AI</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedBelief.short_description}</p>
                  <p className="text-sm italic">"{selectedBelief.activation_prompt}"</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Incantație (citește-o cu voce tare, de 3 ori)</label>
                <Textarea
                  value={incantation}
                  onChange={(e) => setIncantation(e.target.value)}
                  className="min-h-[80px] font-semibold uppercase tracking-wide text-center bg-violet-500/5 border-violet-500/30"
                />
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">Schimbă credința manual</summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {beliefs.map((b) => (
                    <Badge
                      key={b.slug}
                      variant={beliefSlug === b.slug ? 'default' : 'outline'}
                      className={cn('cursor-pointer text-xs', beliefSlug === b.slug && 'bg-violet-500')}
                      onClick={() => {
                        setBeliefSlug(b.slug);
                        setIncantation(b.incantation);
                      }}
                    >
                      {b.name}
                    </Badge>
                  ))}
                </div>
              </details>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPhase('reframe')} className="flex-1">Înapoi</Button>
                <Button onClick={() => setPhase('commit')} className="flex-[2] bg-violet-500 hover:bg-violet-600 text-white">
                  Continuă <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* PHASE 5: COMMIT */}
          {phase === 'commit' && (
            <motion.div key="commit" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="w-4 h-4 text-violet-500" />
                <span>5. Commit — Acțiunea zilei</span>
              </div>
              <p className="text-xs text-muted-foreground">
                O singură acțiune concretă în următoarele 24h. Se adaugă automat în Door pentru azi.
              </p>
              <Textarea
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                placeholder='ex: „Sun partenerul și cer 15 minute pentru o discuție onestă."'
                className="min-h-[90px]"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPhase('activate')} className="flex-1" disabled={saving}>
                  Înapoi
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                  Salvează & trimite în Door
                </Button>
              </div>
            </motion.div>
          )}

          {/* DONE */}
          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 py-6">
              <CheckCircle2 className="w-12 h-12 text-violet-500 mx-auto" />
              <h4 className="font-semibold">Mind Shift complet</h4>
              <p className="text-sm text-muted-foreground">
                Citește-ți incantația de 3 ori și acționează. Coach-ul tău vede sesiunea de seară.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
