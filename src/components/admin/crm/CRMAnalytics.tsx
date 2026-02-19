import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, TrendingUp, Crown, Target, Zap, Clock, Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

interface AnalyticsData {
  totalContacts: number;
  leads: number;
  engaged: number;
  trials: number;
  customers: number;
  totalLTV: number;
  avgLeadScore: number;
  activeThisWeek: number;
  sourceDistribution: { name: string; value: number }[];
  conversionFunnel: { stage: string; count: number }[];
  weeklyGrowth: { week: string; leads: number; engaged: number; customers: number }[];
}

export const CRMAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data: contacts, error } = await supabase
        .from('crm_contact_profiles')
        .select('*');
      if (error) throw error;

      const contactList = contacts || [];
      
      const leads = contactList.filter(c => c.funnel_stage === 'lead');
      const engaged = contactList.filter(c => c.funnel_stage === 'engaged');
      const trials = contactList.filter(c => c.funnel_stage === 'trial' || c.subscription_status === 'trialing');
      const customers = contactList.filter(c => c.funnel_stage === 'customer' && c.subscription_status !== 'trialing');
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const activeThisWeek = contactList.filter(c => 
        c.last_activity_at && new Date(c.last_activity_at) >= oneWeekAgo
      ).length;

      // Source distribution
      const sourceMap: Record<string, number> = {};
      contactList.forEach(c => {
        const source = c.lead_source || 'unknown';
        sourceMap[source] = (sourceMap[source] || 0) + 1;
      });
      const sourceDistribution = Object.entries(sourceMap)
        .map(([name, value]) => ({
          name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      const conversionFunnel = [
        { stage: 'Leads', count: leads.length },
        { stage: 'Engaged', count: engaged.length },
        { stage: 'Trial', count: trials.length },
        { stage: 'Customers', count: customers.length }
      ];

      // Real weekly growth from created_at dates
      const weeklyGrowth: { week: string; leads: number; engaged: number; customers: number }[] = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
        
        const contactsUpToWeek = contactList.filter(c => 
          c.created_at && new Date(c.created_at) <= weekEnd
        );
        
        weeklyGrowth.push({
          week: weekLabel,
          leads: contactsUpToWeek.filter(c => c.funnel_stage === 'lead').length,
          engaged: contactsUpToWeek.filter(c => c.funnel_stage === 'engaged').length,
          customers: contactsUpToWeek.filter(c => c.funnel_stage === 'customer').length
        });
      }

      setData({
        totalContacts: contactList.length,
        leads: leads.length,
        engaged: engaged.length,
        trials: trials.length,
        customers: customers.length,
        totalLTV: contactList.reduce((sum, c) => sum + (c.lifetime_value || 0), 0),
        avgLeadScore: contactList.length > 0 
          ? Math.round(contactList.reduce((sum, c) => sum + (c.lead_score || 0), 0) / contactList.length)
          : 0,
        activeThisWeek,
        sourceDistribution,
        conversionFunnel,
        weeklyGrowth
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="pt-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-muted-foreground py-8">Nu am putut încărca datele</p>;
  }

  const getConversionRate = (from: number, to: number) => {
    if (from === 0) return '0';
    return ((to / from) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Contacte</p>
            <p className="text-3xl font-bold">{data.totalContacts}</p>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Users className="h-3 w-3 mr-1" />{data.activeThisWeek} activi săptămâna asta
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Lead → Engaged</p>
            <p className="text-3xl font-bold text-green-500">
              {getConversionRate(data.leads + data.engaged + data.trials + data.customers, data.engaged + data.trials + data.customers)}%
            </p>
            <p className="text-xs text-muted-foreground">{data.engaged} engaged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Trials Activi</p>
            <p className="text-3xl font-bold text-orange-500">{data.trials}</p>
            <p className="text-xs text-muted-foreground">în perioadă de trial</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Customers</p>
            <p className="text-3xl font-bold text-yellow-500">{data.customers}</p>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Crown className="h-3 w-3 mr-1" />abonați activi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total LTV</p>
            <p className="text-3xl font-bold">{(data.totalLTV / 100).toFixed(0)} EUR</p>
            <p className="text-xs text-muted-foreground">din achiziții</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Funnel Conversion</CardTitle>
            <CardDescription>Lead → Engaged → Trial → Customer</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.conversionFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Sources</CardTitle>
            <CardDescription>De unde vin contactele</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.sourceDistribution}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80} fill="#8884d8" dataKey="value"
                >
                  {data.sourceDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart - REAL DATA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Creștere Săptămânală (Date Reale)</CardTitle>
          <CardDescription>Evoluția contactelor - bazat pe date reale din created_at</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.weeklyGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} name="Leads" />
              <Line type="monotone" dataKey="engaged" stroke="#22c55e" strokeWidth={2} name="Engaged" />
              <Line type="monotone" dataKey="customers" stroke="#eab308" strokeWidth={2} name="Customers" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{data.avgLeadScore}</p>
              <p className="text-sm text-muted-foreground">Scor Mediu Lead</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{data.activeThisWeek}</p>
              <p className="text-sm text-muted-foreground">Activi Ultima Săptămână</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold">
                {data.customers > 0 ? ((data.totalLTV / 100) / data.customers).toFixed(0) : 0} EUR
              </p>
              <p className="text-sm text-muted-foreground">LTV Mediu / Customer</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
