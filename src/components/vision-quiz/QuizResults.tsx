import React, { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { categoryLabels, categoryDescriptions, getScoreLevel, getResultsMessage, QuizCategory } from './quizData';
import { Rocket, Target, Sparkles, TrendingUp, Crown, Zap, Check, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface QuizResultsProps {
  scores: Record<QuizCategory, number>;
  language: 'en' | 'ro';
  onStartTrial: () => void;
}

const UPSELL_PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: '49',
    originalPrice: '98',
    currency: '€',
    period: '/ lună',
    highlight: 'Early Bird',
    benefits: [
      'AI Coaching personalizat',
      'Champion Routine completă',
      'Door - planificare săptămânală',
      'Stacks pentru reset rapid'
    ],
    featured: true
  },
  {
    id: 'free',
    name: 'Trial',
    price: '0',
    afterTrialPrice: '49',
    currency: '€',
    period: '/ 3 zile',
    highlight: '3 Zile Gratuit',
    benefits: [
      '3 zile acces complet GRATUIT',
      'Toate funcțiile Pro incluse',
      'Anulează oricând în trial',
      'Apoi doar €49/lună'
    ],
    featured: false,
    isTrial: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '497',
    currency: '€',
    period: '/ lună',
    highlight: 'Complet',
    benefits: [
      'Tot din Pro +',
      'Warrior Launch Accelerator',
      'Coaching LIVE',
      'Comunitate VIP Elite'
    ],
    featured: true
  }
];

export const QuizResults: React.FC<QuizResultsProps> = ({
  scores,
  language,
  onStartTrial,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  
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

  const handleCheckout = async (planId: string) => {
    setIsLoading(planId);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.info(language === 'en' 
          ? 'Please sign in to continue with the purchase.' 
          : 'Te rugăm să te autentifici pentru a continua cu achiziția.');
        const scoresParam = encodeURIComponent(JSON.stringify(scores));
        navigate('/auth', { 
          state: { 
            returnUrl: `/vision-2026?scores=${scoresParam}`,
            plan: planId
          } 
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'vision-quiz' },
      });

      if (error) {
        let message = error.message;
        const anyErr = error as any;
        if (anyErr?.context) {
          try {
            const body = await anyErr.context.json();
            message = body?.error ?? message;
          } catch {
            // ignore
          }
        } else if ((data as any)?.error) {
          message = (data as any).error;
        }
        throw new Error(message);
      }

      if ((data as any)?.url) {
        window.location.href = (data as any).url;
        return;
      }

      throw new Error((data as any)?.error ?? 'Nu s-a putut crea sesiunea de plată');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Checkout error:', { planId, message, error });
      toast.error(message || 'A apărut o eroare. Încearcă din nou.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
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

      {/* Upsell Section */}
      <div className="space-y-4 pt-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-amber-400" />
            <span className="text-sm uppercase tracking-widest text-amber-400 font-bold">
              {language === 'en' ? 'Next Step' : 'Pasul Următor'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {language === 'en' 
              ? 'Transform Your Score into Action' 
              : 'Transformă Scorul în Acțiune'}
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm">
            {language === 'en'
              ? 'With a score of ' + totalScore + '/64, you have room to grow. Get the tools to accelerate your transformation.'
              : 'Cu un scor de ' + totalScore + '/64, ai spațiu de creștere. Primește uneltele pentru a-ți accelera transformarea.'}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {UPSELL_PLANS.map((plan) => {
            const isElite = plan.id === 'elite';
            const isTrial = plan.id === 'free';
            const isPro = plan.id === 'pro';
            
            return (
              <Card 
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 bg-white/5 backdrop-blur-sm",
                  isElite 
                    ? "border-2 border-amber-500/50" 
                    : isTrial
                      ? "border border-green-500/50"
                      : "border-2 border-purple-500/50"
                )}
              >
                <div className={cn(
                  "absolute top-0 left-0 w-full h-1",
                  isElite 
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"
                    : isTrial
                      ? "bg-gradient-to-r from-green-500/50 via-emerald-500/50 to-green-500/50"
                      : "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                )} />
                
                {plan.highlight && (
                  <Badge 
                    className={cn(
                      "absolute top-4 right-4 border-0 text-xs",
                      isElite 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : isTrial
                          ? "bg-green-500 text-white"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    )}
                  >
                    {plan.highlight}
                  </Badge>
                )}

                <CardContent className="p-5">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      {isElite ? (
                        <Crown className="h-5 w-5 text-amber-500" />
                      ) : isTrial ? (
                        <Sparkles className="h-5 w-5 text-green-500" />
                      ) : (
                        <Zap className="h-5 w-5 text-purple-400" />
                      )}
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    </div>
                    
                    {plan.originalPrice && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white/40 line-through text-sm">
                          {plan.currency}{plan.originalPrice}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-3xl font-black",
                        isElite ? "text-amber-500" : isTrial ? "text-green-500" : "text-white"
                      )}>
                        {plan.currency}{plan.price}
                      </span>
                      <span className="text-white/50 text-sm">{plan.period}</span>
                    </div>
                    
                    {(plan as any).afterTrialPrice && (
                      <p className="text-xs text-white/50 mt-1">
                        {language === 'en' ? 'Then' : 'Apoi'} {plan.currency}{(plan as any).afterTrialPrice}/{language === 'en' ? 'month' : 'lună'}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.benefits.map((benefit, bidx) => (
                      <li key={bidx} className="flex items-start gap-2 text-xs">
                        <Check className={cn(
                          "h-3 w-3 mt-0.5 flex-shrink-0",
                          isElite ? "text-amber-500" : isTrial ? "text-green-500" : "text-green-400"
                        )} />
                        <span className="text-white/70">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isLoading !== null}
                    variant="default"
                    size="sm"
                    className={cn(
                      "w-full gap-2",
                      isElite 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" 
                        : isTrial
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
                    )}
                  >
                    {isLoading === plan.id ? (
                      <>
                        <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        {language === 'en' ? 'Processing...' : 'Se procesează...'}
                      </>
                    ) : (
                      <>
                        {isElite && <Crown className="h-3 w-3" />}
                        {isPro && <Star className="h-3 w-3" />}
                        {isTrial && <Sparkles className="h-3 w-3" />}
                        {isTrial 
                          ? (language === 'en' ? 'Start Free Trial' : 'Începe Trial Gratuit') 
                          : (language === 'en' ? `Choose ${plan.name}` : `Alege ${plan.name}`)}
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Free Option */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              // Navigate with state to start Goal Wizard with lowest category pre-selected
              navigate('/door?tab=annual&startWizard=true', { 
                state: { 
                  fromVisionQuiz: true, 
                  scores,
                  suggestedCategory: lowestCategory
                } 
              });
            }}
            className="gap-2 text-white/50 hover:text-white hover:bg-white/10 text-sm"
          >
            {language === 'en' 
              ? 'Continue without subscription (limited features)' 
              : 'Continuă fără abonament (funcții limitate)'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-white/40 text-xs text-center">
          {language === 'en' 
            ? '✓ Your results have been saved and sent to your email' 
            : '✓ Rezultatele tale au fost salvate și trimise pe email'}
        </p>
      </div>
    </div>
  );
};
