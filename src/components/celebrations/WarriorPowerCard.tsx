import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Activity, Users, Heart, Briefcase } from 'lucide-react';

export const WarriorPowerCard: React.FC = () => {
  const { language } = useLanguage();

  const coreIcons = [
    { icon: Activity, label: 'Body', color: 'text-blue-400 bg-blue-500/20' },
    { icon: Users, label: 'Balance', color: 'text-pink-400 bg-pink-500/20' },
    { icon: Heart, label: 'Being', color: 'text-purple-400 bg-purple-500/20' },
    { icon: Briefcase, label: 'Business', color: 'text-green-400 bg-green-500/20' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border-2 border-primary/40 rounded-lg p-3 md:p-4 animate-power-glow">
      {/* Background energy effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15)_0%,transparent_70%)] animate-energy-pulse-subtle" />
      
      <div className="relative z-10 flex items-center gap-3 md:gap-4">
        {/* Warrior illustration with glow */}
        <div className="relative flex-shrink-0 animate-warrior-breathe">
          {/* Glow behind warrior */}
          <div className="absolute -inset-2 bg-primary/30 rounded-full blur-md animate-energy-pulse-subtle" />
          
          <svg
            viewBox="0 0 100 150"
            className="w-14 h-20 md:w-16 md:h-24 drop-shadow-lg relative z-10"
            fill="none"
          >
            <defs>
              <filter id="powerGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="powerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
            
            {/* Head */}
            <circle cx="50" cy="20" r="15" fill="url(#powerGradient)" filter="url(#powerGlow)" />
            
            {/* Body */}
            <path
              d="M50 35 L50 80 M30 50 L70 50 M50 80 L30 130 M50 80 L70 130"
              stroke="url(#powerGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#powerGlow)"
            />
            
            {/* Arms raised in power pose */}
            <path
              d="M30 50 L15 30 M70 50 L85 30"
              stroke="url(#powerGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#powerGlow)"
            />
          </svg>
        </div>
        
        {/* Text and icons */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase tracking-wide">
            {language === 'en' ? 'Full Power Unlocked' : 'Putere Maximă Deblocată'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {language === 'en' ? 'All Core 4 Complete!' : 'Toate Core 4 Complete!'}
          </p>
          
          {/* Core 4 mini icons */}
          <div className="flex gap-1.5 mt-2">
            {coreIcons.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className={`w-6 h-6 md:w-7 md:h-7 rounded-full ${color} flex items-center justify-center`}
                title={label}
              >
                <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
