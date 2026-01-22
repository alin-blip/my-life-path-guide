import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Flame, Sword, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  WARRIOR_POWER_QUESTIONS, 
  DIMENSION_INFO,
  type WarriorPowerScores,
} from '@/data/warriorPowerQuestions';

interface WarriorPowerQuizProps {
  onComplete: (scores: WarriorPowerScores) => void;
}

// Level configurations
const LEVEL_CONFIG = {
  ADORMIT: {
    icon: '💤',
    gradient: 'from-red-600 to-red-800',
    bg: 'bg-red-950/60',
    border: 'border-red-500/50',
    text: 'text-red-400',
    range: [1, 2, 3]
  },
  TREAZ: {
    icon: '👁️',
    gradient: 'from-yellow-500 to-orange-600',
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    range: [4, 5, 6]
  },
  ACTIV: {
    icon: '⚡',
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-950/60',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    range: [7, 8, 9]
  },
  ACCELERAT: {
    icon: '🔥',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-950/60',
    border: 'border-green-500/50',
    text: 'text-green-400',
    range: [10, 11, 12]
  }
};

export function WarriorPowerQuiz({ onComplete }: WarriorPowerQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Partial<WarriorPowerScores>>({});

  const currentQuestion = WARRIOR_POWER_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / WARRIOR_POWER_QUESTIONS.length) * 100;
  const dimensionInfo = DIMENSION_INFO[currentQuestion.dimension];

  // Select score and auto-advance
  const handleScoreSelect = (score: number) => {
    const newScores = {
      ...scores,
      [currentQuestion.id]: score
    };
    setScores(newScores);

    // Visual feedback then advance
    setTimeout(() => {
      if (currentIndex < WARRIOR_POWER_QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete(newScores as WarriorPowerScores);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white px-3 sm:px-4 py-4 sm:py-6 safe-area-bottom">
      {/* Progress Header */}
      <div className="max-w-2xl mx-auto mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sword className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm text-white/70">
              {currentIndex + 1}/{WARRIOR_POWER_QUESTIONS.length}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-medium" style={{ color: dimensionInfo.color }}>
            {dimensionInfo.icon} {currentQuestion.dimensionName}
          </span>
        </div>
        <Progress value={progress} className="h-1.5 sm:h-2" />
      </div>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-2 sm:mb-3"
                style={{ backgroundColor: `${dimensionInfo.color}20` }}
              >
                <span className="text-lg sm:text-xl">{dimensionInfo.icon}</span>
                <span className="font-semibold text-xs sm:text-sm uppercase tracking-wider" style={{ color: dimensionInfo.color }}>
                  {currentQuestion.dimensionName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-2 px-2">
                {currentQuestion.section}
              </h2>
              <p className="text-xs sm:text-sm text-white/60 px-2">
                {currentQuestion.sectionDescription}
              </p>
            </div>

            {/* Level Cards with Descriptions */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {currentQuestion.levels.map((level, idx) => {
                const levelKey = level.name.toUpperCase() as keyof typeof LEVEL_CONFIG;
                const config = LEVEL_CONFIG[levelKey];
                if (!config) return null;
                
                const currentScore = scores[currentQuestion.id as keyof WarriorPowerScores];
                const hasScoreInThisLevel = currentScore && config.range.includes(currentScore);
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={cn(
                      "rounded-xl sm:rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                      hasScoreInThisLevel
                        ? `${config.border} ${config.bg} shadow-xl` 
                        : "border-white/20 bg-white/5 hover:border-white/40"
                    )}
                  >
                    {/* Level Card with inline score buttons */}
                    <div className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                      {/* Icon Badge */}
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl",
                        hasScoreInThisLevel
                          ? `bg-gradient-to-br ${config.gradient}` 
                          : "bg-white/10"
                      )}>
                        {config.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                          <span className={cn(
                            "font-bold text-sm sm:text-base uppercase tracking-wide",
                            hasScoreInThisLevel ? config.text : "text-white/90"
                          )}>
                            {level.name}
                          </span>
                          <span className="text-[10px] sm:text-xs text-white/50">
                            [{level.range.join('-')}]
                          </span>
                          {hasScoreInThisLevel && (
                            <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold">
                              <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {currentScore}
                            </span>
                          )}
                        </div>
                        {/* Titlu nivel */}
                        <p className={cn(
                          "text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1",
                          hasScoreInThisLevel ? "text-white" : "text-white/80"
                        )}>
                          {level.title}
                        </p>
                        {/* Descriere completă */}
                        <p className={cn(
                          "text-xs sm:text-sm leading-relaxed",
                          hasScoreInThisLevel ? "text-white/90" : "text-white/70"
                        )}>
                          {level.description}
                        </p>

                        {/* Quick Score Buttons - Always visible under the description */}
                        <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2">
                          {config.range.map((score) => (
                            <motion.button
                              key={score}
                              whileHover={{ scale: 1.06 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => handleScoreSelect(score)}
                              className={cn(
                                "h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold text-sm sm:text-base transition-all",
                                currentScore === score
                                  ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg ring-2 ring-white/30`
                                  : `${config.bg} ${config.text} border ${config.border} hover:brightness-125`
                              )}
                            >
                              {score}
                            </motion.button>
                          ))}
                          <span className="text-xs sm:text-sm text-white/50 ml-1">
                            — selectează nivelul tău
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Back Button */}
            {currentIndex > 0 && (
              <div className="flex justify-center pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="gap-2 text-white/60 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Întrebarea anterioară
                </Button>
              </div>
            )}

            {/* Last question with score - show complete button */}
            {currentIndex === WARRIOR_POWER_QUESTIONS.length - 1 && 
             scores[currentQuestion.id as keyof WarriorPowerScores] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6"
              >
                <Button
                  onClick={() => onComplete(scores as WarriorPowerScores)}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 font-bold px-8"
                >
                  <Flame className="h-4 w-4" />
                  Vezi Rezultatele
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
