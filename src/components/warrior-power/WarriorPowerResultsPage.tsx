import { motion } from 'framer-motion';
import { Sword, Flame, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImpactSummaryCard } from './ImpactSummaryCard';
import { ChallengeMiniPreview } from './ChallengeMiniPreview';
import { WarriorPowerUpsell } from './WarriorPowerUpsell';
import { EarlyBirdCountdownCard } from './EarlyBirdCountdownCard';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
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
    <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 safe-area-bottom bg-white min-h-screen font-['Montserrat',sans-serif]">
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
              <span className="text-lg md:text-xl text-gray-600">/96</span>
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
        <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
          {headline}
        </h1>
        <p className="text-sm text-gray-600">
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
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              Have It All Lifestyle
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            Challenge-ul de 7 Zile care îți transformă viața
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
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            <button
              onClick={() => {
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-3 px-6 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              🚀 Începe Gratuit — Alege Trial-ul
            </button>
          </motion.div>
          
          {/* Detailed Challenge Preview */}
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
        id="pricing-section"
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

      {/* ============================================ */}
      {/* SECTION 4: PLATFORM VIDEO + FEATURES */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 pt-8 border-t border-border/50"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              Descoperă Platforma
            </span>
          </div>
        </div>

        {/* Platform Demo Video */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4),0_0_30px_rgba(34,211,238,0.2)]">
            <iframe
              src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=F5ekB1wK9EDeyiELl4ugLceeGp7GHnFN2w1UzsaIMLLpCm0BY&videoRatio=1.777778&type=v&skinColor=%232758EB&autoplay=0&loop=0&muted=0"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Interactive Feature Showcase */}
        <FeatureShowcase />

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center"
        >
          <button
            onClick={() => {
              document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full max-w-md mx-auto py-4 px-8 bg-gradient-to-r from-primary via-cyan-500 to-primary text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse"
          >
            🚀 Începe Transformarea ACUM
          </button>
          <p className="mt-3 text-sm text-gray-600">
            7 zile gratuit • Anulezi oricând
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
