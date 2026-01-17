import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Magnet, TrendingUp, Users, Target } from 'lucide-react';

interface LeadSource {
  source: string;
  label: string;
  count: number;
  customers: number;
  conversionRate: number;
  totalLTV: number;
}

interface LeadSourceStatsProps {
  contacts: Array<{
    lead_source: string | null;
    funnel_stage: string;
    lifetime_value: number;
  }>;
}

export const LeadSourceStats: React.FC<LeadSourceStatsProps> = ({ contacts }) => {
  // Aggregate stats by lead source
  const sourceStats = React.useMemo(() => {
    const stats = new Map<string, { count: number; customers: number; totalLTV: number }>();
    
    contacts.forEach(contact => {
      const source = contact.lead_source || 'unknown';
      const existing = stats.get(source) || { count: 0, customers: 0, totalLTV: 0 };
      existing.count++;
      if (contact.funnel_stage === 'customer') {
        existing.customers++;
        existing.totalLTV += contact.lifetime_value || 0;
      }
      stats.set(source, existing);
    });
    
    // Convert to array and calculate conversion rates
    const result: LeadSource[] = [];
    stats.forEach((data, source) => {
      result.push({
        source,
        label: getSourceLabel(source),
        count: data.count,
        customers: data.customers,
        conversionRate: data.count > 0 ? (data.customers / data.count) * 100 : 0,
        totalLTV: data.totalLTV
      });
    });
    
    // Sort by count descending
    return result.sort((a, b) => b.count - a.count);
  }, [contacts]);

  const totalLeads = contacts.length;
  const maxCount = Math.max(...sourceStats.map(s => s.count), 1);

  function getSourceLabel(source: string): string {
    const labels: Record<string, string> = {
      'warrior_power': 'Warrior Power Quiz',
      'vision_2026': 'Vision 2026',
      'vision_2026_quiz': 'Vision 2026 Quiz',
      'vision_board': 'Vision Board',
      'life_score': 'Life Score Quiz',
      'challenge': 'Challenge',
      'direct_signup': 'Direct Signup',
      'stripe_subscription': 'Stripe Subscription',
      'unknown': 'Necunoscut'
    };
    return labels[source] || source;
  }

  function getSourceColor(source: string): string {
    const colors: Record<string, string> = {
      'warrior_power': 'bg-purple-500',
      'vision_2026': 'bg-blue-500',
      'vision_2026_quiz': 'bg-blue-400',
      'vision_board': 'bg-indigo-500',
      'life_score': 'bg-green-500',
      'challenge': 'bg-orange-500',
      'direct_signup': 'bg-gray-500',
      'stripe_subscription': 'bg-yellow-500'
    };
    return colors[source] || 'bg-gray-400';
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Magnet className="h-5 w-5 text-primary" />
          <CardTitle>Lead Sources</CardTitle>
        </div>
        <CardDescription>
          Performanța lead magnet-urilor și surselor de trafic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sourceStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nu există date despre surse
            </p>
          ) : (
            sourceStats.map((source) => (
              <div key={source.source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getSourceColor(source.source)}`} />
                    <span className="font-medium text-sm">{source.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {source.count}
                    </Badge>
                    {source.customers > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        {source.conversionRate.toFixed(1)}%
                      </Badge>
                    )}
                    {source.totalLTV > 0 && (
                      <Badge className="text-xs bg-green-500 hover:bg-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {source.totalLTV} RON
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress 
                  value={(source.count / maxCount) * 100} 
                  className="h-2"
                />
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{sourceStats.length}</p>
            <p className="text-xs text-muted-foreground">Surse Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalLeads}</p>
            <p className="text-xs text-muted-foreground">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {sourceStats.reduce((sum, s) => sum + s.totalLTV, 0)} RON
            </p>
            <p className="text-xs text-muted-foreground">LTV Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
