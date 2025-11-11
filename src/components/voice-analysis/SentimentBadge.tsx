import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Smile, Frown, Meh, Angry, Heart, Zap } from 'lucide-react';

interface SentimentBadgeProps {
  emotion: string;
  intensity?: 'scăzută' | 'medie' | 'ridicată';
  score?: number;
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({ 
  emotion, 
  intensity,
  score 
}) => {
  const getEmotionIcon = (emotion: string) => {
    const lower = emotion.toLowerCase();
    if (lower.includes('bucur') || lower.includes('ferici')) return Smile;
    if (lower.includes('trist') || lower.includes('deprima')) return Frown;
    if (lower.includes('furie') || lower.includes('mânie')) return Angry;
    if (lower.includes('dragoste') || lower.includes('iubire')) return Heart;
    if (lower.includes('energie') || lower.includes('entuziasm')) return Zap;
    return Meh;
  };

  const getIntensityColor = (intensity?: string) => {
    switch (intensity) {
      case 'ridicată':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'medie':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'scăzută':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSentimentColor = (score?: number) => {
    if (score === undefined) return '';
    if (score > 0.3) return 'bg-green-500/20 text-green-300 border-green-500/50';
    if (score < -0.3) return 'bg-red-500/20 text-red-300 border-red-500/50';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
  };

  const Icon = getEmotionIcon(emotion);
  const colorClass = intensity ? getIntensityColor(intensity) : getSentimentColor(score);

  return (
    <Badge variant="outline" className={`${colorClass} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {emotion}
      {intensity && <span className="text-xs ml-1">({intensity})</span>}
    </Badge>
  );
};
