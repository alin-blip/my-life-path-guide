import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Mic } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface VoiceSessionsListProps {
  sessions: any[];
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  formatStackType: (stackType: string) => string;
}

export const VoiceSessionsList: React.FC<VoiceSessionsListProps> = ({
  sessions,
  selectedSessionId,
  onSessionSelect,
  formatStackType
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {sessions.map((session) => (
        <Button
          key={session.sessionId}
          variant={selectedSessionId === session.sessionId ? "default" : "outline"}
          className="w-full justify-start h-auto p-4 hover:bg-accent/50 transition-colors"
          onClick={() => onSessionSelect(session.sessionId)}
        >
          <div className="flex flex-col items-start gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-sm">
                {formatStackType(session.stackType)}
              </span>
              <Badge variant="secondary" className="text-xs">
                {session.totalQuestions} întrebări
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground w-full">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(session.totalDuration)}
              </div>
              <div className="flex items-center gap-1">
                <Mic className="w-3 h-3" />
                {formatDistanceToNow(new Date(session.createdAt), {
                  addSuffix: true,
                  locale: ro
                })}
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
};
