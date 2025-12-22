import React, { useEffect, useState } from 'react';
import { Star, Sparkles, Zap, Trophy } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { getLevelTitle } from '@/hooks/useXPSystem';
import confetti from 'canvas-confetti';

interface LevelUpCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  isOpen,
  onClose,
  newLevel,
}) => {
  const { language } = useLanguage();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay content for dramatic effect
      setTimeout(() => setShowContent(true), 300);

      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Big burst in center
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors,
        });
      }, 500);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const levelTitle = getLevelTitle(newLevel);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-yellow-500/50 bg-gradient-to-br from-background via-yellow-500/5 to-background overflow-hidden">
        {showContent && (
          <div className="flex flex-col items-center text-center py-6 animate-scale-in">
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute text-yellow-400 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.6,
                    width: `${12 + Math.random() * 12}px`,
                    height: `${12 + Math.random() * 12}px`,
                  }}
                />
              ))}
            </div>

            {/* Level Up Badge */}
            <div className="relative mb-6">
              {/* Outer glow ring */}
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 blur-xl opacity-50 animate-pulse" />
              
              {/* Main badge */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-yellow-500/50 animate-bounce">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center border-4 border-white/30">
                  <span className="text-5xl font-black text-white drop-shadow-lg">
                    {newLevel}
                  </span>
                </div>
              </div>

              {/* Trophy icon */}
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
                <Trophy className="w-5 h-5 text-yellow-900" />
              </div>

              {/* Stars */}
              <Star className="absolute -left-4 top-4 w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
              <Star className="absolute -right-4 bottom-8 w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>

            {/* Title */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {language === 'ro' ? 'NIVEL NOU!' : 'LEVEL UP!'}
                </h2>
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              
              <p className="text-4xl font-black text-foreground">
                {language === 'ro' ? 'Nivel' : 'Level'} {newLevel}
              </p>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-medium">{levelTitle}</span>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
            </div>

            {/* Motivational message */}
            <p className="text-muted-foreground mb-6 max-w-xs">
              {language === 'ro' 
                ? 'Continuă să progresezi! Fiecare nivel te aduce mai aproape de măiestrie.'
                : 'Keep pushing forward! Every level brings you closer to mastery.'}
            </p>

            {/* Continue button */}
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold px-8 py-3 shadow-lg shadow-yellow-500/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {language === 'ro' ? 'Continuă' : 'Continue'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
