import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Sparkles, Zap, ChevronRight, Heart, Brain, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ExtendedEmotionPicker, MindCoachEmotion, getEmotionInfo, MIND_COACH_EMOTIONS } from '@/components/mind-coach/ExtendedEmotionPicker';
import { MindCoachChat } from '@/components/mind-coach/MindCoachChat';

interface EmotionalCheckUnifiedStepProps {
  emotion: MindCoachEmotion | null;
  intensity: number;
  onEmotionChange: (emotion: MindCoachEmotion) => void;
  onIntensityChange: (intensity: number) => void;
  onComplete: (data: { emotion: MindCoachEmotion; intensity: number; stackCompleted?: boolean; transformedEnergy?: string }) => void;
  onSkip: () => void;
}

const POSITIVE_EMOTIONS: MindCoachEmotion[] = ['happy', 'calm', 'enthusiastic', 'natural', 'motivated'];
const NEGATIVE_EMOTIONS: MindCoachEmotion[] = ['angry', 'sad', 'anxious', 'stressed', 'overwhelmed', 'procrastinating', 'stuck', 'distracted', 'conflicted'];

type Phase = 'emotion' | 'choice' | 'mind-coach';

export function EmotionalCheckUnifiedStep({
  emotion,
  intensity,
  onEmotionChange,
  onIntensityChange,
  onComplete,
  onSkip
}: EmotionalCheckUnifiedStepProps) {
  const [phase, setPhase] = useState<Phase>('emotion');
  
  const needsTransformation = emotion && (NEGATIVE_EMOTIONS.includes(emotion) || intensity < 4);
  const emotionInfo = emotion ? getEmotionInfo(emotion) : null;
  const canProceed = emotion !== null;

  const handleEmotionComplete = () => {
    if (needsTransformation) {
      // For negative emotions, go directly to Mind Coach
      setPhase('mind-coach');
    } else {
      // Good mood - offer choice
      setPhase('choice');
    }
  };

  const handleMindCoachComplete = (breakthrough?: any) => {
    // Nu mai apelăm automat onComplete - așteptăm ca utilizatorul să aleagă manual
    // Breakthrough-ul este salvat și utilizatorul va apăsa "Continuă Rutina"
    console.log('Mind Coach completed:', breakthrough);
  };

  // Handler pentru butonul "Continuă Rutina"
  const handleContinueRoutine = () => {
    onComplete({ 
      emotion: emotion!, 
      intensity, 
      stackCompleted: true,
      transformedEnergy: 'transformed'
    });
  };

  // Handler pentru butonul "Altă Sesiune"
  const handleNewSession = () => {
    setPhase('emotion');
  };

  const handleSkipStack = () => {
    onComplete({ 
      emotion: emotion!, 
      intensity, 
      stackCompleted: false 
    });
  };

  // Mind Coach running inline
  if (phase === 'mind-coach' && emotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
          )}>
            <Brain className="w-4 h-4" />
            <span>Mind Coach - Transformare</span>
          </div>
        </div>

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
              onBack={() => setPhase('emotion')}
            />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Phase Indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
          phase === 'emotion' 
            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30" 
            : "bg-muted/50 text-muted-foreground"
        )}>
          <Heart className="w-4 h-4" />
          <span>Emoție</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
          phase === 'choice' || phase === 'mind-coach'
            ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30" 
            : "bg-muted/50 text-muted-foreground"
        )}>
          <Brain className="w-4 h-4" />
          <span>Transformare</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'emotion' && (
          <motion.div
            key="emotion"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
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
                      Cum te simți în această dimineață?
                    </span>
                    <p className="text-muted-foreground text-sm font-normal mt-0.5">
                      Onestitatea cu tine însuți este primul pas
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                {/* Extended Emotion Picker */}
                <ExtendedEmotionPicker
                  selectedEmotion={emotion}
                  onSelect={onEmotionChange}
                  language="ro"
                />

                {/* Intensity Slider */}
                {emotion && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2"
                  >
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-muted-foreground">
                        Intensitate
                      </label>
                      <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        {intensity}/10
                      </span>
                    </div>
                    <Slider
                      value={[intensity]}
                      onValueChange={(values) => onIntensityChange(values[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Slabă</span>
                      <span>Moderată</span>
                      <span>Foarte intensă</span>
                    </div>
                  </motion.div>
                )}

                {/* Feedback */}
                {emotion && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-4 rounded-xl border-2 backdrop-blur-sm",
                      needsTransformation 
                        ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30' 
                        : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                    )}
                  >
                    {needsTransformation ? (
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        </motion.div>
                        <div>
                          <p className="font-medium text-amber-600 dark:text-amber-400">
                            Hai să transformăm această stare în putere!
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Mind Coach-ul te va ghida prin procesul Tony Robbins de transformare.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <Sparkles className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        </motion.div>
                        <div>
                          <p className="font-medium text-green-600 dark:text-green-400">
                            Minunat! Ești într-o stare excelentă! {emotionInfo?.emoji}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Poți amplifica această energie sau continua direct.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Continue Button */}
                <Button
                  onClick={handleEmotionComplete}
                  disabled={!canProceed}
                  className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25"
                  size="lg"
                >
                  {needsTransformation ? (
                    <>
                      <Flame className="h-4 w-4" />
                      Începe Transformarea
                    </>
                  ) : (
                    <>
                      Continuă
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 bg-gradient-to-br from-background via-background to-green-500/5 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
              <CardHeader className="pb-4 relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <motion.div
                    className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <span className="text-2xl filter drop-shadow">✨</span>
                  </motion.div>
                  <div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                      Excelent! {emotionInfo?.emoji}
                    </span>
                    <p className="text-muted-foreground text-sm font-normal mt-0.5">
                      Starea ta: {emotionInfo?.labelRo || emotion} ({intensity}/10)
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                {/* Option: Amplify with Mind Coach */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setPhase('mind-coach')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 border-transparent",
                    "bg-gradient-to-r hover:border-primary/30 transition-all",
                    "flex items-center gap-4 text-left group",
                    "hover:shadow-lg hover:scale-[1.02]"
                  )}
                  style={{
                    background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 100%)`,
                  }}
                >
                  <motion.div
                    className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-2xl">🧠</span>
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Amplifică cu Mind Coach
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Extinde această energie în toate ariile vieții
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.button>

                {/* Skip Button */}
                <div className="pt-2">
                  <Button
                    onClick={handleSkipStack}
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continuă la rutină
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
