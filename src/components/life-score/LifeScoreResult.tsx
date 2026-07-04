import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { categoryLabels, getLifeScoreLevel, LifeScoreCategory } from '@/data/lifeScoreQuestions';
import { ArrowRight, Target, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LifeScorePlanningFlow } from './LifeScorePlanningFlow';
import visionBoardPreview from '@/assets/vision-board-preview.png';

// ---------------------------------------------------------------------------
// Bilingual copy dictionary
// ---------------------------------------------------------------------------
const COPY = {
  ro: {
    lifeScore: 'Scorul Vieții',
    ctaTitle: 'Creează Viziunea Ta pentru 2026',
    ctaSubtitle: 'Setează obiectivele anuale, 90 zile, lunare și săptămânale cu ghidare AI.',
    ctaBtn: 'Începe Planificarea Obiectivelor',
    focusLabel: (cat: string) => `Focus pe ${cat}`,
    focusDesc: 'Această arie are nevoie de cea mai mare atenție.',
    shareWa: (pct: number) =>
      `Tocmai am făcut quiz-ul Life Score 60s și am obținut ${pct}%! 🎯 Vezi cum te compari: `,
    shareTw: (pct: number) =>
      `Scorul meu de Viață: ${pct}% 🎯 Ia quiz-ul de 60 secunde pentru a-l descoperi pe al tău!`,
  },
  en: {
    lifeScore: 'Life Score',
    ctaTitle: 'Create Your 2026 Vision',
    ctaSubtitle: 'Set your annual, 90-day, monthly & weekly goals with AI-powered guidance.',
    ctaBtn: 'Start Planning My Goals',
    focusLabel: (cat: string) => `Focus on ${cat}`,
    focusDesc: 'This area needs the most attention right now.',
    shareWa: (pct: number) =>
      `I just took the Life Score 60s quiz and scored ${pct}%! 🎯 See how you compare: `,
    shareTw: (pct: number) =>
      `My Life Score: ${pct}% 🎯 Take the 60-second quiz to discover yours!`,
  },
} as const;

interface LifeScoreResultProps {
  totalScore: number;
  categoryScores: Record<string, number>;
  language: 'en' | 'ro';
}

export const LifeScoreResult: React.FC<LifeScoreResultProps> = ({
  totalScore,
  categoryScores,
  language,
}) => {
  const t = COPY[language];
  const navigate = useNavigate();
  const [showPlanningFlow, setShowPlanningFlow] = useState(false);
  
  const maxScore = 20;
  const percentage = Math.round((totalScore / maxScore) * 100);
  const scoreLevel = getLifeScoreLevel(totalScore, maxScore);

  // Find the weakest category (excluding 'overall')
  const categoryEntries = Object.entries(categoryScores).filter(([cat]) => cat !== 'overall');
  const weakestCategory = categoryEntries.reduce((lowest, [category, score]) => 
    score < (categoryScores[lowest] ?? Infinity) ? category : lowest
  , categoryEntries[0]?.[0] || 'body') as LifeScoreCategory;

  const weakestCategoryInfo = categoryLabels[weakestCategory];

  const handleShareWhatsApp = () => {
    const url = window.location.origin + '/life-score';
    window.open(`https://wa.me/?text=${encodeURIComponent(t.shareWa(percentage) + url)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const url = window.location.origin + '/life-score';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t.shareTw(percentage))}&url=${encodeURIComponent(url)}`, '_blank');
  };

  // Show planning flow if user clicked CTA
  if (showPlanningFlow) {
    return (
      <LifeScorePlanningFlow
        categoryScores={categoryScores}
        weakestCategory={weakestCategory}
        language={language}
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-3 sm:space-y-4 px-2 sm:px-0">
      {/* Main Score Card - Mobile Optimized */}
      <motion.div 
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        {/* Score Circle - Responsive */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-3 sm:mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <motion.circle
              cx="72" cy="72" r="64" fill="none"
              stroke="url(#scoreGradient)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={402}
              initial={{ strokeDashoffset: 402 }}
              animate={{ strokeDashoffset: 402 - (402 * percentage) / 100 }}
              transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {percentage}%
            </motion.span>
            <span className="text-white/70 text-[10px] sm:text-xs font-medium">
              {t.lifeScore}
            </span>
          </div>
        </div>

        {/* Level Badge */}
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-2xl sm:text-3xl">{scoreLevel.emoji}</span>
          <div className="text-left">
            <h2 className="text-base sm:text-lg font-bold text-white">
              {language === 'en' ? scoreLevel.level : scoreLevel.levelRo}
            </h2>
            <p className="text-white/60 text-[10px] sm:text-xs line-clamp-2">
              {language === 'en' ? scoreLevel.description : scoreLevel.descriptionRo}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="bg-gradient-to-br from-violet-500/30 to-purple-600/30 backdrop-blur-xl border border-violet-400/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <h3 className="text-base sm:text-lg font-bold text-white mb-1">
          {t.ctaTitle}
        </h3>
        <p className="text-white/60 text-[10px] sm:text-xs mb-2 sm:mb-3">
          {t.ctaSubtitle}
        </p>
        
        {/* Vision Board Preview */}
        <div className="rounded-lg sm:rounded-xl overflow-hidden border border-white/10 mb-2 sm:mb-3">
          <img 
            src={visionBoardPreview} 
            alt="Vision Board Preview" 
            className="w-full h-auto object-cover"
          />
        </div>
        
        <Button 
          size="default"
          onClick={() => setShowPlanningFlow(true)}
          className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 text-sm sm:text-base py-3 sm:py-4"
        >
          {t.ctaBtn}
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
        </Button>
      </motion.div>

      {/* Category Breakdown - 2x2 Grid */}
      <motion.div 
        className="grid grid-cols-2 gap-1.5 sm:gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        {Object.entries(categoryScores)
          .filter(([cat]) => cat !== 'overall')
          .map(([category, score]) => {
            const info = categoryLabels[category as LifeScoreCategory];
            const isWeakest = category === weakestCategory;
            return (
              <div 
                key={category}
                className={`bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border transition-all ${
                  isWeakest ? 'border-amber-400/50 bg-amber-400/10' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-base sm:text-lg">{info.emoji}</span>
                  <span className="font-medium text-white text-[10px] sm:text-xs truncate">
                    {language === 'en' ? info.en : info.ro}
                  </span>
                  {isWeakest && (
                    <span className="text-[6px] sm:text-[8px] bg-amber-400/20 text-amber-400 px-1 sm:px-1.5 py-0.5 rounded-full ml-auto font-bold shrink-0">
                      FOCUS
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex-1 h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${info.color}, ${info.color}99)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / 4) * 100}%` }}
                      transition={{ delay: 1.7, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-white">{score}/4</span>
                </div>
              </div>
            );
          })}
      </motion.div>

      {/* Weakest Area Insight */}
      <motion.div 
        className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-xs sm:text-sm truncate">
              {t.focusLabel(language === 'en' ? weakestCategoryInfo.en : weakestCategoryInfo.ro)}
            </h3>
            <p className="text-white/60 text-[10px] sm:text-xs">
              {t.focusDesc}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
