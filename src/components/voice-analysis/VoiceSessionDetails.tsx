import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceRecordingPlayer } from './VoiceRecordingPlayer';
import { SessionInsights } from './SessionInsights';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Mic, Calendar, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface VoiceSessionDetailsProps {
  session: any;
  formatStackType: (stackType: string) => string;
}

export const VoiceSessionDetails: React.FC<VoiceSessionDetailsProps> = ({
  session,
  formatStackType
}) => {
  if (!session) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">
              {formatStackType(session.stackType)}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(session.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ro })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(session.totalDuration)}
              </span>
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {session.totalQuestions} întrebări
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recordings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recordings" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Înregistrări
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Insights AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recordings" className="mt-6">
            <div className="space-y-4">
              {session.recordings
                .sort((a: any, b: any) => (a.question_number || 0) - (b.question_number || 0))
                .map((recording: any, index: number) => (
                  <div key={recording.id}>
                    <VoiceRecordingPlayer recording={recording} index={index} />
                    {index < session.recordings.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <SessionInsights session={session} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
