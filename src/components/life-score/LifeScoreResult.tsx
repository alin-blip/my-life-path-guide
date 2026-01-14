import React from 'react';
import { Button } from '@/components/ui/button';
import { categoryLabels, getLifeScoreLevel, LifeScoreCategory } from '@/data/lifeScoreQuestions';
import { ArrowRight, Target, Sparkles, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

  return (
    <motion.div 
      className="max-w-lg mx-auto space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Score Circle */}
      <motion.div 
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <div className="relative w-48 h-48 mx-auto mb-6">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={scoreLevel.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={553}
              initial={{ strokeDashoffset: 553 }}
              animate={{ strokeDashoffset: 553 - (553 * percentage) / 100 }}
              transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className="text-5xl font-bold"
              style={{ color: scoreLevel.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {percentage}%
            </motion.span>
            <span className="text-muted-foreground text-sm">
              {language === 'en' ? 'Life Score' : 'Scorul Vieții'}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-4xl mb-2 block">{scoreLevel.emoji}</span>
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: scoreLevel.color }}
          >
            {language === 'en' ? scoreLevel.level : scoreLevel.levelRo}
          </h2>
          <p className="text-muted-foreground">
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
                className={`bg-card rounded-xl p-4 border-2 transition-all ${
                  isWeakest ? 'border-amber-500 bg-amber-500/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{info.emoji}</span>
                  <span className="font-medium text-sm">
                    {language === 'en' ? info.en : info.ro}
                  </span>
                  {isWeakest && (
                    <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full ml-auto">
                      {language === 'en' ? 'Focus' : 'Focus'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: info.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / 4) * 100}%` }}
                      transition={{ delay: 1.6, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm font-medium" style={{ color: info.color }}>
                    {score}/4
                  </span>
                </div>
              </div>
            );
          })}
      </motion.div>

      {/* Weakest Area Insight */}
      <motion.div 
        className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              {language === 'en' 
                ? `Your ${weakestCategoryInfo.en} needs attention`
                : `${weakestCategoryInfo.ro} are nevoie de atenție`}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'en'
                ? 'Take the full 16-question assessment to get a detailed breakdown and personalized action plan.'
                : 'Completează evaluarea completă cu 16 întrebări pentru a primi o analiză detaliată și un plan de acțiune personalizat.'}
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
        <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
          <Share2 className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
        <Button variant="outline" size="sm" onClick={handleShareTwitter}>
          <Share2 className="w-4 h-4 mr-2" />
          Twitter
        </Button>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-center text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" />
        <h3 className="text-xl font-bold mb-2">
          {language === 'en' 
            ? 'Want the Full Picture?' 
            : 'Vrei Imaginea Completă?'}
        </h3>
        <p className="text-white/80 text-sm mb-4">
          {language === 'en'
            ? 'Take the complete 16-question Vision 2026 Assessment for detailed insights and a personalized action plan.'
            : 'Completează Evaluarea Viziunii 2026 cu 16 întrebări pentru insight-uri detaliate și un plan de acțiune personalizat.'}
        </p>
        <Button 
          size="lg"
          variant="secondary"
          onClick={() => navigate('/vision-2026')}
          className="w-full sm:w-auto"
        >
          {language === 'en' ? 'Take Full Assessment' : 'Completează Evaluarea Completă'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-white/60 text-xs mt-3">
          ⏱️ {language === 'en' ? '3 minutes • 16 questions • Free' : '3 minute • 16 întrebări • Gratuit'}
        </p>
      </motion.div>
    </motion.div>
  );
};
