import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Mail, Eye, MousePointer, UserX, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface EmailStats {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_unsubscribed: number;
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
}

interface DayStats {
  day_number: number;
  sent: number;
  opened: number;
  clicked: number;
  open_rate: number;
  click_rate: number;
}

export const EmailAnalytics: React.FC = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [dayStats, setDayStats] = useState<DayStats[]>([]);
  const [recentEmails, setRecentEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch overall stats
      const { data: logs, error } = await supabase
        .from('email_sequence_log')
        .select('*')
        .eq('sequence_type', 'warrior_power');

      if (error) throw error;

      const totalSent = logs?.length || 0;
      const totalOpened = logs?.filter(l => l.opened_at).length || 0;
      const totalClicked = logs?.filter(l => l.clicked_at).length || 0;
      const totalUnsubscribed = logs?.filter(l => l.unsubscribed_at).length || 0;

      setStats({
        total_sent: totalSent,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        total_unsubscribed: totalUnsubscribed,
        open_rate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        click_rate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        unsubscribe_rate: totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0,
      });

      // Calculate per-day stats
      const dayStatsMap: Record<number, DayStats> = {};
      for (let i = 1; i <= 7; i++) {
        dayStatsMap[i] = { day_number: i, sent: 0, opened: 0, clicked: 0, open_rate: 0, click_rate: 0 };
      }

      logs?.forEach(log => {
        const day = log.day_number;
        if (dayStatsMap[day]) {
          dayStatsMap[day].sent++;
          if (log.opened_at) dayStatsMap[day].opened++;
          if (log.clicked_at) dayStatsMap[day].clicked++;
        }
      });

      Object.values(dayStatsMap).forEach(day => {
        day.open_rate = day.sent > 0 ? (day.opened / day.sent) * 100 : 0;
        day.click_rate = day.sent > 0 ? (day.clicked / day.sent) * 100 : 0;
      });

      setDayStats(Object.values(dayStatsMap));

      // Fetch recent emails
      const { data: recent } = await supabase
        .from('email_sequence_log')
        .select('*')
        .eq('sequence_type', 'warrior_power')
        .order('sent_at', { ascending: false })
        .limit(10);

      setRecentEmails(recent || []);
    } catch (error) {
      console.error('Error fetching email stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const dayNames: Record<number, string> = {
    1: 'Rezultate',
    2: 'Challenge 7 Zile',
    3: 'Dimensiune Slabă',
    4: 'Rutina Campionilor',
    5: 'AI Coach',
    6: 'Brotherhood',
    7: 'Ofertă Specială'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📧 Email Analytics - Warrior Power</h2>
        <button 
          onClick={fetchStats}
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              Total Trimise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_sent || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.open_rate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">{stats?.total_opened} deschise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-purple-500" />
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.click_rate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">{stats?.total_clicked} click-uri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              Unsubscribe Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unsubscribe_rate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">{stats?.total_unsubscribed} dezabonări</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Day Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performanță per Email
          </CardTitle>
          <CardDescription>
            Statistici pentru fiecare email din secvența de 7 zile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Ziua</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-right py-2 font-medium">Trimise</th>
                  <th className="text-right py-2 font-medium">Open Rate</th>
                  <th className="text-right py-2 font-medium">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {dayStats.map(day => (
                  <tr key={day.day_number} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-medium">Ziua {day.day_number}</td>
                    <td className="py-3 text-muted-foreground">{dayNames[day.day_number]}</td>
                    <td className="py-3 text-right">{day.sent}</td>
                    <td className="py-3 text-right">
                      <span className={day.open_rate >= 30 ? 'text-green-500' : day.open_rate >= 15 ? 'text-yellow-500' : 'text-red-500'}>
                        {day.open_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={day.click_rate >= 5 ? 'text-green-500' : day.click_rate >= 2 ? 'text-yellow-500' : 'text-red-500'}>
                        {day.click_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Emailuri Recente
          </CardTitle>
          <CardDescription>
            Ultimele 10 emailuri trimise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentEmails.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nu există emailuri trimise încă.
              </p>
            ) : (
              recentEmails.map(email => (
                <div 
                  key={email.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      email.opened_at ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">{email.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Ziua {email.day_number} • {format(new Date(email.sent_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {email.opened_at && (
                      <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded">
                        Deschis
                      </span>
                    )}
                    {email.clicked_at && (
                      <span className="bg-purple-500/20 text-purple-500 px-2 py-1 rounded">
                        Click
                      </span>
                    )}
                    {email.unsubscribed_at && (
                      <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded">
                        Dezabonat
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
