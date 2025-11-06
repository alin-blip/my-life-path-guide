import React from 'react';
import { Radio } from 'lucide-react';

interface AISpeakingIndicatorProps {
  isAISpeaking: boolean;
  message?: string;
}

export const AISpeakingIndicator: React.FC<AISpeakingIndicatorProps> = ({
  isAISpeaking,
  message = "AI vorbește, te rog așteaptă..."
}) => {
  if (!isAISpeaking) return null;

  return (
    <div 
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400 animate-fade-in mb-4"
      role="status"
      aria-live="polite"
    >
      <Radio className="w-4 h-4 animate-pulse" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
