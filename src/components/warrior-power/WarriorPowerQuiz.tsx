import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Sword, Shield, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  WARRIOR_POWER_QUESTIONS, 
  DIMENSION_INFO,
  type WarriorPowerScores,
  type WarriorPowerQuestion 
} from '@/data/warriorPowerQuestions';

interface WarriorPowerQuizProps {
  onComplete: (scores: WarriorPowerScores) => void;
}

// Warrior level icons and styling
const LEVEL_CONFIG = {
  ADORMIT: {
    icon: '💤',
    gradient: 'from-red-600 to-red-800',
    bg: 'bg-red-950/60',
    border: 'border-red-500/50',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    range: [1, 2, 3]
  },
  TREAZ: {
    icon: '👁️',
    gradient: 'from-yellow-500 to-orange-600',
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
    range: [4, 5, 6]
  },
  ACTIV: {
    icon: '⚡',
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-950/60',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    range: [7, 8, 9]
  },
  ACCELERAT: {
    icon: '🔥',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-950/60',
    border: 'border-green-500/50',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
    range: [10, 11, 12]
  }
};

export function WarriorPowerQuiz({ onComplete }: WarriorPowerQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Partial<WarriorPowerScores>>({});
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const currentQuestion = WARRIOR_POWER_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / WARRIOR_POWER_QUESTIONS.length) * 100;
  const dimensionInfo = DIMENSION_INFO[currentQuestion.dimension];

  const handleLevelSelect = (levelName: string, defaultScore: number) => {
    setSelectedLevel(levelName);
    setSelectedScore(defaultScore);
  };

  const handleScoreRefine = (score: number) => {
    setSelectedScore(score);
  };

  const handleNext = () => {
    if (selectedScore === null) return;

    const newScores = {
      ...scores,
      [currentQuestion.id]: selectedScore
    };
    setScores(newScores);

    if (currentIndex < WARRIOR_POWER_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedLevel(null);
      setSelectedScore(null);
    } else {
      onComplete(newScores as WarriorPowerScores);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevQuestion = WARRIOR_POWER_QUESTIONS[currentIndex - 1];
      const prevScore = scores[prevQuestion.id as keyof WarriorPowerScores];
      if (prevScore) {
        setSelectedScore(prevScore);
        // Find the level for this score
        if (prevScore <= 3) setSelectedLevel('ADORMIT');
        else if (prevScore <= 6) setSelectedLevel('TREAZ');
        else if (prevScore <= 9) setSelectedLevel('ACTIV');
        else setSelectedLevel('ACCELERAT');
      } else {
        setSelectedLevel(null);
        setSelectedScore(null);
      }
    }
  };

  const getLevelFromScore = (score: number) => {
    if (score <= 3) return 'ADORMIT';
    if (score <= 6) return 'TREAZ';
    if (score <= 9) return 'ACTIV';
    return 'ACCELERAT';
  };

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 py-8">
      {/* Progress Header */}
      <div className="mb-6">
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
            <h2 className="text-lg md:text-xl font-bold text-white mb-1">
              {currentQuestion.section}
            </h2>
            <p className="text-sm text-white/70 max-w-2xl mx-auto">
              {currentQuestion.sectionDescription}
            </p>
          </div>

          {/* Clickable Level Cards */}
          <div className="space-y-3 mb-6">
            {currentQuestion.levels.map((level, idx) => {
              const levelKey = level.name.toUpperCase() as keyof typeof LEVEL_CONFIG;
              const config = LEVEL_CONFIG[levelKey];
              if (!config) return null;
              const isSelected = selectedLevel === level.name;
              
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => handleLevelSelect(level.name, config.range[1])}
                  className={cn(
                    "w-full text-left rounded-2xl border-2 transition-all duration-300 overflow-hidden group",
                    "hover:scale-[1.01] active:scale-[0.99]",
                    isSelected 
                      ? `${config.border} ${config.bg} ring-2 ring-offset-2 ring-offset-black shadow-xl ${config.glow}` 
                      : "border-white/40 bg-white/5 hover:border-white/60 hover:bg-white/10"
                  )}
                  style={isSelected ? { 
                    borderColor: config.text.replace('text-', '').includes('red') ? '#ef4444' :
                                 config.text.includes('yellow') ? '#eab308' :
                                 config.text.includes('blue') ? '#3b82f6' : '#22c55e'
                  } : {}}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Level Badge */}
                      <div className={cn(
                        "flex flex-col items-center justify-center w-14 h-14 rounded-xl font-black transition-all flex-shrink-0",
                        isSelected 
                          ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg` 
                          : "bg-white/10 text-white/60 group-hover:bg-white/20"
                      )}>
                        <span className="text-[10px] font-semibold opacity-80">[{level.range.join(',')}]</span>
                        <span className="text-lg">{config.icon}</span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={cn(
                            "font-bold text-base uppercase tracking-wide transition-colors",
                            isSelected ? config.text : "text-white group-hover:text-white"
                          )}>
                            {level.name}
                          </span>
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold"
                            >
                              <Check className="h-3 w-3" />
                              SELECTAT
                            </motion.span>
                          )}
                        </div>
                        <h4 className={cn(
                          "font-semibold text-sm mb-2 transition-colors",
                          isSelected ? "text-white" : "text-white/70 group-hover:text-white"
                        )}>
                          {level.title}
                        </h4>
                        <p className={cn(
                          "text-sm leading-relaxed transition-colors",
                          isSelected ? "text-white/80" : "text-white/60 group-hover:text-white/70"
                        )}>
                          {level.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fine-tune score selector - shows when level is selected */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={cn(
                          "px-5 pb-5 pt-3 border-t",
                          config.border
                        )}>
                          <p className="text-sm text-white/70 mb-3 text-center font-medium">
                            Alege scorul exact:
                          </p>
                          <div className="flex justify-center gap-3">
                            {config.range.map(score => (
                              <button
                                key={score}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScoreRefine(score);
                                }}
                                className={cn(
                                  "w-14 h-14 rounded-xl font-bold text-lg transition-all",
                                  "hover:scale-110 active:scale-95",
                                  selectedScore === score
                                    ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg ring-2 ring-white/30`
                                    : `${config.bg} ${config.text} border-2 ${config.border} hover:brightness-110`
                                )}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          {/* Selected Score Display */}
          {selectedScore !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <div className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-full border-2",
                selectedLevel && LEVEL_CONFIG[selectedLevel.toUpperCase() as keyof typeof LEVEL_CONFIG]?.bg,
                selectedLevel && LEVEL_CONFIG[selectedLevel.toUpperCase() as keyof typeof LEVEL_CONFIG]?.border
              )}>
                <span className="text-2xl">{selectedLevel && LEVEL_CONFIG[selectedLevel.toUpperCase() as keyof typeof LEVEL_CONFIG]?.icon}</span>
                <div>
                  <span className={cn("font-bold", selectedLevel && LEVEL_CONFIG[selectedLevel.toUpperCase() as keyof typeof LEVEL_CONFIG]?.text)}>
                    {selectedLevel}
                  </span>
                  <span className="text-white/50 mx-2">•</span>
                  <span className="font-bold text-white">Scor: {selectedScore}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Înapoi
            </Button>

            <Button
              onClick={handleNext}
              disabled={selectedScore === null}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 font-bold px-8"
            >
              {currentIndex === WARRIOR_POWER_QUESTIONS.length - 1 ? (
                <>
                  <Flame className="h-4 w-4" />
                  Vezi Rezultatele
                </>
              ) : (
                <>
                  Continuă
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
