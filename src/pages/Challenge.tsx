import React from 'react';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Flame, Heart, Target, Zap, Gift, BookOpen, Crown,
  Play, Lock, CheckCircle2, ArrowRight, Rocket, Dumbbell, Brain, Users,
  Sparkles, Bell, Trophy, Map, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { EarlyBirdCountdown } from '@/components/membership/EarlyBirdCountdown';

interface ChallengeDay {
  day: number;
  titleEn: string;
  titleRo: string;
  subtitleEn: string;
  subtitleRo: string;
  icon: React.ElementType;
  color: string;
  actionPath: string;
  focusAreas: ('body' | 'being' | 'balance' | 'business')[];
}

const challengeDays: ChallengeDay[] = [
  {
    day: 1,
    titleEn: "🚀 PLATFORM TOUR",
    titleRo: "🚀 TOUR PLATFORMĂ",
    subtitleEn: "Discover all the tools at your disposal",
    subtitleRo: "Descoperă toate instrumentele disponibile",
    icon: Map,
    color: "from-purple-500 to-indigo-500",
    actionPath: "/challenge/1",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 2,
    titleEn: "💪✨ BODY + BEING",
    titleRo: "💪✨ CORP + SPIRIT",
    subtitleEn: "Set objectives for health & inner peace",
    subtitleRo: "Setează obiective pentru sănătate și pace interioară",
    icon: Target,
    color: "from-green-500 to-purple-500",
    actionPath: "/challenge/2",
    focusAreas: ['body', 'being']
  },
  {
    day: 3,
    titleEn: "💕💰 BALANCE + BUSINESS",
    titleRo: "💕💰 RELAȚII + BUSINESS",
    subtitleEn: "Set objectives for relationships & career",
    subtitleRo: "Setează obiective pentru relații și carieră",
    icon: Target,
    color: "from-pink-500 to-blue-500",
    actionPath: "/challenge/3",
    focusAreas: ['balance', 'business']
  },
  {
    day: 4,
    titleEn: "🏆 CHAMPION ROUTINE",
    titleRo: "🏆 RUTINA CAMPIONULUI",
    subtitleEn: "Configure your winning morning routine",
    subtitleRo: "Configurează-ți rutina matinală câștigătoare",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    actionPath: "/challenge/4",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 5,
    titleEn: "✨ AI VISION",
    titleRo: "✨ VIZIUNE AI",
    subtitleEn: "Generate images & personalized meditation",
    subtitleRo: "Generează imagini și meditație personalizată",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-500",
    actionPath: "/challenge/5",
    focusAreas: ['being']
  },
  {
    day: 6,
    titleEn: "🔔 ACCOUNTABILITY",
    titleRo: "🔔 ACCOUNTABILITY",
    subtitleEn: "Set up your notification system",
    subtitleRo: "Configurează-ți sistemul de notificări",
    icon: Bell,
    color: "from-red-500 to-pink-500",
    actionPath: "/challenge/6",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 7,
    titleEn: "🎯 PUTTING IT ALL TOGETHER",
    titleRo: "🎯 PUNEM TOTUL ÎMPREUNĂ",
    subtitleEn: "Complete recap + Premium upgrade",
    subtitleRo: "Recapitulare completă + Upgrade Premium",
    icon: Trophy,
    color: "from-amber-500 to-yellow-600",
    actionPath: "/challenge/7",
    focusAreas: ['body', 'being', 'balance', 'business']
  }
];

const areaColors = {
  body: 'bg-green-500',
  being: 'bg-purple-500',
  balance: 'bg-pink-500',
  business: 'bg-blue-500'
};

const areaLabels = {
  body: { en: 'Body', ro: 'Corp' },
  being: { en: 'Spirituality', ro: 'Spiritualitate' },
  balance: { en: 'Relationships', ro: 'Relații' },
  business: { en: 'Business', ro: 'Business' }
};

