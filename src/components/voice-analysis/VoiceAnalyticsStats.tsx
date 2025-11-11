import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface VoiceAnalyticsStatsProps {
  stats: {
    totalSessions: number;
    totalRecordings: number;
    totalDuration: number;
    completedSessions: number;
  };
}

export const VoiceAnalyticsStats: React.FC<VoiceAnalyticsStatsProps> = ({ stats }) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const statsCards = [
    {
      title: 'Sesiuni Totale',
      value: stats.totalSessions,
      icon: Mic,
      color: 'text-primary'
    },
    {
      title: 'Înregistrări',
      value: stats.totalRecordings,
      icon: TrendingUp,
      color: 'text-accent'
    },
    {
      title: 'Timp Total',
      value: formatDuration(stats.totalDuration),
      icon: Clock,
      color: 'text-muted-foreground'
    },
    {
      title: 'Sesiuni Complete',
      value: stats.completedSessions,
      icon: CheckCircle,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
