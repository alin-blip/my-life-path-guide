import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { categoryLabels, getLifeScoreLevel, LifeScoreCategory } from '@/data/lifeScoreQuestions';
import { ArrowRight, Target, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LifeScorePlanningFlow } from './LifeScorePlanningFlow';
import visionBoardPreview from '@/assets/vision-board-preview.png';

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
    const text = language === 'en'
      ? `I just took the Life Score 60s quiz and scored ${percentage}%! 🎯 See how you compare: `
      : `Tocmai am făcut quiz-ul Life Score 60s și am obținut ${percentage}%! 🎯 Vezi cum te compari: `;
    const url = window.location.origin + '/life-score';
    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = language === 'en'
      ? `My Life Score: ${percentage}% 🎯 Take the 60-second quiz to discover yours!`
      : `Scorul meu de Viață: ${percentage}% 🎯 Ia quiz-ul de 60 secunde pentru a-l descoperi pe al tău!`;
    const url = window.location.origin + '/life-score';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
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
    <div className="max-w-lg mx-auto space-y-4">
      {/* Main Score Card - More Compact */}
      <motion.div 
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        {/* Score Circle - Smaller */}
        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="64"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
            />
            <motion.circle
              cx="72"
              cy="72"
              r="64"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              strokeLinecap="round"
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
              className="text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {percentage}%
            </motion.span>
            <span className="text-white/50 text-xs font-medium">
              {language === 'en' ? 'Life Score' : 'Scorul Vieții'}
            </span>
          </div>
        </div>

        {/* Level Badge - Inline */}
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-3xl">{scoreLevel.emoji}</span>
          <div className="text-left">
            <h2 className="text-lg font-bold text-white">
              {language === 'en' ? scoreLevel.level : scoreLevel.levelRo}
            </h2>
            <p className="text-white/60 text-xs">
              {language === 'en' ? scoreLevel.description : scoreLevel.descriptionRo}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* CTA Section - Moved Up */}
      <motion.div 
        className="bg-gradient-to-br from-violet-500/30 to-purple-600/30 backdrop-blur-xl border border-violet-400/30 rounded-2xl p-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <h3 className="text-lg font-bold text-white mb-1">
          {language === 'en' 
            ? 'Create Your 2026 Vision' 
            : 'Creează Viziunea Ta pentru 2026'}
        </h3>
        <p className="text-white/60 text-xs mb-3">
          {language === 'en'
            ? 'Set your annual, 90-day, monthly & weekly goals with AI-powered guidance.'
            : 'Setează obiectivele anuale, 90 zile, lunare și săptămânale cu ghidare AI.'}
        </p>
        
        {/* Vision Board Preview Image */}
        <div className="rounded-xl overflow-hidden border border-white/10 mb-3">
          <img 
            src={visionBoardPreview} 
            alt="Vision Board Preview" 
            className="w-full h-auto object-cover"
          />
        </div>
        
        <Button 
          size="lg"
          onClick={() => setShowPlanningFlow(true)}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg"
        >
          {language === 'en' ? 'Start Planning My Goals' : 'Începe Planificarea Obiectivelor'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>

      {/* Category Breakdown - Compact */}
      <motion.div 
        className="grid grid-cols-2 gap-2"
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
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 border transition-all ${
                  isWeakest 
                    ? 'border-amber-400/50 bg-amber-400/10' 
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{info.emoji}</span>
                  <span className="font-medium text-white text-xs">
                    {language === 'en' ? info.en : info.ro}
                  </span>
                  {isWeakest && (
                    <span className="text-[8px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded-full ml-auto font-bold">
                      FOCUS
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ 
                        background: `linear-gradient(90deg, ${info.color}, ${info.color}99)` 
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / 4) * 100}%` }}
                      transition={{ delay: 1.7, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white">
                    {score}/4
                  </span>
                </div>
              </div>
            );
          })}
      </motion.div>

      {/* Weakest Area Insight - Compact */}
      <motion.div 
        className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              {language === 'en' 
                ? `Focus on ${weakestCategoryInfo.en}`
                : `Focus pe ${weakestCategoryInfo.ro}`}
            </h3>
            <p className="text-white/60 text-xs">
              {language === 'en'
                ? 'This area needs the most attention right now.'
                : 'Această arie are nevoie de cea mai mare atenție.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};