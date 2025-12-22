import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy, Star, Zap, Target, BookOpen, Award, Crown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

type MilestoneType = 
  | 'first_stack' 
  | 'first_week' 
  | 'pages_100' 
  | 'pages_365' 
  | 'actions_100' 
  | 'level_10' 
  | 'level_25' 
  | 'level_50';

interface MilestoneConfig {
  icon: React.ElementType;
  title: { en: string; ro: string };
  subtitle: { en: string; ro: string };
  message: { en: string; ro: string };
  color: string;
  xpBonus: number;
}

const MILESTONE_CONFIGS: Record<MilestoneType, MilestoneConfig> = {
  first_stack: {
    icon: Sparkles,
    title: { en: 'First Stack Complete!', ro: 'Primul Stack Complet!' },
    subtitle: { en: 'The Journey Begins', ro: 'Călătoria Începe' },
    message: { en: 'You\'ve completed your first introspection session. This is the first step to transformation!', ro: 'Ai completat prima sesiune de introspecție. Acesta e primul pas spre transformare!' },
    color: 'from-green-400 to-emerald-500',
    xpBonus: 50
  },
  first_week: {
    icon: Trophy,
    title: { en: 'First Week Champion!', ro: 'Campion Prima Săptămână!' },
    subtitle: { en: '7 Days of Growth', ro: '7 Zile de Creștere' },
    message: { en: 'One week of consistent effort! You\'re building habits that will change your life.', ro: 'O săptămână de efort constant! Construiești obiceiuri care îți vor schimba viața.' },
    color: 'from-blue-400 to-cyan-500',
    xpBonus: 200
  },
  pages_100: {
    icon: BookOpen,
    title: { en: 'Century Reader!', ro: 'Cititor Centenar!' },
    subtitle: { en: '100 Pages of Wisdom', ro: '100 Pagini de Înțelepciune' },
    message: { en: 'You\'ve absorbed 100 pages of knowledge. Your mind is expanding!', ro: 'Ai absorbit 100 de pagini de cunoștințe. Mintea ta se extinde!' },
    color: 'from-amber-400 to-orange-500',
    xpBonus: 300
  },
  pages_365: {
    icon: Crown,
    title: { en: 'Book Master!', ro: 'Maestru al Cărții!' },
    subtitle: { en: 'Every Page Complete', ro: 'Fiecare Pagină Completă' },
    message: { en: 'You\'ve read every single page! This is an incredible achievement!', ro: 'Ai citit fiecare pagină! Aceasta e o realizare incredibilă!' },
    color: 'from-purple-400 to-indigo-500',
    xpBonus: 2000
  },
  actions_100: {
    icon: Target,
    title: { en: 'Action Master!', ro: 'Maestru al Acțiunii!' },
    subtitle: { en: '100 Actions Complete', ro: '100 Acțiuni Complete' },
    message: { en: '100 actions taken! You\'re not just learning, you\'re DOING!', ro: '100 de acțiuni întreprinse! Nu doar înveți, ci FACI!' },
    color: 'from-green-400 to-teal-500',
    xpBonus: 500
  },
  level_10: {
    icon: Star,
    title: { en: 'Double Digits!', ro: 'Cifre Duble!' },
    subtitle: { en: 'Level 10 Achieved', ro: 'Nivelul 10 Atins' },
    message: { en: 'You\'ve reached level 10! Your dedication is paying off.', ro: 'Ai atins nivelul 10! Dedicarea ta dă roade.' },
    color: 'from-yellow-400 to-amber-500',
    xpBonus: 250
  },
  level_25: {
    icon: Award,
    title: { en: 'Quarter Century!', ro: 'Sfert de Secol!' },
    subtitle: { en: 'Level 25 Achieved', ro: 'Nivelul 25 Atins' },
    message: { en: 'Level 25! You\'re in the top tier of dedicated warriors!', ro: 'Nivelul 25! Ești în topul războinicilor dedicați!' },
    color: 'from-orange-400 to-red-500',
    xpBonus: 500
  },
  level_50: {
    icon: Crown,
    title: { en: 'Legendary Status!', ro: 'Statut Legendar!' },
    subtitle: { en: 'Level 50 Achieved', ro: 'Nivelul 50 Atins' },
    message: { en: 'Level 50! You are now a LEGEND! Few reach this pinnacle of achievement.', ro: 'Nivelul 50! Ești acum o LEGENDĂ! Puțini ating acest vârf al realizării.' },
    color: 'from-purple-500 to-pink-500',
    xpBonus: 2000
  }
};

interface MilestoneCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneType: MilestoneType;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  isOpen,
  onClose,
  milestoneType
}) => {
  const { language } = useLanguage();
  const [showContent, setShowContent] = useState(false);
  
  const config = MILESTONE_CONFIGS[milestoneType];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      
      // Epic confetti
      const duration = 4000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#a855f7', '#7c3aed', '#4ade80']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#a855f7', '#7c3aed', '#4ade80']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
      
      // Big burst in the middle
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#a855f7', '#7c3aed']
        });
      }, 500);
      
      setTimeout(() => setShowContent(true), 300);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-primary/30 overflow-hidden bg-gradient-to-br from-background to-muted/30">
        <div className="relative flex flex-col items-center py-8 px-4">
          {/* Floating decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <Star
                key={i}
                className="absolute w-3 h-3 text-primary/30 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
          
          {/* Achievement label */}
          <div className={`flex items-center gap-2 mb-4 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}>
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {language === 'en' ? 'Milestone Achieved!' : 'Realizare Atinsă!'}
            </span>
          </div>
          
          {/* Main icon */}
          <div className={`relative mb-6 ${showContent ? 'animate-scale-in' : 'opacity-0'}`}>
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-2xl`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              <Icon className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
          </div>
          
          {/* Title */}
          <h2 className={`text-2xl font-bold text-center mb-2 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}>
            {config.title[language]}
          </h2>
          
          {/* Subtitle */}
          <p className={`text-lg text-primary font-semibold mb-4 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}>
            {config.subtitle[language]}
          </p>
          
          {/* Message */}
          <p className={`text-center text-muted-foreground mb-6 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.3s' }}>
            {config.message[language]}
          </p>
          
          {/* XP Bonus */}
          <div className={`flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-full shadow-lg mb-6 ${showContent ? 'animate-bounce' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}>
            <Zap className="w-5 h-5" />
            <span className="font-bold">+{config.xpBonus} XP Bonus!</span>
          </div>
          
          {/* Continue Button */}
          <Button 
            onClick={onClose}
            className={`w-full ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.5s' }}
          >
            {language === 'en' ? 'Amazing!' : 'Extraordinar!'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export type { MilestoneType };
export default MilestoneCelebration;
