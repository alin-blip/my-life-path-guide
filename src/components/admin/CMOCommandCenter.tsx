import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, TrendingUp, DollarSign, Target, ArrowUpRight, ArrowDownRight,
  Activity, Eye, UserPlus, CreditCard, Zap, BarChart3, Clock, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { format, subDays, startOfDay, differenceInDays, parseISO } from 'date-fns';

interface KPIData {
  totalLeads: number;
  totalLeadsPrev: number;
  mqls: number;
  mqlsPrev: number;
  sqls: number;
  sqlsPrev: number;
  customers: number;
  customersPrev: number;
  totalRevenue: number;
  totalRevenuePrev: number;
  mrr: number;
  avgLeadScore: number;
  leadToMqlRate: number;
  mqlToSqlRate: number;
  sqlToCustomerRate: number;
  overallConversion: number;
}

interface SourceData {
  name: string;
  leads: number;
  mqls: number;
  customers: number;
  conversionRate: number;
}

interface DailyTrend {
  date: string;
  leads: number;
  mqls: number;
  customers: number;
}

interface BottleneckAlert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric: string;
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#6366f1', '#94a3b8'];

const TIME_RANGES = [
  { value: '7', label: 'Ultimele 7 zile' },
  { value: '30', label: 'Ultimele 30 zile' },
  { value: '90', label: 'Ultimele 90 zile' },
  { value: 'all', label: 'Tot timpul' },
];

