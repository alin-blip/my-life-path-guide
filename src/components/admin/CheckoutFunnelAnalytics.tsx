import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, MousePointer, CreditCard, AlertCircle, UserX, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { FunnelChart } from '@/components/analytics/FunnelChart';

interface CheckoutEvent {
  id: string;
  user_id: string | null;
  session_id: string;
  event_type: string;
  plan_id: string | null;
  source: string;
  error_message: string | null;
  metadata: any;
  created_at: string;
}

interface FunnelStats {
  upsell_views: number;
  plan_clicks: number;
  checkout_starts: number;
  checkout_redirects: number;
  checkout_errors: number;
  auth_redirects: number;
  continue_free: number;
}

export function CheckoutFunnelAnalytics() {
  const [events, setEvents] = useState<CheckoutEvent[]>([]);
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [timeRange, sourceFilter]);

  const getDateFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'all': return null;
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('checkout_events')
        .select('*')
        .order('created_at', { ascending: false });

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }

      const { data, error } = await query.limit(500);

      if (error) {
        console.error('Error fetching checkout events:', error);
        return;
      }

      setEvents(data || []);

      // Calculate stats
      const statsData: FunnelStats = {
        upsell_views: 0,
        plan_clicks: 0,
        checkout_starts: 0,
        checkout_redirects: 0,
        checkout_errors: 0,
        auth_redirects: 0,
        continue_free: 0,
      };

      (data || []).forEach((event: CheckoutEvent) => {
        switch (event.event_type) {
          case 'upsell_view': statsData.upsell_views++; break;
          case 'plan_click': statsData.plan_clicks++; break;
          case 'checkout_start': statsData.checkout_starts++; break;
          case 'checkout_redirect': statsData.checkout_redirects++; break;
          case 'checkout_error': statsData.checkout_errors++; break;
          case 'auth_redirect': statsData.auth_redirects++; break;
          case 'continue_free': statsData.continue_free++; break;
        }
      });

      setStats(statsData);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate funnel data for visualization
  const funnelData = stats ? [
    { name: 'Upsell Views', value: stats.upsell_views, percentage: 100 },
    { name: 'Plan Clicks', value: stats.plan_clicks, percentage: stats.upsell_views > 0 ? Math.round((stats.plan_clicks / stats.upsell_views) * 100) : 0 },
    { name: 'Checkout Start', value: stats.checkout_starts, percentage: stats.upsell_views > 0 ? Math.round((stats.checkout_starts / stats.upsell_views) * 100) : 0 },
    { name: 'Checkout Redirect', value: stats.checkout_redirects, percentage: stats.upsell_views > 0 ? Math.round((stats.checkout_redirects / stats.upsell_views) * 100) : 0 },
  ] : [];

  // Plan breakdown
  const planBreakdown = events.reduce((acc, event) => {
    if (event.plan_id && event.event_type === 'plan_click') {
      acc[event.plan_id] = (acc[event.plan_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Error breakdown
  const errorEvents = events.filter(e => e.event_type === 'checkout_error');

  const eventTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
    upsell_view: { icon: Eye, color: 'bg-blue-500', label: 'Upsell View' },
    plan_click: { icon: MousePointer, color: 'bg-purple-500', label: 'Plan Click' },
    checkout_start: { icon: CreditCard, color: 'bg-green-500', label: 'Checkout Start' },
    checkout_redirect: { icon: ArrowRight, color: 'bg-emerald-500', label: 'Checkout Redirect' },
    checkout_error: { icon: AlertCircle, color: 'bg-red-500', label: 'Checkout Error' },
    auth_redirect: { icon: UserX, color: 'bg-orange-500', label: 'Auth Redirect' },
    continue_free: { icon: ArrowRight, color: 'bg-gray-500', label: 'Continue Free' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Ultimele 24h</SelectItem>
            <SelectItem value="7d">Ultimele 7 zile</SelectItem>
            <SelectItem value="30d">Ultimele 30 zile</SelectItem>
            <SelectItem value="all">Tot timpul</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate sursele</SelectItem>
            <SelectItem value="warrior_power">Warrior Power</SelectItem>
            <SelectItem value="vision_2026">Vision 2026</SelectItem>
            <SelectItem value="pricing_page">Pricing Page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Views</span>
            </div>
            <p className="text-2xl font-bold">{stats?.upsell_views || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Clicks</span>
            </div>
            <p className="text-2xl font-bold">{stats?.plan_clicks || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Checkout</span>
            </div>
            <p className="text-2xl font-bold">{stats?.checkout_starts || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Redirect</span>
            </div>
            <p className="text-2xl font-bold">{stats?.checkout_redirects || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Erori</span>
            </div>
            <p className="text-2xl font-bold">{stats?.checkout_errors || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserX className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Auth Req.</span>
            </div>
            <p className="text-2xl font-bold">{stats?.auth_redirects || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-muted-foreground">Free</span>
            </div>
            <p className="text-2xl font-bold">{stats?.continue_free || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate */}
      {stats && stats.upsell_views > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Rate de Conversie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">View → Click</p>
                <p className="text-2xl font-bold text-blue-500">
                  {((stats.plan_clicks / stats.upsell_views) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Click → Checkout</p>
                <p className="text-2xl font-bold text-purple-500">
                  {stats.plan_clicks > 0 ? ((stats.checkout_starts / stats.plan_clicks) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checkout → Stripe</p>
                <p className="text-2xl font-bold text-green-500">
                  {stats.checkout_starts > 0 ? ((stats.checkout_redirects / stats.checkout_starts) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className={`text-2xl font-bold ${stats.checkout_errors > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {stats.checkout_starts > 0 ? ((stats.checkout_errors / stats.checkout_starts) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funnel Chart */}
      <FunnelChart data={funnelData} />

      {/* Plan Breakdown */}
      {Object.keys(planBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Click-uri per Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {Object.entries(planBreakdown).map(([plan, count]) => (
                <div key={plan} className="flex items-center gap-2">
                  <Badge variant={plan === 'free' ? 'default' : plan === 'elite' ? 'secondary' : 'outline'}>
                    {plan.toUpperCase()}
                  </Badge>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {errorEvents.length > 0 && (
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              Erori Checkout ({errorEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errorEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-start justify-between p-3 bg-red-500/10 rounded-lg">
                  <div>
                    <p className="font-medium text-red-500">{event.error_message || 'Unknown error'}</p>
                    <p className="text-sm text-muted-foreground">
                      Plan: {event.plan_id} • Source: {event.source}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ro })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Evenimente Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.slice(0, 50).map((event) => {
              const config = eventTypeConfig[event.event_type] || { icon: Eye, color: 'bg-gray-500', label: event.event_type };
              const Icon = config.icon;
              
              return (
                <div key={event.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${config.color}`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="font-medium">{config.label}</span>
                      {event.plan_id && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {event.plan_id}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-2">
                        {event.source}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ro })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
