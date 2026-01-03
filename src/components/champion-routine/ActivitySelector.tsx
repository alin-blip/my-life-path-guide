import React from 'react';
import { Card } from '@/components/ui/card';
import { Dumbbell, PersonStanding, Bike, Footprints } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type ActivityType = 'workout' | 'running' | 'cycling' | 'walking';

interface ActivitySelectorProps {
  onSelect: (type: ActivityType) => void;
  selected?: ActivityType | null;
}

const activities: { type: ActivityType; icon: React.ElementType; labelKey: string; color: string }[] = [
  { type: 'workout', icon: Dumbbell, labelKey: 'workout', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
  { type: 'running', icon: PersonStanding, labelKey: 'running', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
  { type: 'cycling', icon: Bike, labelKey: 'cycling', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
  { type: 'walking', icon: Footprints, labelKey: 'walking', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' },
];

export function ActivitySelector({ onSelect, selected }: ActivitySelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {activities.map(({ type, icon: Icon, labelKey, color }) => (
        <Card
          key={type}
          onClick={() => onSelect(type)}
          className={`
            p-4 cursor-pointer transition-all duration-200 hover:scale-105
            bg-gradient-to-br ${color}
            ${selected === type ? 'ring-2 ring-primary scale-105' : ''}
          `}
        >
          <div className="flex flex-col items-center gap-2">
            <Icon className="h-8 w-8 text-foreground" />
            <span className="text-sm font-medium text-foreground capitalize">
              {t(labelKey) || labelKey}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
