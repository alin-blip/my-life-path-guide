import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPPopupProps {
  amount: number;
  reason?: string;
  onComplete?: () => void;
}

export const XPPopup: React.FC<XPPopupProps> = ({ amount, reason, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-50",
        "animate-fade-in",
        "pointer-events-none"
      )}
    >
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-full shadow-lg shadow-yellow-500/30 flex items-center gap-2 animate-bounce">
        <Zap className="w-5 h-5" />
        <span className="font-bold text-lg">+{amount} XP</span>
      </div>
      {reason && (
        <p className="text-center text-xs text-muted-foreground mt-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
          {reason}
        </p>
      )}
    </div>
  );
};

// Component that can be used in context to show XP popups globally
interface XPPopupContainerProps {
  recentGain: { amount: number; reason: string } | null;
}

export const XPPopupContainer: React.FC<XPPopupContainerProps> = ({ recentGain }) => {
  if (!recentGain) return null;

  return <XPPopup amount={recentGain.amount} reason={recentGain.reason} />;
};
