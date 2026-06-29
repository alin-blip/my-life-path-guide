import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Heart, Brain } from 'lucide-react';
import { MarriageSession } from '@/services/marriageService';

interface Props {
  session: MarriageSession;
}

export const RelationalTriangle: React.FC<Props> = ({ session }) => {
  const cards = [
    {
      title: 'Tu (Antreprenorul)',
      subtitle: 'Iluzia / Filtrul distorsionat',
      content: session.perspective_husband,
      icon: User,
      accent: 'border-l-4 border-l-muted-foreground',
    },
    {
      title: 'Partener (Realitatea Resimțită)',
      subtitle: 'Ce trăiește celălalt',
      content: session.perspective_wife,
      icon: Heart,
      accent: 'border-l-4 border-l-destructive/60',
    },
    {
      title: 'AI Coach',
      subtitle: 'Adevărul obiectiv',
      content: session.perspective_coach,
      icon: Brain,
      accent: 'border-l-4 border-l-primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <Card key={i} className={`p-5 ${c.accent} bg-card`}>
          <div className="flex items-center gap-2 mb-3">
            <c.icon className="h-5 w-5 text-primary" />
            <div>
              <div className="font-display font-semibold text-base">{c.title}</div>
              <Badge variant="outline" className="text-[10px] mt-0.5">{c.subtitle}</Badge>
            </div>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{c.content || '—'}</p>
        </Card>
      ))}
    </div>
  );
};
