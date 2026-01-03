import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Moon, MessageSquare, Heart, Calendar, Check, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TomorrowTask {
  id: string;
  title: string;
  completed: boolean;
}

export const EveningRoutineCard: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('reflection');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reflection state
  const [doneWell, setDoneWell] = useState('');
  const [notDone, setNotDone] = useState('');
  const [learned, setLearned] = useState('');

  // Gratitude state
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['', '', '']);

  // Tomorrow tasks state
  const [tomorrowTasks, setTomorrowTasks] = useState<TomorrowTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [eveningCompleted, setEveningCompleted] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrowDayOfWeek = format(addDays(new Date(), 1), 'EEEE').toLowerCase();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Load evening routine data from champion_routine_logs
      const { data: routineData } = await supabase
        .from('champion_routine_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .maybeSingle();

      if (routineData) {
        setDoneWell(routineData.evening_reflection_done_well || '');
        setNotDone(routineData.evening_reflection_not_done || '');
        setLearned(routineData.evening_reflection_learned || '');
        setEveningCompleted(routineData.evening_completed || false);
        
        // Parse gratitude items
        const gratitude = routineData.gratitude_items as string[] | null;
        if (gratitude && Array.isArray(gratitude)) {
          setGratitudeItems([...gratitude, '', '', ''].slice(0, 3));
        }
      }

      // Load tomorrow's tasks from hot_list_items
      const weekKey = getWeekKey(addDays(new Date(), 1));
      const { data: tasksData } = await supabase
        .from('hot_list_items')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('week_key', weekKey)
        .eq('day_of_week', tomorrowDayOfWeek)
        .order('priority', { ascending: true });

      if (tasksData) {
        setTomorrowTasks(tasksData.map(t => ({
          id: t.id,
          title: t.title,
          completed: t.completed || false
        })));
      }
    } catch (error) {
      console.error('Error loading evening routine data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekKey = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: language === 'en' ? 'Error' : 'Eroare',
          description: language === 'en' ? 'Please log in to save' : 'Trebuie să fii autentificat',
          variant: 'destructive'
        });
        return;
      }

      // Upsert evening routine data
      const { error } = await supabase
        .from('champion_routine_logs')
        .upsert({
          user_id: session.user.id,
          date: today,
          evening_reflection_done_well: doneWell,
          evening_reflection_not_done: notDone,
          evening_reflection_learned: learned,
          gratitude_items: gratitudeItems.filter(g => g.trim() !== ''),
          evening_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      setEveningCompleted(true);
      toast({
        title: language === 'en' ? 'Saved!' : 'Salvat!',
        description: language === 'en' ? 'Evening routine completed' : 'Rutina de seară completată'
      });
    } catch (error) {
      console.error('Error saving evening routine:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save' : 'Nu am putut salva',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const weekKey = getWeekKey(addDays(new Date(), 1));
      const { data, error } = await supabase
        .from('hot_list_items')
        .insert({
          user_id: session.user.id,
          week_key: weekKey,
          day_of_week: tomorrowDayOfWeek,
          day: tomorrow,
          title: newTaskTitle.trim(),
          item_id: crypto.randomUUID(),
          list_type: 'hit',
          completed: false,
          priority: tomorrowTasks.length + 1
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTomorrowTasks([...tomorrowTasks, {
          id: data.id,
          title: data.title,
          completed: false
        }]);
        setNewTaskTitle('');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('hot_list_items')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTomorrowTasks(tomorrowTasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tomorrowTasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('hot_list_items')
        .update({ completed: !task.completed })
        .eq('id', taskId);

      if (error) throw error;

      setTomorrowTasks(tomorrowTasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const updateGratitudeItem = (index: number, value: string) => {
    const newItems = [...gratitudeItems];
    newItems[index] = value;
    setGratitudeItems(newItems);
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-lg">
              {language === 'en' ? 'Evening Routine' : 'Rutina de Seară'}
            </CardTitle>
            {eveningCompleted && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                ✓ {language === 'en' ? 'Completed' : 'Completat'}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="reflection" className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{language === 'en' ? 'Reflection' : 'Reflecție'}</span>
            </TabsTrigger>
            <TabsTrigger value="gratitude" className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{language === 'en' ? 'Gratitude' : 'Recunoștință'}</span>
            </TabsTrigger>
            <TabsTrigger value="tomorrow" className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{language === 'en' ? 'Tomorrow' : 'Mâine'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reflection" className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                {language === 'en' ? 'What did I do well today?' : 'Ce am făcut bine azi?'}
              </label>
              <Textarea
                value={doneWell}
                onChange={(e) => setDoneWell(e.target.value)}
                placeholder={language === 'en' ? 'My wins and achievements...' : 'Victoriile și realizările mele...'}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                {language === 'en' ? "What didn't I do?" : 'Ce nu am făcut?'}
              </label>
              <Textarea
                value={notDone}
                onChange={(e) => setNotDone(e.target.value)}
                placeholder={language === 'en' ? 'Things I missed or postponed...' : 'Lucruri pe care le-am ratat sau amânat...'}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                {language === 'en' ? 'What did I learn?' : 'Ce am învățat?'}
              </label>
              <Textarea
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                placeholder={language === 'en' ? 'Insights and lessons...' : 'Perspective și lecții...'}
                className="min-h-[80px] resize-none"
              />
            </div>
          </TabsContent>

          <TabsContent value="gratitude" className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              {language === 'en' 
                ? 'Write 3 things you are grateful for today:' 
                : 'Scrie 3 lucruri pentru care ești recunoscător azi:'}
            </p>
            {gratitudeItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-lg">{['💜', '💙', '💚'][index]}</span>
                <Input
                  value={item}
                  onChange={(e) => updateGratitudeItem(index, e.target.value)}
                  placeholder={`${language === 'en' ? 'I am grateful for' : 'Sunt recunoscător pentru'}...`}
                  className="flex-1"
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tomorrow" className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Tasks for' : 'Taskuri pentru'}{' '}
                <span className="font-medium text-foreground">
                  {format(addDays(new Date(), 1), 'EEEE, d MMMM', { locale: language === 'ro' ? ro : undefined })}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              {tomorrowTasks.length > 0 ? (
                tomorrowTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md transition-all",
                      task.completed ? "bg-green-500/10" : "bg-muted/50"
                    )}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                        task.completed
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground/50 hover:border-primary"
                      )}
                    >
                      {task.completed && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <span className={cn(
                      "flex-1 text-sm",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic py-4 text-center">
                  {language === 'en' ? 'No tasks for tomorrow yet' : 'Nu ai taskuri pentru mâine încă'}
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={language === 'en' ? 'Add a task for tomorrow...' : 'Adaugă un task pentru mâine...'}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <Button size="icon" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          className="w-full mt-4" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          {language === 'en' ? 'Save Evening Routine' : 'Salvează Rutina de Seară'}
        </Button>
      </CardContent>
    </Card>
  );
};
