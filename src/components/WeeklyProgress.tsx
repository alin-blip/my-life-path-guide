
import React from 'react';
import { Progress } from './ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface WeeklyProgressProps {
  title: string;
  currentProgress: number;
  maxPoints: number;
  variant?: 'default' | 'compact';
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({
  title,
  currentProgress,
  maxPoints,
  variant = 'default'
}) => {
  const percentage = Math.min(Math.round((currentProgress / maxPoints) * 100), 100);
  
  return (
    <Card className="bg-[#11152b] border border-gray-700">
      <CardHeader className={variant === 'compact' ? 'p-3' : 'p-4'}>
        <div className="flex justify-between items-center">
          <CardTitle className={`${variant === 'compact' ? 'text-base' : 'text-lg'} font-semibold`}>
            {title} {currentProgress} / {maxPoints}
          </CardTitle>
          <span className="text-sm font-medium text-blue-400">{percentage}%</span>
        </div>
      </CardHeader>
      <CardContent className={variant === 'compact' ? 'p-3 pt-0' : 'p-4 pt-0'}>
        <Progress 
          value={percentage} 
          className="h-2 bg-gray-700" 
          indicatorClassName={`${
            percentage < 30 
              ? 'bg-red-500' 
              : percentage < 70 
                ? 'bg-amber-500' 
                : 'bg-emerald-500'
          }`} 
        />
      </CardContent>
    </Card>
  );
};
