import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { EmotionalCheckin } from '@/components/emotional/EmotionalCheckin';
import { EmotionalTimeline } from '@/components/emotional/EmotionalTimeline';
import { PatternAlert } from '@/components/emotional/PatternAlert';
import { WeeklyReport } from '@/components/emotional/WeeklyReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, TrendingUp, Brain, FileText } from 'lucide-react';

export default function EmotionalTracker() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCheckinSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Emotional Tracker</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Urmărește-ți emoțiile, descoperă pattern-uri și dezvoltă-ți inteligența emoțională
          </p>
        </div>

        {/* Check-in Card */}
        <EmotionalCheckin onSuccess={handleCheckinSuccess} />

        {/* Tabs for different views */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline" className="text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs sm:text-sm">
              <Brain className="h-4 w-4 mr-1 hidden sm:inline" />
              Pattern-uri
            </TabsTrigger>
            <TabsTrigger value="report" className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 mr-1 hidden sm:inline" />
              Raport
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <EmotionalTimeline refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="patterns" className="mt-4">
            <PatternAlert refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="report" className="mt-4">
            <WeeklyReport />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
