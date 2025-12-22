import React from 'react';
import { CelebrationOverlay } from './CelebrationOverlay';
import { EnergyParticles } from './EnergyParticles';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface TransformedWarriorProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TransformedWarrior: React.FC<TransformedWarriorProps> = ({
  isVisible,
  onClose
}) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const rayCount = isMobile ? 6 : 12;

  return (
    <CelebrationOverlay isVisible={isVisible} onClose={onClose} duration={4000}>
      <EnergyParticles count={30} color="hsl(var(--primary))" />
      
      {/* Energy rays */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: rayCount }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 md:w-1 h-32 md:h-48 bg-gradient-to-t from-primary/80 to-transparent animate-ray-expand origin-bottom"
            style={{
              transform: `rotate(${i * (360 / rayCount)}deg)`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Pulsing aura circles - responsive sizes */}
      <div className="absolute w-52 h-52 md:w-80 md:h-80 rounded-full border-2 border-primary/30 animate-energy-pulse" />
      <div className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full border-2 border-primary/50 animate-energy-pulse" style={{ animationDelay: '0.3s' }} />
      <div className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-primary/70 animate-energy-pulse" style={{ animationDelay: '0.6s' }} />

      {/* Warrior silhouette SVG - responsive */}
      <div className="relative z-10 animate-warrior-rise">
        <svg
          viewBox="0 0 100 150"
          className="w-24 h-36 md:w-32 md:h-48 drop-shadow-2xl"
          fill="none"
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
          
          {/* Head */}
          <circle cx="50" cy="20" r="15" fill="url(#bodyGradient)" filter="url(#glow)" />
          
          {/* Body */}
          <path
            d="M50 35 L50 80 M30 50 L70 50 M50 80 L30 130 M50 80 L70 130"
            stroke="url(#bodyGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          
          {/* Arms raised in power pose */}
          <path
            d="M30 50 L15 30 M70 50 L85 30"
            stroke="url(#bodyGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#glow)"
          />
        </svg>
      </div>

      {/* Orbiting energy spheres for Core 4 - responsive */}
      <div className="absolute w-52 h-52 md:w-72 md:h-72">
        {['Body', 'Balance', 'Being', 'Business'].map((label, i) => (
          <div
            key={label}
            className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/80 flex items-center justify-center text-[6px] md:text-[8px] font-bold text-primary-foreground animate-orbit shadow-lg"
            style={{
              animationDelay: `${i * 0.25}s`,
              animationDuration: '4s'
            }}
          >
            {label[0]}
          </div>
        ))}
      </div>

      {/* Title text - responsive */}
      <div className="absolute bottom-24 md:bottom-20 text-center animate-fade-in px-4" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {language === 'en' ? 'WARRIOR IN POWER' : 'RĂZBOINIC ÎN PUTERE'}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {language === 'en' ? 'All Core 4 Complete!' : 'Toate Core 4 Complete!'}
        </p>
      </div>
    </CelebrationOverlay>
  );
};

// Compact badge for permanent display
export const WarriorBadge: React.FC = () => {
  return (
    <div className="relative inline-flex items-center justify-center animate-energy-pulse-subtle">
      <div className="absolute w-8 h-8 rounded-full bg-primary/20" />
      <svg viewBox="0 0 100 150" className="w-6 h-9">
        <defs>
          <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="20" r="15" fill="url(#badgeGradient)" />
        <path
          d="M50 35 L50 80 M30 50 L70 50 M50 80 L30 130 M50 80 L70 130"
          stroke="url(#badgeGradient)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M30 50 L15 30 M70 50 L85 30"
          stroke="url(#badgeGradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
