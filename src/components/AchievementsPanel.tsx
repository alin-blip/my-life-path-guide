import { ACHIEVEMENTS } from '@/data/achievements';
import { useAchievements } from '@/hooks/useAchievements';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface Props {
  className?: string;
}

export const AchievementsPanel = ({ className }: Props) => {
  const { unlocked } = useAchievements();
  const unlockedSet = new Set(unlocked.map((u) => u.key));

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Deblocări Războinic</h3>
        <Badge variant="secondary">
          {unlockedSet.size} / {ACHIEVEMENTS.length}
        </Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlockedSet.has(a.key);
          return (
            <Card
              key={a.key}
              className={cn(
                'p-3 flex flex-col items-center text-center transition-all',
                isUnlocked
                  ? 'border-primary/40 bg-primary/5'
                  : 'opacity-60 grayscale',
              )}
            >
              <div className="text-3xl mb-1 relative">
                {isUnlocked ? a.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
              </div>
              <div className="text-sm font-medium leading-tight">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {a.description}
              </div>
              {a.reward && isUnlocked && (
                <Badge variant="outline" className="mt-2 text-[10px]">
                  {a.reward}
                </Badge>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
