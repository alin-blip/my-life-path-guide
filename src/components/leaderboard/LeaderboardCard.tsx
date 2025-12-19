import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardCardProps {
  rank: number;
  displayName: string;
  avatarEmoji: string;
  pagesRead: number;
  actionsCompleted: number;
  principlesTouched: number;
  isCurrentUser?: boolean;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  rank,
  displayName,
  avatarEmoji,
  pagesRead,
  actionsCompleted,
  principlesTouched,
  isCurrentUser = false,
}) => {
  const getRankDisplay = () => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-500' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-400' };
    if (rank === 3) return { icon: '🥉', color: 'text-amber-600' };
    return { icon: `#${rank}`, color: 'text-muted-foreground' };
  };

  const rankDisplay = getRankDisplay();

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isCurrentUser && "ring-2 ring-primary bg-primary/5",
      rank <= 3 && "border-primary/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className={cn(
            "text-2xl font-bold min-w-[48px] text-center",
            rankDisplay.color
          )}>
            {rankDisplay.icon}
          </div>

          {/* Avatar & Name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-3xl">{avatarEmoji}</span>
            <div className="min-w-0">
              <p className="font-semibold truncate">
                {displayName}
                {isCurrentUser && (
                  <Badge variant="secondary" className="ml-2 text-xs">Tu</Badge>
                )}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">{pagesRead}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="font-medium">{actionsCompleted}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Flame className="h-4 w-4" />
              <span className="font-medium">{principlesTouched}/13</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
