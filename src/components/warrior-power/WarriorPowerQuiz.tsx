import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Flame, Sword } from 'lucide-react';
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

// Score level configurations
const SCORE_LEVELS = [
  { range: [1, 2, 3], label: 'ADORMIT', icon: '💤', color: 'from-red-600 to-red-800', bg: 'bg-red-500', text: 'text-red-400' },
  { range: [4, 5, 6], label: 'TREAZ', icon: '👁️', color: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-500', text: 'text-yellow-400' },
  { range: [7, 8, 9], label: 'ACTIV', icon: '⚡', color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500', text: 'text-blue-400' },
  { range: [10, 11, 12], label: 'ACCELERAT', icon: '🔥', color: 'from-green-500 to-emerald-600', bg: 'bg-green-500', text: 'text-green-400' },
];

const getScoreConfig = (score: number) => {
  if (score <= 3) return SCORE_LEVELS[0];
  if (score <= 6) return SCORE_LEVELS[1];
  if (score <= 9) return SCORE_LEVELS[2];
  return SCORE_LEVELS[3];
};

export function WarriorPowerQuiz({ onComplete }: WarriorPowerQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Partial<WarriorPowerScores>>({});

  const currentQuestion = WARRIOR_POWER_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / WARRIOR_POWER_QUESTIONS.length) * 100;
  const dimensionInfo = DIMENSION_INFO[currentQuestion.dimension];

  // Auto-advance when score is selected
  const handleScoreSelect = (score: number) => {
    const newScores = {
      ...scores,
      [currentQuestion.id]: score
    };
    setScores(newScores);

    // Small delay for visual feedback before advancing
    setTimeout(() => {
      if (currentIndex < WARRIOR_POWER_QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete(newScores as WarriorPowerScores);
      }
    }, 200);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentScore = scores[currentQuestion.id as keyof WarriorPowerScores];

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col">
      {/* Fixed Header with Progress */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sword className="h-4 w-4 text-primary" />
              <span className="text-sm text-white/70">
                {currentIndex + 1} / {WARRIOR_POWER_QUESTIONS.length}
              </span>
            </div>
            <span className="text-sm font-medium" style={{ color: dimensionInfo.color }}>
              {dimensionInfo.icon} {currentQuestion.dimensionName}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl"
            >
              {/* Question Header */}
              <div className="text-center mb-6">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                  style={{ backgroundColor: `${dimensionInfo.color}20` }}
                >
                  <span className="text-2xl">{dimensionInfo.icon}</span>
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

              {/* Score Selection Grid */}
              <div className="mb-6">
                <p className="text-center text-white/70 text-sm mb-4">
                  Alege nivelul tău actual (1-12):
                </p>
                
                {/* Score Grid - 4x3 */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(score => {
                    const config = getScoreConfig(score);
                    const isSelected = currentScore === score;
                    
                    return (
                      <motion.button
                        key={score}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleScoreSelect(score)}
                        className={cn(
                          "aspect-square rounded-xl font-bold text-lg transition-all duration-200 relative overflow-hidden",
                          isSelected
                            ? `bg-gradient-to-br ${config.color} text-white shadow-lg ring-2 ring-white/50`
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/30"
                        )}
                      >
                        {score}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                          >
                            <span className="text-[10px]">✓</span>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Level Legend */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {SCORE_LEVELS.map((level, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="block text-lg mb-1">{level.icon}</span>
                      <span className={cn("font-semibold", level.text)}>{level.label}</span>
                      <span className="block text-white/40 text-[10px]">{level.range.join('-')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Level Info - Shows when selected */}
              {currentQuestion.levels && currentScore && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  {currentQuestion.levels.map((level, idx) => {
                    const levelScore = level.range[1]; // middle of range
                    const isActive = level.range.includes(currentScore);
                    if (!isActive) return null;
                    
                    const config = getScoreConfig(currentScore);
                    return (
                      <div key={idx} className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-2xl">{config.icon}</span>
                          <span className={cn("font-bold uppercase", config.text)}>{level.name}</span>
                        </div>
                        <p className="text-white/70 text-sm">{level.description}</p>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Back Button */}
              {currentIndex > 0 && (
                <div className="flex justify-center">
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

              {/* Last Question - Show Complete Button */}
              {currentIndex === WARRIOR_POWER_QUESTIONS.length - 1 && currentScore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex justify-center"
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

      {/* Tip Footer */}
      <div className="text-center px-4 pb-6">
        <p className="text-white/40 text-xs">
          💡 Alege un număr și mergi automat la următoarea întrebare
        </p>
      </div>
    </div>
  );
}
