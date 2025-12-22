import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame, Shield, Zap, Crown, Star, Trophy } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import confetti from 'canvas-confetti';

interface StreakMilestoneCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  milestone: 7 | 30 | 100 | 365;
}

const MILESTONE_CONFIG = {
  7: {
    icon: Flame,
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-500/20 to-red-600/20',
    title: { en: 'Week Warrior!', ro: 'Războinic Săptămânal!' },
    subtitle: { en: '7 Days Strong', ro: '7 Zile Puternic' },
    message: { en: 'You\'ve maintained your streak for a full week! This is the foundation of lasting change.', ro: 'Ai menținut streak-ul o săptămână întreagă! Aceasta e fundația schimbării durabile.' },
    xpBonus: 100
  },
  30: {
    icon: Zap,
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20',
    title: { en: 'Monthly Master!', ro: 'Maestru Lunar!' },
    subtitle: { en: '30 Days Unstoppable', ro: '30 Zile De Neoprit' },
    message: { en: 'A full month of consistency! You\'re building habits that will last a lifetime.', ro: 'O lună întreagă de consistență! Construiești obiceiuri care vor dura o viață.' },
    xpBonus: 500
  },
  100: {
    icon: Crown,
    color: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-purple-500/20 to-indigo-600/20',
    title: { en: 'Century Legend!', ro: 'Legendă Centenară!' },
    subtitle: { en: '100 Days of Greatness', ro: '100 Zile de Măreție' },
    message: { en: '100 days! You\'ve proven that greatness is a daily choice. You are unstoppable!', ro: '100 de zile! Ai dovedit că măreția e o alegere zilnică. Ești de neoprit!' },
    xpBonus: 1000
  },
  365: {
    icon: Trophy,
    color: 'from-amber-300 to-yellow-500',
    bgColor: 'bg-gradient-to-br from-amber-400/20 to-yellow-600/20',
    title: { en: 'Year Champion!', ro: 'Campion Anual!' },
    subtitle: { en: '365 Days of Transformation', ro: '365 Zile de Transformare' },
    message: { en: 'ONE FULL YEAR! You\'ve achieved what few dare to dream. You are a living legend!', ro: 'UN AN ÎNTREG! Ai realizat ce puțini îndrăznesc să viseze. Ești o legendă vie!' },
    xpBonus: 5000
  }
};

export const StreakMilestoneCelebration: React.FC<StreakMilestoneCelebrationProps> = ({
  isOpen,
  onClose,
  streakDays,
  milestone
}) => {
  const { language } = useLanguage();
  const [showContent, setShowContent] = useState(false);
  
  const config = MILESTONE_CONFIG[milestone];
  const IconComponent = config.icon;

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;
      
      const colors = milestone >= 100 
        ? ['#fbbf24', '#f59e0b', '#d97706', '#b45309']
        : milestone >= 30 
          ? ['#facc15', '#fbbf24', '#f59e0b']
          : ['#fb923c', '#f97316', '#ea580c'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
      
      setTimeout(() => setShowContent(true), 200);
    }
  }, [isOpen, milestone]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${config.bgColor} border-2 border-primary/30 overflow-hidden`}>
        <div className="relative flex flex-col items-center py-8 px-4">
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <Star
                key={i}
                className={`absolute w-4 h-4 text-primary/30 animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
          
          {/* Streak Shield Badge */}
          <div className={`relative mb-6 ${showContent ? 'animate-scale-in' : 'opacity-0'}`}>
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-2xl`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              <IconComponent className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background px-4 py-1 rounded-full border-2 border-primary shadow-lg">
              <span className="text-xl font-bold text-primary">{streakDays} 🔥</span>
            </div>
          </div>
          
          {/* Title */}
          <h2 className={`text-2xl font-bold text-center mb-2 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}>
            {config.title[language]}
          </h2>
          
          {/* Subtitle */}
          <p className={`text-lg text-primary font-semibold mb-4 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}>
            {config.subtitle[language]}
          </p>
          
          {/* Message */}
          <p className={`text-center text-muted-foreground mb-6 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}>
            {config.message[language]}
          </p>
          
          {/* XP Bonus */}
          <div className={`flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-full shadow-lg mb-6 ${showContent ? 'animate-bounce' : 'opacity-0'}`}
            style={{ animationDelay: '0.3s' }}>
            <Zap className="w-5 h-5" />
            <span className="font-bold">+{config.xpBonus} XP Bonus!</span>
          </div>
          
          {/* Streak Shield unlock for 30+ days */}
          {milestone >= 30 && (
            <div className={`flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg mb-6 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: '0.4s' }}>
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'Streak Shield Activated! Miss one day without losing your streak.' : 'Scut Streak Activat! Poți rata o zi fără să pierzi streak-ul.'}
              </span>
            </div>
          )}
          
          {/* Continue Button */}
          <Button 
            onClick={onClose}
            className={`w-full ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.5s' }}
          >
            {language === 'en' ? 'Keep Going!' : 'Continuă!'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakMilestoneCelebration;
