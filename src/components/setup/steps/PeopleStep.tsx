import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, Heart, Briefcase, GraduationCap, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Person {
  id: string;
  name: string;
  relationship_type: string;
}

interface PeopleStepProps {
  people: Person[];
  onAddPerson: (name: string, type: string) => Promise<void>;
  onRemovePerson: (id: string) => Promise<void>;
}

const RELATIONSHIP_TYPES = [
  { value: 'family', label: 'Familie', icon: Heart, color: 'text-rose-500' },
  { value: 'friend', label: 'Prieten', icon: Users, color: 'text-blue-500' },
  { value: 'colleague', label: 'Coleg', icon: Briefcase, color: 'text-amber-500' },
  { value: 'mentor', label: 'Mentor', icon: GraduationCap, color: 'text-purple-500' },
  { value: 'other', label: 'Altul', icon: UserCheck, color: 'text-muted-foreground' },
];

export function PeopleStep({ people, onAddPerson, onRemovePerson }: PeopleStepProps) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('family');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsAdding(true);
    try {
      await onAddPerson(newName.trim(), newType);
      setNewName('');
    } finally {
      setIsAdding(false);
    }
  };

  const getTypeInfo = (type: string) => {
    return RELATIONSHIP_TYPES.find(t => t.value === type) || RELATIONSHIP_TYPES[4];
  };

  // Group people by type
  const groupedPeople = people.reduce((acc, person) => {
    const type = person.relationship_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(person);
    return acc;
  }, {} as Record<string, Person[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Persoane Importante</h2>
          <p className="text-muted-foreground text-sm">Pentru pasul de relații din rutina de dimineață</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Adaugă Persoană</CardTitle>
          <CardDescription>
            Adaugă persoanele cărora vrei să le trimiți mesaje sau să petreci timp de calitate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Nume persoană"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-4 h-4", type.color)} />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={!newName.trim() || isAdding}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {people.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nu ai adăugat încă nicio persoană. Adaugă familia, prietenii sau mentorii tăi pentru a menține relațiile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {RELATIONSHIP_TYPES.map((type) => {
            const typePeople = groupedPeople[type.value] || [];
            if (typePeople.length === 0) return null;
            
            const Icon = type.icon;
            return (
              <Card key={type.value}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", type.color)} />
                    {type.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {typePeople.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <span className="text-sm font-medium">{person.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemovePerson(person.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">🤝 De ce sunt importante relațiile?</h4>
        <p className="text-sm text-muted-foreground">
          Studiile arată că menținerea relațiilor puternice contribuie la longevitate și fericire.
          În fiecare dimineață, vei primi sugestii să contactezi sau să petreci timp cu aceste persoane.
        </p>
      </div>
    </div>
  );
}
