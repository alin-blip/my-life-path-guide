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
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

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
        setExpandedLevel(null);
      } else {
        onComplete(newScores as WarriorPowerScores);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setExpandedLevel(null);
    }
  };

  const handleLevelClick = (levelName: string) => {
    setExpandedLevel(expandedLevel === levelName ? null : levelName);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 py-6">
      {/* Progress Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sword className="h-4 w-4 text-primary" />
            <span className="text-sm text-white/70">
              Întrebarea {currentIndex + 1} din {WARRIOR_POWER_QUESTIONS.length}
            </span>
          </div>
          <span className="text-sm font-medium" style={{ color: dimensionInfo.color }}>
            {dimensionInfo.icon} {currentQuestion.dimensionName}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
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
            <div className="text-center mb-6">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
                style={{ backgroundColor: `${dimensionInfo.color}20` }}
              >
                <span className="text-xl">{dimensionInfo.icon}</span>
                <span className="font-semibold text-sm uppercase tracking-wider" style={{ color: dimensionInfo.color }}>
                  {currentQuestion.dimensionName}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                {currentQuestion.section}
              </h2>
              <p className="text-sm text-white/60">
                {currentQuestion.sectionDescription}
              </p>
            </div>

            {/* Level Cards with Descriptions */}
            <div className="space-y-3 mb-6">
              {currentQuestion.levels.map((level, idx) => {
                const levelKey = level.name.toUpperCase() as keyof typeof LEVEL_CONFIG;
                const config = LEVEL_CONFIG[levelKey];
                if (!config) return null;
                
                const isExpanded = expandedLevel === level.name;
                const currentScore = scores[currentQuestion.id as keyof WarriorPowerScores];
                const hasScoreInThisLevel = currentScore && config.range.includes(currentScore);
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={cn(
                      "rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                      isExpanded || hasScoreInThisLevel
                        ? `${config.border} ${config.bg} shadow-xl` 
                        : "border-white/20 bg-white/5 hover:border-white/40"
                    )}
                  >
                    {/* Level Header - Clickable */}
                    <button
                      onClick={() => handleLevelClick(level.name)}
                      className="w-full text-left p-4 flex items-start gap-4"
                    >
                      {/* Icon Badge */}
                      <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl",
                        isExpanded || hasScoreInThisLevel
                          ? `bg-gradient-to-br ${config.gradient}` 
                          : "bg-white/10"
                      )}>
                        {config.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "font-bold text-sm uppercase tracking-wide",
                            isExpanded || hasScoreInThisLevel ? config.text : "text-white/80"
                          )}>
                            {level.name}
                          </span>
                          <span className="text-xs text-white/40">
                            [{level.range.join('-')}]
                          </span>
                          {hasScoreInThisLevel && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                              <Check className="h-3 w-3" />
                              {currentScore}
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm leading-relaxed",
                          isExpanded || hasScoreInThisLevel ? "text-white/80" : "text-white/50"
                        )}>
                          {level.description}
                        </p>
                      </div>
                    </button>

                    {/* Score Selector - Shows when expanded */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className={cn("px-4 pb-4 pt-2 border-t", config.border)}>
                            <p className="text-sm text-white/60 mb-3 text-center">
                              Alege scorul exact:
                            </p>
                            <div className="flex justify-center gap-3">
                              {config.range.map(score => (
                                <motion.button
                                  key={score}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleScoreSelect(score)}
                                  className={cn(
                                    "w-16 h-16 rounded-xl font-bold text-xl transition-all",
                                    currentScore === score
                                      ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg ring-2 ring-white/30`
                                      : `${config.bg} ${config.text} border-2 ${config.border} hover:brightness-125`
                                  )}
                                >
                                  {score}
                                </motion.button>
                              ))}
                            </div>
                            <p className="text-xs text-white/40 text-center mt-3">
                              💡 Click pe număr pentru a continua automat
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
