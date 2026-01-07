import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, TrendingUp, TrendingDown, Minus, Sparkles, Calendar } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ro } from 'date-fns/locale';
import { getEmotionInfo, Emotion } from './EmotionPicker';
import { toast } from 'sonner';

interface WeeklyReportData {
  dominantEmotion: Emotion | null;
  avgIntensity: number;
  avgEnergy: number;
  totalCheckins: number;
  topTriggers: string[];
  emotionBreakdown: Record<string, number>;
  energyTrend: 'up' | 'down' | 'stable';
  aiInsights: string | null;
}

export function WeeklyReport() {
  const { user } = useAuth();
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      generateReport();
    }
  }, [user]);

  const generateReport = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const { data: checkins, error } = await supabase
      .from('emotional_checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching checkins:', error);
      setIsLoading(false);
      return;
    }

    if (!checkins || checkins.length === 0) {
      setReport(null);
      setIsLoading(false);
      return;
    }

    // Calculate report data
    const emotionCounts: Record<string, number> = {};
    let totalIntensity = 0;
    let totalEnergy = 0;
    const triggers: string[] = [];

    checkins.forEach(c => {
      emotionCounts[c.emotion] = (emotionCounts[c.emotion] || 0) + 1;
      totalIntensity += c.intensity;
      totalEnergy += c.energy_level;
      if (c.trigger) triggers.push(c.trigger);
    });

    const dominantEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as Emotion | null;

    // Calculate energy trend (compare first half vs second half)
    const midpoint = Math.floor(checkins.length / 2);
    const firstHalfEnergy = checkins.slice(0, midpoint).reduce((sum, c) => sum + c.energy_level, 0) / (midpoint || 1);
    const secondHalfEnergy = checkins.slice(midpoint).reduce((sum, c) => sum + c.energy_level, 0) / ((checkins.length - midpoint) || 1);
    
    let energyTrend: 'up' | 'down' | 'stable' = 'stable';
    if (secondHalfEnergy - firstHalfEnergy > 1) energyTrend = 'up';
    else if (firstHalfEnergy - secondHalfEnergy > 1) energyTrend = 'down';

    // Get unique triggers sorted by frequency
    const triggerCounts = triggers.reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger);

    setReport({
      dominantEmotion,
      avgIntensity: Math.round(totalIntensity / checkins.length * 10) / 10,
      avgEnergy: Math.round(totalEnergy / checkins.length * 10) / 10,
      totalCheckins: checkins.length,
      topTriggers,
      emotionBreakdown: emotionCounts,
      energyTrend,
      aiInsights: null,
    });

    setIsLoading(false);
  };

  const generateAIInsights = async () => {
    if (!user || !report) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('emotional-insights', {
        body: { userId: user.id, action: 'weekly_report' }
      });

      if (error) throw error;

      setReport(prev => prev ? { ...prev, aiInsights: data.insights } : null);
      toast.success('Raport AI generat!');
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast.error('Nu am putut genera insight-urile AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Se generează raportul...
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nu există suficiente date pentru raportul săptămânal
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Continuă să faci check-in-uri zilnice
          </p>
        </CardContent>
      </Card>
    );
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Raport Săptămânal
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            <Calendar className="h-3 w-3 mr-1" />
            {format(weekStart, 'd MMM', { locale: ro })} - {format(weekEnd, 'd MMM', { locale: ro })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl mb-1">
                  {report.dominantEmotion ? getEmotionInfo(report.dominantEmotion)?.emoji : '—'}
                </div>
                <div className="text-xs font-medium">
                  {report.dominantEmotion ? getEmotionInfo(report.dominantEmotion)?.labelRo : 'N/A'}
                </div>
                <div className="text-[10px] text-muted-foreground">Emoție dominantă</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold">{report.totalCheckins}</div>
                <div className="text-xs font-medium">Check-in-uri</div>
                <div className="text-[10px] text-muted-foreground">Această săptămână</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm">Intensitate medie</span>
                <span className="font-bold">{report.avgIntensity}/10</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm">Energie medie</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(report.energyTrend)}
                  <span className="font-bold">{report.avgEnergy}/10</span>
                </div>
              </div>
            </div>

            {/* Emotion Breakdown */}
            <div>
              <h4 className="text-sm font-medium mb-2">Distribuție emoții</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(report.emotionBreakdown).map(([emotion, count]) => {
                  const info = getEmotionInfo(emotion as Emotion);
                  const percentage = Math.round((count / report.totalCheckins) * 100);
                  return (
                    <Badge key={emotion} variant="secondary" className="text-xs">
                      {info?.emoji} {percentage}%
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Top Triggers */}
            {report.topTriggers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Top trigger-uri</h4>
                <div className="space-y-1">
                  {report.topTriggers.map((trigger, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-muted/30">
                      {i + 1}. {trigger}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {report.aiInsights ? (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-1 text-xs text-primary font-medium mb-2">
                  <Sparkles className="h-3 w-3" />
                  Insight-uri AI
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {report.aiInsights}
                </p>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={generateAIInsights}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generează insight-uri AI
              </Button>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
