import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories, TimeCategory } from "./CategoryPicker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimeEntryData {
  id: string;
  category: TimeCategory;
  activity: string;
  duration_minutes: number;
  energy_before: number | null;
  energy_after: number | null;
  satisfaction: number | null;
  was_planned: boolean | null;
  started_at: string | null;
  created_at: string;
}

interface TimeTimelineProps {
  entries: TimeEntryData[];
  onDelete?: (id: string) => void;
}

export function TimeTimeline({ entries, onDelete }: TimeTimelineProps) {
  const { toast } = useToast();

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getCategoryConfig = (cat: TimeCategory) => {
    return categories.find(c => c.id === cat);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('time_entries').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Șters", description: "Intrarea a fost ștearsă" });
      onDelete?.(id);
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({ title: "Eroare", description: "Nu am putut șterge intrarea", variant: "destructive" });
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const timeA = a.started_at || a.created_at;
    const timeB = b.started_at || b.created_at;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Activități Azi
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEntries.length > 0 ? (
          <div className="space-y-3">
            {sortedEntries.map((entry) => {
              const catConfig = getCategoryConfig(entry.category);
              const Icon = catConfig?.icon || Clock;
              const energyDelta = entry.energy_after && entry.energy_before 
                ? entry.energy_after - entry.energy_before 
                : null;

              return (
                <div 
                  key={entry.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    catConfig?.bgColor || "bg-muted/50"
                  )}
                >
                  <div className={cn("p-2 rounded-full", catConfig?.bgColor)}>
                    <Icon className={cn("h-4 w-4", catConfig?.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{entry.activity}</span>
                      {entry.was_planned ? (
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatTime(entry.started_at || entry.created_at)}</span>
                      <span className="font-medium">{formatDuration(entry.duration_minutes)}</span>
                      {energyDelta !== null && (
                        <span className={cn(
                          "font-medium",
                          energyDelta > 0 ? "text-green-500" : energyDelta < 0 ? "text-red-500" : ""
                        )}>
                          {energyDelta > 0 ? '+' : ''}{energyDelta} energie
                        </span>
                      )}
                      {entry.satisfaction && (
                        <span>⭐ {entry.satisfaction}/10</span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nicio activitate logată azi</p>
            <p className="text-xs">Folosește formularul pentru a începe</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
