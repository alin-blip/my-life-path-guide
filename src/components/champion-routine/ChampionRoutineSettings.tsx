import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, User, Heart, Briefcase, Dumbbell, Sparkles, Save } from 'lucide-react';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface ChampionRoutineSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RELATIONSHIP_TYPES = [
  { value: 'partner', label: 'Partener/ă' },
  { value: 'child', label: 'Copil' },
  { value: 'parent', label: 'Părinte' },
  { value: 'friend', label: 'Prieten/ă' },
  { value: 'sibling', label: 'Frate/Soră' },
  { value: 'colleague', label: 'Coleg/ă' },
];

const AREAS = [
  { key: 'body', icon: Dumbbell, label: 'Body', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
  { key: 'being', icon: Sparkles, label: 'Being', color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30' },
  { key: 'balance', icon: Heart, label: 'Balance', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30' },
  { key: 'business', icon: Briefcase, label: 'Business', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
];

export function ChampionRoutineSettings({ open, onOpenChange }: ChampionRoutineSettingsProps) {
  const { t } = useLanguage();
  const { people, settings, addPerson, updatePerson, removePerson, saveSettings, updateAutosuggestion } = useChampionRoutine();
  
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonType, setNewPersonType] = useState('partner');
  const [autosuggestion, setAutosuggestion] = useState(settings?.default_autosuggestion || 'Every day, in every way, I am getting better and better.');
  const [activeArea, setActiveArea] = useState<string | null>(null);

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) {
      toast.error('Introdu un nume');
      return;
    }

    const { error } = await addPerson(newPersonName.trim(), newPersonType);
    if (error) {
      toast.error('Eroare la adăugare');
    } else {
      toast.success(`${newPersonName} a fost adăugat/ă`);
      setNewPersonName('');
    }
  };

  const handleRemovePerson = async (id: string, name: string) => {
    const { error } = await removePerson(id);
    if (error) {
      toast.error('Eroare la ștergere');
    } else {
      toast.success(`${name} a fost șters/ă`);
    }
  };

  const handleSaveAutosuggestion = async () => {
    await updateAutosuggestion(autosuggestion);
    toast.success('Autosugestie salvată');
  };

  const handleSaveAndClose = async () => {
    await saveSettings({ is_configured: true });
    toast.success('Setări salvate!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Personalizează Rutina de Campion</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Areas Grid */}
          <div className="grid grid-cols-2 gap-3">
            {AREAS.map(({ key, icon: Icon, label, color }) => (
              <Card
                key={key}
                onClick={() => setActiveArea(activeArea === key ? null : key)}
                className={`
                  p-4 cursor-pointer transition-all duration-200 hover:scale-105
                  bg-gradient-to-br ${color}
                  ${activeArea === key ? 'ring-2 ring-primary' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6" />
                  <span className="font-medium">{label}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Balance - People Management */}
          {activeArea === 'balance' && (
            <Card className="p-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Persoane Importante
              </h3>
              
              {/* Existing People */}
              <div className="space-y-2">
                {people.map((person) => (
                  <div key={person.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 font-medium">{person.name}</span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {RELATIONSHIP_TYPES.find(t => t.value === person.relationship_type)?.label || person.relationship_type}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePerson(person.id, person.name)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Person */}
              <div className="flex gap-2">
                <Input
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Nume..."
                  className="flex-1"
                />
                <Select value={newPersonType} onValueChange={setNewPersonType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddPerson} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Being - Autosuggestion */}
          {activeArea === 'being' && (
            <Card className="p-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Autosugestie Personalizată
              </h3>
              
              <Textarea
                value={autosuggestion}
                onChange={(e) => setAutosuggestion(e.target.value)}
                placeholder="Scrie afirmația ta zilnică..."
                className="min-h-[100px]"
              />
              
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Sugestii:</p>
                <ul className="space-y-1 text-xs">
                  <li>• "Every day, in every way, I am getting better and better."</li>
                  <li>• "Sunt plin de energie, sănătate și vitalitate."</li>
                  <li>• "Atrag abundență și succes în viața mea."</li>
                </ul>
              </div>

              <Button onClick={handleSaveAutosuggestion} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvează Autosugestia
              </Button>
            </Card>
          )}

          {/* Body - Info */}
          {activeArea === 'body' && (
            <Card className="p-4">
              <h3 className="font-medium flex items-center gap-2 mb-3">
                <Dumbbell className="h-5 w-5 text-orange-500" />
                Body - Fitness & Sănătate
              </h3>
              <p className="text-sm text-muted-foreground">
                Această secțiune include pași pentru apă, lumină naturală, exerciții și activitate fizică.
                Poți alege între Workout, Running, Cycling sau Walking în rutina zilnică.
              </p>
            </Card>
          )}

          {/* Business - Info */}
          {activeArea === 'business' && (
            <Card className="p-4">
              <h3 className="font-medium flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Business - Productivitate
              </h3>
              <p className="text-sm text-muted-foreground">
                Această secțiune include definirea priorităților zilnice (Top 3) și vizualizarea succesului.
              </p>
            </Card>
          )}

          {/* Save Button */}
          <Button onClick={handleSaveAndClose} className="w-full" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Salvează și Închide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
