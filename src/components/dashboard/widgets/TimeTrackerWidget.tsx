import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { TimeCategory, categories } from "@/components/time/CategoryPicker";

interface TimeTrackerWidgetProps {
  size?: 'small' | 'medium' | 'large';
  onRemove?: () => void;
}

interface TodayStats {
  totalMinutes: number;
  entries: number;
  avgEnergy: number;
  energyTrend: number;
  topCategory: TimeCategory | null;
}

export function TimeTrackerWidget({ size = 'medium', onRemove }: TimeTrackerWidgetProps) {
  const [stats, setStats] = useState<TodayStats>({
    totalMinutes: 0,
    entries: 0,
    avgEnergy: 0,
    energyTrend: 0,
    topCategory: null
  });
  const [hasAlert, setHasAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Fetch today's entries
      const { data: entries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (entries && entries.length > 0) {
        const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0);
        const energyBefore = entries.filter(e => e.energy_before).map(e => e.energy_before as number);
        const energyAfter = entries.filter(e => e.energy_after).map(e => e.energy_after as number);
        
        const avgBefore = energyBefore.length > 0 ? energyBefore.reduce((a, b) => a + b, 0) / energyBefore.length : 0;
        const avgAfter = energyAfter.length > 0 ? energyAfter.reduce((a, b) => a + b, 0) / energyAfter.length : 0;

        // Find top category
        const categoryMinutes: Record<string, number> = {};
        entries.forEach(e => {
          categoryMinutes[e.category] = (categoryMinutes[e.category] || 0) + e.duration_minutes;
        });
        const topCategory = Object.entries(categoryMinutes).sort((a, b) => b[1] - a[1])[0]?.[0] as TimeCategory;

        setStats({
          totalMinutes,
          entries: entries.length,
          avgEnergy: avgAfter,
          energyTrend: avgAfter - avgBefore,
          topCategory
        });
      }

      // Check for unacknowledged alerts
      const { data: alerts } = await supabase
        .from('burnout_alerts')
        .select('id')
        .eq('user_id', user.id)
        .is('acknowledged_at', null)
        .limit(1);

      setHasAlert(alerts && alerts.length > 0);
    } catch (error) {
      console.error('Error fetching time stats:', error);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const topCategoryConfig = stats.topCategory ? categories.find(c => c.id === stats.topCategory) : null;

  return (
    <Card className={cn(
      "relative overflow-hidden",
      hasAlert && "border-orange-500/50"
    )}>
      {hasAlert && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="h-4 w-4 text-orange-500 animate-pulse" />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Total time today */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatTime(stats.totalMinutes)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.entries} activități azi
            </p>
          </div>
          
          {/* Energy trend */}
          {stats.entries > 0 && (
            <div className="flex items-center gap-1">
              {stats.energyTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : stats.energyTrend < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : null}
              <span className={cn(
                "text-sm font-medium",
                stats.energyTrend > 0 ? "text-green-500" : stats.energyTrend < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                {stats.energyTrend > 0 ? '+' : ''}{stats.energyTrend.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Top category */}
        {topCategoryConfig && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <topCategoryConfig.icon className={cn("h-3 w-3", topCategoryConfig.color)} />
            <span>Cel mai mult: {topCategoryConfig.labelRo}</span>
          </div>
        )}

        {/* Quick add button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate('/time-tracker')}
        >
          <Plus className="h-3 w-3 mr-1" />
          Loghează Timp
        </Button>
      </CardContent>
    </Card>
  );
}
