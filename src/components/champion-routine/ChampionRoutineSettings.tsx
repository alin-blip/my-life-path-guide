import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, User, Heart, Briefcase, Dumbbell, Sparkles, Save, ListOrdered } from 'lucide-react';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { StepsOrderEditor } from './StepsOrderEditor';

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
  const [autosuggestion, setAutosuggestion] = useState('');
  const [activeSteps, setActiveSteps] = useState<string[]>([]);
  const [stepsOrder, setStepsOrder] = useState<string[]>([]);

  // Initialize state from settings
  useEffect(() => {
    if (settings) {
      setAutosuggestion(settings.default_autosuggestion || 'Every day, in every way, I am getting better and better.');
      setActiveSteps(settings.active_steps || []);
      setStepsOrder(settings.routine_steps_order || []);
    }
  }, [settings]);

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

  const handleSaveStepsOrder = async () => {
    await saveSettings({ 
      routine_steps_order: stepsOrder,
      active_steps: activeSteps
    });
    toast.success('Ordinea pașilor salvată');
  };

  const handleSaveAndClose = async () => {
    await saveSettings({ 
      is_configured: true,
      routine_steps_order: stepsOrder,
      active_steps: activeSteps
    });
    toast.success('Setări salvate!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Personalizează Rutina de Campion</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="steps" className="gap-2">
              <ListOrdered className="h-4 w-4" />
              Pași
            </TabsTrigger>
            <TabsTrigger value="people" className="gap-2">
              <Heart className="h-4 w-4" />
              Persoane
            </TabsTrigger>
            <TabsTrigger value="autosuggestion" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Autosugestie
            </TabsTrigger>
          </TabsList>

          {/* Steps Order Tab */}
          <TabsContent value="steps" className="space-y-4 mt-4">
            <StepsOrderEditor
              activeSteps={activeSteps}
              stepsOrder={stepsOrder}
              onActiveStepsChange={setActiveSteps}
              onStepsOrderChange={setStepsOrder}
            />
            <Button onClick={handleSaveStepsOrder} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Salvează Ordinea
            </Button>
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="space-y-4 mt-4">
            <Card className="p-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Persoane Importante
              </h3>
              
              {/* Existing People */}
              <div className="space-y-2">
                {people.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nu ai adăugat persoane. Adaugă persoanele importante din viața ta.
                  </p>
                )}
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
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
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
          </TabsContent>

          {/* Autosuggestion Tab */}
          <TabsContent value="autosuggestion" className="space-y-4 mt-4">
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
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Button onClick={handleSaveAndClose} className="w-full mt-4" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Salvează și Închide
        </Button>
      </DialogContent>
    </Dialog>
  );
}
