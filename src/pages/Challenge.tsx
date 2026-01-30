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
    titleEn: "🔥 VISION + DECLARATION",
    titleRo: "🔥 VIZIUNE + DECLARAȚIE",
    subtitleEn: "Napoleon Hill Vision + Join Community + Invite Friends",
    subtitleRo: "Viziune Napoleon Hill + Join Community + Invită Prieteni",
    icon: Flame,
    color: "from-purple-500 to-indigo-500",
    actionPath: "/challenge/1",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 2,
    titleEn: "💪✨💕 BODY + SPIRIT + RELATIONSHIPS",
    titleRo: "💪✨💕 CORP + SPIRIT + RELAȚII",
    subtitleEn: "2026 / 90-day / 30-day goals for all 3 areas",
    subtitleRo: "Obiective 2026 / 90 zile / 30 zile pentru toate 3 ariile",
    icon: Dumbbell,
    color: "from-green-500 to-purple-500",
    actionPath: "/challenge/2",
    focusAreas: ['body', 'being', 'balance']
  },
  {
    day: 3,
    titleEn: "💰🎯 BUSINESS + DOMINO DOOR",
    titleRo: "💰🎯 BUSINESS + DOMINO DOOR",
    subtitleEn: "Business Vision + 90 Days + Monthly + Weekly Door (ONE GO)",
    subtitleRo: "Business Vision + 90 Zile + Lunar + Weekly Door (ONE GO)",
    icon: Target,
    color: "from-blue-500 to-amber-500",
    actionPath: "/challenge/3",
    focusAreas: ['business']
  },
  {
    day: 4,
    titleEn: "⚡ WARRIOR ROUTINE + VISION AI + MEDITATION",
    titleRo: "⚡ WARRIOR ROUTINE + VISION AI + MEDITAȚIE",
    subtitleEn: "Daily routine + AI images + personalized meditation",
    subtitleRo: "Rutină zilnică + Imagini AI + Meditație personalizată",
    icon: Sparkles,
    color: "from-cyan-500 to-purple-500",
    actionPath: "/challenge/4",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 5,
    titleEn: "🧠 ACCOUNTABILITY + MIND COACH",
    titleRo: "🧠 ACCOUNTABILITY + MIND COACH",
    subtitleEn: "Status check + Transform emotions into power",
    subtitleRo: "Status check + Transformă emoțiile în putere",
    icon: Brain,
    color: "from-red-500 to-pink-500",
    actionPath: "/challenge/5",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 6,
    titleEn: "💡 IDEA LIST (STRATEGIC FILTER)",
    titleRo: "💡 IDEA LIST (FILTRU STRATEGIC)",
    subtitleEn: "Impulse control + Eisenhower classification",
    subtitleRo: "Controlul impulsului + Clasificare Eisenhower",
    icon: Target,
    color: "from-amber-500 to-yellow-500",
    actionPath: "/challenge/6",
    focusAreas: ['business']
  },
  {
    day: 7,
    titleEn: "🏆 MEMBERSHIP + CONTINUITY",
    titleRo: "🏆 MEMBERSHIP + CONTINUITATE",
    subtitleEn: "Recap + Upgrade + Invite final friends",
    subtitleRo: "Recap + Upgrade + Invită prieteni finali",
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
    isDayPremium,
    isAuthenticated,
    hasPremiumAccess
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
          {challengeDays.map((day, index) => {
            const Icon = day.icon;
            const unlocked = isDayUnlocked(day.day);
            const completed = isDayCompleted(day.day);
            const isPremium = isDayPremium(day.day);
            const isFreeDay = day.day <= 2;
            
            // Show upgrade card between Day 2 and Day 3 for non-premium users
            const showUpgradeCard = day.day === 3 && isAuthenticated && !hasPremiumAccess;
            
            return (
              <div key={day.day} className="space-y-4">
                {/* Upgrade Gate Card - between Day 2 and Day 3 */}
                {showUpgradeCard && (
                  <Card className="p-6 border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-background to-orange-500/10">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <Lock className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          🔥 {language === 'en' ? 'Unlock Days 3-7' : 'Deblochează Zilele 3-7'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === 'en' 
                            ? 'Continue your transformation with 5-day FREE trial + Early Bird 50% OFF'
                            : 'Continuă transformarea cu 5 zile TRIAL gratuit + Early Bird 50% REDUCERE'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                            ✓ 5 {language === 'en' ? 'Days Trial' : 'Zile Trial'}
                          </Badge>
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                            🔥 50% {language === 'en' ? 'OFF' : 'Reducere'}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/pricing')}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        {language === 'en' ? 'Start 5-Day Trial' : 'Începe 5 Zile Trial'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                )}
              
                <Card 
                  className={`p-4 transition-all duration-300 ${
                    unlocked 
                      ? 'bg-card border-primary/20 hover:border-primary/40 cursor-pointer' 
                      : 'bg-muted/30 border-border/50 opacity-60'
                  } ${completed ? 'ring-2 ring-green-500/50' : ''} ${isPremium && !hasPremiumAccess ? 'border-amber-500/30' : ''}`}
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
                      {isPremium && !hasPremiumAccess && (
                        <span className="absolute -top-2 -right-2">
                          <Crown className="h-5 w-5 text-amber-400" />
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {language === 'en' ? day.titleEn : day.titleRo}
                        </h3>
                        {/* Badge for Free/Premium/Trial */}
                        {isFreeDay && completed && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
                            ✓ {language === 'en' ? 'FREE' : 'GRATUIT'}
                          </Badge>
                        )}
                        {isFreeDay && !completed && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
                            {language === 'en' ? 'FREE' : 'GRATUIT'}
                          </Badge>
                        )}
                        {isPremium && hasPremiumAccess && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-xs">
                            🔓 {language === 'en' ? 'UNLOCKED' : 'DEBLOCAT'}
                          </Badge>
                        )}
                        {isPremium && !hasPremiumAccess && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                            🔒 Premium
                          </Badge>
                        )}
                      </div>
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
              </div>
            );
          })}
        </div>

        {/* CTA for Trial */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 text-foreground">
              {language === 'en' 
                ? '🦅 Start Your FREE Challenge: 2 Days + 5-Day Trial' 
                : '🦅 Începe Challenge-ul GRATUIT: 2 Zile + 5 Zile Trial'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en'
                ? '2 days FREE to start, then unlock days 3-7 with a 5-day trial!'
                : '2 zile GRATUIT pentru început, apoi deblochează zilele 3-7 cu 5 zile trial!'}
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
