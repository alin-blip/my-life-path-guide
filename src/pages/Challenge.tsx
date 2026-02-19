import React, { useEffect, useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ProgramsLayout } from '@/components/programs/ProgramsLayout';
import { ChallengeSidebar } from '@/components/programs/ChallengeSidebar';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Target, Sparkles, Play, Lock, CheckCircle2, ArrowRight, Rocket, Dumbbell, Brain, Trophy, Crown, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { EarlyBirdCountdown } from '@/components/membership/EarlyBirdCountdown';
import { ChallengeCoachWidget } from '@/components/challenge/ChallengeCoachWidget';
import { InstallAppPrompt } from '@/components/pwa/InstallAppPrompt';
import { ChallengeAudioPlayer } from '@/components/challenge/ChallengeAudioPlayer';
import { ChallengeScriptCard } from '@/components/challenge/ChallengeScriptCard';
import { ChallengeInlineChat } from '@/components/challenge/ChallengeInlineChat';
import { ChallengeIntakeModal } from '@/components/challenge/ChallengeIntakeModal';
import { COMMUNITY_URL } from '@/config/socialLinks';
import { getDayScriptRo } from '@/data/challengeScriptsRo';
import { getDayScript } from '@/data/challengeScripts';
import { supabase } from '@/integrations/supabase/client';

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
const challengeDays: ChallengeDay[] = [{
  day: 1,
  titleEn: "VISION + DECLARATION",
  titleRo: "VIZIUNE + DECLARAȚIE",
  subtitleEn: "Map reality + Set direction",
  subtitleRo: "Evaluează realitatea + Setează direcția",
  icon: Flame,
  color: "from-purple-500 to-indigo-500",
  actionPath: "/challenge/1",
  focusAreas: ['body', 'being', 'balance', 'business']
}, {
  day: 2,
  titleEn: "BODY + SPIRIT + RELATIONSHIPS",
  titleRo: "CORP + SPIRIT + RELAȚII",
  subtitleEn: "Rebuild energy: Body, Spirit & Relationships goals",
  subtitleRo: "Reconstruiește energia: obiective Corp, Spirit & Relații",
  icon: Dumbbell,
  color: "from-green-500 to-purple-500",
  actionPath: "/challenge/2",
  focusAreas: ['body', 'being', 'balance']
}, {
  day: 3,
  titleEn: "BUSINESS + DOMINO DOOR",
  titleRo: "BUSINESS + DOMINO DOOR",
  subtitleEn: "Stop the planning loop — Build your execution machine",
  subtitleRo: "Oprește ciclul planificării — Construiește mașina de execuție",
  icon: Target,
  color: "from-blue-500 to-amber-500",
  actionPath: "/challenge/3",
  focusAreas: ['business']
}, {
  day: 4,
  titleEn: "WARRIOR ROUTINE + VISION AI + MEDITATION",
  titleRo: "WARRIOR ROUTINE + VISION AI + MEDITAȚIE",
  subtitleEn: "Anti-burnout routine + AI vision + personalized meditation",
  subtitleRo: "Rutină anti-burnout + Viziune AI + Meditație personalizată",
  icon: Sparkles,
  color: "from-cyan-500 to-purple-500",
  actionPath: "/challenge/4",
  focusAreas: ['body', 'being', 'balance', 'business']
}, {
  day: 5,
  titleEn: "ACCOUNTABILITY + MIND COACH",
  titleRo: "ACCOUNTABILITY + MIND COACH",
  subtitleEn: "Break emotional resistance + Transform procrastination into momentum",
  subtitleRo: "Sparge rezistența emoțională + Transformă procrastinarea în momentum",
  icon: Brain,
  color: "from-red-500 to-pink-500",
  actionPath: "/challenge/5",
  focusAreas: ['body', 'being', 'balance', 'business']
}, {
  day: 6,
  titleEn: "IDEA LIST (STRATEGIC FILTER)",
  titleRo: "IDEA LIST (FILTRU STRATEGIC)",
  subtitleEn: "Protect your momentum from shiny distractions",
  subtitleRo: "Protejează-ți momentum-ul de distracții strălucitoare",
  icon: Target,
  color: "from-amber-500 to-yellow-500",
  actionPath: "/challenge/6",
  focusAreas: ['business']
}, {
  day: 7,
  titleEn: "MEMBERSHIP + CONTINUITY",
  titleRo: "MEMBERSHIP + CONTINUITATE",
  subtitleEn: "Make the momentum permanent + Continue the system",
  subtitleRo: "Fă momentum-ul permanent + Continuă sistemul",
  icon: Trophy,
  color: "from-amber-500 to-yellow-600",
  actionPath: "/challenge/7",
  focusAreas: ['body', 'being', 'balance', 'business']
}];
// Area colors kept for potential future use but not rendered in cards
const ChallengePage = () => {
  const {
    language
  } = useLanguage();
  const {
    user,
    earlyBirdExpiresAt,
    isEarlyBirdActive,
    subscribed
  } = useAuth();
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
    hasPremiumAccess,
    trackChallengeStarted
  } = useChallengeProgress();

  // Intake modal state
  const [showIntake, setShowIntake] = useState(false);
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const done = localStorage.getItem('challenge_intake_done');
    if (done) return;
    supabase
      .from('challenge_intake')
      .select('id')
      .eq('user_id', user?.id ?? '')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setShowIntake(true);
        else localStorage.setItem('challenge_intake_done', 'true');
      });
  }, [isAuthenticated, loading, user?.id]);

  // FIX: Fallback session check for fresh signups from challenge landing
  const [sessionCheckDone, setSessionCheckDone] = useState(false);
  useEffect(() => {
    if (!sessionCheckDone && !loading) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session && !isAuthenticated) {
          console.log('[Challenge] Session mismatch detected, reloading to sync auth state');
          window.location.reload();
        }
        setSessionCheckDone(true);
      });
    }
  }, [loading, isAuthenticated, sessionCheckDone]);

  // Automatically track challenge started when authenticated user enters
  useEffect(() => {
    if (isAuthenticated && !loading) {
      trackChallengeStarted();
    }
  }, [isAuthenticated, loading, trackChallengeStarted]);
  const handleStartDay = (day: ChallengeDay) => {
    if (!isDayUnlocked(day.day)) return;
    navigate(day.actionPath);
  };
  if (loading) {
    return <ProgramsLayout activeTab="classroom" showNavBar={false} sidebar={<ChallengeSidebar />}>
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-2" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>
          <Skeleton className="h-24 w-full mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        </div>
      </ProgramsLayout>;
  }

  // Hero video URL
  const heroVideoUrl = "https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=EmSYV-az3RPM1F2dgE82gFhgBtO6C9nQVNVAE4IeNa7M1V0a6&videoRatio=1.777778&type=v&skinColor=%232758EB";
  return <>
      <ChallengeIntakeModal open={showIntake} onComplete={() => setShowIntake(false)} />
      <ChallengeCoachWidget currentDay={currentDay} />
      <ProgramsLayout activeTab="classroom" showNavBar={false} sidebar={<ChallengeSidebar />}>
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {language === 'en' 
                ? 'From burnout & blockage to clarity, results & momentum in body, spirit, relationships & business in 7 days' 
                : 'De la blocaj și epuizare la claritate, rezultate și momentum în corp, spiritualitate, relații și business în 7 zile'}
            </h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? "The world's first operating system for an abundant and balanced life. Built in Romania."
              : 'Primul sistem de operare pentru o viață abundentă și echilibrată din lume. Construit în România.'}
          </p>
          
          
        </div>

        {/* Hero Video */}
        <Collapsible defaultOpen className="mb-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-card border border-primary/20 hover:border-primary/40 transition-all group">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">
                {language === 'ro' ? '🎬 Video introducere' : '🎬 Intro video'}
              </span>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground group-data-[state=open]:hidden" />
            <ChevronUp className="h-5 w-5 text-muted-foreground group-data-[state=closed]:hidden" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 max-w-2xl mx-auto">
              <div className="relative w-full rounded-xl overflow-hidden" style={{
                paddingBottom: '56.25%',
                boxShadow: '0 0 30px 4px rgba(59, 130, 246, 0.5), 0 0 60px 8px rgba(59, 130, 246, 0.3)'
              }}>
                <iframe src={heroVideoUrl} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute top-0 left-0 w-full h-full" />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Skool Community */}
        <Card className="mb-6 p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                S
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  {language === 'en' ? 'Join our Skool community' : 'Alătură-te comunității pe Skool'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Connect with fellow warriors for support & accountability' : 'Conectează-te cu alți warriors pentru suport & accountability'}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => window.open(COMMUNITY_URL, '_blank')}
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
            >
              {language === 'en' ? 'Join community' : 'Intră în comunitate'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Install App Prompt */}
        <InstallAppPrompt />

        {/* Early Bird Countdown Banner for Trial Users */}
        {isAuthenticated && !subscribed && isEarlyBirdActive && earlyBirdExpiresAt && <Card className="p-4 mb-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-amber-400" />
                  <span className="font-bold text-amber-400">
                    {language === 'en' ? 'EARLY BIRD - 50% OFF' : 'EARLY BIRD - 50% REDUCERE'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Lock in the lowest price before your trial ends!' : 'Blochează cel mai mic preț înainte să expire trial-ul!'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <EarlyBirdCountdown expiresAt={earlyBirdExpiresAt} compact />
                <Button onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 whitespace-nowrap">
                  {language === 'en' ? 'Upgrade Now' : 'Upgrade Acum'}
                </Button>
              </div>
            </div>
          </Card>}

        {/* Login Banner for Unauthenticated Users */}
        {!isAuthenticated && <Card className="p-4 mb-6 bg-amber-500/10 border-amber-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-medium text-foreground">
                  {language === 'en' ? "Don't lose momentum — Save your progress" : 'Nu pierde momentum-ul — Salvează progresul'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Create a free account to track your challenge progress' : 'Creează un cont gratuit pentru a-ți urmări progresul'}
                </p>
              </div>
              <Button onClick={() => navigate('/auth?redirect=/challenge')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 whitespace-nowrap">
                {language === 'en' ? 'Create Free Account' : 'Creează Cont Gratuit'}
              </Button>
            </div>
          </Card>}

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
            {!isAuthenticated ? language === 'en' ? 'Login to track your progress' : 'Autentifică-te pentru a-ți urmări progresul' : progressPercentage === 100 ? language === 'en' ? 'Challenge Complete! You broke the burnout cycle!' : 'Challenge Complet! Ai spart ciclul burnout-ului!' : language === 'en' ? `Day ${currentDay} of 7 - Momentum is building!` : `Ziua ${currentDay} din 7 - Momentum-ul crește!`}
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
            return <div key={day.day} className="space-y-4">
                {/* Upgrade Gate Card - between Day 2 and Day 3 */}
                {showUpgradeCard && <Card className="p-6 border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-background to-orange-500/10">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <Lock className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {language === 'en' ? 'Continue the Momentum — Days 3-7' : 'Continuă Momentum-ul — Zilele 3-7'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === 'en' ? 'Keep building momentum with 5-day FREE trial + Early Bird 50% OFF' : 'Continuă momentum-ul cu 5 zile TRIAL gratuit + Early Bird 50% REDUCERE'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                            5 {language === 'en' ? 'Days Trial' : 'Zile Trial'}
                          </Badge>
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                            50% {language === 'en' ? 'OFF' : 'Reducere'}
                          </Badge>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        {language === 'en' ? 'Start 5-Day Trial' : 'Începe 5 Zile Trial'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </Card>}
              
                <Card className={`transition-all duration-300 ${unlocked ? 'bg-card border-primary/20 hover:border-primary/40 cursor-pointer' : 'bg-muted/30 border-border/50 opacity-60'} ${completed ? 'ring-2 ring-green-500/50' : ''} ${isPremium && !hasPremiumAccess ? 'border-amber-500/30' : ''}`} onClick={() => handleStartDay(day)}>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Day Number & Icon */}
                      <div className={`relative flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${day.color} ${!unlocked ? 'grayscale' : ''}`}>
                        {completed ? <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" /> : unlocked ? <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" /> : <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-white/70" />}
                        <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-background border-2 border-primary rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary">
                          {day.day}
                        </span>
                        {isPremium && !hasPremiumAccess && <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2">
                            <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                          </span>}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
                          <h3 className={`font-bold text-sm sm:text-lg leading-tight ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {language === 'en' ? day.titleEn : day.titleRo}
                          </h3>
                          {/* Badge for Free/Premium/Trial */}
                          {isFreeDay && <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-[10px] sm:text-xs px-1.5 py-0">
                              {language === 'en' ? 'FREE' : 'GRATUIT'}
                            </Badge>}
                          {isPremium && hasPremiumAccess && <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[10px] sm:text-xs px-1.5 py-0">
                              {language === 'en' ? 'UNLOCKED' : 'DEBLOCAT'}
                            </Badge>}
                          {isPremium && !hasPremiumAccess && <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] sm:text-xs px-1.5 py-0">
                              Premium
                            </Badge>}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {language === 'en' ? day.subtitleEn : day.subtitleRo}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        {completed ? <Button variant="outline" size="sm" className="border-green-500/50 text-green-500 h-8 px-2 sm:px-3 text-xs sm:text-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">{language === 'en' ? 'Done' : 'Gata'}</span>
                          </Button> : unlocked ? <Button size="sm" className={`bg-gradient-to-r ${day.color} hover:opacity-90 h-8 px-2 sm:px-3 text-xs sm:text-sm`} onClick={e => {
                        e.stopPropagation();
                        handleStartDay(day);
                      }}>
                            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">{language === 'en' ? 'Start' : 'Începe'}</span>
                          </Button> : <Button variant="ghost" size="sm" disabled className="h-8 px-2">
                            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>;
          })}
        </div>


        {/* CTA for Trial */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 text-foreground">
              {language === 'en' ? 'Break free from burnout: 2 Days Free + 5-Day Trial' : 'Ieși din burnout: 2 Zile Gratuit + 5 Zile Trial'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en' ? '2 days FREE to start building momentum, then unlock days 3-7 with a 5-day trial!' : '2 zile GRATUIT pentru a construi momentum, apoi deblochează zilele 3-7 cu 5 zile trial!'}
            </p>
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" onClick={() => handleStartDay(challengeDays[0])}>
              {language === 'en' ? 'Begin Challenge' : 'Începe Provocarea'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
        </div>
      </ProgramsLayout>
    </>;
};
export default ChallengePage;