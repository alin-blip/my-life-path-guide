import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { X, Flame, Zap, Target, Clock, Trophy, Sparkles, TrendingUp, Heart, Brain, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'streak_reminder' | 'morning_motivation' | 'milestone_close' | 'comeback' | 'celebration' | 'tip';
  icon: React.ElementType;
  title: { en: string; ro: string };
  message: { en: string; ro: string };
  action?: { en: string; ro: string };
  priority: 'low' | 'medium' | 'high';
  color: string;
}

interface SmartNotificationsProps {
  currentStreak: number;
  lastActivityDate: string | null;
  xpToNextLevel: number;
  totalXP: number;
  currentLevel: number;
  hasCompletedTodayStack: boolean;
  onAction?: (notificationId: string) => void;
}

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const MOTIVATIONAL_QUOTES = {
  en: [
    "The only bad workout is the one that didn't happen.",
    "Your future self will thank you for what you do today.",
    "Small daily improvements lead to stunning results.",
    "Discipline is choosing between what you want now and what you want most.",
    "The secret of getting ahead is getting started."
  ],
  ro: [
    "Singurul antrenament prost e cel care nu s-a întâmplat.",
    "Viitorul tău eu îți va mulțumi pentru ce faci azi.",
    "Îmbunătățirile mici zilnice duc la rezultate uimitoare.",
    "Disciplina e alegerea între ce vrei acum și ce vrei cel mai mult.",
    "Secretul succesului e să începi."
  ]
};

export const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  currentStreak,
  lastActivityDate,
  xpToNextLevel,
  totalXP,
  currentLevel,
  hasCompletedTodayStack,
  onAction
}) => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];
      const timeOfDay = getTimeOfDay();
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = lastActivityDate ? new Date(lastActivityDate).toISOString().split('T')[0] : null;
      const daysSinceActivity = lastActivity 
        ? Math.floor((new Date(today).getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Morning motivation
      if (timeOfDay === 'morning' && !hasCompletedTodayStack) {
        const quoteIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.en.length);
        newNotifications.push({
          id: 'morning_motivation',
          type: 'morning_motivation',
          icon: Sparkles,
          title: { en: 'Good Morning, Warrior!', ro: 'Bună Dimineața, Războinicule!' },
          message: { 
            en: MOTIVATIONAL_QUOTES.en[quoteIndex], 
            ro: MOTIVATIONAL_QUOTES.ro[quoteIndex] 
          },
          action: { en: 'Start Stack', ro: 'Începe Stack' },
          priority: 'medium',
          color: 'from-orange-400 to-amber-500'
        });
      }

      // Streak at risk
      if (currentStreak > 0 && daysSinceActivity === 1 && !hasCompletedTodayStack) {
        newNotifications.push({
          id: 'streak_reminder',
          type: 'streak_reminder',
          icon: Flame,
          title: { en: 'Protect Your Streak! 🔥', ro: 'Protejează-ți Streak-ul! 🔥' },
          message: { 
            en: `Your ${currentStreak} day streak is at risk! Complete an activity to keep it alive.`, 
            ro: `Streak-ul tău de ${currentStreak} zile e în pericol! Completează o activitate.` 
          },
          action: { en: 'Save Streak', ro: 'Salvează Streak' },
          priority: 'high',
          color: 'from-red-500 to-orange-500'
        });
      }

      // Close to level up
      if (xpToNextLevel <= 50) {
        newNotifications.push({
          id: 'milestone_close',
          type: 'milestone_close',
          icon: TrendingUp,
          title: { en: 'Almost There!', ro: 'Aproape Ai Ajuns!' },
          message: { 
            en: `Only ${xpToNextLevel} XP to level ${currentLevel + 1}! One more action could do it.`, 
            ro: `Doar ${xpToNextLevel} XP până la nivelul ${currentLevel + 1}! O acțiune ar putea fi suficientă.` 
          },
          priority: 'medium',
          color: 'from-purple-400 to-indigo-500'
        });
      }

      // Comeback message
      if (daysSinceActivity >= 3 && daysSinceActivity < 30) {
        newNotifications.push({
          id: 'comeback',
          type: 'comeback',
          icon: Heart,
          title: { en: 'We Miss You!', ro: 'Ne Lipseși!' },
          message: { 
            en: `It's been ${daysSinceActivity} days. Every master was once a beginner. Start again today!`, 
            ro: `Au trecut ${daysSinceActivity} zile. Fiecare maestru a fost odată începător. Începe din nou azi!` 
          },
          action: { en: 'Start Fresh', ro: 'Început Proaspăt' },
          priority: 'high',
          color: 'from-pink-400 to-rose-500'
        });
      }

      // Streak milestone approaching
      const streakMilestones = [7, 30, 100, 365];
      const nextMilestone = streakMilestones.find(m => m > currentStreak);
      if (nextMilestone && currentStreak >= nextMilestone - 2 && currentStreak < nextMilestone) {
        newNotifications.push({
          id: 'streak_milestone',
          type: 'celebration',
          icon: Trophy,
          title: { en: `${nextMilestone - currentStreak} Days to ${nextMilestone}!`, ro: `${nextMilestone - currentStreak} Zile până la ${nextMilestone}!` },
          message: { 
            en: `You're so close to a major milestone! Keep pushing!`, 
            ro: `Ești atât de aproape de o realizare majoră! Continuă!` 
          },
          priority: 'medium',
          color: 'from-yellow-400 to-amber-500'
        });
      }

      // Afternoon tip
      if (timeOfDay === 'afternoon') {
        newNotifications.push({
          id: 'afternoon_tip',
          type: 'tip',
          icon: Brain,
          title: { en: 'Pro Tip', ro: 'Sfat Pro' },
          message: { 
            en: 'Afternoon slump? A quick meditation or 5-minute walk can boost your focus.', 
            ro: 'Oboseală de după-amiază? O meditație scurtă sau o plimbare de 5 minute îți poate îmbunătăți concentrarea.' 
          },
          priority: 'low',
          color: 'from-cyan-400 to-blue-500'
        });
      }

      setNotifications(newNotifications.filter(n => !dismissedIds.includes(n.id)));
    };

    generateNotifications();
  }, [currentStreak, lastActivityDate, xpToNextLevel, currentLevel, hasCompletedTodayStack, dismissedIds]);

  const dismissNotification = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  if (notifications.length === 0) return null;

  // Show only the highest priority notification
  const sortedNotifications = [...notifications].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const notification = sortedNotifications[0];
  const Icon = notification.icon;

  return (
    <Card className={cn(
      "relative overflow-hidden border-2",
      notification.priority === 'high' 
        ? "border-red-500/50 animate-pulse" 
        : notification.priority === 'medium'
          ? "border-primary/30"
          : "border-border/50"
    )}>
      <div className={`absolute inset-0 bg-gradient-to-r ${notification.color} opacity-10`} />
      
      <div className="relative p-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => dismissNotification(notification.id)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${notification.color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm mb-1">{notification.title[language]}</h4>
            <p className="text-xs text-muted-foreground mb-3">{notification.message[language]}</p>
            
            {notification.action && (
              <Button 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => onAction?.(notification.id)}
              >
                {notification.action[language]}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SmartNotifications;
