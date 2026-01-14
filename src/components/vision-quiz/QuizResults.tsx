import React, { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { categoryLabels, categoryDescriptions, getScoreLevel, getResultsMessage, QuizCategory } from './quizData';
import { Rocket, Target, Sparkles, TrendingUp } from 'lucide-react';

interface QuizResultsProps {
  scores: Record<QuizCategory, number>;
  language: 'en' | 'ro';
  onStartTrial: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  scores,
  language,
  onStartTrial,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  const chartData = Object.entries(scores).map(([category, score]) => ({
    category: language === 'en' 
      ? categoryLabels[category as QuizCategory].en 
      : categoryLabels[category as QuizCategory].ro,
    score,
    fullMark: 16,
  }));

  const lowestCategory = Object.entries(scores).reduce((lowest, [category, score]) => 
    score < scores[lowest as QuizCategory] ? category : lowest
  , 'body') as QuizCategory;

  const resultMessage = getResultsMessage(lowestCategory, language);

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const maxTotal = 64;
  const overallPercentage = Math.round((totalScore / maxTotal) * 100);

  // Animated counter effect
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = overallPercentage / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= overallPercentage) {
        setDisplayScore(overallPercentage);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [overallPercentage]);

  const categoryGradients: Record<QuizCategory, string> = {
    body: 'from-green-500 to-emerald-400',
    being: 'from-purple-500 to-violet-400',
    balance: 'from-pink-500 to-rose-400',
    business: 'from-blue-500 to-cyan-400',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {language === 'en' ? 'Your 2026 Vision Score' : 'Scorul Tău pentru Viziunea 2026'}
        </h1>
        <p className="text-white/60">
          {language === 'en' 
            ? 'Here\'s where you stand across the 4 life pillars' 
            : 'Iată unde te afli în cele 4 piloni ai vieții'}
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/20 backdrop-blur-sm border border-amber-500/30 rounded-3xl p-8 text-center">
        <div className="relative inline-block">
          <div className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
            {displayScore}%
          </div>
          <Sparkles className="absolute -top-2 -right-4 w-8 h-8 text-amber-400 animate-pulse" />
        </div>
        <p className="text-white/70 mt-2">
          {language === 'en' ? 'Overall Life Balance Score' : 'Scor General de Echilibru'}
        </p>
      </div>

      {/* Radar Chart */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 16]} 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="url(#radarGradient)"
              fill="url(#radarFill)"
              strokeWidth={3}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(scores).map(([category, score]) => {
          const level = getScoreLevel(score);
          const label = categoryLabels[category as QuizCategory];
          const gradient = categoryGradients[category as QuizCategory];
          return (
            <div 
              key={category}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-white text-sm">
                  {language === 'en' ? label.en : label.ro}
                </span>
                <span 
                  className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10"
                  style={{ color: level.color }}
                >
                  {score}/16
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000`}
                  style={{ width: `${(score / 16) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Area Message */}
      <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white mb-1">
              {resultMessage.title}
            </h3>
            <p className="text-white/70 text-sm">
              {resultMessage.description}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
        <h3 className="text-2xl font-bold text-white mb-2">
          {language === 'en' 
            ? 'Ready to Transform Your 2026?' 
            : 'Gata să-ți Transformi 2026?'}
        </h3>
        <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
          {language === 'en'
            ? 'Get your personalized action plan and start seeing results in 48 hours'
            : 'Primește planul tău personalizat de acțiune și vezi rezultate în 48 de ore'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            size="lg"
            onClick={() => {
              const scoresParam = encodeURIComponent(JSON.stringify(scores));
              window.location.href = `/vision-2026/plan?scores=${scoresParam}`;
            }}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
          >
            <Target className="w-4 h-4 mr-2" />
            {language === 'en' ? 'View My 2026 Plan' : 'Vezi Planul Meu 2026'}
          </Button>
          <Button 
            size="lg"
            onClick={() => {
              const scoresParam = encodeURIComponent(JSON.stringify(scores));
              window.location.href = `/auth?from=vision-plan&scores=${scoresParam}`;
            }}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-white font-bold shadow-lg shadow-orange-500/30 border-0"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Implement Now - 7 Days Free' : 'Implementează Acum - 7 Zile Gratuit'}
          </Button>
        </div>
        <p className="text-white/50 text-xs mt-4">
          {language === 'en' 
            ? '✓ We create your tasks automatically • No credit card' 
            : '✓ Creăm task-urile automat • Fără card de credit'}
        </p>
      </div>
    </div>
  );
};
