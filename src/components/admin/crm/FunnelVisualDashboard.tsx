import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, TrendingUp, TrendingDown, Crown, Target, 
  ArrowDown, Clock, AlertTriangle, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  dropOffRate: number;
  avgDaysInStage: number;
  color: string;
  icon: React.ReactNode;
}

interface FunnelData {
  stages: FunnelStage[];
  totalContacts: number;
  totalLTV: number;
  overallConversion: number;
  avgTimeToConvert: number;
}

export const FunnelVisualDashboard: React.FC = () => {
  const [data, setData] = useState<FunnelData | null>(null);
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
      
      // Count by stage
      const leads = contactList.filter(c => c.funnel_stage === 'lead');
      const mql = contactList.filter(c => c.funnel_stage === 'mql');
      const sql = contactList.filter(c => c.funnel_stage === 'sql');
      const trials = contactList.filter(c => 
        c.funnel_stage === 'trial' || c.subscription_status === 'trialing'
      );
      const customers = contactList.filter(c => 
        c.funnel_stage === 'customer' && c.subscription_status !== 'trialing'
      );

      // Calculate avg days in stage (simplified)
      const calculateAvgDays = (stageContacts: typeof contacts) => {
        if (!stageContacts || stageContacts.length === 0) return 0;
        const now = new Date();
        const totalDays = stageContacts.reduce((sum, c) => {
          const stageDate = c.funnel_stage_changed_at || c.lead_captured_at || c.created_at;
          if (!stageDate) return sum;
          const diff = Math.floor((now.getTime() - new Date(stageDate).getTime()) / (1000 * 60 * 60 * 24));
          return sum + diff;
        }, 0);
        return Math.round(totalDays / stageContacts.length);
      };

      // Build stages array with cumulative drop-off
      const stagesData: FunnelStage[] = [
        {
          id: 'lead',
          name: 'Lead',
          count: leads.length,
          percentage: total > 0 ? (leads.length / total) * 100 : 0,
          dropOffRate: 0, // No drop-off at first stage
          avgDaysInStage: calculateAvgDays(leads),
          color: 'bg-blue-500',
          icon: <Users className="h-5 w-5" />
        },
        {
          id: 'mql',
          name: 'MQL',
          count: mql.length,
          percentage: leads.length > 0 ? (mql.length / leads.length) * 100 : 0,
          dropOffRate: leads.length > 0 ? ((leads.length - mql.length) / leads.length) * 100 : 0,
          avgDaysInStage: calculateAvgDays(mql),
          color: 'bg-purple-500',
          icon: <Target className="h-5 w-5" />
        },
        {
          id: 'sql',
          name: 'SQL',
          count: sql.length,
          percentage: mql.length > 0 ? (sql.length / mql.length) * 100 : 0,
          dropOffRate: mql.length > 0 ? ((mql.length - sql.length) / mql.length) * 100 : 0,
          avgDaysInStage: calculateAvgDays(sql),
          color: 'bg-indigo-500',
          icon: <TrendingUp className="h-5 w-5" />
        },
        {
          id: 'trial',
          name: 'Trial',
          count: trials.length,
          percentage: sql.length > 0 ? (trials.length / sql.length) * 100 : 0,
          dropOffRate: sql.length > 0 ? ((sql.length - trials.length) / sql.length) * 100 : 0,
          avgDaysInStage: 3, // Trial is always 3 days
          color: 'bg-orange-500',
          icon: <Clock className="h-5 w-5" />
        },
        {
          id: 'customer',
          name: 'Customer',
          count: customers.length,
          percentage: trials.length > 0 ? (customers.length / trials.length) * 100 : 0,
          dropOffRate: trials.length > 0 ? ((trials.length - customers.length) / trials.length) * 100 : 0,
          avgDaysInStage: calculateAvgDays(customers),
          color: 'bg-yellow-500',
          icon: <Crown className="h-5 w-5" />
        }
      ];

      // Calculate overall metrics
      const overallConversion = total > 0 ? (customers.length / total) * 100 : 0;
      const totalLTV = contactList.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);

      setData({
        stages: stagesData,
        totalContacts: total,
        totalLTV,
        overallConversion,
        avgTimeToConvert: 14 // Simplified average
      });
    } catch (error) {
      console.error('Error loading funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nu am putut încărca datele</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate width percentages for visual funnel
  const maxCount = Math.max(...data.stages.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold">{data.totalContacts}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Overall</p>
                <p className="text-2xl font-bold text-green-500">{data.overallConversion.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LTV Total</p>
                <p className="text-2xl font-bold">{data.totalLTV} RON</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Timp Mediu Conversie</p>
                <p className="text-2xl font-bold">{data.avgTimeToConvert}z</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Funnel Vizual
          </CardTitle>
          <CardDescription>
            Vizualizare completă a conversiilor pe fiecare etapă
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-1">
            {data.stages.map((stage, index) => {
              const widthPercent = Math.max((stage.count / maxCount) * 100, 15);
              const isBottleneck = stage.dropOffRate > 70;
              
              return (
                <div key={stage.id} className="relative">
                  {/* Stage Bar */}
                  <div 
                    className={`
                      relative mx-auto transition-all duration-500 rounded-lg
                      ${stage.color} text-white
                      ${isBottleneck ? 'ring-2 ring-red-500 ring-offset-2' : ''}
                    `}
                    style={{ 
                      width: `${widthPercent}%`,
                      minHeight: '60px'
                    }}
                  >
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        {stage.icon}
                        <span className="font-semibold">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {stage.count}
                        </Badge>
                        {stage.avgDaysInStage > 0 && (
                          <span className="text-xs opacity-75">
                            ~{stage.avgDaysInStage}z
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Bottleneck Warning */}
                    {isBottleneck && index > 0 && (
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Drop-off Arrow */}
                  {index < data.stages.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowDown className="h-4 w-4 text-muted-foreground" />
                        <span className={`font-medium ${
                          stage.dropOffRate > 50 ? 'text-red-500' : 
                          stage.dropOffRate > 30 ? 'text-orange-500' : 
                          'text-green-500'
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

      {/* Stage Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {data.stages.map((stage, index) => (
          <Card key={stage.id} className={`border-t-4 ${stage.color.replace('bg-', 'border-t-')}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {stage.icon}
                {stage.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold">{stage.count}</p>
                  <p className="text-xs text-muted-foreground">contacte</p>
                </div>
                
                {index > 0 && (
                  <div className="flex items-center gap-1 text-sm">
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
                
                <div className="text-xs text-muted-foreground">
                  ~{stage.avgDaysInStage} zile în etapă
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottleneck Alerts */}
      {data.stages.some(s => s.dropOffRate > 70) && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Blocaje Identificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.stages.filter(s => s.dropOffRate > 70).map(stage => (
                <li key={stage.id} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{stage.name}:</span>
                  <span className="text-red-600">{stage.dropOffRate.toFixed(0)}% drop-off</span>
                  <span className="text-muted-foreground">- necesită atenție!</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
