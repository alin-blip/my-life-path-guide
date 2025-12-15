import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X, RefreshCw } from 'lucide-react';

interface ReviewProgressStatsProps {
  totalKeys: number;
  completedKeys: number;
  continuedKeys: number;
  failedKeys: number;
}

export const ReviewProgressStats: React.FC<ReviewProgressStatsProps> = ({
  totalKeys,
  completedKeys,
  continuedKeys,
  failedKeys
}) => {
  const completionPercentage = totalKeys > 0 ? (completedKeys / totalKeys) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 mb-4 border border-border/50">
      <h4 className="text-sm font-semibold text-foreground mb-3">
        Rezumatul Săptămânii Trecute
      </h4>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Procent de completare</span>
          <span className="font-medium text-foreground">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-2 bg-green-500/10 rounded-lg border border-green-500/30">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
            <Check className="w-4 h-4 text-green-500" />
          </div>
          <span className="text-lg font-bold text-green-500">{completedKeys}</span>
          <span className="text-xs text-muted-foreground text-center">Completate</span>
        </div>
        
        <div className="flex flex-col items-center p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mb-1">
            <RefreshCw className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-lg font-bold text-amber-500">{continuedKeys}</span>
          <span className="text-xs text-muted-foreground text-center">Continuate</span>
        </div>
        
        <div className="flex flex-col items-center p-2 bg-red-500/10 rounded-lg border border-red-500/30">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mb-1">
            <X className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-lg font-bold text-red-500">{failedKeys}</span>
          <span className="text-xs text-muted-foreground text-center">Abandonate</span>
        </div>
      </div>
    </div>
  );
};
