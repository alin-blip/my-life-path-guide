import { motion } from 'framer-motion';
import { Sword, Flame, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImpactSummaryCard } from './ImpactSummaryCard';
import { ChallengeMiniPreview } from './ChallengeMiniPreview';
import { WarriorPowerUpsell } from './WarriorPowerUpsell';
import { EarlyBirdCountdownCard } from './EarlyBirdCountdownCard';
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

// Simple headline based on score
function getPersonalizedHeadline(userName: string, percentage: number): string {
  if (percentage <= 50) {
    return `${userName}, ai potențial MARE de creștere`;
  } else if (percentage <= 75) {
    return `${userName}, ești la ${percentage}% din potențial`;
  } else {
    return `${userName}, ești aproape - un upgrade te face unstoppable`;
  }
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

  // Find weakest dimension
  const sortedDimensions = Object.entries(dimensionScores).sort(([, a], [, b]) => a - b);
  const weakestDimension = sortedDimensions[0][0];
  const weakestDimName = DIMENSION_INFO[weakestDimension as keyof typeof DIMENSION_INFO]?.name || weakestDimension;

  const headline = getPersonalizedHeadline(userName, percentage);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 safe-area-bottom">
      {/* ============================================ */}
      {/* SECTION 1: IMPACT (Score + Summary) */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-3">
          <Sword className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            Rezultate
          </span>
          <Sword className="h-4 w-4 text-primary transform scale-x-[-1]" />
        </div>

        {/* Score Display */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-4"
        >
          <div className={cn(
            "relative px-6 py-4 rounded-xl border-2 backdrop-blur-sm",
            percentage <= 25 ? "border-red-500 bg-red-500/10" :
            percentage <= 50 ? "border-yellow-500 bg-yellow-500/10" :
            percentage <= 75 ? "border-blue-500 bg-blue-500/10" :
            "border-green-500 bg-green-500/10"
          )}>
            <div className="text-3xl md:text-4xl font-black">
              {totalScore}
              <span className="text-lg md:text-xl text-muted-foreground">/96</span>
            </div>
            <div className={cn(
              "text-sm font-bold uppercase tracking-wider",
              percentage <= 25 ? "text-red-400" :
              percentage <= 50 ? "text-yellow-400" :
              percentage <= 75 ? "text-blue-400" :
              "text-green-400"
            )}>
              {overallLevel.name}
            </div>
            <Flame className={cn(
              "absolute -top-2 -right-2 h-6 w-6",
              percentage <= 25 ? "text-red-500" :
              percentage <= 50 ? "text-yellow-500" :
              percentage <= 75 ? "text-blue-500" :
              "text-green-500"
            )} />
          </div>
        </motion.div>

        {/* Headline */}
        <h1 className="text-lg md:text-xl font-bold text-foreground mb-2">
          {headline}
        </h1>
        <p className="text-sm text-muted-foreground">
          Focus principal: <span className="text-primary font-medium">{weakestDimName}</span>
        </p>
      </motion.div>

      {/* Impact Summary Card (Replaces 2 old components) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <ImpactSummaryCard scores={dimensionScores} userName={userName} />
      </motion.div>

      {/* ============================================ */}
      {/* SECTION 2: SOLUTION (Video + Mini Preview) */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              Planul Tău
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            Transformă {weakestDimName} în 7 Zile
          </h2>
        </div>
        
        {/* Video */}
        <div className="max-w-2xl mx-auto">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-primary/20 shadow-lg">
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
          
          {/* Mini Preview (3 bullets) */}
          <ChallengeMiniPreview weakestDimension={weakestDimension} />
        </div>
      </motion.div>

      {/* ============================================ */}
      {/* SECTION 3: URGENCY + PRICING */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <EarlyBirdCountdownCard />
      </motion.div>

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
