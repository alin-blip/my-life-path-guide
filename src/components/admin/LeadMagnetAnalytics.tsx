import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, Users, Mail, Target, 
  RefreshCw, Calendar, ArrowUpRight, Zap 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfDay } from 'date-fns';

interface LeadStats {
  leadMagnet: string;
  total: number;
  last7Days: number;
  last30Days: number;
  conversionRate: number;
  accountsCreated: number;
}

interface DailyLead {
  date: string;
  count: number;
  leadMagnet: string;
}

const LEAD_MAGNET_LABELS: Record<string, { label: string; color: string }> = {
  'business-lead-magnet': { label: 'Business 2026', color: '#3b82f6' },
  'vision-lead-magnet': { label: 'Vision 2026', color: '#8b5cf6' },
  'warrior-power': { label: 'Warrior Power', color: '#f59e0b' },
  'life-score': { label: 'Life Score Quiz', color: '#10b981' },
  'vision-quiz': { label: 'Vision Quiz', color: '#ec4899' },
  'challenge-7': { label: 'Challenge 7 Zile', color: '#ef4444' },
  'email-collection': { label: 'Email Collection', color: '#6366f1' },
  'unknown': { label: 'Direct/Other', color: '#94a3b8' },
};

const TIME_RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

export const LeadMagnetAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LeadStats[]>([]);
  const [dailyData, setDailyData] = useState<DailyLead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [timeRange, setTimeRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const daysAgo = timeRange === 'all' ? 365 * 5 : parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo)).toISOString();
      
      // Fetch leads from email_leads table
      const { data: leads, error: leadsError } = await supabase
        .from('email_leads')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Fetch CRM profiles to see account conversions
      const { data: profiles, error: profilesError } = await supabase
        .from('crm_contact_profiles')
        .select('email, lead_source, account_created_at, user_id')
        .gte('created_at', startDate);

      if (profilesError) throw profilesError;

      // Process leads by lead_magnet
      const leadsByMagnet: Record<string, { 
        total: number; 
        last7: number; 
        last30: number; 
        accounts: number;
        emails: Set<string>;
      }> = {};

      const sevenDaysAgo = subDays(new Date(), 7);
      const thirtyDaysAgo = subDays(new Date(), 30);

      leads?.forEach(lead => {
        const source = lead.lead_magnet || lead.source || 'unknown';
        const createdAt = new Date(lead.created_at);
        
        if (!leadsByMagnet[source]) {
          leadsByMagnet[source] = { 
            total: 0, 
            last7: 0, 
            last30: 0, 
            accounts: 0,
            emails: new Set()
          };
        }

        leadsByMagnet[source].total++;
        leadsByMagnet[source].emails.add(lead.email);
        
        if (createdAt >= sevenDaysAgo) {
          leadsByMagnet[source].last7++;
        }
        if (createdAt >= thirtyDaysAgo) {
          leadsByMagnet[source].last30++;
        }
      });

      // Check which leads converted to accounts
      profiles?.forEach(profile => {
        if (profile.account_created_at && profile.user_id) {
          const source = profile.lead_source || 'unknown';
          if (leadsByMagnet[source]) {
            if (leadsByMagnet[source].emails.has(profile.email)) {
              leadsByMagnet[source].accounts++;
            }
          }
        }
      });

      // Convert to array format
      const statsArray: LeadStats[] = Object.entries(leadsByMagnet)
        .map(([magnet, data]) => ({
          leadMagnet: magnet,
          total: data.total,
          last7Days: data.last7,
          last30Days: data.last30,
          accountsCreated: data.accounts,
          conversionRate: data.total > 0 ? (data.accounts / data.total) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total);

      // Calculate daily data for chart (last 30 days)
      const dailyLeads: Record<string, Record<string, number>> = {};
      const last30Days = Array.from({ length: 30 }, (_, i) => 
        format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
      );

      last30Days.forEach(date => {
        dailyLeads[date] = {};
      });

      leads?.forEach(lead => {
        const date = format(new Date(lead.created_at), 'yyyy-MM-dd');
        if (dailyLeads[date]) {
          const source = lead.lead_magnet || lead.source || 'unknown';
          dailyLeads[date][source] = (dailyLeads[date][source] || 0) + 1;
        }
      });

      const chartData = last30Days.map(date => ({
        date: format(new Date(date), 'MMM dd'),
        ...dailyLeads[date],
        total: Object.values(dailyLeads[date]).reduce((a, b) => a + b, 0),
      }));

      setStats(statsArray);
      setDailyData(chartData as any);
      setTotalLeads(leads?.length || 0);
      setTotalAccounts(profiles?.filter(p => p.user_id).length || 0);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLabel = (magnet: string) => 
    LEAD_MAGNET_LABELS[magnet]?.label || magnet;
  
  const getColor = (magnet: string) => 
    LEAD_MAGNET_LABELS[magnet]?.color || '#94a3b8';

  // Prepare pie chart data
  const pieData = stats.map(s => ({
    name: getLabel(s.leadMagnet),
    value: s.total,
    color: getColor(s.leadMagnet),
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const overallConversion = totalLeads > 0 
    ? ((totalAccounts / totalLeads) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Magnet Analytics</h2>
          <p className="text-muted-foreground">
            Conversii și performanță per lead magnet
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold">{totalLeads}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conturi Create</p>
                <p className="text-3xl font-bold">{totalAccounts}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">{overallConversion}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lead Magnets</p>
                <p className="text-3xl font-bold">{stats.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Daily Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads per Zi (30 zile)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuție Lead Magnets</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Performanță per Lead Magnet
          </CardTitle>
          <CardDescription>
            Statistici detaliate pentru fiecare sursă de lead-uri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead Magnet</TableHead>
                <TableHead className="text-right">Total Leads</TableHead>
                <TableHead className="text-right">7 Zile</TableHead>
                <TableHead className="text-right">30 Zile</TableHead>
                <TableHead className="text-right">Conturi Create</TableHead>
                <TableHead className="text-right">Conversion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.leadMagnet}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getColor(stat.leadMagnet) }}
                      />
                      <span className="font-medium">{getLabel(stat.leadMagnet)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {stat.total}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{stat.last7Days}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{stat.last30Days}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {stat.accountsCreated}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={stat.conversionRate > 20 ? "default" : "secondary"}
                      className={stat.conversionRate > 20 ? "bg-green-500" : ""}
                    >
                      {stat.conversionRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