const ChallengePage = () => {
  const { language } = useLanguage();
  const { earlyBirdExpiresAt, isEarlyBirdActive, subscribed } = useAuth();
  const navigate = useNavigate();
  const { 
    loading, 
    completedDaysCount, 
    progressPercentage, 
    currentDay,
    isDayUnlocked, 
    isDayCompleted,
    isAuthenticated
  } = useChallengeProgress();

  const handleStartDay = (day: ChallengeDay) => {
    if (!isDayUnlocked(day.day)) return;
    navigate(day.actionPath);
  };

  if (loading) {
    return (
      <Layout>
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-2" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>
          <Skeleton className="h-24 w-full mb-8" />
          <div className="space-y-4">
            {[1,2,3,4,5,6,7].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
              {language === 'en' ? 'Have It All Lifestyle Challenge' : 'Provocarea Have It All Lifestyle'}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {language === 'en' 
              ? '7 Days to Transform Every Area of Your Life' 
              : '7 Zile pentru a Transforma Fiecare Arie a Vieții Tale'}
          </p>
          
          {/* 4 Areas Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            {(['body', 'being', 'balance', 'business'] as const).map((area) => (
              <div key={area} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${areaColors[area]}`} />
                <span className="text-sm text-muted-foreground">
                  {language === 'en' ? areaLabels[area].en : areaLabels[area].ro}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Early Bird Countdown Banner for Trial Users */}
        {isAuthenticated && !subscribed && isEarlyBirdActive && earlyBirdExpiresAt && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-amber-400" />
                  <span className="font-bold text-amber-400">
                    {language === 'en' ? 'EARLY BIRD - 50% OFF' : 'EARLY BIRD - 50% REDUCERE'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Lock in the lowest price before your trial ends!' 
                    : 'Blochează cel mai mic preț înainte să expire trial-ul!'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <EarlyBirdCountdown expiresAt={earlyBirdExpiresAt} compact />
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 whitespace-nowrap"
                >
                  {language === 'en' ? 'Upgrade Now' : 'Upgrade Acum'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Login Banner for Unauthenticated Users */}
        {!isAuthenticated && (
          <Card className="p-4 mb-6 bg-amber-500/10 border-amber-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-medium text-foreground">
                  {language === 'en' ? '🔐 Save Your Progress' : '🔐 Salvează-ți Progresul'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Create a free account to track your challenge progress' 
                    : 'Creează un cont gratuit pentru a-ți urmări progresul'}
                </p>
              </div>
              <Button 
                onClick={() => navigate('/auth?redirect=/challenge')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 whitespace-nowrap"
              >
                {language === 'en' ? 'Create Free Account' : 'Creează Cont Gratuit'}
              </Button>
            </div>
          </Card>
        )}

        {/* Progress Card */}
        <Card className="p-6 mb-8 bg-card border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              {language === 'en' ? 'Your Progress' : 'Progresul Tău'}
            </span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {completedDaysCount}/7 {language === 'en' ? 'Days' : 'Zile'}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            {!isAuthenticated 
              ? (language === 'en' ? 'Login to track your progress' : 'Autentifică-te pentru a-ți urmări progresul')
              : progressPercentage === 100 
                ? (language === 'en' ? '🎉 Challenge Complete! You are a Have It All Achiever!' : '🎉 Challenge Complet! Ești un Realizator Have It All!')
                : (language === 'en' ? `Day ${currentDay} of 7 - Keep going!` : `Ziua ${currentDay} din 7 - Continuă!`)}
          </p>
        </Card>

        {/* Challenge Days Grid */}
        <div className="space-y-4">
          {challengeDays.map((day) => {
            const Icon = day.icon;
            const unlocked = isDayUnlocked(day.day);
            const completed = isDayCompleted(day.day);
            
            return (
              <Card 
                key={day.day}
                className={`p-4 transition-all duration-300 ${
                  unlocked 
                    ? 'bg-card border-primary/20 hover:border-primary/40 cursor-pointer' 
                    : 'bg-muted/30 border-border/50 opacity-60'
                } ${completed ? 'ring-2 ring-green-500/50' : ''}`}
                onClick={() => handleStartDay(day)}
              >
                <div className="flex items-center gap-4">
                  {/* Day Number & Icon */}
                  <div className={`relative flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${day.color} ${!unlocked ? 'grayscale' : ''}`}>
                    {completed ? (
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    ) : unlocked ? (
                      <Icon className="h-8 w-8 text-white" />
                    ) : (
                      <Lock className="h-6 w-6 text-white/70" />
                    )}
                    <span className="absolute -top-2 -left-2 w-6 h-6 bg-background border-2 border-primary rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {day.day}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {language === 'en' ? day.titleEn : day.titleRo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? day.subtitleEn : day.subtitleRo}
                    </p>
                    {/* Focus Areas Badges */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {day.focusAreas.map((area) => (
                        <div 
                          key={area} 
                          className={`w-2.5 h-2.5 rounded-full ${areaColors[area]}`}
                          title={language === 'en' ? areaLabels[area].en : areaLabels[area].ro}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {completed ? (
                      <Button variant="outline" size="sm" className="border-green-500/50 text-green-500">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {language === 'en' ? 'Done' : 'Gata'}
                      </Button>
                    ) : unlocked ? (
                      <Button 
                        size="sm" 
                        className={`bg-gradient-to-r ${day.color} hover:opacity-90`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartDay(day);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        {language === 'en' ? 'Start' : 'Începe'}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA for Trial */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 text-foreground">
              {language === 'en' 
                ? '🦅 Start Your FREE 7-Day Transformation' 
                : '🦅 Începe Transformarea ta GRATUITĂ de 7 Zile'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en'
                ? 'Master Body, Being, Balance & Business — Have It ALL!'
                : 'Stăpânește Corpul, Spiritul, Relațiile și Business-ul — Ai TOTUL!'}
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={() => handleStartDay(challengeDays[0])}
            >
              {language === 'en' ? 'Begin Challenge' : 'Începe Provocarea'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ChallengePage;
