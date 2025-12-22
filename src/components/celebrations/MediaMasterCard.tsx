import React from 'react';
import { Video, FileText, AudioLines, Image } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const mediaIcons = [
  { icon: Video, label: 'Video', color: 'text-red-400 bg-red-500/20' },
  { icon: FileText, label: 'Text', color: 'text-blue-400 bg-blue-500/20' },
  { icon: AudioLines, label: 'Audio', color: 'text-green-400 bg-green-500/20' },
  { icon: Image, label: 'Image', color: 'text-purple-400 bg-purple-500/20' },
];

export const MediaMasterCard: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-accent/20 via-purple-500/10 to-accent/20 
                    border-2 border-accent/40 rounded-lg p-3 md:p-4 animate-power-glow mb-3 md:mb-4">
      {/* Background energy effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent animate-energy-pulse-subtle" />
      
      <div className="relative z-10 flex items-center gap-3 md:gap-4">
        {/* Media icons in circle */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 animate-warrior-breathe">
          {/* Center spark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-accent to-primary 
                           animate-pulse flex items-center justify-center shadow-lg shadow-accent/30">
              <span className="text-base md:text-lg">✨</span>
            </div>
          </div>
          
          {/* 4 icons orbiting */}
          {mediaIcons.map(({ icon: Icon, color, label }, i) => {
            const angle = (i * Math.PI * 2) / 4 - Math.PI / 2;
            const radius = 38;
            return (
              <div 
                key={label}
                className="absolute transition-all duration-300"
                style={{
                  top: `${50 + radius * Math.sin(angle)}%`,
                  left: `${50 + radius * Math.cos(angle)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full ${color} flex items-center justify-center 
                               border border-white/10 shadow-sm`}>
                  <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </div>
              </div>
            );
          })}
          
          {/* Glow behind icons */}
          <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl animate-pulse" />
        </div>
        
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-bold bg-gradient-to-r from-accent to-purple-400 
                        bg-clip-text text-transparent uppercase tracking-wide">
            {language === 'en' ? 'Media Mastery' : 'Stăpânul Media'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {language === 'en' ? 'All Biz 4 Complete!' : 'Toate Biz 4 Complete!'}
          </p>
          
          {/* Media mini icons row */}
          <div className="flex gap-1.5 mt-2">
            {mediaIcons.map(({ icon: Icon, label, color }) => (
              <div 
                key={label} 
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${color} flex items-center justify-center
                           border border-white/10`}
                title={label}
              >
                <Icon className="w-2.5 h-2.5 md:w-3 md:h-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
