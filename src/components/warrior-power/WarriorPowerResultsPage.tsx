import { motion } from 'framer-motion';
import { Sword, Flame, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WarriorPowerUpsell } from './WarriorPowerUpsell';
import {
  calculateTotalScore,
  getScorePercentage,
  getOverallLevel,
  calculateDimensionScore,
  DIMENSION_INFO,
  type WarriorPowerScores
} from '@/data/warriorPowerQuestions';

interface WarriorPowerResultsPageProps {
  scores: WarriorPowerScores;
  userName: string;
  onContinueFree: () => void;
}

export function WarriorPowerResultsPage({ scores, userName, onContinueFree }: WarriorPowerResultsPageProps) {
  const totalScore = calculateTotalScore(scores);
  const percentage = getScorePercentage(scores);
  const overallLevel = getOverallLevel(scores);

  const dimensionScores = {
    body: calculateDimensionScore(scores, 'body'),
    being: calculateDimensionScore(scores, 'being'),
    balance: calculateDimensionScore(scores, 'balance'),
    business: calculateDimensionScore(scores, 'business')
  };

  // Find weakest and strongest dimensions
  const sortedDimensions = Object.entries(dimensionScores)
    .sort(([, a], [, b]) => a - b);
  const weakestDimension = sortedDimensions[0];
  const strongestDimension = sortedDimensions[sortedDimensions.length - 1];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 safe-area-bottom">
      {/* Hero Result Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Sword className="h-5 w-5 text-primary" />
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            Warrior Power Assessment
          </span>
          <Sword className="h-5 w-5 text-primary transform scale-x-[-1]" />
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
          {userName}, Iată Rezultatele Tale!
        </h1>

        {/* Score Display */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className={cn(
            "relative px-8 py-5 rounded-xl border-2 backdrop-blur-sm",
            percentage <= 25 ? "border-red-500 bg-red-500/10" :
            percentage <= 50 ? "border-yellow-500 bg-yellow-500/10" :
            percentage <= 75 ? "border-blue-500 bg-blue-500/10" :
            "border-green-500 bg-green-500/10"
          )}>
            <div className="text-4xl md:text-5xl font-black">
              {totalScore}
              <span className="text-xl md:text-2xl text-muted-foreground">/96</span>
            </div>
            <div className={cn(
              "text-lg font-bold uppercase tracking-wider mt-1",
              percentage <= 25 ? "text-red-400" :
              percentage <= 50 ? "text-yellow-400" :
              percentage <= 75 ? "text-blue-400" :
              "text-green-400"
            )}>
              {overallLevel.name}
            </div>
            <Flame className={cn(
              "absolute -top-3 -right-3 h-8 w-8",
              percentage <= 25 ? "text-red-500" :
              percentage <= 50 ? "text-yellow-500" :
              percentage <= 75 ? "text-blue-500" :
              "text-green-500"
            )} />
          </div>
        </motion.div>

        {/* Dimension Scores Mini Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-6"
        >
          {(Object.entries(DIMENSION_INFO) as [string, { name: string; icon: string }][]).map(([key, info]) => {
            const dimScore = dimensionScores[key as keyof typeof dimensionScores];
            const pct = (dimScore / 24) * 100;
            const isWeakest = key === weakestDimension[0];
            const isStrongest = key === strongestDimension[0];

            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                  isWeakest && "border-red-500/50 bg-red-500/10",
                  isStrongest && "border-green-500/50 bg-green-500/10",
                  !isWeakest && !isStrongest && "border-border bg-card/50"
                )}
              >
                <span className="text-xl">{info.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-medium text-muted-foreground">{info.name}</div>
                  <div className={cn(
                    "text-sm font-bold",
                    pct <= 25 ? "text-red-400" :
                    pct <= 50 ? "text-yellow-400" :
                    pct <= 75 ? "text-blue-400" :
                    "text-green-400"
                  )}>
                    {dimScore}/24
                  </div>
                </div>
                {isWeakest && <span className="text-[10px] text-red-400 font-medium">FOCALIZARE</span>}
                {isStrongest && <Trophy className="h-4 w-4 text-green-400" />}
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Voomly Video Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-10"
      >
        <div className="text-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            🎬 Descoperă Cum Să Devii ACCELERAT în 7 Zile
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Privește acest video pentru a înțelege cum funcționează sistemul
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-primary/20 shadow-2xl">
            <iframe
              src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=Q2rPQbpGVI3G3AQChBI7EptvcVsWzFtGMVz09Gu8CDoxI1d3P&videoRatio=1.777778&type=v&skinColor=%232758EB"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              width="100%"
              height="100%"
              className="absolute inset-0"
            />
          </div>
        </div>
      </motion.div>

      {/* Subscription Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <WarriorPowerUpsell
          scores={scores}
          userName={userName}
          onContinueFree={onContinueFree}
        />
      </motion.div>
    </div>
  );
}
