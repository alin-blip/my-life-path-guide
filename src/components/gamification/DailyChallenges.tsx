import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { useXPSystem, XP_REWARDS } from '@/hooks/useXPSystem';
import { Zap, Target, BookOpen, Flame, Users, Brain, Dumbbell, Clock, CheckCircle2, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyChallenge {
  id: string;
  type: 'stack' | 'core4' | 'biz4' | 'reading' | 'streak' | 'action';
  title: { en: string; ro: string };
  description: { en: string; ro: string };
  icon: React.ElementType;
  xpReward: number;
  target: number;
  current: number;
}

const ALL_CHALLENGES: Omit<DailyChallenge, 'current'>[] = [
  {
    id: 'complete_stack',
    type: 'stack',
    title: { en: 'Morning Stack', ro: 'Stack Matinal' },
    description: { en: 'Complete your daily stack', ro: 'Completează stack-ul zilnic' },
    icon: Flame,
    xpReward: 25,
    target: 1
  },
  {
    id: 'complete_core4',
    type: 'core4',
    title: { en: 'Core 4 Master', ro: 'Maestru Core 4' },
    description: { en: 'Complete all Core 4 activities', ro: 'Completează toate activitățile Core 4' },
    icon: Target,
    xpReward: 50,
    target: 8
  },
  {
    id: 'complete_biz4',
    type: 'biz4',
    title: { en: 'Media Champion', ro: 'Campion Media' },
    description: { en: 'Complete all Biz 4 activities', ro: 'Completează toate activitățile Biz 4' },
    icon: Zap,
    xpReward: 50,
    target: 4
  },
  {
    id: 'read_pages',
    type: 'reading',
    title: { en: 'Knowledge Seeker', ro: 'Căutător de Cunoștințe' },
    description: { en: 'Read 3 pages today', ro: 'Citește 3 pagini azi' },
    icon: BookOpen,
    xpReward: 30,
    target: 3
  },
  {
    id: 'complete_actions',
    type: 'action',
    title: { en: 'Action Taker', ro: 'Om de Acțiune' },
    description: { en: 'Complete 5 actions today', ro: 'Completează 5 acțiuni azi' },
    icon: CheckCircle2,
    xpReward: 40,
    target: 5
  },
  {
    id: 'relationship_boost',
    type: 'core4',
    title: { en: 'Connection Builder', ro: 'Constructor de Conexiuni' },
    description: { en: 'Add value to 2 people today', ro: 'Adaugă valoare la 2 persoane azi' },
    icon: Users,
    xpReward: 35,
    target: 2
  },
  {
    id: 'mindfulness',
    type: 'core4',
    title: { en: 'Inner Peace', ro: 'Pace Interioară' },
    description: { en: 'Complete meditation today', ro: 'Completează meditația azi' },
    icon: Brain,
    xpReward: 25,
    target: 1
  },
  {
    id: 'fitness_warrior',
    type: 'core4',
    title: { en: 'Fitness Warrior', ro: 'Războinic Fitness' },
    description: { en: 'Complete body activities', ro: 'Completează activitățile corporale' },
    icon: Dumbbell,
    xpReward: 30,
    target: 2
  }
];

// Seeded random for daily challenges
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const getDailyChallenges = (date: Date): Omit<DailyChallenge, 'current'>[] => {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const shuffled = [...ALL_CHALLENGES].sort((a, b) => seededRandom(seed + a.id.length) - seededRandom(seed + b.id.length));
  return shuffled.slice(0, 3);
};

interface DailyChallengesProps {
  stackCompleted?: boolean;
  core4Score?: number;
  biz4Score?: number;
  pagesReadToday?: number;
  actionsCompletedToday?: number;
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({
  stackCompleted = false,
  core4Score = 0,
  biz4Score = 0,
  pagesReadToday = 0,
  actionsCompletedToday = 0
}) => {
  const { language } = useLanguage();
  const { addXP } = useXPSystem();
  const [claimedChallenges, setClaimedChallenges] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState('');

  // Get today's challenges
  const todaysChallenges = useMemo(() => {
    const today = new Date();
    const baseChallenges = getDailyChallenges(today);
    
    return baseChallenges.map(challenge => {
      let current = 0;
      
      switch (challenge.type) {
        case 'stack':
          current = stackCompleted ? 1 : 0;
          break;
        case 'core4':
          current = core4Score;
          break;
        case 'biz4':
          current = biz4Score;
          break;
        case 'reading':
          current = pagesReadToday;
          break;
        case 'action':
          current = actionsCompletedToday;
          break;
      }
      
      return { ...challenge, current };
    });
  }, [stackCompleted, core4Score, biz4Score, pagesReadToday, actionsCompletedToday]);

  // Load claimed challenges from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`dailyChallenges_${today}`);
    if (stored) {
      setClaimedChallenges(JSON.parse(stored));
    }
  }, []);

  // Update time left
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  const claimReward = async (challenge: DailyChallenge) => {
    if (claimedChallenges.includes(challenge.id)) return;
    if (challenge.current < challenge.target) return;
    
    await addXP(challenge.xpReward, `Daily Challenge: ${challenge.title.en}`);
    
    const newClaimed = [...claimedChallenges, challenge.id];
    setClaimedChallenges(newClaimed);
    
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`dailyChallenges_${today}`, JSON.stringify(newClaimed));
  };

  const allCompleted = todaysChallenges.every(c => c.current >= c.target && claimedChallenges.includes(c.id));

  return (
    <Card className="p-4 bg-card border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          {language === 'en' ? 'Daily Challenges' : 'Provocări Zilnice'}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeLeft}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {todaysChallenges.map(challenge => {
          const Icon = challenge.icon;
          const isComplete = challenge.current >= challenge.target;
          const isClaimed = claimedChallenges.includes(challenge.id);
          const progress = Math.min((challenge.current / challenge.target) * 100, 100);
          
          return (
            <div 
              key={challenge.id}
              className={cn(
                "p-3 rounded-lg border transition-all",
                isComplete && isClaimed 
                  ? "bg-primary/10 border-primary/30" 
                  : isComplete 
                    ? "bg-yellow-500/10 border-yellow-500/30 animate-pulse"
                    : "bg-muted/30 border-border/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{challenge.title[language]}</h4>
                    <span className="text-xs font-bold text-primary">+{challenge.xpReward} XP</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{challenge.description[language]}</p>
                  
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium">{challenge.current}/{challenge.target}</span>
                  </div>
                </div>
                
                {isComplete && !isClaimed && (
                  <Button 
                    size="sm" 
                    className="shrink-0 animate-bounce"
                    onClick={() => claimReward(challenge)}
                  >
                    <Gift className="h-3 w-3 mr-1" />
                    {language === 'en' ? 'Claim' : 'Revendică'}
                  </Button>
                )}
                
                {isClaimed && (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {allCompleted && (
        <div className="mt-4 p-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg text-center">
          <p className="text-sm font-medium text-primary">
            🎉 {language === 'en' ? 'All challenges complete! Come back tomorrow for more.' : 'Toate provocările complete! Revino mâine pentru mai multe.'}
          </p>
        </div>
      )}
    </Card>
  );
};

export default DailyChallenges;
