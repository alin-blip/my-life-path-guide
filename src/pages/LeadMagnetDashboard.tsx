import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Eye, MousePointer, Users, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FunnelChart } from '@/components/analytics/FunnelChart';
import { TrafficSources } from '@/components/analytics/TrafficSources';
import { RealtimeEvents } from '@/components/analytics/RealtimeEvents';
import { DeviceBreakdown } from '@/components/analytics/DeviceBreakdown';
import { format, subDays, parseISO } from 'date-fns';

interface OverviewStats {
  pageViews: number;
  ctaClicks: number;
  quizStarts: number;
  leadCaptures: number;
  quizCompletes: number;
  bounces: number;
  avgTimeOnQuiz: number;
}

interface FunnelStep {
  name: string;
  value: number;
  percentage: number;
}

const LeadMagnetDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMagnet, setSelectedMagnet] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats>({
    pageViews: 0,
    ctaClicks: 0,
    quizStarts: 0,
    leadCaptures: 0,
    quizCompletes: 0,
    bounces: 0,
    avgTimeOnQuiz: 0
  });
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; pageViews: number; leads: number }[]>([]);

  const getDateFilter = () => {
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return subDays(new Date(), days).toISOString();
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();
      
      let query = supabase
        .from('lead_magnet_events')
        .select('*')
        .gte('created_at', dateFilter);

      if (selectedMagnet !== 'all') {
        query = query.eq('lead_magnet', selectedMagnet);
      }

      const { data: events, error } = await query;

      if (error) {
        console.error('Error fetching analytics:', error);
        return;
      }

      if (!events || events.length === 0) {
        setStats({
          pageViews: 0,
          ctaClicks: 0,
          quizStarts: 0,
          leadCaptures: 0,
          quizCompletes: 0,
          bounces: 0,
          avgTimeOnQuiz: 0
        });
        setFunnelData([]);
        setDailyData([]);
        setLoading(false);
        return;
      }

      // Calculate stats
      const pageViews = events.filter(e => e.event_type === 'page_view').length;
      const ctaClicks = events.filter(e => e.event_type === 'cta_click').length;
      const quizStarts = events.filter(e => e.event_type === 'quiz_start').length;
      const leadCaptures = events.filter(e => e.event_type === 'lead_capture').length;
      const quizCompletes = events.filter(e => e.event_type === 'quiz_complete').length;
      const bounces = events.filter(e => e.event_type === 'bounce').length;

      // Calculate average time on quiz
      const quizCompleteEvents = events.filter(e => e.event_type === 'quiz_complete');
      const avgTimeOnQuiz = quizCompleteEvents.length > 0
        ? quizCompleteEvents.reduce((acc, e) => {
            const eventData = e.event_data as { total_time_seconds?: number } | null;
            return acc + (eventData?.total_time_seconds || 0);
          }, 0) / quizCompleteEvents.length
        : 0;

      setStats({
        pageViews,
        ctaClicks,
        quizStarts,
        leadCaptures,
        quizCompletes,
        bounces,
        avgTimeOnQuiz: Math.round(avgTimeOnQuiz)
      });

      // Calculate funnel data
      setFunnelData([
        { name: 'Page Views', value: pageViews, percentage: 100 },
        { name: 'CTA Clicks', value: ctaClicks, percentage: pageViews > 0 ? Math.round((ctaClicks / pageViews) * 100) : 0 },
        { name: 'Quiz Starts', value: quizStarts, percentage: pageViews > 0 ? Math.round((quizStarts / pageViews) * 100) : 0 },
        { name: 'Lead Captures', value: leadCaptures, percentage: pageViews > 0 ? Math.round((leadCaptures / pageViews) * 100) : 0 },
        { name: 'Quiz Completes', value: quizCompletes, percentage: pageViews > 0 ? Math.round((quizCompletes / pageViews) * 100) : 0 }
      ]);

      // Calculate daily data
      const dailyMap = new Map<string, { pageViews: number; leads: number }>();
      events.forEach(event => {
        const date = format(parseISO(event.created_at), 'MMM dd');
        const existing = dailyMap.get(date) || { pageViews: 0, leads: 0 };
        if (event.event_type === 'page_view') existing.pageViews++;
        if (event.event_type === 'lead_capture') existing.leads++;
        dailyMap.set(date, existing);
      });
      
      setDailyData(Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        ...data
      })));

    } catch (error) {
      console.error('Error in fetchAnalytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedMagnet]);

  const conversionRate = stats.pageViews > 0 
    ? ((stats.leadCaptures / stats.pageViews) * 100).toFixed(1)
    : '0';

  const bounceRate = stats.pageViews > 0 
    ? ((stats.bounces / stats.pageViews) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lead Magnet Analytics</h1>
            <p className="text-muted-foreground text-sm">Track performance across all lead magnets</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedMagnet} onValueChange={setSelectedMagnet}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Lead Magnets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lead Magnets</SelectItem>
              <SelectItem value="warrior_power">Warrior Power</SelectItem>
              <SelectItem value="vision_2026">Vision 2026</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Eye className="h-5 w-5 text-blue-500" />
              <Badge variant="secondary" className="text-xs">Views</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.pageViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Page Views</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <MousePointer className="h-5 w-5 text-purple-500" />
              <Badge variant="secondary" className="text-xs">Clicks</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.ctaClicks.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">CTA Clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-green-500" />
              <Badge variant="secondary" className="text-xs">Leads</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.leadCaptures.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Leads Captured</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <Badge variant="secondary" className="text-xs">CVR</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <Badge variant="secondary" className="text-xs">Bounce</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{bounceRate}%</p>
            <p className="text-xs text-muted-foreground">Bounce Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-cyan-500" />
              <Badge variant="secondary" className="text-xs">Time</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{Math.floor(stats.avgTimeOnQuiz / 60)}:{String(stats.avgTimeOnQuiz % 60).padStart(2, '0')}</p>
            <p className="text-xs text-muted-foreground">Avg. Quiz Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="realtime">Realtime</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel">
          <FunnelChart data={funnelData} />
        </TabsContent>

        <TabsContent value="realtime">
          <RealtimeEvents leadMagnetFilter={selectedMagnet} />
        </TabsContent>

        <TabsContent value="traffic">
          <TrafficSources timeRange={timeRange} leadMagnetFilter={selectedMagnet} />
        </TabsContent>

        <TabsContent value="devices">
          <DeviceBreakdown timeRange={timeRange} leadMagnetFilter={selectedMagnet} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadMagnetDashboard;
