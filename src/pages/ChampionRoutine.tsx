import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Play, Settings, Users, Zap, ListChecks, MessageSquare, GripVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { useDailyHabits, HabitCategory } from '@/hooks/useDailyHabits';
import { useLanguage } from '@/context/LanguageContext';
import { StepsOrderEditor, ALL_STEPS } from '@/components/champion-routine/StepsOrderEditor';
import { HabitSettingsPanel } from '@/components/champion-routine/HabitSettingsPanel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const ChampionRoutine = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { 
    settings, 
    saveSettings, 
    people, 
    addPerson, 
    removePerson,
    todayLog,
    isLoading 
  } = useChampionRoutine();
  const { habits, completions } = useDailyHabits();

  const [activeSteps, setActiveSteps] = useState<string[]>(
    (settings?.active_steps as string[]) || ALL_STEPS.map(s => s.id)
  );
  const [stepsOrder, setStepsOrder] = useState<string[]>(
    (settings?.routine_steps_order as string[]) || ALL_STEPS.map(s => s.id)
  );
  const [habitSteps, setHabitSteps] = useState<string[]>(
    (settings?.habit_steps as string[]) || []
  );
  const [includeDailyTasks, setIncludeDailyTasks] = useState(
    settings?.include_daily_tasks ?? true
  );
  const [autosuggestion, setAutosuggestion] = useState(
    settings?.default_autosuggestion || ''
  );
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonType, setNewPersonType] = useState('family');

  // Calculate today's progress
  const calculateProgress = () => {
    if (!todayLog) return 0;
    
    const checkFields = [
      'breathing_completed',
      'light_exposure',
      'water_drunk',
      'exercise_completed',
      'meditation_duration_seconds',
      'visualization_completed',
      'autosuggestion_completed',
      'gratitude_items',
      'journaling_completed',
      'reading_completed'
    ];
    
    let completed = 0;
    checkFields.forEach(field => {
      const value = todayLog[field as keyof typeof todayLog];
      if (value && (typeof value === 'boolean' ? value : true)) {
        completed++;
      }
    });
    
    return Math.round((completed / checkFields.length) * 100);
  };

  const progress = calculateProgress();
  const habitsCompleted = completions.length;
  const totalHabits = habits.filter(h => h.is_active).length;

  const handleSaveSteps = async () => {
    await saveSettings({
      active_steps: activeSteps,
      routine_steps_order: stepsOrder
    });
    toast.success(language === 'ro' ? 'Pașii au fost salvați!' : 'Steps saved!');
  };

  const handleSaveHabits = async () => {
    await saveSettings({
      habit_steps: habitSteps,
      include_daily_tasks: includeDailyTasks
    });
    toast.success(language === 'ro' ? 'Setările de habits au fost salvate!' : 'Habit settings saved!');
  };

  const handleSaveAutosuggestion = async () => {
    await saveSettings({
      default_autosuggestion: autosuggestion
    });
    toast.success(language === 'ro' ? 'Autosugestia a fost salvată!' : 'Autosuggestion saved!');
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return;
    await addPerson(newPersonName.trim(), newPersonType);
    setNewPersonName('');
    toast.success(language === 'ro' ? 'Persoana a fost adăugată!' : 'Person added!');
  };

  const handleRemovePerson = async (id: string) => {
    await removePerson(id);
    toast.success(language === 'ro' ? 'Persoana a fost ștearsă!' : 'Person removed!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'ro' ? 'Rutina Campionului' : 'Champion Routine'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ro' 
              ? 'Configurează și începe rutina ta zilnică'
              : 'Configure and start your daily routine'}
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {language === 'ro' ? 'Progres Azi' : 'Today\'s Progress'}
                </span>
                <span className="text-2xl font-bold text-amber-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-amber-200/30" />
              <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                <span>🌅 {language === 'ro' ? 'Rutină' : 'Routine'}: {progress}%</span>
                <span>✅ Habits: {habitsCompleted}/{totalHabits}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                onClick={() => navigate('/daily-flow')}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                <Play className="h-5 w-5 mr-2" />
                {language === 'ro' ? 'Începe Rutina' : 'Start Routine'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {language === 'ro' ? 'Configurare Rutină' : 'Routine Configuration'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="steps" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="steps" className="text-xs sm:text-sm">
                <GripVertical className="h-4 w-4 mr-1 hidden sm:inline" />
                {language === 'ro' ? 'Pași' : 'Steps'}
              </TabsTrigger>
              <TabsTrigger value="habits" className="text-xs sm:text-sm">
                <Zap className="h-4 w-4 mr-1 hidden sm:inline" />
                Habits
              </TabsTrigger>
              <TabsTrigger value="people" className="text-xs sm:text-sm">
                <Users className="h-4 w-4 mr-1 hidden sm:inline" />
                {language === 'ro' ? 'Persoane' : 'People'}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm">
                <ListChecks className="h-4 w-4 mr-1 hidden sm:inline" />
                {language === 'ro' ? 'Task-uri' : 'Tasks'}
              </TabsTrigger>
              <TabsTrigger value="autosuggestion" className="text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4 mr-1 hidden sm:inline" />
                Auto
              </TabsTrigger>
            </TabsList>

            {/* Steps Tab */}
            <TabsContent value="steps" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'ro' 
                  ? 'Aranjează ordinea pașilor și activează/dezactivează ce dorești'
                  : 'Arrange the order of steps and toggle what you want'}
              </p>
              <StepsOrderEditor
                activeSteps={activeSteps}
                stepsOrder={stepsOrder}
                onActiveStepsChange={setActiveSteps}
                onStepsOrderChange={setStepsOrder}
              />
              <Button onClick={handleSaveSteps} className="w-full mt-4">
                {language === 'ro' ? 'Salvează Ordinea' : 'Save Order'}
              </Button>
            </TabsContent>

            {/* Habits Tab */}
            <TabsContent value="habits" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'ro' 
                  ? 'Selectează ce habits să apară în rutina de dimineață'
                  : 'Select which habits to show in the morning routine'}
              </p>
              <HabitSettingsPanel
                habitSteps={habitSteps}
                onHabitStepsChange={setHabitSteps}
              />
              <Button onClick={handleSaveHabits} className="w-full mt-4">
                {language === 'ro' ? 'Salvează Habits' : 'Save Habits'}
              </Button>
            </TabsContent>

            {/* People Tab */}
            <TabsContent value="people" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'ro' 
                  ? 'Adaugă persoanele importante pentru pasul de relații'
                  : 'Add important people for the relationships step'}
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder={language === 'ro' ? 'Nume persoană' : 'Person name'}
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
                />
                <Select value={newPersonType} onValueChange={setNewPersonType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">{language === 'ro' ? 'Familie' : 'Family'}</SelectItem>
                    <SelectItem value="friend">{language === 'ro' ? 'Prieten' : 'Friend'}</SelectItem>
                    <SelectItem value="colleague">{language === 'ro' ? 'Coleg' : 'Colleague'}</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddPerson}>
                  {language === 'ro' ? 'Adaugă' : 'Add'}
                </Button>
              </div>

              <div className="space-y-2 mt-4">
                {people.map(person => (
                  <div 
                    key={person.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{person.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({person.relationship_type})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePerson(person.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {people.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {language === 'ro' 
                      ? 'Nu ai adăugat încă persoane'
                      : 'No people added yet'}
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-base font-medium">
                    {language === 'ro' ? 'Include Task-urile Zilnice' : 'Include Daily Tasks'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ro' 
                      ? 'Afișează task-urile din Do List în rutină'
                      : 'Show Do List tasks in the routine'}
                  </p>
                </div>
                <Switch
                  checked={includeDailyTasks}
                  onCheckedChange={setIncludeDailyTasks}
                />
              </div>
              <Button onClick={handleSaveHabits} className="w-full">
                {language === 'ro' ? 'Salvează' : 'Save'}
              </Button>
            </TabsContent>

            {/* Autosuggestion Tab */}
            <TabsContent value="autosuggestion" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'ro' 
                  ? 'Setează autosugestia ta zilnică'
                  : 'Set your daily autosuggestion'}
              </p>
              <Textarea
                placeholder={language === 'ro' 
                  ? 'Scrie aici autosugestia ta...'
                  : 'Write your autosuggestion here...'}
                value={autosuggestion}
                onChange={(e) => setAutosuggestion(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <Button onClick={handleSaveAutosuggestion} className="w-full">
                {language === 'ro' ? 'Salvează Autosugestia' : 'Save Autosuggestion'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChampionRoutine;
