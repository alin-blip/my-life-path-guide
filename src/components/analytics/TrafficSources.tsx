import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { subDays } from 'date-fns';

interface TrafficSourcesProps {
  timeRange: string;
  leadMagnetFilter: string;
}

interface SourceData {
  name: string;
  value: number;
  percentage: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export const TrafficSources = ({ timeRange, leadMagnetFilter }: TrafficSourcesProps) => {
  const [data, setData] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const dateFilter = subDays(new Date(), days).toISOString();

        let query = supabase
          .from('lead_magnet_events')
          .select('referrer')
          .eq('event_type', 'page_view')
          .gte('created_at', dateFilter);

        if (leadMagnetFilter !== 'all') {
          query = query.eq('lead_magnet', leadMagnetFilter);
        }

        const { data: events, error } = await query;

        if (error) {
          console.error('Error fetching traffic sources:', error);
          return;
        }

        // Group by source
        const sourceMap = new Map<string, number>();
        events?.forEach(event => {
          let source = 'Direct';
          const referrer = event.referrer;
          
          if (referrer) {
            if (referrer.includes('facebook.com') || referrer.includes('fb.com')) {
              source = 'Facebook';
            } else if (referrer.includes('google.com')) {
              source = 'Google';
            } else if (referrer.includes('instagram.com')) {
              source = 'Instagram';
            } else if (referrer.includes('youtube.com')) {
              source = 'YouTube';
            } else if (referrer.includes('linkedin.com')) {
              source = 'LinkedIn';
            } else if (referrer.includes('twitter.com') || referrer.includes('x.com')) {
              source = 'Twitter/X';
            } else {
              source = 'Other';
            }
          }
          
          sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        });

        const total = events?.length || 0;
        const sourceData: SourceData[] = Array.from(sourceMap.entries())
          .map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? Math.round((value / total) * 100) : 0
          }))
          .sort((a, b) => b.value - a.value);

        setData(sourceData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, leadMagnetFilter]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10 text-muted-foreground">
          No traffic data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} visits`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="space-y-3">
            {data.map((source, index) => (
              <div key={source.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{source.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">{source.value}</span>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {source.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
