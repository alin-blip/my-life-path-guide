import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Target, Rocket, Calendar, Flame } from 'lucide-react';

interface Mission {
  id: string;
  category: string;
  title: string;
  mission_type: string;
  period: string | null;
  created_at: string;
}

interface WeeklyPlanning {
  domino_title: string | null;
  week_goal: string | null;
  key_points: { id: string; title: string; completed: boolean }[] | null;
}

interface ClientObjectivesSectionProps {
  missions: {
    annual: Mission[];
    quarterly: Mission[];
    monthly: Mission[];
  };
  weeklyPlanning: WeeklyPlanning | null;
  currentYear: number;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'body': return '💪';
    case 'being': return '🧘';
    case 'balance': return '⚖️';
    case 'business': return '💼';
    default: return '🎯';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'body': return 'Body';
    case 'being': return 'Being';
    case 'balance': return 'Balance';
    case 'business': return 'Business';
    default: return category;
  }
};

export const ClientObjectivesSection: React.FC<ClientObjectivesSectionProps> = ({
  missions,
  weeklyPlanning,
  currentYear
}) => {
  const hasAnyData = missions.annual.length > 0 || 
                     missions.quarterly.length > 0 || 
                     missions.monthly.length > 0 || 
                     weeklyPlanning;

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Obiective Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Clientul nu are obiective definite
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Obiective Client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Annual Objectives */}
        {missions.annual.length > 0 && (
          <div className="p-4 rounded-lg border bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              📅 Anual {currentYear}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {missions.annual.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-black/20">
                  <span>{getCategoryIcon(m.category)}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {getCategoryLabel(m.category)}:
                  </span>
                  <span className="text-sm flex-1 truncate">{m.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quarterly Objectives (90 Days) */}
        {missions.quarterly.length > 0 && (
          <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              🎯 90 Zile ({missions.quarterly[0]?.period || 'Q1'})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {missions.quarterly.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-black/20">
                  <span>{getCategoryIcon(m.category)}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {getCategoryLabel(m.category)}:
                  </span>
                  <span className="text-sm flex-1 truncate">{m.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Objectives */}
        {missions.monthly.length > 0 && (
          <div className="p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Rocket className="h-4 w-4 text-purple-600" />
              🚀 Lunar ({missions.monthly[0]?.period || 'Luna curentă'})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {missions.monthly.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-black/20">
                  <span>{getCategoryIcon(m.category)}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {getCategoryLabel(m.category)}:
                  </span>
                  <span className="text-sm flex-1 truncate">{m.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domino Door */}
        {weeklyPlanning && (weeklyPlanning.domino_title || weeklyPlanning.week_goal) && (
          <div className="p-4 rounded-lg border bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-600" />
              🎲 Domino Door (Săptămâna curentă)
            </h4>
            <div className="space-y-2">
              {weeklyPlanning.domino_title && (
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground">🎯 Titlu:</span>
                  <span className="text-sm">{weeklyPlanning.domino_title}</span>
                </div>
              )}
              {weeklyPlanning.week_goal && (
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground">📌 Obiectiv:</span>
                  <span className="text-sm">{weeklyPlanning.week_goal}</span>
                </div>
              )}
              {weeklyPlanning.key_points && weeklyPlanning.key_points.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {weeklyPlanning.key_points.map((kp, i) => (
                    <Badge 
                      key={kp.id || i} 
                      variant={kp.completed ? 'default' : 'outline'}
                      className={kp.completed ? 'bg-green-500' : ''}
                    >
                      🔑 {kp.title}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
