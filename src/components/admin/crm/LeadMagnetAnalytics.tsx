import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  Eye, 
  MousePointerClick, 
  Users, 
  TrendingUp,
  Clock,
  XCircle,
  ArrowUpDown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  leadMagnet: string;
  pageViews: number;
  ctaClicks: number;
  quizStarts: number;
  leadCaptures: number;
  quizCompletes: number;
  bounces: number;
  conversionRate: number;
  avgTimeOnPage: number;
}

export const LeadMagnetAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: events, error } = await supabase
        .from('lead_magnet_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Process events by lead magnet
      const leadMagnets = ['warrior_power', 'vision_2026'];
      const processedData: AnalyticsData[] = leadMagnets.map(lm => {
        const lmEvents = events?.filter(e => e.lead_magnet === lm) || [];
        
        const pageViews = lmEvents.filter(e => e.event_type === 'page_view').length;
        const ctaClicks = lmEvents.filter(e => e.event_type === 'cta_click').length;
        const quizStarts = lmEvents.filter(e => e.event_type === 'quiz_start').length;
        const leadCaptures = lmEvents.filter(e => e.event_type === 'lead_capture').length;
        const quizCompletes = lmEvents.filter(e => e.event_type === 'quiz_complete').length;
        const bounces = lmEvents.filter(e => e.event_type === 'bounce').length;

        // Calculate avg time on page from quiz_complete events
        const completeEvents = lmEvents.filter(e => {
          const eventData = e.event_data as Record<string, unknown> | null;
          return e.event_type === 'quiz_complete' && eventData?.total_time_seconds;
        });
        const avgTimeOnPage = completeEvents.length > 0
          ? completeEvents.reduce((sum, e) => {
              const eventData = e.event_data as Record<string, unknown> | null;
              return sum + (Number(eventData?.total_time_seconds) || 0);
            }, 0) / completeEvents.length
          : 0;

        const conversionRate = pageViews > 0 
          ? Math.round((leadCaptures / pageViews) * 100) 
          : 0;

        return {
          leadMagnet: lm === 'warrior_power' ? 'Warrior Power' : 'Vision 2026',
          pageViews,
          ctaClicks,
          quizStarts,
          leadCaptures,
          quizCompletes,
          bounces,
          conversionRate,
          avgTimeOnPage: Math.round(avgTimeOnPage)
        };
      });

      setAnalytics(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = analytics.reduce((acc, curr) => ({
    pageViews: acc.pageViews + curr.pageViews,
    leadCaptures: acc.leadCaptures + curr.leadCaptures,
    quizCompletes: acc.quizCompletes + curr.quizCompletes,
    bounces: acc.bounces + curr.bounces
  }), { pageViews: 0, leadCaptures: 0, quizCompletes: 0, bounces: 0 });

  const overallConversion = totalStats.pageViews > 0 
    ? Math.round((totalStats.leadCaptures / totalStats.pageViews) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lead Magnet Analytics</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 zile</SelectItem>
            <SelectItem value="30d">30 zile</SelectItem>
            <SelectItem value="90d">90 zile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs">Page Views</span>
            </div>
            <p className="text-2xl font-bold">{totalStats.pageViews}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Leads</span>
            </div>
            <p className="text-2xl font-bold">{totalStats.leadCaptures}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Conversie</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{overallConversion}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs">Bounce</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{totalStats.bounces}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per Lead Magnet Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        {analytics.map((data) => (
          <Card key={data.leadMagnet}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {data.leadMagnet}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Views</span>
                  <span className="font-medium">{data.pageViews}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">CTA Clicks</span>
                  <span className="font-medium">{data.ctaClicks}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Quiz Start</span>
                  <span className="font-medium">{data.quizStarts}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Leads</span>
                  <span className="font-medium text-green-600">{data.leadCaptures}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Complete</span>
                  <span className="font-medium">{data.quizCompletes}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Bounce</span>
                  <span className="font-medium text-red-500">{data.bounces}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-500/10 rounded col-span-2">
                  <span className="text-muted-foreground">Conversie</span>
                  <span className="font-bold text-green-600">{data.conversionRate}%</span>
                </div>
                {data.avgTimeOnPage > 0 && (
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded col-span-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Timp mediu quiz
                    </span>
                    <span className="font-medium">{Math.floor(data.avgTimeOnPage / 60)}:{String(data.avgTimeOnPage % 60).padStart(2, '0')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
