import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { categoryLabels, categoryDescriptions, getScoreLevel, getResultsMessage, QuizCategory } from './quizData';
import { Rocket, TrendingUp, Target, Sparkles } from 'lucide-react';

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

  const lowestScore = scores[lowestCategory];
  const lowestLevel = getScoreLevel(lowestScore);
  const resultMessage = getResultsMessage(lowestCategory, language);

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const maxTotal = 64;
  const overallPercentage = Math.round((totalScore / maxTotal) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {language === 'en' ? 'Your 2026 Vision Score' : 'Scorul Tău pentru Viziunea 2026'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Here\'s where you stand across the 4 life pillars' 
            : 'Iată unde te afli în cele 4 piloni ai vieții'}
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 text-center">
        <div className="text-5xl font-bold text-primary mb-2">{overallPercentage}%</div>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Overall Life Balance Score' : 'Scor General de Echilibru'}
        </p>
      </div>

      {/* Radar Chart */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 16]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(scores).map(([category, score]) => {
          const level = getScoreLevel(score);
          const label = categoryLabels[category as QuizCategory];
          return (
            <div 
              key={category}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">
                  {language === 'en' ? label.en : label.ro}
                </span>
                <span 
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ backgroundColor: `${level.color}20`, color: level.color }}
                >
                  {score}/16
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(score / 16) * 100}%`,
                    backgroundColor: level.color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Area Message */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-1">
              {resultMessage.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {resultMessage.description}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-center text-white">
        <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" />
        <h3 className="text-xl font-bold mb-2">
          {language === 'en' 
            ? 'Ready to Transform Your 2026?' 
            : 'Gata să-ți Transformi 2026?'}
        </h3>
        <p className="text-white/80 text-sm mb-4">
          {language === 'en'
            ? 'Get your personalized action plan and start seeing results in 48 hours'
            : 'Primește planul tău personalizat de acțiune și vezi rezultate în 48 de ore'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => {
              const scoresParam = encodeURIComponent(JSON.stringify(scores));
              window.location.href = `/vision-2026/plan?scores=${scoresParam}`;
            }}
            className="w-full sm:w-auto"
          >
            <Target className="w-4 h-4 mr-2" />
            {language === 'en' ? 'View My 2026 Plan' : 'Vezi Planul Meu 2026'}
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => {
              const scoresParam = encodeURIComponent(JSON.stringify(scores));
              window.location.href = `/auth?from=vision-plan&scores=${scoresParam}`;
            }}
            className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 animate-pulse hover:animate-none"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Implement Now - 7 Days Free' : 'Implementează Acum - 7 Zile Gratuit'}
          </Button>
        </div>
        <p className="text-white/60 text-xs mt-3">
          {language === 'en' 
            ? '✓ We create your tasks automatically • No credit card' 
            : '✓ Creăm task-urile automat • Fără card de credit'}
        </p>
      </div>
    </div>
  );
};
