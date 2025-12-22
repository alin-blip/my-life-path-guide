import React from 'react';
import { CelebrationOverlay } from './CelebrationOverlay';
import { Video, FileText, AudioLines, Image } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MediaMasterProps {
  isVisible: boolean;
  onClose: () => void;
}

export const MediaMaster: React.FC<MediaMasterProps> = ({
  isVisible,
  onClose
}) => {
  const { language } = useLanguage();
  
  const icons = [
    { Icon: Video, color: 'text-red-500', delay: '0s' },
    { Icon: FileText, color: 'text-blue-500', delay: '0.15s' },
    { Icon: AudioLines, color: 'text-green-500', delay: '0.3s' },
    { Icon: Image, color: 'text-purple-500', delay: '0.45s' }
  ];

  return (
    <CelebrationOverlay isVisible={isVisible} onClose={onClose} duration={4000}>
      {/* Ripple waves */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-20 h-20 rounded-full border-2 border-accent/50 animate-ripple"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>

      {/* Floating media icons in circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {icons.map(({ Icon, color, delay }, i) => (
          <div
            key={i}
            className="absolute animate-icon-appear"
            style={{
              animationDelay: delay,
              top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 4 - Math.PI / 2)}%`,
              left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 4 - Math.PI / 2)}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`p-4 rounded-full bg-card border border-border shadow-xl ${color}`}>
              <Icon className="w-8 h-8" />
            </div>
          </div>
        ))}
        
        {/* Center spark */}
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary animate-pulse flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
      </div>

      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-lg animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Title text */}
      <div className="absolute bottom-20 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          {language === 'en' ? 'MEDIA MASTERY' : 'STĂPÂNUL MEDIA'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'en' ? 'All Daily Four Complete!' : 'Toate Daily Four Complete!'}
        </p>
      </div>
    </CelebrationOverlay>
  );
};

// Compact badge for permanent display
export const MediaBadge: React.FC = () => {
  return (
    <div className="relative inline-flex items-center justify-center">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center animate-pulse">
        <span className="text-xs">✨</span>
      </div>
    </div>
  );
};
