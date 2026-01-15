import { motion } from 'framer-motion';
import { TrendingUp, Target, ArrowRight, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DIMENSION_INFO,
  WARRIOR_POWER_QUESTIONS,
  calculateDimensionScore,
  calculateTotalScore,
  getScorePercentage,
  getOverallLevel,
  getLevelForScore,
  type WarriorPowerScores
} from '@/data/warriorPowerQuestions';

interface WarriorPowerResultsProps {
  scores: WarriorPowerScores;
  userName: string;
}

export function WarriorPowerResults({ scores, userName }: WarriorPowerResultsProps) {
  const navigate = useNavigate();
  
  const totalScore = calculateTotalScore(scores);
  const percentage = getScorePercentage(scores);
  const overallLevel = getOverallLevel(scores);

  const dimensionScores = {
    body: calculateDimensionScore(scores, 'body'),
    being: calculateDimensionScore(scores, 'being'),
    balance: calculateDimensionScore(scores, 'balance'),
    business: calculateDimensionScore(scores, 'business')
  };

  const getLevelColorClass = (score: number, max: number = 24) => {
    const pct = (score / max) * 100;
    if (pct <= 25) return 'text-red-500';
    if (pct <= 50) return 'text-yellow-500';
    if (pct <= 75) return 'text-blue-500';
    return 'text-green-500';
  };

  const getProgressColor = (score: number, max: number = 24) => {
    const pct = (score / max) * 100;
    if (pct <= 25) return 'bg-red-500';
    if (pct <= 50) return 'bg-yellow-500';
    if (pct <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Find weakest dimensions (areas to improve)
  const sortedDimensions = Object.entries(dimensionScores)
    .sort(([, a], [, b]) => a - b);
  const weakestDimension = sortedDimensions[0];
  const strongestDimension = sortedDimensions[sortedDimensions.length - 1];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Hero Result */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Rezultatele Tale, {userName}!
        </h1>
        
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{totalScore}</div>
              <div className="text-sm text-muted-foreground">din 96</div>
            </div>
          </div>
          <svg className="absolute w-44 h-44 -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="80"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/20"
            />
            <circle
              cx="88"
              cy="88"
              r="80"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${percentage * 5.02} 502`}
              className={getLevelColorClass(totalScore, 96)}
            />
          </svg>
        </div>

        <div className={cn(
          "inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold",
          percentage <= 25 ? "bg-red-500/20 text-red-400" :
          percentage <= 50 ? "bg-yellow-500/20 text-yellow-400" :
          percentage <= 75 ? "bg-blue-500/20 text-blue-400" :
          "bg-green-500/20 text-green-400"
        )}>
          <TrendingUp className="h-5 w-5" />
          Nivel General: {overallLevel.name.toUpperCase()}
        </div>

        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          {percentage <= 25 
            ? "Ai multe arii de îmbunătățit. Aceasta este oportunitatea ta de a începe o transformare profundă."
            : percentage <= 50 
            ? "Ești pe drumul cel bun, dar există zone importante care necesită atenție imediată."
            : percentage <= 75 
            ? "Ai o fundație solidă. Cu câteva ajustări strategice, poți atinge nivelul următor."
            : "Excelent! Ești pe drumul spre excelență. Continuă să-ți perfecționezi abordarea."
          }
        </p>
      </motion.div>

      {/* Dimension Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-4 mb-8"
      >
        {(Object.entries(DIMENSION_INFO) as [keyof typeof DIMENSION_INFO, typeof DIMENSION_INFO[keyof typeof DIMENSION_INFO]][]).map(([key, info], idx) => {
          const dimScore = dimensionScores[key];
          const dimPercentage = (dimScore / 24) * 100;
          const dimLevel = getLevelForScore(Math.round(dimScore / 2));

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{info.icon}</span>
                      <span className="font-semibold">{info.name}</span>
                    </div>
                    <span className={cn("font-bold text-lg", getLevelColorClass(dimScore))}>
                      {dimScore}/24
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dimPercentage}%` }}
                      transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                      className={cn("h-full rounded-full", getProgressColor(dimScore))}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Nivel: {dimLevel.name}</span>
                    <span>{Math.round(dimPercentage)}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Detailed Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border mb-8"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Detalii pe Secțiuni
        </h3>
        <div className="space-y-3">
          {WARRIOR_POWER_QUESTIONS.map((q, idx) => {
            const score = scores[q.id as keyof WarriorPowerScores];
            const level = getLevelForScore(score);
            const pct = (score / 12) * 100;
            
            return (
              <div key={q.id} className="flex items-center gap-4">
                <div className="w-8 text-center">
                  <span className="text-lg">{DIMENSION_INFO[q.dimension].icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{q.section}</span>
                    <span className={cn("text-sm font-bold", getLevelColorClass(score, 12))}>
                      {score}/12 • {level.name}
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + idx * 0.05 }}
                      className={cn("h-full rounded-full", getProgressColor(score, 12))}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid md:grid-cols-2 gap-4 mb-8"
      >
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <h4 className="font-semibold text-red-400 mb-2">⚠️ Prioritate de Îmbunătățire</h4>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">
                {DIMENSION_INFO[weakestDimension[0] as keyof typeof DIMENSION_INFO].name}
              </strong>
              {' '}este zona ta cea mai slabă cu un scor de {weakestDimension[1]}/24.
              Concentrează-te aici pentru cel mai mare impact.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <h4 className="font-semibold text-green-400 mb-2">✨ Punctul Tău Forte</h4>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">
                {DIMENSION_INFO[strongestDimension[0] as keyof typeof DIMENSION_INFO].name}
              </strong>
              {' '}este zona ta cea mai puternică cu un scor de {strongestDimension[1]}/24.
              Folosește această energie pentru a-ți ridica celelalte arii.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-4"
      >
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl p-8 border border-primary/30">
          <h3 className="text-2xl font-bold mb-3">
            Ești Gata să Îți Transformi Viața?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Acum că știi exact unde te afli, este timpul să îți setezi obiective anuale
            clare și să începi călătoria spre versiunea ta accelerată.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/pricing')}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg px-8 py-6"
          >
            Setează-ți Obiectivele Anuale
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Rezultatele tale au fost salvate și trimise pe email.
        </p>
      </motion.div>
    </div>
  );
}
