import React from 'react';
import { CelebrationOverlay } from './CelebrationOverlay';
import { EnergyParticles } from './EnergyParticles';
import { useLanguage } from '@/context/LanguageContext';

interface AlchemistTransformationProps {
  isVisible: boolean;
  onClose: () => void;
  stackType: string;
}

const stackColors: Record<string, { primary: string; secondary: string; emoji: string }> = {
  anger: { primary: '#ef4444', secondary: '#f97316', emoji: '🔥' },
  'divine-prayer': { primary: '#fbbf24', secondary: '#f8fafc', emoji: '✝️' },
  'gods-school': { primary: '#a855f7', secondary: '#6366f1', emoji: '📿' },
  hormozi: { primary: '#10b981', secondary: '#059669', emoji: '💰' },
  'napoleon-hill': { primary: '#d4af37', secondary: '#b8860b', emoji: '📚' },
  gratitude: { primary: '#22c55e', secondary: '#16a34a', emoji: '🙏' }
};

export const AlchemistTransformation: React.FC<AlchemistTransformationProps> = ({
  isVisible,
  onClose,
  stackType
}) => {
  const { language } = useLanguage();
  const colors = stackColors[stackType] || stackColors.anger;

  return (
    <CelebrationOverlay isVisible={isVisible} onClose={onClose} duration={4000}>
      <EnergyParticles count={25} color={colors.primary} />

      {/* Alchemy symbol - circle with triangle */}
      <div className="relative w-48 h-48 animate-alchemist-appear">
        {/* Outer circle */}
        <div 
          className="absolute inset-0 rounded-full border-4 animate-spin-slow"
          style={{ borderColor: colors.primary }}
        />
        
        {/* Inner triangle */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="alchemyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
            <filter id="alchemyGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon 
            points="50,20 80,75 20,75" 
            fill="none" 
            stroke="url(#alchemyGradient)" 
            strokeWidth="3"
            filter="url(#alchemyGlow)"
          />
        </svg>

        {/* Center flame/symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl animate-flame-flicker">
            {colors.emoji}
          </div>
        </div>
      </div>

      {/* Floating energy orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 rounded-full animate-float-orbit"
            style={{
              backgroundColor: i % 2 === 0 ? colors.primary : colors.secondary,
              left: `${50 + 35 * Math.cos((i * Math.PI * 2) / 8)}%`,
              top: `${50 + 35 * Math.sin((i * Math.PI * 2) / 8)}%`,
              animationDelay: `${i * 0.2}s`,
              boxShadow: `0 0 15px ${colors.primary}`
            }}
          />
        ))}
      </div>

      {/* Title text */}
      <div className="absolute bottom-20 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h2 
          className="text-3xl font-bold"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {language === 'en' ? 'TRANSFORMATION COMPLETE' : 'TRANSFORMARE COMPLETĂ'}
        </h2>
        <p className="text-muted-foreground mt-2 capitalize">
          {stackType.replace('-', ' ')} Stack
        </p>
      </div>
    </CelebrationOverlay>
  );
};
