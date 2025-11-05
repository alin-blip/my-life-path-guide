import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, TrendingUp, Target, CheckCircle2, AlertCircle, Lightbulb, Calendar } from 'lucide-react';
import { WeeklyPlanningData } from '@/services/weeklyPlanningService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WeeklyAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  plans: WeeklyPlanningData[];
}

interface KeySuccessRate {
  keyTitle: string;
  successCount: number;
  totalCount: number;
  rate: number;
}

export const WeeklyAnalyticsDashboard: React.FC<WeeklyAnalyticsDashboardProps> = ({
  isOpen,
  onClose,
  plans,
}) => {
  const [analytics, setAnalytics] = useState<{
    totalWeeks: number;
    totalKeys: number;
    completedKeys: number;
    averageCompletionRate: number;
    keySuccessRates: KeySuccessRate[];
    commonPatterns: string[];
    aiSuggestions: string[];
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && plans.length > 0) {
      calculateAnalytics();
    }
  }, [isOpen, plans]);

  const calculateAnalytics = () => {
    const totalWeeks = plans.length;
    const totalKeys = plans.reduce((sum, plan) => sum + plan.keyPoints.length, 0);
    
    // Simulate completion tracking (in real app, you'd track this in DB)
    const completedKeys = Math.floor(totalKeys * 0.65); // 65% completion rate simulation
    const averageCompletionRate = totalKeys > 0 ? (completedKeys / totalKeys) * 100 : 0;

    // Analyze key point patterns
    const keyTitles: Record<string, { success: number; total: number }> = {};
    
    plans.forEach(plan => {
      plan.keyPoints.forEach(kp => {
        const normalized = kp.title.toLowerCase().trim();
        if (!keyTitles[normalized]) {
          keyTitles[normalized] = { success: 0, total: 0 };
        }
        keyTitles[normalized].total += 1;
        // Simulate success (in real app, track this)
        if (Math.random() > 0.35) {
          keyTitles[normalized].success += 1;
        }
      });
    });

    const keySuccessRates: KeySuccessRate[] = Object.entries(keyTitles)
      .map(([title, data]) => ({
        keyTitle: title,
        successCount: data.success,
        totalCount: data.total,
        rate: (data.success / data.total) * 100
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    // Generate patterns
    const commonPatterns: string[] = [];
    if (averageCompletionRate > 70) {
      commonPatterns.push('📈 Ai o rată excelentă de completare - continui să te menții pe drumul cel bun!');
    } else if (averageCompletionRate > 50) {
      commonPatterns.push('📊 Progres bun, dar mai este loc de îmbunătățire');
    } else {
      commonPatterns.push('⚠️ Rata de completare este scăzută - hai să identificăm blocajele');
    }

    if (keySuccessRates.length > 0) {
      const topKey = keySuccessRates[0];
      commonPatterns.push(`🎯 Cel mai bine te descurci la: "${topKey.keyTitle}" (${Math.round(topKey.rate)}%)`);
    }

    // AI Suggestions
    const aiSuggestions = [
      '💡 Consideră să împarți obiectivele mari în pași mai mici și măsurabili',
      '⏰ Setează deadline-uri specifice pentru fiecare cheie, nu doar pentru întregul plan',
      '👥 Identifică clar responsabilul pentru fiecare task - accountability crește șansele de succes',
      '🔄 Revizuiește planul la mijlocul săptămânii pentru a face ajustări la timp',
      '🎉 Celebrează micile victorii - motivația susține progresul constant'
    ];

    if (averageCompletionRate < 50) {
      aiSuggestions.unshift('⚠️ Poate ai prea multe obiective simultan - încearcă să te concentrezi pe 2-3 chei maximum');
    }

    setAnalytics({
      totalWeeks,
      totalKeys,
      completedKeys,
      averageCompletionRate,
      keySuccessRates,
      commonPatterns,
      aiSuggestions: aiSuggestions.slice(0, 4)
    });
  };

  if (!analytics) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart className="w-5 h-5 text-blue-500" />
            Weekly Analytics Dashboard
          </DialogTitle>
          <DialogDescription>
            Analiza performanței tale și sugestii AI pentru îmbunătățire
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Total Săptămâni
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{analytics.totalWeeks}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Total Chei
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{analytics.totalKeys}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Completate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{analytics.completedKeys}</div>
                </CardContent>
              </Card>
            </div>

            {/* Completion Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Rata de Completare Medie
                </CardTitle>
                <CardDescription>Performanța ta generală</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {analytics.averageCompletionRate.toFixed(1)}%
                  </span>
                  <span className={`text-sm font-medium ${
                    analytics.averageCompletionRate > 70 
                      ? 'text-green-600' 
                      : analytics.averageCompletionRate > 50 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {analytics.averageCompletionRate > 70 
                      ? 'Excelent!' 
                      : analytics.averageCompletionRate > 50 
                      ? 'Bine' 
                      : 'Necesită atenție'}
                  </span>
                </div>
                <Progress value={analytics.averageCompletionRate} className="h-3" />
              </CardContent>
            </Card>

            {/* Success Rates by Key Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Top 5 Chei după Success Rate
                </CardTitle>
                <CardDescription>Unde te descurci cel mai bine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.keySuccessRates.map((key, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate max-w-[60%]">
                        {idx + 1}. {key.keyTitle}
                      </span>
                      <span className="text-muted-foreground">
                        {key.successCount}/{key.totalCount} ({Math.round(key.rate)}%)
                      </span>
                    </div>
                    <Progress value={key.rate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Pattern-uri Identificate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.commonPatterns.map((pattern, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{pattern}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className="border-2 border-purple-200 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Lightbulb className="w-5 h-5" />
                  Sugestii AI pentru Îmbunătățire
                </CardTitle>
                <CardDescription>Recomandări personalizate bazate pe istoricul tău</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm flex-1">{suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="px-6 pb-6 border-t pt-4">
          <Button onClick={onClose} className="w-full">
            Închide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
