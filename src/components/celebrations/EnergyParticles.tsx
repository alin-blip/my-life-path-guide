import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EnergyParticlesProps {
  count?: number;
  color?: string;
}

export const EnergyParticles: React.FC<EnergyParticlesProps> = ({
  count = 20,
  color = 'hsl(var(--primary))'
}) => {
  const isMobile = useIsMobile();
  const particleCount = isMobile ? Math.floor(count / 2) : count;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-particle-float"
          style={{
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            bottom: '-10px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            opacity: 0.6 + Math.random() * 0.4
          }}
        />
      ))}
    </div>
  );
};
