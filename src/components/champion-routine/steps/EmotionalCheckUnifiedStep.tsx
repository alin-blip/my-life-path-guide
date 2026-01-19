import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { EmotionPicker, Emotion, getEmotionInfo } from '@/components/emotional/EmotionPicker';
import { ArrowRight, Sparkles, Zap, ChevronRight, Heart, Brain, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { InlineStackWrapper } from './InlineStackWrapper';

// Stack types available for selection
const QUICK_STACKS = [
  { id: 'divine-prayer', name: 'Rugăciune Divină', emoji: '🙏', color: 'from-purple-500 to-indigo-600', description: 'Conectare spirituală profundă' },
  { id: 'divine-gratitude', name: 'Recunoștință', emoji: '💛', color: 'from-amber-500 to-orange-600', description: 'Cultivă starea de mulțumire' },
  { id: 'adaptive-transform', name: 'Transformare', emoji: '⚡', color: 'from-red-500 to-pink-600', description: 'Transformă emoția în putere' },
];

interface EmotionalCheckUnifiedStepProps {
  emotion: Emotion | null;
  intensity: number;
  onEmotionChange: (emotion: Emotion) => void;
  onIntensityChange: (intensity: number) => void;
  onComplete: (data: { emotion: Emotion; intensity: number; stackCompleted?: boolean; transformedEnergy?: string }) => void;
  onSkip: () => void;
}

const POSITIVE_EMOTIONS: Emotion[] = ['happy', 'calm', 'excited'];
const NEGATIVE_EMOTIONS: Emotion[] = ['angry', 'sad', 'anxious', 'stressed'];

type Phase = 'emotion' | 'stack' | 'running';

export function EmotionalCheckUnifiedStep({
  emotion,
  intensity,
  onEmotionChange,
  onIntensityChange,
  onComplete,
  onSkip
}: EmotionalCheckUnifiedStepProps) {
  const [phase, setPhase] = useState<Phase>('emotion');
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  
  const needsTransformation = emotion && (NEGATIVE_EMOTIONS.includes(emotion) || intensity < 4);
  const emotionInfo = emotion ? getEmotionInfo(emotion) : null;
  const canProceed = emotion !== null;

  const handleEmotionComplete = () => {
    if (needsTransformation) {
      setPhase('stack');
    } else {
      // Good mood - offer optional stack or continue
      setPhase('stack');
    }
  };

  const handleStackSelect = (stackId: string) => {
    setSelectedStack(stackId);
    setPhase('running');
  };

  const handleStackComplete = () => {
    onComplete({ 
      emotion: emotion!, 
      intensity, 
      stackCompleted: true 
    });
  };

  const handleSkipStack = () => {
    onComplete({ 
      emotion: emotion!, 
      intensity, 
      stackCompleted: false 
    });
  };

  // Running stack inline
  if (phase === 'running' && selectedStack) {
    return (
      <InlineStackWrapper
        stackType={selectedStack}
        emotion={emotion}
        intensity={intensity}
        onComplete={handleStackComplete}
        onBack={() => {
          setSelectedStack(null);
          setPhase('stack');
        }}
        onAddToHitList={(action) => {
          console.log('Add to hit list:', action);
        }}
      />
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
          phase === 'stack' 
            ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30" 
            : "bg-muted/50 text-muted-foreground"
        )}>
          <Brain className="w-4 h-4" />
          <span>Stack</span>
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
                {/* Emotion Picker */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Selectează emoția dominantă
                  </label>
                  <EmotionPicker
                    value={emotion}
                    onChange={onEmotionChange}
                    language="ro"
                  />
                </div>

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
                            Te voi ghida printr-un proces de transformare emoțională.
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
                            Poți amplifica această energie cu un stack rapid.
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
                  Continuă
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === 'stack' && (
          <motion.div
            key="stack"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 bg-gradient-to-br from-background via-background to-purple-500/5 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5" />
              <CardHeader className="pb-4 relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <motion.div
                    className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <span className="text-2xl filter drop-shadow">✨</span>
                  </motion.div>
                  <div>
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                      {needsTransformation ? 'Alege un Stack de Transformare' : 'Amplifică-ți Energia'}
                    </span>
                    <p className="text-muted-foreground text-sm font-normal mt-0.5">
                      Starea actuală: {emotionInfo?.emoji} {emotionInfo?.label || emotion} ({intensity}/10)
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                {/* Quick Stacks */}
                <div className="grid gap-3">
                  {QUICK_STACKS.map((stack, index) => (
                    <motion.button
                      key={stack.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleStackSelect(stack.id)}
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
                        className={cn("p-3 rounded-xl bg-gradient-to-br shadow-lg", stack.color)}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <span className="text-2xl">{stack.emoji}</span>
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {stack.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {stack.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>

                {/* Skip Button */}
                <div className="pt-2">
                  <Button
                    onClick={handleSkipStack}
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Continuă fără stack
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
