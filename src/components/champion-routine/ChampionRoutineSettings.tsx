import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, User, Heart, Briefcase, Dumbbell, Sparkles, Save, ListOrdered, Link2, Settings2 } from 'lucide-react';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { useDailyHabits } from '@/hooks/useDailyHabits';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { StepsOrderEditor } from './StepsOrderEditor';
import { HabitSettingsPanel } from '@/components/habits/HabitSettingsPanel';

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
  const { habits, addHabit, updateHabit, deleteHabit, reorderHabits, refetch: refetchHabits } = useDailyHabits();
  
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonType, setNewPersonType] = useState('partner');
  const [autosuggestion, setAutosuggestion] = useState('');
  const [activeSteps, setActiveSteps] = useState<string[]>([]);
  const [stepsOrder, setStepsOrder] = useState<string[]>([]);
  const [habitSteps, setHabitSteps] = useState<string[]>([]);
  const [includeDailyTasks, setIncludeDailyTasks] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const ALL_STEP_IDS = [
    'emotionalCheck', 'lightExposure', 'hydration', 'breathing', 'meditation', 'gratitude',
    'visualization', 'autosuggestion', 'journaling', 'reading',
    'exercise', 'mealPlanning', 'contentCreation', 'dailyTasks', 'relationships'
  ];

  // Initialize state from settings
  useEffect(() => {
    if (settings) {
      setAutosuggestion(settings.default_autosuggestion || 'Every day, in every way, I am getting better and better.');
      setActiveSteps(
        settings.active_steps && settings.active_steps.length > 0 
          ? settings.active_steps 
          : ALL_STEP_IDS
      );
      setStepsOrder(
        settings.routine_steps_order && settings.routine_steps_order.length > 0 
          ? settings.routine_steps_order 
          : ALL_STEP_IDS
      );
      setHabitSteps(settings.habit_steps || []);
      setIncludeDailyTasks(settings.include_daily_tasks !== false);
    } else {
      // First time setup - set defaults
      setActiveSteps(ALL_STEP_IDS);
      setStepsOrder(ALL_STEP_IDS);
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
    setIsSaving(true);
    try {
      await updateAutosuggestion(autosuggestion);
      toast.success('Autosugestie salvată');
    } catch (err) {
      toast.error('Eroare la salvare autosugestie');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStepsOrder = async () => {
    setIsSaving(true);
    try {
      const { error } = await saveSettings({ 
        routine_steps_order: stepsOrder,
        active_steps: activeSteps,
        habit_steps: habitSteps,
        include_daily_tasks: includeDailyTasks
      });
      
      if (error) {
        console.error('Save settings error:', error);
        toast.error('Eroare la salvare. Încearcă din nou.');
      } else {
        toast.success('Ordinea pașilor salvată');
      }
    } catch (err) {
      console.error('Save settings exception:', err);
      toast.error('Eroare la salvare');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHabitStepToggle = (stepId: string, checked: boolean) => {
    if (checked) {
      setHabitSteps([...habitSteps, stepId]);
    } else {
      setHabitSteps(habitSteps.filter(s => s !== stepId));
    }
  };

  const handleSaveAndClose = async () => {
    setIsSaving(true);
    try {
      const { error } = await saveSettings({ 
        is_configured: true,
        routine_steps_order: stepsOrder,
        active_steps: activeSteps,
        habit_steps: habitSteps,
        include_daily_tasks: includeDailyTasks
      });
      
      if (error) {
        console.error('Save and close error:', error);
        toast.error('Eroare la salvare. Încearcă din nou.');
      } else {
        toast.success('Setări salvate!');
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Save and close exception:', err);
      toast.error('Eroare la salvare');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Personalizează Rutina de Campion</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="steps" className="gap-1 text-xs px-2">
              <ListOrdered className="h-4 w-4" />
              <span className="hidden sm:inline">Pași</span>
            </TabsTrigger>
            <TabsTrigger value="sync" className="gap-1 text-xs px-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Sync</span>
            </TabsTrigger>
            <TabsTrigger value="habits" className="gap-1 text-xs px-2">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Habits</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="gap-1 text-xs px-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Persoane</span>
            </TabsTrigger>
            <TabsTrigger value="autosuggestion" className="gap-1 text-xs px-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Auto</span>
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
            <Button onClick={handleSaveStepsOrder} className="w-full" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Se salvează...' : 'Salvează Ordinea'}
            </Button>
          </TabsContent>

          {/* Sync Tab */}
          <TabsContent value="sync" className="space-y-4 mt-4">
            <Card className="p-4 space-y-6">
              <h3 className="font-medium flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-500" />
                Sincronizare Habits & Tasks
              </h3>
              
              {/* Include Today's Tasks */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="include-tasks">Include Sarcinile de Azi în rutină</Label>
                  <p className="text-xs text-muted-foreground">
                    Adaugă sarcinile ca pas final înainte de finalizare
                  </p>
                </div>
                <Switch 
                  id="include-tasks"
                  checked={includeDailyTasks} 
                  onCheckedChange={setIncludeDailyTasks} 
                />
              </div>
              
              {/* Habit Categories to Include */}
              <div className="space-y-3">
                <div>
                  <Label>Categorii de habits în rutină</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selectează categoriile care să apară ca pași în rutina de campion
                  </p>
                </div>
                
                <div className="space-y-2">
                  {[
                    { id: 'habit_body', label: 'Corp', icon: Dumbbell, color: 'text-red-500' },
                    { id: 'habit_being', label: 'Spirit', icon: Sparkles, color: 'text-purple-500' },
                    { id: 'habit_balance', label: 'Relații', icon: Heart, color: 'text-pink-500' },
                    { id: 'habit_business', label: 'Business', icon: Briefcase, color: 'text-blue-500' },
                  ].map(({ id, label, icon: Icon, color }) => (
                    <div key={id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Checkbox 
                        id={id}
                        checked={habitSteps.includes(id)}
                        onCheckedChange={(checked) => handleHabitStepToggle(id, checked === true)}
                      />
                      <Icon className={`h-4 w-4 ${color}`} />
                      <Label htmlFor={id} className="cursor-pointer flex-1">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            <Button onClick={handleSaveStepsOrder} className="w-full" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Se salvează...' : 'Salvează Sincronizarea'}
            </Button>
          </TabsContent>

          {/* Habits Tab - NEW */}
          <TabsContent value="habits" className="space-y-4 mt-4">
            <Card className="p-4">
              <h3 className="font-medium flex items-center gap-2 mb-4">
                <Settings2 className="h-5 w-5 text-amber-500" />
                Configurare Habits
              </h3>
              <HabitSettingsPanel
                habits={habits}
                onAdd={addHabit}
                onUpdate={updateHabit}
                onDelete={deleteHabit}
                onReorder={reorderHabits}
              />
            </Card>
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

              <Button onClick={handleSaveAutosuggestion} className="w-full" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Se salvează...' : 'Salvează Autosugestia'}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Button onClick={handleSaveAndClose} className="w-full mt-4" size="lg" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Se salvează...' : 'Salvează și Închide'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
