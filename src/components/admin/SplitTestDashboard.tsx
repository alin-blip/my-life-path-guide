import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, TrendingUp, Users, Trophy, Target, 
  ArrowRight, Beaker, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

interface VariantStats {
  variant: 'A' | 'B' | 'C';
  name: string;
  destination: string;
  leads: number;
  conversions: number;
  conversionRate: number;
}

interface DailyStats {
  date: string;
  A: number;
  B: number;
  C: number;
}

const VARIANT_CONFIG = {
  A: {
    name: 'Warrior Launch',
    destination: '/warrior-launch-accelerator',
    color: '#22c55e', // green
    description: 'Redirect to €497 offer page'
  },
  B: {
    name: 'Results Page',
    destination: 'Results + Challenge',
    color: '#3b82f6', // blue
    description: 'Show results with challenge upsell'
  },
  C: {
    name: 'Platform Explore',
    destination: '/ (Homepage)',
    color: '#f59e0b', // amber
    description: 'Redirect to explore platform'
  }
};

export const SplitTestDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VariantStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all leads from warrior power split test
      const { data: leads, error: leadsError } = await supabase
        .from('email_leads')
        .select('email, source, created_at, subscribed')
        .eq('lead_magnet', 'warrior_power')
        .like('source', 'warrior_power_split_%');

      if (leadsError) throw leadsError;

      // Get emails for conversion check
      const emails = leads?.map(l => l.email) || [];

      // Fetch subscribers to check conversions
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('email, subscribed, subscription_tier')
        .in('email', emails)
        .eq('subscribed', true);

      const subscriberEmails = new Set(subscribers?.map(s => s.email) || []);

      // Calculate stats per variant
      const variantData: Record<string, { leads: number; conversions: number }> = {
        A: { leads: 0, conversions: 0 },
        B: { leads: 0, conversions: 0 },
        C: { leads: 0, conversions: 0 }
      };

      // Daily data for chart
      const dailyData: Record<string, { A: number; B: number; C: number }> = {};

      leads?.forEach(lead => {
        const variant = getVariantFromSource(lead.source);
        if (variant) {
          variantData[variant].leads++;
          if (subscriberEmails.has(lead.email)) {
            variantData[variant].conversions++;
          }

          // Daily tracking
          const dateKey = format(parseISO(lead.created_at), 'yyyy-MM-dd');
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = { A: 0, B: 0, C: 0 };
          }
          dailyData[dateKey][variant]++;
        }
      });

      // Convert to array format
      const statsArray: VariantStats[] = (['A', 'B', 'C'] as const).map(variant => ({
        variant,
        name: VARIANT_CONFIG[variant].name,
        destination: VARIANT_CONFIG[variant].destination,
        leads: variantData[variant].leads,
        conversions: variantData[variant].conversions,
        conversionRate: variantData[variant].leads > 0 
          ? (variantData[variant].conversions / variantData[variant].leads) * 100 
          : 0
      }));

      // Sort daily data and format for chart
      const dailyArray: DailyStats[] = Object.entries(dailyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14) // Last 14 days
        .map(([date, counts]) => ({
          date: format(parseISO(date), 'dd MMM'),
          ...counts
        }));

      setStats(statsArray);
      setDailyStats(dailyArray);
      setTotalLeads(leads?.length || 0);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching split test stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVariantFromSource = (source: string | null): 'A' | 'B' | 'C' | null => {
    if (!source) return null;
    if (source.includes('split_a')) return 'A';
    if (source.includes('split_b')) return 'B';
    if (source.includes('split_c')) return 'C';
    return null;
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const getWinner = (): VariantStats | null => {
    if (stats.length === 0) return null;
    const minLeads = 10; // Minimum leads for significance
    const validStats = stats.filter(s => s.leads >= minLeads);
    if (validStats.length === 0) return null;
    return validStats.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );
  };

  const winner = getWinner();
  const distribution = stats.reduce((acc, s) => {
    acc[s.variant] = totalLeads > 0 ? ((s.leads / totalLeads) * 100).toFixed(1) : '0';
    return acc;
  }, {} as Record<string, string>);

  const chartData = stats.map(s => ({
    name: `Variant ${s.variant}`,
    rate: s.conversionRate,
    leads: s.leads,
    color: VARIANT_CONFIG[s.variant].color
  }));

  if (loading && stats.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Beaker className="h-6 w-6 text-primary" />
            Split Test: Warrior Power
          </h2>
          <p className="text-muted-foreground">
            A/B/C test pentru optimizarea conversiilor după quiz
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Ultima actualizare: {format(lastRefresh, 'HH:mm:ss')}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Din split test
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Distribuție
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" style={{ borderColor: VARIANT_CONFIG.A.color }}>
                A: {distribution.A}%
              </Badge>
              <Badge variant="outline" style={{ borderColor: VARIANT_CONFIG.B.color }}>
                B: {distribution.B}%
              </Badge>
              <Badge variant="outline" style={{ borderColor: VARIANT_CONFIG.C.color }}>
                C: {distribution.C}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: 33% fiecare
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Best Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {winner ? `${winner.conversionRate.toFixed(1)}%` : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {winner ? `Variant ${winner.variant}` : 'Date insuficiente'}
            </p>
          </CardContent>
        </Card>

        <Card className={winner ? 'border-green-500/50 bg-green-500/5' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Winner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {winner ? (
                <>
                  🏆 Variant {winner.variant}
                </>
              ) : (
                <span className="text-muted-foreground">TBD</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {winner ? winner.name : 'Min. 10 leads/variantă'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performanță per Variantă
          </CardTitle>
          <CardDescription>
            Detalii comparative pentru fiecare variantă din split test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variantă</TableHead>
                <TableHead>Destinație</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Conversii</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.variant}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: VARIANT_CONFIG[stat.variant].color }}
                      />
                      <span className="font-medium">Variant {stat.variant}</span>
                      <span className="text-muted-foreground text-sm">
                        ({stat.name})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <ArrowRight className="h-3 w-3" />
                      {stat.destination}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {stat.leads}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {stat.conversions}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${
                      stat.conversionRate > 0 
                        ? 'text-green-500' 
                        : 'text-muted-foreground'
                    }`}>
                      {stat.conversionRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {winner?.variant === stat.variant && stat.leads >= 10 ? (
                      <Badge className="bg-green-500">🏆 Leading</Badge>
                    ) : stat.leads < 10 ? (
                      <Badge variant="outline">Collecting data</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate Comparison</CardTitle>
            <CardDescription>Rata de conversie per variantă</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Conversion Rate']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Leads Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Leads per Zi</CardTitle>
            <CardDescription>Trend leads ultimele 14 zile</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="A" 
                  stroke={VARIANT_CONFIG.A.color} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="B" 
                  stroke={VARIANT_CONFIG.B.color} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="C" 
                  stroke={VARIANT_CONFIG.C.color} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Statistical Significance Notice */}
      {totalLeads < 100 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-500/10">
                <Beaker className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium text-amber-700 dark:text-amber-400">
                  Date Insuficiente pentru Decizie
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Pentru semnificație statistică, ai nevoie de minim 100 de leads în total 
                  și 30+ leads per variantă. Actualmente ai {totalLeads} leads.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
