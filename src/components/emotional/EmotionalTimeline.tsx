import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ro } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getEmotionInfo, Emotion } from './EmotionPicker';
import { Activity, TrendingUp, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmotionalCheckin {
  id: string;
  created_at: string;
  emotion: Emotion;
  intensity: number;
  energy_level: number;
  trigger: string | null;
  reaction: string | null;
  result: string | null;
  notes: string | null;
}

interface EmotionalTimelineProps {
  refreshTrigger?: number;
}

export function EmotionalTimeline({ refreshTrigger }: EmotionalTimelineProps) {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<EmotionalCheckin[]>([]);
  const [period, setPeriod] = useState<'7' | '30'>('7');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCheckins();
    }
  }, [user, period, refreshTrigger]);

  const fetchCheckins = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const daysAgo = parseInt(period);
    const startDate = startOfDay(subDays(new Date(), daysAgo));

    const { data, error } = await supabase
      .from('emotional_checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching checkins:', error);
    } else {
      setCheckins(data as EmotionalCheckin[]);
    }
    setIsLoading(false);
  };

  const chartData = checkins.map(c => ({
    date: format(new Date(c.created_at), 'dd MMM', { locale: ro }),
    fullDate: format(new Date(c.created_at), 'dd MMM HH:mm', { locale: ro }),
    intensity: c.intensity,
    energy: c.energy_level,
    emotion: c.emotion,
  }));

  const emotionCounts = checkins.reduce((acc, c) => {
    acc[c.emotion] = (acc[c.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as Emotion | undefined;

  const avgIntensity = checkins.length > 0
    ? Math.round(checkins.reduce((sum, c) => sum + c.intensity, 0) / checkins.length * 10) / 10
    : 0;

  const avgEnergy = checkins.length > 0
    ? Math.round(checkins.reduce((sum, c) => sum + c.energy_level, 0) / checkins.length * 10) / 10
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Se încarcă...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1">
              {dominantEmotion ? getEmotionInfo(dominantEmotion)?.emoji : '—'}
            </div>
            <div className="text-xs text-muted-foreground">Emoție dominantă</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{avgIntensity}</div>
            <div className="text-xs text-muted-foreground">Intensitate medie</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{avgEnergy}</div>
            <div className="text-xs text-muted-foreground">Energie medie</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trend
            </CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as '7' | '30')}>
              <TabsList className="h-7">
                <TabsTrigger value="7" className="text-xs px-2 h-5">7 zile</TabsTrigger>
                <TabsTrigger value="30" className="text-xs px-2 h-5">30 zile</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 10]} 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  width={20}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const emotionInfo = getEmotionInfo(data.emotion);
                      return (
                        <div className="bg-popover border rounded-lg p-2 shadow-lg">
                          <p className="text-xs text-muted-foreground">{data.fullDate}</p>
                          <p className="font-medium">{emotionInfo?.emoji} {emotionInfo?.labelRo}</p>
                          <p className="text-xs">Intensitate: {data.intensity}/10</p>
                          <p className="text-xs">Energie: {data.energy}/10</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="intensity"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorIntensity)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="#eab308"
                  fillOpacity={1}
                  fill="url(#colorEnergy)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
              Niciun check-in în această perioadă
            </div>
          )}
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Intensitate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-muted-foreground">Energie</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Checkins */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Check-in-uri recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkins.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {[...checkins].reverse().slice(0, 10).map((checkin) => {
                const emotionInfo = getEmotionInfo(checkin.emotion);
                return (
                  <div
                    key={checkin.id}
                    className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-xl">{emotionInfo?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{emotionInfo?.labelRo}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {checkin.intensity}/10
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500/50 text-yellow-600">
                          ⚡ {checkin.energy_level}/10
                        </Badge>
                      </div>
                      {checkin.trigger && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          Trigger: {checkin.trigger}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {format(new Date(checkin.created_at), 'EEEE, d MMM • HH:mm', { locale: ro })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-4">
              Niciun check-in încă. Începe să îți urmărești emoțiile!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
