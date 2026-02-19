import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Crown, TrendingUp, Users, CreditCard } from 'lucide-react';

interface SubscriptionStats {
  activeSubscriptions: number;
  trialUsers: number;
  totalMRR: number;
  tierBreakdown: { tier: string; count: number; mrr: number }[];
  monthlyGrowth: { month: string; customers: number; mrr: number }[];
}

export const RevenueDashboard: React.FC = () => {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);

      // Get real subscription data from subscribers table
      const { data: subscribers, error } = await supabase
        .from('subscribers')
        .select('email, subscribed, subscription_tier, subscription_status, created_at');

      if (error) throw error;

      const subs = subscribers || [];
      const active = subs.filter(s => s.subscribed && s.subscription_status !== 'trialing');
      const trials = subs.filter(s => s.subscription_status === 'trialing');

      // Tier breakdown
      const tierMap = new Map<string, { count: number; mrr: number }>();
      active.forEach(s => {
        const tier = s.subscription_tier || 'Unknown';
        const existing = tierMap.get(tier) || { count: 0, mrr: 0 };
        const price = tier === 'Elite' ? 297 : (tier === 'Pro' ? 99 : 0);
        tierMap.set(tier, { count: existing.count + 1, mrr: existing.mrr + price });
      });

      const tierBreakdown = Array.from(tierMap.entries()).map(([tier, data]) => ({
        tier, count: data.count, mrr: data.mrr
      }));

      const totalMRR = tierBreakdown.reduce((sum, t) => sum + t.mrr, 0);

      // Monthly customer growth from crm_contact_profiles
      const { data: contacts } = await supabase
        .from('crm_contact_profiles')
        .select('created_at, funnel_stage, subscription_status')
        .in('funnel_stage', ['customer', 'trial']);

      const monthlyGrowth: { month: string; customers: number; mrr: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthLabel = monthDate.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' });
        
        const customersUpTo = (contacts || []).filter(c => 
          c.created_at && new Date(c.created_at) <= monthEnd && c.funnel_stage === 'customer'
        ).length;

        monthlyGrowth.push({
          month: monthLabel,
          customers: customersUpTo,
          mrr: customersUpTo * (totalMRR / Math.max(active.length, 1)) // Estimated MRR per customer
        });
      }

      setStats({
        activeSubscriptions: active.length,
        trialUsers: trials.length,
        totalMRR,
        tierBreakdown,
        monthlyGrowth
      });
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="pt-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-center text-muted-foreground py-8">Nu am putut încărca datele</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Revenue Dashboard (Date Reale)</h3>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalMRR}</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="h-4 w-4" /> Abonați Activi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">subscripții active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> În Trial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.trialUsers}</div>
            <p className="text-xs text-muted-foreground">useri în perioadă de trial</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> ARPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.activeSubscriptions > 0 ? Math.round(stats.totalMRR / stats.activeSubscriptions) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Average Revenue Per User</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Breakdown */}
      {stats.tierBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuție pe Planuri</CardTitle>
            <CardDescription>Abonați activi pe fiecare plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.tierBreakdown.map(tier => (
                <div key={tier.tier} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Crown className={`h-5 w-5 ${tier.tier === 'Elite' ? 'text-yellow-500' : 'text-blue-500'}`} />
                    <div>
                      <p className="font-medium">{tier.tier}</p>
                      <p className="text-sm text-muted-foreground">{tier.count} abonați</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€{tier.mrr}/lună</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Monthly Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Creștere Lunară</CardTitle>
          <CardDescription>Evoluția numărului de clienți</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" name="Clienți" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
