import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Flame, Target, Trophy } from 'lucide-react';

interface FocusStatsProps {
  completedToday: number;
}

export const FocusStats: React.FC<FocusStatsProps> = ({ completedToday }) => {
  const { language } = useLanguage();

  const stats = [
    {
      icon: Target,
      label: language === 'en' ? 'Today' : 'Azi',
      value: completedToday,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Flame,
      label: language === 'en' ? 'Streak' : 'Serie',
      value: 5,
      suffix: language === 'en' ? ' days' : ' zile',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Trophy,
      label: language === 'en' ? 'Best' : 'Record',
      value: 12,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-sm text-foreground mb-4">
        {language === 'en' ? 'Focus Stats' : 'Statistici Focus'}
      </h3>
      
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-semibold text-foreground">
                {stat.value}{stat.suffix || ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
