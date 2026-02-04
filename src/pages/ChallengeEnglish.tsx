import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Sparkles, 
  Trophy,
  Target,
  Heart,
  Brain,
  Lightbulb,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ChallengeAudioPlayer } from '@/components/challenge/english/ChallengeAudioPlayer';
import { ChallengeScriptCard } from '@/components/challenge/english/ChallengeScriptCard';
import { ChallengeInlineChat } from '@/components/challenge/english/ChallengeInlineChat';
import { ChallengeInviteFriends } from '@/components/challenge/ChallengeInviteFriends';
import { ChallengeComments } from '@/components/challenge/ChallengeComments';
import { getChallengeIntroScript } from '@/data/challengeScripts';

import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

const days = [
  { day: 1, icon: Target, title: 'Vision + Declaration', free: true },
  { day: 2, icon: Heart, title: 'Body, Spirit & Relationships', free: true },
  { day: 3, icon: Rocket, title: 'Business + Domino Door', free: false },
  { day: 4, icon: Zap, title: 'Warrior Routine + AI Vision', free: false },
  { day: 5, icon: Brain, title: 'Accountability + Mind Coach', free: false },
  { day: 6, icon: Lightbulb, title: 'Strategic Impulse Control', free: false },
  { day: 7, icon: Trophy, title: 'Integration + Continuity', free: false },
];

const ChallengeEnglish: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setLanguage } = useLanguage();
  const script = getChallengeIntroScript();

  // Force English language for this page
  useEffect(() => {
    setLanguage('en');
  }, [setLanguage]);

  const handleStartChallenge = () => {
    if (user) {
      navigate('/challenge/1');
    } else {
      navigate('/auth?redirect=/challenge/1');
    }
  };

  const handleDayClick = (day: number, free: boolean) => {
    if (!free) return;
    
    if (user) {
      navigate(`/challenge/${day}`);
    } else {
      navigate(`/auth?redirect=/challenge/${day}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-12 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            FREE ACCESS - DAYS 1-2
          </Badge>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            Have It All Lifestyle Challenge
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            7 Days to Transform Every Area of Your Life
          </p>
        </div>
      </section>

      {/* Audio + Script Card */}
      <section className="px-4 pb-8">
        <Card className="max-w-3xl mx-auto overflow-hidden border-amber-500/20 shadow-lg shadow-amber-500/5">
          <ChallengeAudioPlayer script={script} />
          <ChallengeScriptCard script={script} maxHeight="350px" />
        </Card>
      </section>

      {/* Inline Chat */}
      <section className="px-4 pb-8">
        <Card className="max-w-3xl mx-auto overflow-hidden border-amber-500/20">
          <ChallengeInlineChat currentDay={0} />
        </Card>
      </section>

      {/* 7-Day Overview */}
      <section className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-500" />
            Your 7-Day Transformation Map
          </h2>

          <div className="grid gap-3">
            {days.map(({ day, icon: Icon, title, free }) => (
              <Card
                key={day}
                onClick={() => handleDayClick(day, free)}
                className={cn(
                  'p-4 transition-all',
                  free
                    ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent cursor-pointer hover:shadow-md hover:border-amber-500/50'
                    : 'border-border/50 opacity-80 cursor-not-allowed'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      free
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                        : 'bg-muted'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', free ? 'text-white' : 'text-muted-foreground')} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Day {day}</span>
                      {free && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                          FREE
                        </Badge>
                      )}
                      {!free && (
                        <Badge variant="secondary" className="text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                  </div>

                  {free ? (
                    <ArrowRight className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <section className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={handleStartChallenge}
            size="lg"
            className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 shadow-lg shadow-amber-500/20"
          >
            <Rocket className="h-5 w-5 mr-2" />
            Start Day 1 Now — Free Access
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            No credit card required • Instant access • Days 1-2 completely free
          </p>
        </div>
      </section>

      {/* Invite Friends */}
      <section className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <ChallengeInviteFriends dayNumber={1} />
        </div>
      </section>

      {/* Community Comments */}
      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Community
          </h2>
          <Card className="p-4">
            <ChallengeComments dayNumber={0} />
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ChallengeEnglish;
