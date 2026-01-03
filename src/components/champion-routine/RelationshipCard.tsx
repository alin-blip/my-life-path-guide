import React from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface RelationshipCardProps {
  personId: string;
  personName: string;
  relationshipType: string;
  action: string;
  completed: boolean;
  onActionChange: (action: string) => void;
  onCompletedChange: (completed: boolean) => void;
}

const RELATIONSHIP_EXAMPLES: Record<string, string[]> = {
  partner: [
    'Un compliment sincer despre calitățile sale',
    'Un mesaj de apreciere neașteptat',
    'O îmbrățișare mai lungă de 20 de secunde',
    'Ascultare activă fără telefon',
  ],
  child: [
    'Timp exclusiv de joacă împreună',
    'O conversație despre visurile lor',
    'Citit o poveste împreună',
    'Un compliment specific despre realizările lor',
  ],
  parent: [
    'Un apel telefonic să îi întrebi cum se simte',
    'Recunoștință pentru ce au făcut pentru tine',
    'O vizită neașteptată',
    'Să le ceri un sfat',
  ],
  friend: [
    'Un mesaj de încurajare',
    'Să îți faci timp pentru ei',
    'Să le mulțumești pentru prietenie',
    'Să îi ajuți cu ceva',
  ],
};

export function RelationshipCard({
  personId,
  personName,
  relationshipType,
  action,
  completed,
  onActionChange,
  onCompletedChange,
}: RelationshipCardProps) {
  const { t } = useLanguage();
  const examples = RELATIONSHIP_EXAMPLES[relationshipType] || RELATIONSHIP_EXAMPLES.friend;

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-blue-500/20">
            <User className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h4 className="font-medium text-foreground flex items-center gap-2">
              Ce valoare aduci astăzi în viața lui{' '}
              <span className="text-primary font-bold">{personName}</span>?
            </h4>
            <p className="text-sm text-muted-foreground">
              Cum ridici această persoană astăzi?
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pl-2 border-l-2 border-blue-500/30">
          <p className="font-medium mb-1">Exemple:</p>
          <ul className="space-y-0.5">
            {examples.slice(0, 2).map((example, i) => (
              <li key={i}>• {example}</li>
            ))}
          </ul>
        </div>

        <Textarea
          value={action}
          onChange={(e) => onActionChange(e.target.value)}
          placeholder="Ce vei face astăzi pentru această persoană..."
          className="bg-background/50 min-h-[80px]"
        />

        <div className="flex items-center gap-2">
          <Checkbox
            id={`completed-${personId}`}
            checked={completed}
            onCheckedChange={(checked) => onCompletedChange(checked === true)}
          />
          <label
            htmlFor={`completed-${personId}`}
            className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
          >
            <Heart className="h-3 w-3 text-pink-500" />
            Am făcut asta
          </label>
        </div>
      </div>
    </Card>
  );
}