export const CMOCommandCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAlert[]>([]);
  const [funnelData, setFunnelData] = useState<{ stage: string; count: number; rate: string }[]>([]);

  useEffect(() => {
    loadDashboard();
  }, [timeRange]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const daysAgo = timeRange === 'all' ? 365 * 5 : parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo)).toISOString();
      const prevStartDate = startOfDay(subDays(new Date(), daysAgo * 2)).toISOString();

      // Fetch all data in parallel
      const [leadsRes, contactsRes, prevLeadsRes] = await Promise.all([
        supabase.from('email_leads').select('*').gte('created_at', startDate),
        supabase.from('crm_contact_profiles').select('*'),
        supabase.from('email_leads').select('*').gte('created_at', prevStartDate).lt('created_at', startDate),
      ]);

      const leads = leadsRes.data || [];
      const contacts = contactsRes.data || [];
      const prevLeads = prevLeadsRes.data || [];

      // Current period contacts
      const currentContacts = contacts.filter(c => {
        const created = c.created_at || c.lead_captured_at;
        return created && created >= startDate;
      });
      const prevContacts = contacts.filter(c => {
        const created = c.created_at || c.lead_captured_at;
        return created && created >= prevStartDate && created < startDate;
      });

      // Funnel stages from crm_contact_profiles
      const allLeads = contacts.filter(c => c.funnel_stage === 'lead' || !c.funnel_stage);
      const allMqls = contacts.filter(c => 
        c.funnel_stage === 'engaged' || c.mql_at || 
        (c.engagement_score && c.engagement_score >= 30)
      );
      const allSqls = contacts.filter(c => 
        c.funnel_stage === 'trial' || c.sql_at || 
        c.subscription_status === 'trialing'
      );
      const allCustomers = contacts.filter(c => 
        c.funnel_stage === 'customer' || 
        (c.subscription_status === 'active' && c.subscription_status !== 'trialing') ||
        (c.total_purchases && c.total_purchases > 0)
      );

      // Previous period counts for comparison
      const prevMqls = prevContacts.filter(c => c.funnel_stage === 'engaged' || c.mql_at);
      const prevSqls = prevContacts.filter(c => c.funnel_stage === 'trial' || c.sql_at);
      const prevCustomers = prevContacts.filter(c => 
        c.funnel_stage === 'customer' || (c.total_purchases && c.total_purchases > 0)
      );

      // Revenue calculation
      const totalLTV = contacts.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
      const prevLTV = prevContacts.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
      
      // MRR from active subscriptions
      const activeSubscribers = contacts.filter(c => c.subscription_status === 'active');
      const mrr = activeSubscribers.reduce((sum, c) => {
        const tier = c.subscription_tier?.toLowerCase() || '';
        if (tier.includes('elite')) return sum + 99;
        if (tier.includes('warrior') || tier.includes('pro')) return sum + 49;
        if (tier.includes('accelerator')) return sum + 29;
        return sum + 19;
      }, 0);

      // Conversion rates
      const totalContactCount = contacts.length;
      const leadToMqlRate = totalContactCount > 0 ? (allMqls.length / totalContactCount) * 100 : 0;
      const mqlToSqlRate = allMqls.length > 0 ? (allSqls.length / allMqls.length) * 100 : 0;
      const sqlToCustomerRate = allSqls.length > 0 ? (allCustomers.length / allSqls.length) * 100 : 0;
      const overallConversion = totalContactCount > 0 ? (allCustomers.length / totalContactCount) * 100 : 0;

      setKpis({
        totalLeads: leads.length,
        totalLeadsPrev: prevLeads.length,
        mqls: allMqls.length,
        mqlsPrev: prevMqls.length,
        sqls: allSqls.length,
        sqlsPrev: prevSqls.length,
        customers: allCustomers.length,
        customersPrev: prevCustomers.length,
        totalRevenue: totalLTV,
        totalRevenuePrev: prevLTV,
        mrr,
        avgLeadScore: contacts.length > 0 
          ? Math.round(contacts.reduce((sum, c) => sum + (c.lead_score || 0), 0) / contacts.length) 
          : 0,
        leadToMqlRate,
        mqlToSqlRate,
        sqlToCustomerRate,
        overallConversion,
      });

      // Funnel visualization data
      setFunnelData([
        { stage: 'Leads', count: totalContactCount, rate: '100%' },
        { stage: 'MQL (Engaged)', count: allMqls.length, rate: `${leadToMqlRate.toFixed(1)}%` },
        { stage: 'SQL (Trial)', count: allSqls.length, rate: `${mqlToSqlRate.toFixed(1)}%` },
        { stage: 'Customer', count: allCustomers.length, rate: `${sqlToCustomerRate.toFixed(1)}%` },
      ]);

      // Source attribution
      const sourceMap: Record<string, { leads: number; mqls: number; customers: number }> = {};
      leads.forEach(l => {
        const src = l.lead_magnet || l.source || 'unknown';
        if (!sourceMap[src]) sourceMap[src] = { leads: 0, mqls: 0, customers: 0 };
        sourceMap[src].leads++;
      });
      // Cross-reference with CRM profiles for MQL/Customer counts per source
      contacts.forEach(c => {
        const src = c.lead_source || 'unknown';
        if (!sourceMap[src]) sourceMap[src] = { leads: 0, mqls: 0, customers: 0 };
        if (c.funnel_stage === 'engaged' || c.mql_at) sourceMap[src].mqls++;
        if (c.funnel_stage === 'customer' || (c.total_purchases && c.total_purchases > 0)) sourceMap[src].customers++;
      });

      const sourceData: SourceData[] = Object.entries(sourceMap)
        .map(([name, data]) => ({
          name: formatSourceName(name),
          leads: data.leads,
          mqls: data.mqls,
          customers: data.customers,
          conversionRate: data.leads > 0 ? (data.customers / data.leads) * 100 : 0,
        }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 8);
      setSources(sourceData);

      // Daily trends
      const dailyMap: Record<string, { leads: number; mqls: number; customers: number }> = {};
      const days = Math.min(parseInt(timeRange) || 30, 90);
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMap[date] = { leads: 0, mqls: 0, customers: 0 };
      }
      leads.forEach(l => {
        const date = format(new Date(l.created_at), 'yyyy-MM-dd');
        if (dailyMap[date]) dailyMap[date].leads++;
      });
      contacts.forEach(c => {
        if (c.mql_at) {
          const date = format(new Date(c.mql_at), 'yyyy-MM-dd');
          if (dailyMap[date]) dailyMap[date].mqls++;
        }
        if (c.first_purchase_at) {
          const date = format(new Date(c.first_purchase_at), 'yyyy-MM-dd');
          if (dailyMap[date]) dailyMap[date].customers++;
        }
      });

      setDailyTrends(
        Object.entries(dailyMap)
          .map(([date, data]) => ({ date: format(new Date(date), 'dd MMM'), ...data }))
          .reverse()
      );

      // Bottleneck detection
      const alerts: BottleneckAlert[] = [];
      
      if (leadToMqlRate < 10) {
        alerts.push({
          type: 'critical',
          title: 'Lead → MQL Conversion Scăzută',
          description: 'Sub 10% din lead-uri devin MQL. Verifică calitatea lead magnet-urilor și follow-up-ul.',
          metric: `${leadToMqlRate.toFixed(1)}%`,
        });
      }
      
      if (mqlToSqlRate < 15) {
        alerts.push({
          type: 'warning',
          title: 'MQL → SQL Conversion Scăzută',
          description: 'Sub 15% din MQL-uri devin SQL. Nurturing-ul trebuie îmbunătățit.',
          metric: `${mqlToSqlRate.toFixed(1)}%`,
        });
      }

      if (sqlToCustomerRate < 20) {
        alerts.push({
          type: 'warning',
          title: 'SQL → Customer Conversion Scăzută',
          description: 'Sub 20% din trial-uri convertesc. Verifică onboarding-ul și pricing-ul.',
          metric: `${sqlToCustomerRate.toFixed(1)}%`,
        });
      }

      // Check for stale leads (leads with no activity in 14+ days)
      const staleLeads = contacts.filter(c => {
        if (c.funnel_stage !== 'lead') return false;
        const lastActivity = c.last_activity_at || c.created_at;
        if (!lastActivity) return true;
        return differenceInDays(new Date(), new Date(lastActivity)) > 14;
      });
      if (staleLeads.length > 10) {
        alerts.push({
          type: 'info',
          title: `${staleLeads.length} Lead-uri Inactive`,
          description: 'Lead-uri fără activitate de 14+ zile. Consideră o campanie de re-engagement.',
          metric: `${staleLeads.length} leads`,
        });
      }

      setBottlenecks(alerts);
    } catch (error) {
      console.error('Error loading CMO dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSourceName = (name: string) => {
    const labels: Record<string, string> = {
      'business-lead-magnet': 'Business 2026',
      'vision-lead-magnet': 'Vision 2026',
      'warrior-power': 'Warrior Power',
      'life-score': 'Life Score Quiz',
      'vision-quiz': 'Vision Quiz',
      'challenge-7': 'Challenge 7 Zile',
      'ebook_burnout': 'Ebook Burnout',
      'ebook_landing_ro': 'Ebook Landing RO',
      'ebook_landing_en': 'Ebook Landing EN',
      'email-collection': 'Email Collection',
      'unknown': 'Direct / Organic',
    };
    return labels[name] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const ChangeIndicator = ({ current, previous }: { current: number; previous: number }) => {
    const change = getChangePercent(current, previous);
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span>{Math.abs(change).toFixed(0)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i}><CardContent className="pt-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-amber-500" />
            CMO Command Center
          </h2>
          <p className="text-muted-foreground text-sm">Date reale din Supabase. Actualizat la fiecare refresh.</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map(r => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bottleneck Alerts */}
      {bottlenecks.length > 0 && (
        <div className="space-y-2">
          {bottlenecks.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                alert.type === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                alert.type === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
                'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                alert.type === 'critical' ? 'text-red-500' :
                alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{alert.title}</span>
                  <Badge variant="outline" className="text-xs">{alert.metric}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards - Row 1: Volume */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-500" /> Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">{kpis.totalLeads}</div>
              <ChangeIndicator current={kpis.totalLeads} previous={kpis.totalLeadsPrev} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">din email_leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> MQL (Engaged)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">{kpis.mqls}</div>
              <ChangeIndicator current={kpis.mqls} previous={kpis.mqlsPrev} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">engagement score ≥ 30</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" /> SQL (Trial)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">{kpis.sqls}</div>
              <ChangeIndicator current={kpis.sqls} previous={kpis.sqlsPrev} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">trial activ sau sql_at setat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-500" /> Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">{kpis.customers}</div>
              <ChangeIndicator current={kpis.customers} previous={kpis.customersPrev} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">plată confirmată</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Row 2: Revenue & Conversion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">€{kpis.totalRevenue}</div>
              <ChangeIndicator current={kpis.totalRevenue} previous={kpis.totalRevenuePrev} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">lifetime value total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" /> MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{kpis.mrr}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Overall Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.overallConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Lead → Customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" /> Avg Lead Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.avgLeadScore}</div>
            <p className="text-xs text-muted-foreground mt-1">din 100 puncte</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization + Conversion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Funnel Pipeline</CardTitle>
            <CardDescription>Lead → MQL → SQL → Customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((stage, i) => {
                const maxCount = funnelData[0]?.count || 1;
                const widthPercent = Math.max((stage.count / maxCount) * 100, 8);
                const colors = ['bg-blue-500', 'bg-amber-500', 'bg-green-500', 'bg-purple-500'];
                return (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{stage.count}</span>
                        {i > 0 && (
                          <Badge variant="outline" className="text-xs">{stage.rate}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded-md overflow-hidden">
                      <div
                        className={`h-full ${colors[i]} rounded-md transition-all duration-500 flex items-center justify-center`}
                        style={{ width: `${widthPercent}%` }}
                      >
                        {widthPercent > 20 && (
                          <span className="text-xs font-bold text-white">{stage.count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conversion rates between stages */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold text-blue-500">{kpis.leadToMqlRate.toFixed(1)}%</div>
                <div className="text-[10px] text-muted-foreground">Lead → MQL</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold text-amber-500">{kpis.mqlToSqlRate.toFixed(1)}%</div>
                <div className="text-[10px] text-muted-foreground">MQL → SQL</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold text-green-500">{kpis.sqlToCustomerRate.toFixed(1)}%</div>
                <div className="text-[10px] text-muted-foreground">SQL → Customer</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Source Attribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atribuire Surse</CardTitle>
            <CardDescription>Leads per sursă cu conversion rate</CardDescription>
          </CardHeader>
          <CardContent>
            {sources.length > 0 ? (
              <div className="space-y-3">
                {sources.map((src, i) => (
                  <div key={src.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{src.name}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{src.leads} leads</span>
                          <span>{src.mqls} MQL</span>
                          <span>{src.customers} cust.</span>
                          <Badge variant={src.conversionRate > 5 ? 'default' : 'outline'} className="text-[10px]">
                            {src.conversionRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max((src.leads / (sources[0]?.leads || 1)) * 100, 3)}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nu sunt date suficiente</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trend Zilnic</CardTitle>
          <CardDescription>Evoluția lead-urilor, MQL-urilor și clienților</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="leads" name="Leads" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Area type="monotone" dataKey="mqls" name="MQLs" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                <Area type="monotone" dataKey="customers" name="Customers" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
