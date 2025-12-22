import React, { useEffect } from 'react';
import { useSoundSettings } from '@/hooks/useSoundSettings';

interface CelebrationOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  children: React.ReactNode;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  isVisible,
  onClose,
  duration = 4000,
  children
}) => {
  const { playSuccessSound } = useSoundSettings();

  useEffect(() => {
    if (isVisible) {
      playSuccessSound();
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose, playSuccessSound]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
