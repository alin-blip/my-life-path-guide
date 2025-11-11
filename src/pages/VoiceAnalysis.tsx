import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoiceSessionsList } from '@/components/voice-analysis/VoiceSessionsList';
import { VoiceSessionDetails } from '@/components/voice-analysis/VoiceSessionDetails';
import { VoiceAnalyticsStats } from '@/components/voice-analysis/VoiceAnalyticsStats';
import { voiceRecordingService } from '@/services/voiceRecordingService';
import { supabase } from '@/integrations/supabase/client';
import { Mic, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VoiceAnalysis() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalRecordings: 0,
    totalDuration: 0,
    completedSessions: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all recordings grouped by session
      const { data: recordings, error } = await supabase
        .from('voice_recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by session_id and stack_type
      const sessionsMap = new Map();
      let totalDuration = 0;

      recordings?.forEach((recording) => {
        const key = `${recording.session_id}-${recording.stack_type}`;
        if (!sessionsMap.has(key)) {
          sessionsMap.set(key, {
            sessionId: recording.session_id,
            stackType: recording.stack_type,
            recordings: [],
            createdAt: recording.created_at,
            totalQuestions: 0,
            totalDuration: 0
          });
        }
        
        const session = sessionsMap.get(key);
        session.recordings.push(recording);
        session.totalQuestions = session.recordings.length;
        session.totalDuration += recording.duration_seconds || 0;
        totalDuration += recording.duration_seconds || 0;
      });

      const sessionsList = Array.from(sessionsMap.values());
      setSessions(sessionsList);

      // Calculate stats
      setStats({
        totalSessions: sessionsList.length,
        totalRecordings: recordings?.length || 0,
        totalDuration: Math.round(totalDuration),
        completedSessions: sessionsList.filter(s => s.totalQuestions >= 5).length
      });

    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca sesiunile vocale.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId === selectedSessionId ? null : sessionId);
  };

  const formatStackType = (stackType: string) => {
    const types: Record<string, string> = {
      'anger': 'Alchimia Furiei',
      'divine-prayer': 'Dialogul cu Divinitatea',
      'ai-live': 'Oracolul Înțelepciunii',
      'hormozi-coaching': 'Imperiul de Business',
      'gods-school': 'Școala Zeilor'
    };
    return types[stackType] || stackType;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Analiza Înregistrărilor Vocale
          </h1>
          <p className="text-muted-foreground">
            Analizează răspunsurile tale vocale și urmărește progresul în sesiunile de transformare
          </p>
        </div>

        {/* Statistics Cards */}
        <VoiceAnalyticsStats stats={stats} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Sesiuni Vocale
                </CardTitle>
                <CardDescription>
                  {sessions.length} {sessions.length === 1 ? 'sesiune' : 'sesiuni'} înregistrate
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Nu ai încă înregistrări vocale
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Începe un stack în modul audio pentru a crea prima înregistrare
                    </p>
                  </div>
                ) : (
                  <VoiceSessionsList
                    sessions={sessions}
                    selectedSessionId={selectedSessionId}
                    onSessionSelect={handleSessionSelect}
                    formatStackType={formatStackType}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSessionId ? (
              <VoiceSessionDetails
                session={sessions.find(s => s.sessionId === selectedSessionId)}
                formatStackType={formatStackType}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Mic className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Selectează o sesiune
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Alege o sesiune din lista din stânga pentru a vedea detalii, transcripturi și a asculta înregistrările
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
