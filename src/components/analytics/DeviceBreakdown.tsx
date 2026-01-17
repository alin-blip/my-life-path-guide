import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { subDays } from 'date-fns';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

interface DeviceBreakdownProps {
  timeRange: string;
  leadMagnetFilter: string;
}

interface DeviceData {
  device: string;
  pageViews: number;
  leads: number;
  conversionRate: number;
}

const COLORS = {
  mobile: '#3b82f6',
  tablet: '#8b5cf6',
  desktop: '#10b981'
};

const ICONS = {
  mobile: <Smartphone className="h-5 w-5" />,
  tablet: <Tablet className="h-5 w-5" />,
  desktop: <Monitor className="h-5 w-5" />
};

export const DeviceBreakdown = ({ timeRange, leadMagnetFilter }: DeviceBreakdownProps) => {
  const [data, setData] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const dateFilter = subDays(new Date(), days).toISOString();

        let query = supabase
          .from('lead_magnet_events')
          .select('device_type, event_type')
          .gte('created_at', dateFilter);

        if (leadMagnetFilter !== 'all') {
          query = query.eq('lead_magnet', leadMagnetFilter);
        }

        const { data: events, error } = await query;

        if (error) {
          console.error('Error fetching device data:', error);
          return;
        }

        // Group by device
        const deviceMap = new Map<string, { pageViews: number; leads: number }>();
        
        events?.forEach(event => {
          const device = event.device_type || 'desktop';
          const existing = deviceMap.get(device) || { pageViews: 0, leads: 0 };
          
          if (event.event_type === 'page_view') {
            existing.pageViews++;
          }
          if (event.event_type === 'lead_capture') {
            existing.leads++;
          }
          
          deviceMap.set(device, existing);
        });

        const deviceData: DeviceData[] = ['mobile', 'tablet', 'desktop'].map(device => {
          const stats = deviceMap.get(device) || { pageViews: 0, leads: 0 };
          return {
            device: device.charAt(0).toUpperCase() + device.slice(1),
            pageViews: stats.pageViews,
            leads: stats.leads,
            conversionRate: stats.pageViews > 0 
              ? Math.round((stats.leads / stats.pageViews) * 100 * 10) / 10
              : 0
          };
        });

        setData(deviceData);
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
          <CardTitle>Device Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const totalPageViews = data.reduce((acc, d) => acc + d.pageViews, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="device" />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Page Views']}
                />
                <Bar dataKey="pageViews" radius={[0, 4, 4, 0]}>
                  {data.map((entry) => (
                    <Cell 
                      key={entry.device} 
                      fill={COLORS[entry.device.toLowerCase() as keyof typeof COLORS]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            {data.map((device) => {
              const percentage = totalPageViews > 0 
                ? Math.round((device.pageViews / totalPageViews) * 100)
                : 0;
                
              return (
                <div 
                  key={device.device} 
                  className="p-4 rounded-lg border bg-card"
                  style={{ borderLeftColor: COLORS[device.device.toLowerCase() as keyof typeof COLORS], borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {ICONS[device.device.toLowerCase() as keyof typeof ICONS]}
                      <span className="font-semibold">{device.device}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{percentage}% of traffic</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{device.pageViews}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{device.leads}</p>
                      <p className="text-xs text-muted-foreground">Leads</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{device.conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">CVR</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
