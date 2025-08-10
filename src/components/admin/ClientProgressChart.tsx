import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminClientService } from '@/services/adminClientService';
import { TrendingUp, TrendingDown, Target, Flame, Calendar, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ClientProgressChartProps {
  userId: string;
  clientName: string;
}

export const ClientProgressChart: React.FC<ClientProgressChartProps> = ({ userId, clientName }) => {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgCompletionRate: 0,
    totalTasks: 0,
    currentStreak: 0,
    trend: 'neutral' as 'up' | 'down' | 'neutral'
  });

  useEffect(() => {
    loadProgressData();
  }, [userId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const data = await adminClientService.fetchClientDoorData(userId, 14);
      
      const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }),
        completionRate: Number(item.completion_rate) || 0,
        totalTasks: item.total_tasks || 0,
        completedTasks: item.completed_tasks || 0
      }));

      setProgressData(chartData);

      // Calculate stats
      const avgRate = chartData.reduce((sum, item) => sum + item.completionRate, 0) / chartData.length;
      const totalTasks = chartData.reduce((sum, item) => sum + item.totalTasks, 0);
      const currentStreak = data[data.length - 1]?.streak_days || 0;
      
      // Calculate trend
      const recentRates = chartData.slice(-3).map(item => item.completionRate);
      const trend = recentRates.length >= 2 ? 
        (recentRates[recentRates.length - 1] > recentRates[0] ? 'up' : 
         recentRates[recentRates.length - 1] < recentRates[0] ? 'down' : 'neutral') : 'neutral';

      setStats({
        avgCompletionRate: avgRate,
        totalTasks,
        currentStreak,
        trend
      });

    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Progres Door pentru {clientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Progres Door - {clientName}
        </h3>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.avgCompletionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Rata medie</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total task-uri</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Zile consecutive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {stats.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : stats.trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Activity className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {stats.trend === 'up' ? 'În creștere' : stats.trend === 'down' ? 'În scădere' : 'Stabil'}
                </p>
                <p className="text-xs text-muted-foreground">Tendință</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rata de completare (ultimele 14 zile)</CardTitle>
            <CardDescription>Procentul de task-uri completate zilnic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => `Data: ${value}`}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Rata de completare']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volum task-uri zilnic</CardTitle>
            <CardDescription>Task-uri create vs completate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalTasks" fill="hsl(var(--muted))" name="Total" />
                  <Bar dataKey="completedTasks" fill="hsl(var(--primary))" name="Completate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};