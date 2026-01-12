import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export const FocusModeBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient - Theme aware */}
      <div 
        className={cn(
          "absolute inset-0 transition-colors duration-500",
          isDark 
            ? "" // Dark mode uses HSL style below
            : "bg-gradient-to-br from-slate-50 via-blue-50/80 to-purple-50/60"
        )}
        style={isDark ? {
          background: 'radial-gradient(ellipse at 50% 50%, hsl(222 47% 11%) 0%, hsl(222 84% 5%) 50%, hsl(222 84% 3%) 100%)'
        } : undefined}
      />
      
      {/* Animated stars layer - Dark mode only */}
      {isDark && (
        <>
          <div className="stars-layer-1" />
          <div className="stars-layer-2" />
        </>
      )}
      
      {/* Nebula glow effects - Theme aware */}
      <div 
        className={cn(
          "absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse",
          isDark ? "opacity-20" : "opacity-30"
        )}
        style={{ 
          background: isDark 
            ? 'radial-gradient(circle, hsl(217 91% 60% / 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, hsl(217 91% 60% / 0.15) 0%, transparent 70%)'
        }}
      />
      <div 
        className={cn(
          "absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl animate-pulse",
          isDark ? "opacity-15" : "opacity-20"
        )}
        style={{ 
          background: isDark
            ? 'radial-gradient(circle, hsl(280 65% 60% / 0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, hsl(280 65% 60% / 0.12) 0%, transparent 70%)',
          animationDelay: '1s'
        }}
      />
      <div 
        className={cn(
          "absolute top-2/3 left-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse",
          isDark ? "opacity-10" : "opacity-15"
        )}
        style={{ 
          background: isDark
            ? 'radial-gradient(circle, hsl(200 80% 50% / 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, hsl(200 80% 50% / 0.1) 0%, transparent 70%)',
          animationDelay: '2s'
        }}
      />
      
      {/* Grid overlay for depth - Theme aware */}
      <div 
        className={cn(
          "absolute inset-0",
          isDark ? "opacity-30" : "opacity-10"
        )}
        style={{
          backgroundImage: isDark
            ? `linear-gradient(hsl(217 91% 60% / 0.03) 1px, transparent 1px),
               linear-gradient(90deg, hsl(217 91% 60% / 0.03) 1px, transparent 1px)`
            : `linear-gradient(hsl(217 91% 60% / 0.05) 1px, transparent 1px),
               linear-gradient(90deg, hsl(217 91% 60% / 0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Vignette effect - Theme aware */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, transparent 0%, hsl(222 84% 3% / 0.4) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 0%, hsl(220 20% 97% / 0.3) 100%)'
        }}
      />
    </div>
  );
};
