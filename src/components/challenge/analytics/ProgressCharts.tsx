import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { TrendingUp, Calendar, Target, BookOpen } from 'lucide-react';

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))'
};

const PRINCIPLE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#22c55e'
];

export const ProgressCharts: React.FC = () => {
  const { language } = useLanguage();
  const { progress, principleStats } = useReadingProgress();
  const locale = language === 'ro' ? ro : enUS;
  
  // Weekly reading data (last 4 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { week: string; pages: number; actions: number }[] = [];
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
      
      const pagesThisWeek = progress.filter(p => {
        const date = new Date(p.read_at);
        return date >= weekStart && date <= weekEnd;
      });
      
      weeks.push({
        week: format(weekStart, 'dd MMM', { locale }),
        pages: pagesThisWeek.length,
        actions: pagesThisWeek.filter(p => p.action_completed).length
      });
    }
    
    return weeks;
  }, [progress, locale]);
  
  // Daily activity (last 14 days)
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date()
    });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const pagesThisDay = progress.filter(p => 
        format(new Date(p.read_at), 'yyyy-MM-dd') === dayStr
      );
      
      return {
        date: format(day, 'EEE', { locale }),
        fullDate: format(day, 'dd MMM', { locale }),
        pages: pagesThisDay.length,
        actions: pagesThisDay.filter(p => p.action_completed).length
      };
    });
  }, [progress, locale]);
  
  // Principle distribution
  const principleData = useMemo(() => {
    return principleStats
      .filter(p => p.pagesRead > 0)
      .map((p, i) => ({
        name: p.principle.length > 15 ? p.principle.substring(0, 15) + '...' : p.principle,
        fullName: p.principle,
        value: p.pagesRead,
        percentage: p.percentage,
        color: PRINCIPLE_COLORS[i % PRINCIPLE_COLORS.length]
      }));
  }, [principleStats]);
  
  // Cumulative progress
  const cumulativeData = useMemo(() => {
    if (progress.length === 0) return [];
    
    const sortedProgress = [...progress].sort(
      (a, b) => new Date(a.read_at).getTime() - new Date(b.read_at).getTime()
    );
    
    let cumulative = 0;
    const dataMap = new Map<string, number>();
    
    sortedProgress.forEach(p => {
      cumulative++;
      const dateKey = format(new Date(p.read_at), 'dd MMM', { locale });
      dataMap.set(dateKey, cumulative);
    });
    
    return Array.from(dataMap.entries()).map(([date, total]) => ({
      date,
      total,
      target: 365
    }));
  }, [progress, locale]);
  
  return (
    <div className="space-y-6">
      {/* Weekly Progress */}
      <Card className="p-6 bg-card border-primary/20">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {language === 'en' ? 'Weekly Progress' : 'Progres Săptămânal'}
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="pages" 
                name={language === 'en' ? 'Pages' : 'Pagini'} 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="actions" 
                name={language === 'en' ? 'Actions' : 'Acțiuni'} 
                fill="hsl(var(--accent))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Daily Activity Heatmap */}
      <Card className="p-6 bg-card border-primary/20">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {language === 'en' ? 'Daily Activity (Last 14 Days)' : 'Activitate Zilnică (Ultimele 14 Zile)'}
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
              />
              <Area 
                type="monotone" 
                dataKey="pages" 
                name={language === 'en' ? 'Pages Read' : 'Pagini Citite'}
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorPages)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Cumulative Progress */}
      {cumulativeData.length > 0 && (
        <Card className="p-6 bg-card border-primary/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {language === 'en' ? 'Cumulative Progress' : 'Progres Cumulativ'}
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 'auto']} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name={language === 'en' ? 'Total Pages' : 'Total Pagini'}
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
      
      {/* Principle Distribution */}
      {principleData.length > 0 && (
        <Card className="p-6 bg-card border-primary/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {language === 'en' ? 'Reading by Principle' : 'Lectură per Principiu'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={principleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {principleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name, props) => [
                      `${value} ${language === 'en' ? 'pages' : 'pagini'}`,
                      props.payload.fullName
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[250px]">
              {principleData.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate flex-1">{p.fullName}</span>
                  <span className="text-muted-foreground">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProgressCharts;
