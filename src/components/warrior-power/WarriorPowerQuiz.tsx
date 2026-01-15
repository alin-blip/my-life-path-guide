import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
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

export function WarriorPowerQuiz({ onComplete }: WarriorPowerQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Partial<WarriorPowerScores>>({});
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const currentQuestion = WARRIOR_POWER_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / WARRIOR_POWER_QUESTIONS.length) * 100;
  const dimensionInfo = DIMENSION_INFO[currentQuestion.dimension];

  const handleScoreSelect = (score: number) => {
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
      setSelectedScore(newScores[WARRIOR_POWER_QUESTIONS[currentIndex + 1].id as keyof WarriorPowerScores] || null);
    } else {
      onComplete(newScores as WarriorPowerScores);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevQuestion = WARRIOR_POWER_QUESTIONS[currentIndex - 1];
      setSelectedScore(scores[prevQuestion.id as keyof WarriorPowerScores] || null);
    }
  };

  const getLevelColor = (score: number) => {
    if (score <= 3) return 'bg-red-500/20 border-red-500 text-red-400';
    if (score <= 6) return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
    if (score <= 9) return 'bg-blue-500/20 border-blue-500 text-blue-400';
    return 'bg-green-500/20 border-green-500 text-green-400';
  };

  const getLevelName = (score: number) => {
    if (score <= 3) return 'ADORMIT';
    if (score <= 6) return 'TREAZ';
    if (score <= 9) return 'ACTIV';
    return 'ACCELERAT';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Întrebarea {currentIndex + 1} din {WARRIOR_POWER_QUESTIONS.length}
          </span>
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
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: `${dimensionInfo.color}20` }}
            >
              <span className="text-2xl">{dimensionInfo.icon}</span>
              <span className="font-semibold" style={{ color: dimensionInfo.color }}>
                DIMENSIUNEA: {currentQuestion.dimensionName.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Secțiunea: {currentQuestion.section}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {currentQuestion.sectionDescription}
            </p>
          </div>

          {/* Levels Description */}
          <div className="grid gap-4 mb-8">
            {currentQuestion.levels.map((level, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  getLevelColor(level.range[1])
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="text-lg font-bold">
                      [{level.range.join(', ')}]
                    </span>
                    <div className="text-xs uppercase tracking-wide mt-1">
                      {level.name}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{level.title}</h4>
                    <p className="text-sm opacity-90 leading-relaxed">
                      {level.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Score Selection */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border mb-8">
            <h3 className="text-lg font-semibold text-center mb-4">
              Alege scorul care te definește cel mai bine:
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-12 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(score => (
                <button
                  key={score}
                  onClick={() => handleScoreSelect(score)}
                  className={cn(
                    "relative p-3 rounded-lg border-2 transition-all font-bold",
                    "hover:scale-105 active:scale-95",
                    selectedScore === score
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "",
                    getLevelColor(score)
                  )}
                >
                  {score}
                  {selectedScore === score && (
                    <Check className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full p-0.5" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-muted-foreground">
              <span>ADORMIT (1-3)</span>
              <span>TREAZ (4-6)</span>
              <span>ACTIV (7-9)</span>
              <span>ACCELERAT (10-12)</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Înapoi
            </Button>

            {selectedScore !== null && (
              <div className="text-center">
                <span className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium",
                  getLevelColor(selectedScore)
                )}>
                  Nivel: {getLevelName(selectedScore)}
                </span>
              </div>
            )}

            <Button
              onClick={handleNext}
              disabled={selectedScore === null}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              {currentIndex === WARRIOR_POWER_QUESTIONS.length - 1 ? 'Vezi Rezultatele' : 'Continuă'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
