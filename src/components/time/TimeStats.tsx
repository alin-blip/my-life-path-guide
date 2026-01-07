import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, Battery, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories, TimeCategory } from "./CategoryPicker";

interface TimeEntry {
  category: TimeCategory;
  duration_minutes: number;
  energy_before: number | null;
  energy_after: number | null;
  satisfaction: number | null;
}

interface TimeStatsProps {
  entries: TimeEntry[];
  period?: 'today' | 'week';
}

export function TimeStats({ entries, period = 'today' }: TimeStatsProps) {
  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const avgEnergyBefore = entries.length > 0 
    ? entries.reduce((sum, e) => sum + (e.energy_before || 0), 0) / entries.filter(e => e.energy_before).length
    : 0;

  const avgEnergyAfter = entries.length > 0
    ? entries.reduce((sum, e) => sum + (e.energy_after || 0), 0) / entries.filter(e => e.energy_after).length
    : 0;

  const avgSatisfaction = entries.length > 0
    ? entries.reduce((sum, e) => sum + (e.satisfaction || 0), 0) / entries.filter(e => e.satisfaction).length
    : 0;

  const energyDelta = avgEnergyAfter - avgEnergyBefore;

  // Category breakdown
  const categoryBreakdown = categories.map(cat => {
    const catEntries = entries.filter(e => e.category === cat.id);
    const minutes = catEntries.reduce((sum, e) => sum + e.duration_minutes, 0);
    const percentage = totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0;
    return { ...cat, minutes, percentage };
  }).filter(c => c.minutes > 0).sort((a, b) => b.minutes - a.minutes);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Total Time Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {period === 'today' ? 'Total Azi' : 'Total Săptămâna'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalHours}h</div>
          <p className="text-xs text-muted-foreground">
            {entries.length} activități logate
          </p>
        </CardContent>
      </Card>

      {/* Energy Delta Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Trend Energie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-3xl font-bold",
              energyDelta > 0 ? "text-green-500" : energyDelta < 0 ? "text-red-500" : "text-muted-foreground"
            )}>
              {energyDelta > 0 ? '+' : ''}{energyDelta.toFixed(1)}
            </span>
            {energyDelta > 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : energyDelta < 0 ? (
              <TrendingDown className="h-5 w-5 text-red-500" />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Medie: {avgEnergyBefore.toFixed(1)} → {avgEnergyAfter.toFixed(1)}
          </p>
        </CardContent>
      </Card>

      {/* Satisfaction Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            Satisfacție Medie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-3xl font-bold",
            avgSatisfaction >= 7 ? "text-green-500" : avgSatisfaction >= 5 ? "text-yellow-500" : "text-red-500"
          )}>
            {avgSatisfaction.toFixed(1)}/10
          </div>
          <p className="text-xs text-muted-foreground">
            {avgSatisfaction >= 7 ? "Excelent!" : avgSatisfaction >= 5 ? "Poate fi mai bine" : "Necesită atenție"}
          </p>
        </CardContent>
      </Card>

      {/* Category Breakdown Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Distribuție pe Categorii
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-2">
              {categoryBreakdown.map(cat => {
                const Icon = cat.icon;
                return (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", cat.color)} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{cat.labelRo}</span>
                        <span className="text-muted-foreground">{formatTime(cat.minutes)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", cat.bgColor.replace('/10', ''))}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nicio activitate logată</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
