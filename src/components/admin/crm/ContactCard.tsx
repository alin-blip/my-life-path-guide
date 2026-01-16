import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Flame, Target, TrendingUp, Clock, 
  Crown, Zap, User 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ContactCardProps {
  contact: {
    id: string;
    email: string;
    name: string | null;
    lead_score: number;
    lead_source: string | null;
    warrior_power_score: number | null;
    current_streak: number;
    door_completion_rate: number;
    lifetime_value: number;
    last_activity_at: string | null;
    tags: string[] | null;
  };
  onClick: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onClick }) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const getSourceBadge = (source: string | null) => {
    if (!source) return null;
    const sourceMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      'warrior_power': { label: 'Warrior Power', variant: 'default' },
      'vision_2026': { label: 'Vision 2026', variant: 'secondary' },
      'life_score': { label: 'Life Score', variant: 'outline' },
      'challenge': { label: 'Challenge', variant: 'default' }
    };
    return sourceMap[source] || { label: source, variant: 'outline' as const };
  };

  const sourceBadge = getSourceBadge(contact.lead_source);

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {contact.name || contact.email.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {contact.email}
                </p>
              </div>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(contact.lead_score)}`}>
              {contact.lead_score}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {contact.warrior_power_score && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-purple-500" />
                <span>{contact.warrior_power_score}</span>
              </div>
            )}
            {contact.current_streak > 0 && (
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>{contact.current_streak}d</span>
              </div>
            )}
            {contact.door_completion_rate > 0 && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-green-500" />
                <span>{contact.door_completion_rate.toFixed(0)}%</span>
              </div>
            )}
            {contact.lifetime_value > 0 && (
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-yellow-500" />
                <span>{contact.lifetime_value} RON</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {sourceBadge && (
                <Badge variant={sourceBadge.variant} className="text-xs">
                  {sourceBadge.label}
                </Badge>
              )}
            </div>
            {contact.last_activity_at && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(contact.last_activity_at), { 
                    addSuffix: true, 
                    locale: ro 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
