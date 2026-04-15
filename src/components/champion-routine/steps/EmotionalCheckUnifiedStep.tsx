import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Sparkles, Zap, ChevronRight, Heart, Brain, Flame, Wind, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ExtendedEmotionPicker, MindCoachEmotion, getEmotionInfo, MIND_COACH_EMOTIONS } from '@/components/mind-coach/ExtendedEmotionPicker';
import { MindCoachChat } from '@/components/mind-coach/MindCoachChat';
import { supabase } from '@/integrations/supabase/client';
import { getISOWeek, getYear, startOfWeek } from 'date-fns';
import { toast } from 'sonner';

interface EmotionalCheckUnifiedStepProps {
  emotion: MindCoachEmotion | null;
  intensity: number;
  onEmotionChange: (emotion: MindCoachEmotion) => void;
  onIntensityChange: (intensity: number) => void;
  onComplete: (data: { emotion: MindCoachEmotion; intensity: number; stackCompleted?: boolean; transformedEnergy?: string; story?: string }) => void;
  onSkip: () => void;
}

const POSITIVE_EMOTIONS: MindCoachEmotion[] = ['happy', 'calm', 'enthusiastic', 'natural', 'motivated'];
const NEGATIVE_EMOTIONS: MindCoachEmotion[] = ['angry', 'sad', 'anxious', 'stressed', 'overwhelmed', 'procrastinating', 'stuck', 'distracted', 'conflicted'];

type Phase = 'breathe' | 'emotion' | 'power' | 'mind-coach';
type BreathPhase = 'inhale' | 'hold' | 'exhale';

const POWER_PHRASES: Record<string, { incantation: string; emoji: string }> = {
  happy: { incantation: 'EU SUNT RECUNOSCĂTOR.\nEU CREEZ ABUNDENȚĂ.', emoji: '🔥' },
  calm: { incantation: 'EU SUNT PREZENT.\nEU CREEZ CLARITATE.', emoji: '🧘' },
  enthusiastic: { incantation: 'EU SUNT ENERGIE PURĂ.\nEU CREEZ IMPACTUL PE CARE ÎL MERIT.', emoji: '⚡' },
  excited: { incantation: 'EU SUNT ENERGIE PURĂ.\nEU CREEZ IMPACTUL PE CARE ÎL MERIT.', emoji: '⚡' },
  motivated: { incantation: 'EU SUNT IMPARABIL.\nEU EXECUT CU PUTERE.', emoji: '💪' },
  natural: { incantation: 'EU SUNT ECHILIBRAT.\nEU CREEZ ARMONIE ÎN TOT CE FAC.', emoji: '🌊' },
};

const BREATH_DURATION = { inhale: 4000, hold: 4000, exhale: 4000 };

