import { useState, useEffect } from "react";
import { TimeEntry } from "@/components/time/TimeEntry";
import { TimeStats } from "@/components/time/TimeStats";
import { TimeTimeline } from "@/components/time/TimeTimeline";
import { BurnoutAlert } from "@/components/time/BurnoutAlert";
import { WeeklyROIReport } from "@/components/time/WeeklyROIReport";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, TrendingUp, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TimeCategory } from "@/components/time/CategoryPicker";
import { startOfWeek, format } from "date-fns";

interface TimeEntryData {
  id: string;
  category: TimeCategory;
  activity: string;
  duration_minutes: number;
  energy_before: number | null;
  energy_after: number | null;
  satisfaction: number | null;
  was_planned: boolean | null;
  started_at: string | null;
  created_at: string;
}

interface BurnoutAlertData {
  id: string;
  alert_type: 'overwork' | 'energy_drain' | 'imbalance' | 'no_recovery';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metric_value: number | null;
  recommendations: string[] | null;
}

export default function TimeTracker() {
  const [todayEntries, setTodayEntries] = useState<TimeEntryData[]>([]);
  const [weekEntries, setWeekEntries] = useState<TimeEntryData[]>([]);
  const [alerts, setAlerts] = useState<BurnoutAlertData[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

      // Fetch today's entries
      const { data: todayData } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (todayData) setTodayEntries(todayData as TimeEntryData[]);

      // Fetch week's entries
      const { data: weekData } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStart)
        .order('date', { ascending: false });

      if (weekData) setWeekEntries(weekData as TimeEntryData[]);

      // Fetch unacknowledged alerts
      const { data: alertsData } = await supabase
        .from('burnout_alerts')
        .select('*')
        .eq('user_id', user.id)
        .is('acknowledged_at', null)
        .order('created_at', { ascending: false });

      if (alertsData) setAlerts(alertsData as BurnoutAlertData[]);
    } catch (error) {
      console.error('Error fetching time data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntrySuccess = () => {
    setShowNewEntry(false);
    fetchData();
  };

  const handleDeleteEntry = (id: string) => {
    setTodayEntries(prev => prev.filter(e => e.id !== id));
    setWeekEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Time & Energy Tracker
          </h1>
          <p className="text-muted-foreground">
            Monitorizează-ți timpul și energia pentru a preveni burnout-ul
          </p>
        </div>
        <Button onClick={() => setShowNewEntry(!showNewEntry)}>
          {showNewEntry ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Anulează
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Loghează Timp
            </>
          )}
        </Button>
      </div>

      {/* Burnout Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map(alert => (
            <BurnoutAlert 
              key={alert.id} 
              alert={alert} 
              onDismiss={() => handleDismissAlert(alert.id)}
            />
          ))}
        </div>
      )}

      {/* New Entry Form */}
      {showNewEntry && (
        <TimeEntry 
          onSuccess={handleEntrySuccess} 
          onCancel={() => setShowNewEntry(false)} 
        />
      )}

      {/* Tabs */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Azi
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Săptămâna
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6 mt-6">
          <TimeStats entries={todayEntries} period="today" />
          <TimeTimeline entries={todayEntries} onDelete={handleDeleteEntry} />
        </TabsContent>

        <TabsContent value="week" className="space-y-6 mt-6">
          <TimeStats entries={weekEntries} period="week" />
          <div className="grid gap-4 md:grid-cols-2">
            <TimeTimeline 
              entries={weekEntries.slice(0, 10)} 
              onDelete={handleDeleteEntry} 
            />
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 mt-6">
          <WeeklyROIReport 
            entries={weekEntries}
            onRefresh={fetchData}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
