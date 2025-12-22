import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, Star, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge, TIER_COLORS } from '@/components/challenge/badges/badgeDefinitions';
import confetti from 'canvas-confetti';

interface BadgeUnlockCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  badge: Badge | null;
}

export const BadgeUnlockCelebration: React.FC<BadgeUnlockCelebrationProps> = ({
  isOpen,
  onClose,
  badge
}) => {
  const { language } = useLanguage();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen && badge) {
      setShowContent(false);
      
      // Trigger confetti based on tier
      const tierColors: Record<string, string[]> = {
        bronze: ['#cd7f32', '#b8860b', '#daa520'],
        silver: ['#c0c0c0', '#a8a8a8', '#d3d3d3'],
        gold: ['#ffd700', '#ffb700', '#ffa500'],
        platinum: ['#a855f7', '#7c3aed', '#6366f1']
      };
      
      const colors = tierColors[badge.tier] || tierColors.bronze;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors
      });
      
      setTimeout(() => setShowContent(true), 200);
    }
  }, [isOpen, badge]);

  if (!badge) return null;

  const tierGradient = TIER_COLORS[badge.tier];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-primary/30 overflow-hidden bg-gradient-to-br from-background to-muted/30">
        <div className="relative flex flex-col items-center py-8 px-4">
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <Sparkles
                key={i}
                className={`absolute w-4 h-4 text-primary/40 animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
          
          {/* Badge unlocked text */}
          <div className={`flex items-center gap-2 mb-4 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}>
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {language === 'en' ? 'Badge Unlocked!' : 'Badge Deblocat!'}
            </span>
          </div>
          
          {/* Badge Icon */}
          <div className={`relative mb-6 ${showContent ? 'animate-scale-in' : 'opacity-0'}`}>
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${tierGradient} flex items-center justify-center shadow-2xl`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              <span className={`text-4xl ${badge.color}`}>
                {badge.icon === 'BookOpen' && '📖'}
                {badge.icon === 'Flame' && '🔥'}
                {badge.icon === 'Trophy' && '🏆'}
                {badge.icon === 'Star' && '⭐'}
                {badge.icon === 'Award' && '🏅'}
                {badge.icon === 'Target' && '🎯'}
                {badge.icon === 'Zap' && '⚡'}
                {badge.icon === 'Crown' && '👑'}
                {badge.icon === 'Medal' && '🎖️'}
                {badge.icon === 'Sparkles' && '✨'}
                {badge.icon === 'Heart' && '❤️'}
                {badge.icon === 'Rocket' && '🚀'}
                {badge.icon === 'Shield' && '🛡️'}
                {badge.icon === 'Brain' && '🧠'}
                {badge.icon === 'Eye' && '👁️'}
                {badge.icon === 'Dumbbell' && '💪'}
                {badge.icon === 'Users' && '👥'}
              </span>
            </div>
            
            {/* Tier badge */}
            <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${tierGradient} text-white shadow-lg`}>
              {badge.tier}
            </div>
          </div>
          
          {/* Badge Name */}
          <h2 className={`text-2xl font-bold text-center mb-2 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}>
            {badge.name[language]}
          </h2>
          
          {/* Badge Description */}
          <p className={`text-center text-muted-foreground mb-6 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}>
            {badge.description[language]}
          </p>
          
          {/* Stars based on tier */}
          <div className={`flex items-center gap-1 mb-6 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.3s' }}>
            {[...Array(badge.tier === 'platinum' ? 4 : badge.tier === 'gold' ? 3 : badge.tier === 'silver' ? 2 : 1)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            ))}
          </div>
          
          {/* Continue Button */}
          <Button 
            onClick={onClose}
            className={`w-full ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            {language === 'en' ? 'Awesome!' : 'Extraordinar!'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeUnlockCelebration;
