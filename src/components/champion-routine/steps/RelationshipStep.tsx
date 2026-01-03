import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, ArrowRight, Check, Users, MessageCircle, Gift, Clock } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  relationship_type: string;
}

interface RelationshipAction {
  person_id: string;
  action: string;
  completed: boolean;
}

interface RelationshipStepProps {
  people: Person[];
  actions: RelationshipAction[];
  onActionsChange: (actions: RelationshipAction[]) => void;
  onNext: () => void;
}

const SUGGESTIONS = [
  { icon: MessageCircle, text: 'Trimite un mesaj de apreciere' },
  { icon: Gift, text: 'Oferă un compliment sincer' },
  { icon: Clock, text: 'Petrece timp de calitate' },
  { icon: Heart, text: 'Arată-i că îți pasă' },
];

export function RelationshipStep({ 
  people, 
  actions, 
  onActionsChange, 
  onNext 
}: RelationshipStepProps) {
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [localActions, setLocalActions] = useState<RelationshipAction[]>([]);

  useEffect(() => {
    // Initialize local actions from props or create empty ones for each person
    const initialActions = people.map(person => {
      const existing = actions.find(a => a.person_id === person.id);
      return existing || { person_id: person.id, action: '', completed: false };
    });
    setLocalActions(initialActions);
  }, [people, actions]);

  const currentPerson = people[currentPersonIndex];
  const currentAction = localActions.find(a => a.person_id === currentPerson?.id);

  const updateAction = (personId: string, action: string) => {
    const newActions = localActions.map(a => 
      a.person_id === personId ? { ...a, action } : a
    );
    setLocalActions(newActions);
    onActionsChange(newActions);
  };

  const markCompleted = (personId: string) => {
    const newActions = localActions.map(a => 
      a.person_id === personId ? { ...a, completed: true } : a
    );
    setLocalActions(newActions);
    onActionsChange(newActions);
  };

  const handleNextPerson = () => {
    if (currentPersonIndex < people.length - 1) {
      setCurrentPersonIndex(currentPersonIndex + 1);
    } else {
      onNext();
    }
  };

  const getRelationshipLabel = (type: string) => {
    const labels: Record<string, string> = {
      partner: 'Partener/ă',
      child: 'Copil',
      parent: 'Părinte',
      friend: 'Prieten/ă',
      sibling: 'Frate/Soră',
      other: 'Altul',
    };
    return labels[type] || type;
  };

  if (!currentPerson) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-2xl p-8 text-center space-y-6">
          <Users className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Nicio persoană configurată</h2>
          <p className="text-muted-foreground">
            Adaugă persoanele importante din viața ta în setări pentru a vedea acest pas.
          </p>
          <Button onClick={onNext}>Continuă</Button>
        </Card>
      </div>
    );
  }

  const isLastPerson = currentPersonIndex === people.length - 1;
  const hasAction = currentAction?.action?.trim().length > 0;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent border-pink-500/20">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2">
          {people.map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index < currentPersonIndex 
                  ? 'bg-green-500' 
                  : index === currentPersonIndex 
                    ? 'bg-pink-500 scale-125' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Person info */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-pink-500/20 mb-4">
            <Heart className="h-12 w-12 text-pink-500" />
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              {getRelationshipLabel(currentPerson.relationship_type)}
            </span>
            <h1 className="text-3xl font-bold">{currentPerson.name}</h1>
          </div>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-medium">
              Ce valoare aduci astăzi în viața lui <span className="text-pink-500">{currentPerson.name}</span>?
            </h2>
            <p className="text-muted-foreground mt-2">
              Cum ridici această persoană astăzi?
            </p>
          </div>

          {/* Suggestions */}
          <div className="grid grid-cols-2 gap-3">
            {SUGGESTIONS.map(({ icon: Icon, text }) => (
              <button
                key={text}
                onClick={() => updateAction(currentPerson.id, text)}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left text-sm"
              >
                <Icon className="h-4 w-4 text-pink-500 flex-shrink-0" />
                <span>{text}</span>
              </button>
            ))}
          </div>

          {/* Custom input */}
          <Textarea
            placeholder={`Scrie ce vei face pentru ${currentPerson.name}...`}
            value={currentAction?.action || ''}
            onChange={(e) => updateAction(currentPerson.id, e.target.value)}
            className="min-h-[100px] bg-background/50 border-pink-500/20 focus:border-pink-500/50"
          />
        </div>

        {/* Completed checkbox */}
        {hasAction && (
          <div 
            className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
              currentAction?.completed 
                ? 'bg-green-500/20 border-2 border-green-500' 
                : 'bg-muted/30 hover:bg-muted/50'
            }`}
            onClick={() => markCompleted(currentPerson.id)}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              currentAction?.completed ? 'bg-green-500' : 'border-2 border-muted-foreground'
            }`}>
              {currentAction?.completed && <Check className="h-4 w-4 text-white" />}
            </div>
            <span>Am făcut asta pentru {currentPerson.name}</span>
          </div>
        )}

        {/* Navigation */}
        <Button 
          onClick={handleNextPerson} 
          size="lg" 
          className="w-full gap-2"
          disabled={!hasAction}
        >
          {isLastPerson ? 'Finalizează Rutina' : `Următoarea persoană`}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