function BreathingCircle({ onComplete }: { onComplete: () => void }) {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (cycleCount >= 1) {
      onComplete();
      return;
    }

    const sequence: { phase: BreathPhase; duration: number }[] = [
      { phase: 'inhale', duration: BREATH_DURATION.inhale },
      { phase: 'hold', duration: BREATH_DURATION.hold },
      { phase: 'exhale', duration: BREATH_DURATION.exhale },
    ];

    let currentIndex = 0;
    setBreathPhase(sequence[0].phase);

    const advance = () => {
      currentIndex++;
      if (currentIndex >= sequence.length) {
        setCycleCount(prev => prev + 1);
        return;
      }
      setBreathPhase(sequence[currentIndex].phase);
      timeout = setTimeout(advance, sequence[currentIndex].duration);
    };

    let timeout = setTimeout(advance, sequence[0].duration);
    return () => clearTimeout(timeout);
  }, [cycleCount, onComplete]);

  const phaseLabels: Record<BreathPhase, string> = {
    inhale: 'Inspiră adânc...',
    hold: 'Ține...',
    exhale: 'Expiră încet...',
  };

  const circleScale = breathPhase === 'inhale' ? 1.4 : breathPhase === 'hold' ? 1.4 : 1;

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      {/* Posture instruction */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-muted-foreground text-center font-medium uppercase tracking-wider"
      >
        Stai drept. Umerii înapoi. Privirea sus.
      </motion.p>

      {/* Breathing Circle */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl"
          animate={{ scale: circleScale }}
          transition={{ duration: breathPhase === 'hold' ? 0.3 : BREATH_DURATION[breathPhase] / 1000, ease: 'easeInOut' }}
        />
        {/* Main circle */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-2 border-amber-500/50"
          animate={{ scale: circleScale }}
          transition={{ duration: breathPhase === 'hold' ? 0.3 : BREATH_DURATION[breathPhase] / 1000, ease: 'easeInOut' }}
        />
        {/* Inner circle */}
        <motion.div
          className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/40"
          animate={{ scale: circleScale * 0.85 }}
          transition={{ duration: breathPhase === 'hold' ? 0.3 : BREATH_DURATION[breathPhase] / 1000, ease: 'easeInOut' }}
        >
          <Wind className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      {/* Phase text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={breathPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xl font-bold text-foreground"
        >
          {phaseLabels[breathPhase]}
        </motion.p>
      </AnimatePresence>

      {/* Skip */}
      {canSkip && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" size="sm" onClick={onComplete} className="text-muted-foreground text-xs">
            Treci mai departe →
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export function EmotionalCheckUnifiedStep({
  emotion,
  intensity,
  onEmotionChange,
  onIntensityChange,
  onComplete,
  onSkip
}: EmotionalCheckUnifiedStepProps) {
  const [phase, setPhase] = useState<Phase>('breathe');
  const [story, setStory] = useState('');
  const [incantationConfirmed, setIncantationConfirmed] = useState(false);

  const needsTransformation = emotion && (NEGATIVE_EMOTIONS.includes(emotion) || intensity < 4);
  const emotionInfo = emotion ? getEmotionInfo(emotion) : null;

  const handleBreathComplete = useCallback(() => {
    setPhase('emotion');
  }, []);

  // After selecting emotion, go directly to next phase
  const handleEmotionSelect = useCallback((selectedEmotion: MindCoachEmotion) => {
    onEmotionChange(selectedEmotion);
    const isNegative = NEGATIVE_EMOTIONS.includes(selectedEmotion);
    // Small delay for visual feedback
    setTimeout(() => {
      if (isNegative) {
        setPhase('mind-coach');
      } else {
        setPhase('power');
      }
    }, 400);
  }, [onEmotionChange]);

  const handleIncantationConfirm = () => {
    setIncantationConfirmed(true);
    // Small celebration delay
    setTimeout(() => {
      onComplete({
        emotion: emotion!,
        intensity,
        stackCompleted: false,
        story: story || undefined,
      });
    }, 800);
  };

  const handleGoToMindCoach = () => {
    setPhase('mind-coach');
  };

  const handleMindCoachComplete = (breakthrough?: any) => {
    console.log('Mind Coach completed:', breakthrough);
  };

  const handleContinueRoutine = () => {
    onComplete({
      emotion: emotion!,
      intensity,
      stackCompleted: true,
      transformedEnergy: 'transformed',
      story: story || undefined,
    });
  };

  const handleNewSession = () => {
    setPhase('emotion');
  };

  const handleAddToHitList = async (task: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekNum = getISOWeek(weekStart);
      const year = getYear(weekStart);
      const weekKey = `door-week-${year}-${String(weekNum).padStart(2, '0')}`;

      const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
      const todayAbbrev = days[now.getDay()];

      await supabase.from('user_tasks').insert({
        user_id: user.id,
        title: task,
        task_type: 'hit',
        list_type: 'hit',
        day_of_week: todayAbbrev,
        week_key: weekKey,
        priority: 1,
        completed: false,
      });

      toast.success('Acțiune adăugată în HIT List! 🎯');
    } catch (error) {
      console.error('Error adding to HIT list:', error);
      toast.error('Eroare la adăugarea în HIT List');
    }
  };

  const handleSkipStack = () => {
    onComplete({
      emotion: emotion!,
      intensity,
      stackCompleted: false,
      story: story || undefined,
    });
  };

  const powerPhrase = emotion ? POWER_PHRASES[emotion] || POWER_PHRASES['natural'] : POWER_PHRASES['natural'];

  // ========== BREATHE PHASE ==========
  if (phase === 'breathe') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Phase Indicator */}
        <PhaseIndicator current="breathe" />

        <Card className="border-0 bg-gradient-to-br from-background via-background to-amber-500/5 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="flex items-center gap-3 text-xl">
              <motion.div
                className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <span className="text-2xl filter drop-shadow">⚡</span>
              </motion.div>
              <div>
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
                  Pregătește-ți corpul
                </span>
                <p className="text-muted-foreground text-sm font-normal mt-0.5">
                  Schimbarea stării începe cu fiziologia
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <BreathingCircle onComplete={handleBreathComplete} />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ========== MIND COACH PHASE ==========
  if (phase === 'mind-coach' && emotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <PhaseIndicator current="mind-coach" />

        {/* Preparation message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 text-center"
        >
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            🫁 Corpul tău e pregătit. Acum hai să transformăm mintea.
          </p>
        </motion.div>

        <Card className="border-0 bg-gradient-to-br from-background via-background to-amber-500/5 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <MindCoachChat
              initialEmotion={emotion}
              initialIntensity={intensity}
              embedded={true}
              showNavigationButtons={true}
              onContinueRoutine={handleContinueRoutine}
              onNewSession={handleNewSession}
              onComplete={handleMindCoachComplete}
              onAddToHitList={handleAddToHitList}
              onBack={() => setPhase('emotion')}
            />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ========== POWER PHASE (positive emotions) ==========
  if (phase === 'power' && emotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <PhaseIndicator current="power" />

        <Card className="border-0 bg-gradient-to-br from-background via-background to-amber-500/5 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
          <CardHeader className="pb-4 relative">
            <CardTitle className="flex items-center gap-3 text-xl">
              <motion.div
                className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <span className="text-2xl filter drop-shadow">{powerPhrase.emoji}</span>
              </motion.div>
              <div>
                <span className="bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent font-bold">
                  Incantația Puterii
                </span>
                <p className="text-muted-foreground text-sm font-normal mt-0.5">
                  Spune cu voce tare, din piept, cu convingere totală
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* Incantation Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-red-500/10 border-2 border-amber-500/40 text-center"
            >
              {/* Decorative corners */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/60 rounded-tr" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/60 rounded-bl" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/60 rounded-br" />

              <Volume2 className="w-5 h-5 text-amber-500 mx-auto mb-3" />

              {powerPhrase.incantation.split('\n').map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="text-xl md:text-2xl font-black text-foreground tracking-wide leading-relaxed"
                >
                  {line}
                </motion.p>
              ))}

              <p className="text-sm text-muted-foreground mt-4 italic">
                Repetă de 3 ori, crescând volumul
              </p>
            </motion.div>

            {/* Confirmation */}
            <AnimatePresence>
              {!incantationConfirmed ? (
                <motion.div className="space-y-3">
                  <Button
                    onClick={handleIncantationConfirm}
                    className="w-full gap-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 shadow-lg shadow-amber-500/25 text-lg py-6"
                    size="lg"
                  >
                    <Flame className="h-5 w-5" />
                    AM SPUS-O! 🔥
                  </Button>

                  {/* Option to go deeper */}
                  <Button
                    onClick={handleGoToMindCoach}
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground text-sm"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Vreau o sesiune mai profundă cu Mind Coach
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl mb-2"
                  >
                    🔥
                  </motion.div>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    PUTERE ACTIVATĂ!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Continuăm cu rutina...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ========== EMOTION PHASE ==========
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <PhaseIndicator current="emotion" />

      <Card className="border-0 bg-gradient-to-br from-background via-background to-amber-500/5 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
        <CardHeader className="pb-4 relative">
          <CardTitle className="flex items-center gap-3 text-xl">
            <motion.div
              className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <span className="text-2xl filter drop-shadow">🌅</span>
            </motion.div>
            <div>
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
                Ce simți acum?
              </span>
              <p className="text-muted-foreground text-sm font-normal mt-0.5">
                Selectează și mergem direct la transformare
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {/* Extended Emotion Picker — selecting auto-advances */}
          <ExtendedEmotionPicker
            selectedEmotion={emotion}
            onSelect={handleEmotionSelect}
            language="ro"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ========== Phase Indicator Component ==========
function PhaseIndicator({ current }: { current: Phase }) {
  const phases = [
    { id: 'breathe' as Phase, icon: Wind, label: 'Corp' },
    { id: 'emotion' as Phase, icon: Heart, label: 'Emoție' },
    { id: 'power' as Phase, icon: Flame, label: 'Putere' },
  ];

  const isMindCoach = current === 'mind-coach';
  const activeIndex = isMindCoach ? 2 : phases.findIndex(p => p.id === current);

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {phases.map((p, i) => {
        const Icon = p.icon;
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        const showMindCoachLabel = isMindCoach && i === 2;

        return (
          <React.Fragment key={p.id}>
            {i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              isActive
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : isDone
                  ? "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20"
                  : "bg-muted/50 text-muted-foreground"
            )}>
              <Icon className="w-4 h-4" />
              <span>{showMindCoachLabel ? 'Mind Coach' : p.label}</span>
              {isDone && <span className="text-xs">✓</span>}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
