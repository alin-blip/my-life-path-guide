import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Zap, Battery, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories, TimeCategory } from "./CategoryPicker";

interface TimeEntry {
  id: string;
  category: TimeCategory;
  activity: string;
  duration_minutes: number;
  energy_before: number | null;
  energy_after: number | null;
  satisfaction: number | null;
}

interface WeeklyROIReportProps {
  entries: TimeEntry[];
  aiSummary?: string;
  aiRecommendations?: string[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function WeeklyROIReport({ 
  entries, 
  aiSummary, 
  aiRecommendations, 
  onRefresh,
  isLoading 
}: WeeklyROIReportProps) {
  // Calculate energy vampires and boosters
  const activitiesWithDelta = entries
    .filter(e => e.energy_before && e.energy_after)
    .map(e => ({
      ...e,
      energyDelta: (e.energy_after || 0) - (e.energy_before || 0),
      roi: ((e.satisfaction || 5) / (e.duration_minutes / 60)) // satisfaction per hour
    }));

  const energyVampires = [...activitiesWithDelta]
    .filter(a => a.energyDelta < 0)
    .sort((a, b) => a.energyDelta - b.energyDelta)
    .slice(0, 3);

  const energyBoosters = [...activitiesWithDelta]
    .filter(a => a.energyDelta > 0)
    .sort((a, b) => b.energyDelta - a.energyDelta)
    .slice(0, 3);

  const totalHours = entries.reduce((sum, e) => sum + e.duration_minutes, 0) / 60;
  const avgSatisfaction = entries.length > 0
    ? entries.reduce((sum, e) => sum + (e.satisfaction || 5), 0) / entries.length
    : 0;
  
  const roiScore = totalHours > 0 ? (avgSatisfaction / totalHours * 10).toFixed(1) : '0';

  const getCategoryLabel = (cat: TimeCategory) => {
    return categories.find(c => c.id === cat)?.labelRo || cat;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Raport ROI Săptămânal
          </CardTitle>
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ROI Score */}
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Scor ROI</div>
          <div className="text-4xl font-bold text-primary">{roiScore}</div>
          <div className="text-xs text-muted-foreground">Satisfacție per oră investită</div>
        </div>

        {/* Energy Vampires */}
        {energyVampires.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-500">
              <TrendingDown className="h-4 w-4" />
              Energy Vampires 🧛
            </h4>
            <div className="space-y-2">
              {energyVampires.map((activity, i) => (
                <div key={activity.id || i} className="flex items-center justify-between p-2 bg-red-500/5 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">{activity.activity}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({getCategoryLabel(activity.category)})
                    </span>
                  </div>
                  <span className="text-sm text-red-500 font-medium">
                    {activity.energyDelta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Energy Boosters */}
        {energyBoosters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-500">
              <TrendingUp className="h-4 w-4" />
              Energy Boosters ⚡
            </h4>
            <div className="space-y-2">
              {energyBoosters.map((activity, i) => (
                <div key={activity.id || i} className="flex items-center justify-between p-2 bg-green-500/5 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">{activity.activity}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({getCategoryLabel(activity.category)})
                    </span>
                  </div>
                  <span className="text-sm text-green-500 font-medium">
                    +{activity.energyDelta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        {aiSummary && (
          <div className="p-3 bg-primary/5 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Insight AI
            </h4>
            <p className="text-sm text-muted-foreground">{aiSummary}</p>
          </div>
        )}

        {/* AI Recommendations */}
        {aiRecommendations && aiRecommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recomandări</h4>
            <ul className="space-y-2">
              {aiRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Battery className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nicio activitate logată săptămâna asta</p>
            <p className="text-xs">Începe să loghezi pentru a primi insight-uri</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
