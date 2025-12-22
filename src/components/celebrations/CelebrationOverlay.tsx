import React, { useEffect } from 'react';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { haptic } from '@/utils/hapticFeedback';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isVisible) {
      haptic.celebration();
      playSuccessSound();
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose, playSuccessSound]);

  const handleTapToDismiss = () => {
    if (isMobile) {
      haptic.light();
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in cursor-pointer"
      onClick={handleTapToDismiss}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
      
      {/* Tap to dismiss hint on mobile */}
      {isMobile && (
        <p className="absolute bottom-8 text-muted-foreground text-sm animate-pulse">
          Atinge pentru a închide
        </p>
      )}
    </div>
  );
};
