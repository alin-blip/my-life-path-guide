import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, TrendingUp, TrendingDown, Crown, 
  ArrowDown, Clock, AlertTriangle, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FunnelStage {
  id: string;
  name: string;
  count: number;
  dropOffRate: number;
  avgDaysInStage: number;
  color: string;
  icon: React.ReactNode;
}

export const FunnelVisualDashboard: React.FC = () => {
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalLTV, setTotalLTV] = useState(0);
  const [overallConversion, setOverallConversion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFunnelData();
  }, []);

  const loadFunnelData = async () => {
    try {
      setLoading(true);
      const { data: contacts, error } = await supabase
        .from('crm_contact_profiles')
        .select('*');
      if (error) throw error;

      const contactList = contacts || [];
      const total = contactList.length;

      // Simplified 4-stage funnel: Lead → Engaged → Trial → Customer
      const leads = contactList.filter(c => c.funnel_stage === 'lead');
      const engaged = contactList.filter(c => c.funnel_stage === 'engaged');
      const trials = contactList.filter(c => 
        c.funnel_stage === 'trial' || c.subscription_status === 'trialing'
      );
      const customers = contactList.filter(c => 
        c.funnel_stage === 'customer' && c.subscription_status !== 'trialing'
      );

      const now = new Date();
      const calculateAvgDays = (stageContacts: typeof contacts) => {
        if (!stageContacts || stageContacts.length === 0) return 0;
        const totalDays = stageContacts.reduce((sum, c) => {
          const stageDate = c.funnel_stage_changed_at || c.lead_captured_at || c.created_at;
          if (!stageDate) return sum;
          return sum + Math.floor((now.getTime() - new Date(stageDate).getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        return Math.round(totalDays / stageContacts.length);
      };

      const stagesData: FunnelStage[] = [
        {
          id: 'lead', name: 'Lead', count: leads.length,
          dropOffRate: 0,
          avgDaysInStage: calculateAvgDays(leads),
          color: 'bg-blue-500',
          icon: <Users className="h-5 w-5" />
        },
        {
          id: 'engaged', name: 'Engaged', count: engaged.length,
          dropOffRate: leads.length > 0 ? ((leads.length - engaged.length) / leads.length) * 100 : 0,
          avgDaysInStage: calculateAvgDays(engaged),
          color: 'bg-green-500',
          icon: <TrendingUp className="h-5 w-5" />
        },
        {
          id: 'trial', name: 'Trial', count: trials.length,
          dropOffRate: engaged.length > 0 ? ((engaged.length - trials.length) / engaged.length) * 100 : 0,
          avgDaysInStage: 5,
          color: 'bg-orange-500',
          icon: <Clock className="h-5 w-5" />
        },
        {
          id: 'customer', name: 'Customer', count: customers.length,
          dropOffRate: trials.length > 0 ? ((trials.length - customers.length) / trials.length) * 100 : 0,
          avgDaysInStage: calculateAvgDays(customers),
          color: 'bg-yellow-500',
          icon: <Crown className="h-5 w-5" />
        }
      ];

      setStages(stagesData);
      setTotalContacts(total);
      setTotalLTV(contactList.reduce((sum, c) => sum + (c.lifetime_value || 0), 0));
      setOverallConversion(total > 0 ? (customers.length / total) * 100 : 0);
    } catch (error) {
      console.error('Error loading funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="pt-6"><Skeleton className="h-[400px] w-full" /></CardContent></Card>;
  }

  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Pipeline</p>
            <p className="text-2xl font-bold">{totalContacts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Conversion Overall</p>
            <p className="text-2xl font-bold text-green-500">{overallConversion.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">LTV Total</p>
            <p className="text-2xl font-bold">{(totalLTV / 100).toFixed(0)} EUR</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Funnel: Lead → Engaged → Trial → Customer
          </CardTitle>
          <CardDescription>4 etape simplificate, date reale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-1">
            {stages.map((stage, index) => {
              const widthPercent = Math.max((stage.count / maxCount) * 100, 15);
              const isBottleneck = stage.dropOffRate > 70;
              return (
                <div key={stage.id} className="relative">
                  <div 
                    className={`relative mx-auto transition-all duration-500 rounded-lg ${stage.color} text-white ${isBottleneck ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}
                    style={{ width: `${widthPercent}%`, minHeight: '60px' }}
                  >
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        {stage.icon}
                        <span className="font-semibold">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-white/20 text-white">{stage.count}</Badge>
                        {stage.avgDaysInStage > 0 && (
                          <span className="text-xs opacity-75">~{stage.avgDaysInStage}z</span>
                        )}
                      </div>
                    </div>
                    {isBottleneck && index > 0 && (
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {index < stages.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowDown className="h-4 w-4 text-muted-foreground" />
                        <span className={`font-medium ${
                          stage.dropOffRate > 50 ? 'text-red-500' : 
                          stage.dropOffRate > 30 ? 'text-orange-500' : 'text-green-500'
                        }`}>
                          -{stage.dropOffRate.toFixed(0)}% drop-off
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage, index) => (
          <Card key={stage.id} className={`border-t-4 ${stage.color.replace('bg-', 'border-t-')}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">{stage.icon}{stage.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stage.count}</p>
              <p className="text-xs text-muted-foreground">contacte</p>
              {index > 0 && (
                <div className="flex items-center gap-1 text-sm mt-2">
                  {stage.dropOffRate > 50 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  <span className={stage.dropOffRate > 50 ? 'text-red-500' : 'text-green-500'}>
                    {stage.dropOffRate.toFixed(0)}% drop
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottleneck Alerts */}
      {stages.some(s => s.dropOffRate > 70) && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Blocaje Identificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stages.filter(s => s.dropOffRate > 70).map(stage => (
                <li key={stage.id} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{stage.name}:</span>
                  <span className="text-red-600">{stage.dropOffRate.toFixed(0)}% drop-off</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
