import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, PartyPopper, Calendar, ArrowRight, Sparkles, Zap, Flame, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { useRoutineXP, ROUTINE_XP_REWARDS, getLevelTitle, getLevelColor } from '@/hooks/useRoutineXP';
import { StreakDisplay } from '../StreakDisplay';
import { XPDisplay, LevelUpModal } from '../XPDisplay';
import { cn } from '@/lib/utils';

interface CompletionStepProps {
  completedSteps: number;
  totalSteps: number;
  meditationDuration: number;
  onViewHistory?: () => void;
}

export function CompletionStep({ 
  completedSteps, 
  totalSteps, 
  meditationDuration,
  onViewHistory 
}: CompletionStepProps) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [hasProcessedXP, setHasProcessedXP] = useState(false);
  
  const { 
    stats, 
    isLoading, 
    addXP, 
    updateStreak, 
    addMeditationTime,
    getStreakMultiplier,
    showLevelUp,
    newLevel,
    dismissLevelUp 
  } = useRoutineXP();

  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  const isPerfect = completionPercentage === 100;

  // Calculate and award XP on first render
  useEffect(() => {
    if (hasProcessedXP || isLoading || !stats) return;
    
    const processXP = async () => {
      let totalXP = 0;
      
      // XP for completed steps
      totalXP += completedSteps * ROUTINE_XP_REWARDS.step_completed;
      
      // Bonus for completing routine
      if (completedSteps >= totalSteps * 0.8) {
        totalXP += ROUTINE_XP_REWARDS.routine_complete_bonus;
      }
      
      // Perfect routine bonus
      if (isPerfect) {
        totalXP += ROUTINE_XP_REWARDS.perfect_routine;
      }
      
      // Meditation bonus (per 5 min over 10 min)
      const extraMeditationMinutes = Math.max(0, Math.floor(meditationDuration / 60) - 10);
      const bonusMeditation = Math.floor(extraMeditationMinutes / 5) * ROUTINE_XP_REWARDS.meditation_bonus_per_5min;
      totalXP += bonusMeditation;
      
      // Apply streak multiplier
      const multiplier = getStreakMultiplier();
      totalXP = Math.round(totalXP * multiplier);
      
      setXpEarned(totalXP);
      
      // Add XP to user stats
      if (totalXP > 0) {
        await addXP(totalXP, 'Rutină completată');
      }
      
      // Update streak
      await updateStreak(true);
      
      // Add meditation time
      if (meditationDuration > 0) {
        await addMeditationTime(meditationDuration);
      }
      
      setHasProcessedXP(true);
    };
    
    processXP();
  }, [hasProcessedXP, isLoading, stats, completedSteps, totalSteps, isPerfect, meditationDuration, addXP, updateStreak, addMeditationTime, getStreakMultiplier]);

  useEffect(() => {
    // Trigger confetti on mount
    const timer = setTimeout(() => {
      setShowConfetti(true);
      confetti({
        particleCount: isPerfect ? 200 : 100,
        spread: isPerfect ? 100 : 70,
        origin: { y: 0.6 }
      });
      
      if (isPerfect) {
        // Second wave for perfect completion
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 500);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isPerfect]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`;
  };

  return (
    <>
      {showLevelUp && <LevelUpModal level={newLevel} onDismiss={dismissLevelUp} />}
      
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Card className={cn(
          "w-full max-w-2xl p-8 space-y-8 border",
          isPerfect 
            ? "bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border-amber-500/50" 
            : "bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-yellow-500/30"
        )}>
          {/* Trophy animation */}
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className={cn(
                "absolute inset-0 w-32 h-32 rounded-full animate-ping",
                isPerfect ? "bg-amber-400/30" : "bg-yellow-500/20"
              )} style={{ animationDuration: '2s' }} />
              <div className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center shadow-lg",
                isPerfect 
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/50" 
                  : "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-500/50"
              )}>
                <Trophy className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
                {isPerfect ? 'Rutină Perfectă!' : 'Felicitări!'} 
                <PartyPopper className="h-8 w-8 text-yellow-500" />
              </h1>
              <p className="text-xl text-muted-foreground">
                {isPerfect 
                  ? 'Ai completat TOȚI pașii din Rutina de Campion!' 
                  : 'Ai completat Rutina de Campion!'}
              </p>
            </div>
          </div>

          {/* XP Earned Banner */}
          {xpEarned > 0 && (
            <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Zap className="h-8 w-8 text-amber-400" />
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">+{xpEarned} XP</p>
                <p className="text-sm text-muted-foreground">
                  {isPerfect && 'Include bonus rutină perfectă!'}
                  {!isPerfect && getStreakMultiplier() > 1 && `Include bonus streak x${getStreakMultiplier().toFixed(1)}!`}
                </p>
              </div>
              <Zap className="h-8 w-8 text-amber-400" />
            </div>
          )}

          {/* Streak & Level Display */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-muted/30">
                <StreakDisplay 
                  currentStreak={stats.current_streak} 
                  bestStreak={stats.best_streak} 
                />
              </Card>
              <Card className="p-4 bg-muted/30">
                <XPDisplay 
                  totalXP={stats.total_xp} 
                  currentLevel={stats.current_level} 
                />
              </Card>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-3xl font-bold text-green-500">{completedSteps}</p>
              <p className="text-sm text-muted-foreground">Pași completați</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-3xl font-bold text-purple-500">{formatDuration(meditationDuration)}</p>
              <p className="text-sm text-muted-foreground">Meditație</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className={cn(
                "text-3xl font-bold",
                isPerfect ? "text-amber-400" : "text-amber-500"
              )}>
                {completionPercentage}%
              </p>
              <p className="text-sm text-muted-foreground">Completare</p>
            </div>
          </div>

          {/* Motivational message */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <Sparkles className="h-8 w-8 mx-auto text-primary mb-3" />
            <p className="text-lg">
              {isPerfect 
                ? 'Excelent! O rutină perfectă este cea mai bună investiție în tine. Continuă să construiești această versiune extraordinară!'
                : 'Fiecare zi în care îți faci rutina te aduce mai aproape de versiunea extraordinară a ta. Continuă așa!'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/dashboard')} 
              size="lg" 
              className="w-full gap-2"
            >
              Înapoi la Dashboard
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <Button 
              onClick={() => navigate('/champion-routine-history')} 
              size="lg" 
              variant="outline"
              className="w-full gap-2"
            >
              <Calendar className="h-5 w-5" />
              Vezi Istoricul
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
