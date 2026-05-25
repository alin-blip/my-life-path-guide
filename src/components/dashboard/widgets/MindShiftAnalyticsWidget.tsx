import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, TrendingDown, Inbox, Activity } from 'lucide-react';
import { mindShiftService } from '@/services/mindShiftService';
import type { DashboardWidget } from '@/types/dashboardWidget';

interface Props {
  size?: DashboardWidget['size'];
  onRemove?: () => void;
  onResize?: (size: DashboardWidget['size']) => void;
  dragHandleProps?: any;
}

export const MindShiftAnalyticsWidget: React.FC<Props> = ({ dragHandleProps }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    count: number;
    avgDelta: number | null;
    dominantEmotion: string | null;
    drafts: number;
  } | null>(null);

  useEffect(() => {
    mindShiftService.getWeekAnalytics().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <Card
      className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 h-full cursor-pointer hover:border-violet-500/50 transition-colors"
      onClick={() => navigate('/mind-shifting')}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2" {...dragHandleProps}>
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-violet-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Mind Shifting — săptămâna asta</h3>
            <p className="text-[11px] text-muted-foreground">Click pentru detalii</p>
          </div>
        </div>

        {!stats ? (
          <div className="text-xs text-muted-foreground">Se încarcă...</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-background/50 p-2">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Activity className="w-3 h-3" /> Sesiuni
              </div>
              <div className="text-xl font-bold">{stats.count}</div>
            </div>
            <div className="rounded-lg bg-background/50 p-2">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <TrendingDown className="w-3 h-3" /> Δ intensitate
              </div>
              <div className="text-xl font-bold">
                {stats.avgDelta !== null ? `-${stats.avgDelta}%` : '—'}
              </div>
            </div>
            <div className="rounded-lg bg-background/50 p-2">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Inbox className="w-3 h-3" /> Inbox
              </div>
              <div className="text-xl font-bold">{stats.drafts}</div>
            </div>
            <div className="rounded-lg bg-background/50 p-2">
              <div className="text-[10px] text-muted-foreground">Emoția dominantă</div>
              <div className="text-sm font-semibold capitalize truncate">
                {stats.dominantEmotion ?? '—'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
