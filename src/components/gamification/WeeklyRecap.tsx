import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, TrendingUp, Flame, BookOpen, Target, Trophy, Star, Zap, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WeeklyStats {
  daysActive: number;
  stacksCompleted: number;
  pagesRead: number;
  actionsCompleted: number;
  xpEarned: number;
  streakMaintained: boolean;
  currentStreak: number;
  badgesEarned: number;
}

interface WeeklyRecapProps {
  isOpen: boolean;
  onClose: () => void;
  stats: WeeklyStats;
  weekNumber: number;
}

export const WeeklyRecap: React.FC<WeeklyRecapProps> = ({
  isOpen,
  onClose,
  stats,
  weekNumber
}) => {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const slides = [
    {
      icon: Calendar,
      title: language === 'en' ? 'Your Week in Review' : 'Săptămâna Ta în Revizuire',
      subtitle: language === 'en' ? `Week ${weekNumber}` : `Săptămâna ${weekNumber}`,
      stat: stats.daysActive,
      statLabel: language === 'en' ? 'Days Active' : 'Zile Active',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Flame,
      title: language === 'en' ? 'Stack Sessions' : 'Sesiuni Stack',
      subtitle: language === 'en' ? 'Reflections completed' : 'Reflecții completate',
      stat: stats.stacksCompleted,
      statLabel: language === 'en' ? 'Stacks' : 'Stack-uri',
      color: 'from-orange-400 to-red-500'
    },
    {
      icon: BookOpen,
      title: language === 'en' ? 'Knowledge Gained' : 'Cunoștințe Dobândite',
      subtitle: language === 'en' ? 'Pages of wisdom' : 'Pagini de înțelepciune',
      stat: stats.pagesRead,
      statLabel: language === 'en' ? 'Pages Read' : 'Pagini Citite',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Target,
      title: language === 'en' ? 'Actions Taken' : 'Acțiuni Întreprinse',
      subtitle: language === 'en' ? 'Making progress' : 'Faci progres',
      stat: stats.actionsCompleted,
      statLabel: language === 'en' ? 'Actions' : 'Acțiuni',
      color: 'from-purple-400 to-indigo-500'
    },
    {
      icon: Zap,
      title: language === 'en' ? 'XP Earned' : 'XP Câștigat',
      subtitle: language === 'en' ? 'Level up!' : 'Urcă în nivel!',
      stat: stats.xpEarned,
      statLabel: 'XP',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      icon: Trophy,
      title: language === 'en' ? 'Week Complete!' : 'Săptămână Completă!',
      subtitle: stats.streakMaintained 
        ? (language === 'en' ? `${stats.currentStreak} day streak! 🔥` : `Streak de ${stats.currentStreak} zile! 🔥`)
        : (language === 'en' ? 'Keep pushing!' : 'Continuă să lupți!'),
      stat: stats.badgesEarned,
      statLabel: language === 'en' ? 'Badges Earned' : 'Badge-uri Câștigate',
      color: 'from-amber-400 to-yellow-500',
      isFinal: true
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setShowContent(false);
      setTimeout(() => setShowContent(true), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentSlide === slides.length - 1) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#a855f7', '#7c3aed']
      });
    }
  }, [currentSlide, isOpen]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setShowContent(false);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setShowContent(true);
      }, 200);
    } else {
      onClose();
    }
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-primary/30 overflow-hidden bg-gradient-to-br from-background to-muted/30">
        <div className="relative flex flex-col items-center py-8 px-4 min-h-[400px]">
          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-6">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : index < currentSlide 
                      ? 'w-2 bg-primary/50' 
                      : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
          
          {/* Floating stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <Star
                key={i}
                className="absolute w-3 h-3 text-primary/20 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          
          {/* Icon */}
          <div className={`relative mb-6 ${showContent ? 'animate-scale-in' : 'opacity-0'}`}>
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentSlideData.color} flex items-center justify-center shadow-2xl`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            {currentSlideData.isFinal && (
              <div className="absolute -top-2 -right-2">
                <Award className="w-8 h-8 text-yellow-500 animate-bounce" />
              </div>
            )}
          </div>
          
          {/* Title */}
          <h2 className={`text-2xl font-bold text-center mb-2 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}>
            {currentSlideData.title}
          </h2>
          
          {/* Subtitle */}
          <p className={`text-muted-foreground text-center mb-6 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}>
            {currentSlideData.subtitle}
          </p>
          
          {/* Stat */}
          <div className={`text-center mb-8 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.3s' }}>
            <div className={`text-5xl font-bold bg-gradient-to-r ${currentSlideData.color} bg-clip-text text-transparent`}>
              {currentSlideData.stat}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {currentSlideData.statLabel}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="w-full mt-auto">
            <Button 
              onClick={nextSlide}
              className={`w-full ${showContent ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: '0.4s' }}
            >
              {currentSlide === slides.length - 1 
                ? (language === 'en' ? 'Start New Week!' : 'Începe Săptămâna Nouă!')
                : (language === 'en' ? 'Next' : 'Următorul')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyRecap;
