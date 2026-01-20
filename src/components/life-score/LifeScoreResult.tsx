import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { categoryLabels, getLifeScoreLevel, LifeScoreCategory } from '@/data/lifeScoreQuestions';
import { ArrowRight, Target, Sparkles, Share2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LifeScorePlanningFlow } from './LifeScorePlanningFlow';
import platformPreviewPlanning from '@/assets/platform-preview-planning.png';
import platformPreviewVision from '@/assets/platform-preview-vision.png';

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
    <div className="max-w-lg mx-auto space-y-6">
      {/* Main Score Card */}
      <motion.div 
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        {/* Score Circle */}
        <div className="relative w-52 h-52 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="104"
              cy="104"
              r="92"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="14"
            />
            <motion.circle
              cx="104"
              cy="104"
              r="92"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={578}
              initial={{ strokeDashoffset: 578 }}
              animate={{ strokeDashoffset: 578 - (578 * percentage) / 100 }}
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
              className="text-6xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {percentage}%
            </motion.span>
            <span className="text-white/50 text-sm font-medium mt-1">
              {language === 'en' ? 'Life Score' : 'Scorul Vieții'}
            </span>
          </div>
        </div>

        {/* Level Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-5xl mb-3 block">{scoreLevel.emoji}</span>
          <h2 className="text-2xl font-bold text-white mb-2">
            {language === 'en' ? scoreLevel.level : scoreLevel.levelRo}
          </h2>
          <p className="text-white/60">
            {language === 'en' ? scoreLevel.description : scoreLevel.descriptionRo}
          </p>
        </motion.div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div 
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        {Object.entries(categoryScores)
          .filter(([cat]) => cat !== 'overall')
          .map(([category, score]) => {
            const info = categoryLabels[category as LifeScoreCategory];
            const isWeakest = category === weakestCategory;
            return (
              <div 
                key={category}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all ${
                  isWeakest 
                    ? 'border-amber-400/50 bg-amber-400/10' 
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{info.emoji}</span>
                  <span className="font-semibold text-white text-sm">
                    {language === 'en' ? info.en : info.ro}
                  </span>
                  {isWeakest && (
                    <span className="text-[10px] bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full ml-auto font-bold">
                      FOCUS
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ 
                        background: `linear-gradient(90deg, ${info.color}, ${info.color}99)` 
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / 4) * 100}%` }}
                      transition={{ delay: 1.6, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {score}/4
                  </span>
                </div>
              </div>
            );
          })}
      </motion.div>

      {/* Weakest Area Insight */}
      <motion.div 
        className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-2xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1 text-lg">
              {language === 'en' 
                ? `Focus on ${weakestCategoryInfo.en}`
                : `Focus pe ${weakestCategoryInfo.ro}`}
            </h3>
            <p className="text-white/60 text-sm">
              {language === 'en'
                ? 'This area needs the most attention right now. Take the full assessment for a detailed action plan.'
                : 'Această arie are nevoie de cea mai mare atenție. Completează evaluarea completă pentru un plan de acțiune detaliat.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Share Buttons */}
      <motion.div 
        className="flex gap-3 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShareWhatsApp}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShareTwitter}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Twitter
        </Button>
      </motion.div>

      {/* Platform Preview Images */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.1 }}
      >
        <p className="text-center text-white/50 text-xs mb-3 font-medium">
          {language === 'en' ? 'What you get inside the platform:' : 'Ce vei primi în platformă:'}
        </p>
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
            <img 
              src={platformPreviewVision} 
              alt="Vision Board Preview" 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
            <img 
              src={platformPreviewPlanning} 
              alt="Weekly Planning Preview" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="bg-gradient-to-br from-violet-500/30 to-purple-600/30 backdrop-blur-xl border border-violet-400/30 rounded-3xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {language === 'en' 
            ? 'Create Your 2026 Vision' 
            : 'Creează Viziunea Ta pentru 2026'}
        </h3>
        <p className="text-white/60 text-sm mb-6">
          {language === 'en'
            ? 'Set your annual, 90-day, monthly & weekly goals with AI-powered guidance.'
            : 'Setează obiectivele anuale, 90 zile, lunare și săptămânale cu ghidare AI.'}
        </p>
        <Button 
          size="lg"
          onClick={() => setShowPlanningFlow(true)}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg"
        >
          {language === 'en' ? 'Start Planning My Goals' : 'Începe Planificarea Obiectivelor'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-white/40 text-xs mt-4 flex items-center justify-center gap-2">
          <Zap className="w-3 h-3" />
          {language === 'en' ? '5 min • AI-guided • Strategic Roadmap' : '5 min • Ghidare AI • Hartă Strategică'}
        </p>
      </motion.div>
    </div>
  );
};