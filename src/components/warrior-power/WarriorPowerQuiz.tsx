import { useState, useEffect, useRef } from 'react';
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

// Level configurations - Light theme
const LEVEL_CONFIG = {
  ADORMIT: {
    icon: '💤',
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-600',
    range: [1, 2, 3]
  },
  TREAZ: {
    icon: '👁️',
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-600',
    range: [4, 5, 6]
  },
  ACTIV: {
    icon: '⚡',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-600',
    range: [7, 8, 9]
  },
  ACCELERAT: {
    icon: '🔥',
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-600',
    range: [10, 11, 12]
  }
};

const AUTOSAVE_KEY = 'warrior_power_quiz_draft_v1';

export function WarriorPowerQuiz({ onComplete }: WarriorPowerQuizProps) {
  const hydrated = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Partial<WarriorPowerScores>>({});

  // Restore in-progress draft (autosave)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.scores && typeof parsed.scores === 'object') {
            setScores(parsed.scores);
          }
          if (
            typeof parsed.currentIndex === 'number' &&
            parsed.currentIndex >= 0 &&
            parsed.currentIndex < WARRIOR_POWER_QUESTIONS.length
          ) {
            setCurrentIndex(parsed.currentIndex);
          }
        }
      }
    } catch {}
    hydrated.current = true;
  }, []);

  // Persist draft on every change
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(
        AUTOSAVE_KEY,
        JSON.stringify({ currentIndex, scores, savedAt: Date.now() })
      );
    } catch {}
  }, [currentIndex, scores]);

  const currentQuestion = WARRIOR_POWER_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / WARRIOR_POWER_QUESTIONS.length) * 100;
  const dimensionInfo = DIMENSION_INFO[currentQuestion.dimension];

  const clearDraft = () => {
    try { localStorage.removeItem(AUTOSAVE_KEY); } catch {}
  };

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
        clearDraft();
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
    <div className="w-full min-h-screen bg-white text-foreground px-3 sm:px-4 py-4 sm:py-6 safe-area-bottom font-['Montserrat',sans-serif]">
      {/* Progress Header */}
      <div className="max-w-2xl mx-auto mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sword className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm text-gray-500">
              {currentIndex + 1}/{WARRIOR_POWER_QUESTIONS.length}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-medium" style={{ color: dimensionInfo.color }}>
            {dimensionInfo.icon} {currentQuestion.dimensionName}
          </span>
        </div>
        <Progress value={progress} className="h-1.5 sm:h-2 bg-gray-200" />
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
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 px-2">
                {currentQuestion.section}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 px-2">
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
                        ? `${config.border} ${config.bg} shadow-lg` 
                        : "border-gray-200 bg-white hover:border-gray-400"
                    )}
                  >
                    {/* Level Card with inline score buttons */}
                    <div className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                      {/* Icon Badge */}
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl",
                        hasScoreInThisLevel
                          ? `bg-gradient-to-br ${config.gradient} text-white` 
                          : "bg-gray-100"
                      )}>
                        {config.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                          <span className={cn(
                            "font-bold text-sm sm:text-base uppercase tracking-wide",
                            hasScoreInThisLevel ? config.text : "text-gray-900"
                          )}>
                            {level.name}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500">
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
                          hasScoreInThisLevel ? "text-gray-900" : "text-gray-800"
                        )}>
                          {level.title}
                        </p>
                        {/* Descriere completă */}
                        <p className={cn(
                          "text-xs sm:text-sm leading-relaxed",
                          hasScoreInThisLevel ? "text-gray-800" : "text-gray-500"
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
                                  ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg ring-2 ring-primary/30`
                                  : `${config.bg} ${config.text} border ${config.border} hover:brightness-95`
                              )}
                            >
                              {score}
                            </motion.button>
                          ))}
                          <span className="text-xs sm:text-sm text-gray-500 ml-1">
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
              <div className="flex justify-center pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="gap-2 text-gray-500 hover:text-gray-900"
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
                  onClick={() => { clearDraft(); onComplete(scores as WarriorPowerScores); }}
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
