import React from 'react';

export const FocusModeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep space gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(222 47% 11%) 0%, hsl(222 84% 5%) 50%, hsl(222 84% 3%) 100%)'
        }}
      />
      
      {/* Animated stars layer 1 */}
      <div className="stars-layer-1" />
      
      {/* Animated stars layer 2 */}
      <div className="stars-layer-2" />
      
      {/* Subtle nebula glow effects */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(217 91% 60% / 0.3) 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl animate-pulse opacity-15"
        style={{ 
          background: 'radial-gradient(circle, hsl(280 65% 60% / 0.25) 0%, transparent 70%)',
          animationDelay: '1s'
        }}
      />
      <div 
        className="absolute top-2/3 left-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse opacity-10"
        style={{ 
          background: 'radial-gradient(circle, hsl(200 80% 50% / 0.2) 0%, transparent 70%)',
          animationDelay: '2s'
        }}
      />
      
      {/* Grid overlay for depth */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(hsl(217 91% 60% / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217 91% 60% / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, hsl(222 84% 3% / 0.4) 100%)'
        }}
      />
    </div>
  );
};
