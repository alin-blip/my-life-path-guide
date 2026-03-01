import React from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { burnoutCategoryLabels, getBurnoutLevel, burnoutRecommendations, BurnoutCategory } from '@/data/burnoutTestQuestions';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BurnoutResultsProps {
  categoryScores: Record<BurnoutCategory, number>;
  totalScore: number;
  language: 'en' | 'ro';
}

export const BurnoutResults: React.FC<BurnoutResultsProps> = ({
  categoryScores,
  totalScore,
  language,
}) => {
  const navigate = useNavigate();
  const burnoutLevel = getBurnoutLevel(totalScore);

  const radarData = (Object.keys(burnoutCategoryLabels) as BurnoutCategory[]).map((cat) => ({
    category: language === 'en' ? burnoutCategoryLabels[cat].en : burnoutCategoryLabels[cat].ro,
    score: categoryScores[cat] || 0,
    fullMark: 25,
  }));

  // Find weakest category
  const weakest = (Object.entries(categoryScores) as [BurnoutCategory, number][])
    .sort((a, b) => a[1] - b[1])[0];
  const weakestCat = weakest?.[0] as BurnoutCategory;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Score Header */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
        <div className="text-6xl mb-4">{burnoutLevel.emoji}</div>
        <div className="text-5xl font-black text-white mb-2">{totalScore}/100</div>
        <div
          className="text-2xl font-bold mb-3"
          style={{ color: burnoutLevel.color }}
        >
          {language === 'en' ? burnoutLevel.level : burnoutLevel.levelRo}
        </div>
        <p className="text-white/70 text-lg">
          {language === 'en' ? burnoutLevel.description : burnoutLevel.descriptionRo}
        </p>
      </div>

      {/* Radar Chart */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white text-center mb-4">
          {language === 'en' ? 'Your Burnout Map' : 'Harta Ta de Burnout'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.15)" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke={burnoutLevel.color}
              fill={burnoutLevel.color}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(burnoutCategoryLabels) as BurnoutCategory[]).map((cat) => {
          const label = burnoutCategoryLabels[cat];
          const score = categoryScores[cat] || 0;
          const percentage = Math.round((score / 25) * 100);
          return (
            <div
              key={cat}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{label.emoji}</span>
                <span className="text-white font-semibold text-sm">
                  {language === 'en' ? label.en : label.ro}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{percentage}%</div>
              <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: label.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {weakestCat && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span>
            {language === 'en'
              ? `Focus Area: ${burnoutCategoryLabels[weakestCat].en}`
              : `Aria de Focus: ${burnoutCategoryLabels[weakestCat].ro}`}
          </h3>
          <div className="space-y-3">
            {burnoutRecommendations[weakestCat][language === 'en' ? 'en' : 'ro'].map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-white/80">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={() => navigate('/challenge')}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-10 py-7 text-lg font-bold rounded-xl shadow-[0_15px_50px_rgba(251,146,60,0.3)]"
        >
          {language === 'en' ? 'Start Your Recovery Plan' : 'Începe Planul de Recuperare'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};
