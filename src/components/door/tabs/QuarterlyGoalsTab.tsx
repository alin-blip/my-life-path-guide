import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Dumbbell, Brain, Heart, Briefcase, Target, CheckCircle2, Bell, Link2, LayoutGrid, GitBranch, Sparkles, Crown, Flag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { GoalReminderDialog } from '@/components/door/GoalReminderDialog';
import { LinkedMissionsSelector } from '@/components/door/LinkedMissionsSelector';
import { HierarchicalGoalsView } from '@/components/door/HierarchicalGoalsView';
import { goalRemindersService } from '@/services/goalRemindersService';
import { GoalWizardModal } from '@/components/goal-wizard/GoalWizardModal';
import { GoalCategory } from '@/types/goalWizard';
import { HierarchyBadge } from '@/components/door/HierarchyBadge';
import { useChildMissions } from '@/hooks/useHierarchyData';

interface QuarterlyGoal {
  id: string;
  category: string;
  title: string;
  description?: string;
  measurableResult?: string;
  progress: number;
  keyActions?: string[];
  hasReminder?: boolean;
  linkedMissionsCount?: number;
  parentMissionId?: string | null;
  parentMission?: {
    id: string;
    title: string;
    period: string;
  } | null;
}

const CATEGORY_CONFIG = {
  body: {
    icon: Dumbbell,
    label: { en: 'Body', ro: 'Corp' },
    description: { en: 'Health, fitness, energy', ro: 'Sănătate, fitness, energie' },
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-emerald-600/10'
  },
  being: {
    icon: Brain,
    label: { en: 'Being', ro: 'Ființă' },
    description: { en: 'Mind, spirit, growth', ro: 'Minte, spirit, creștere' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    gradient: 'from-purple-500/20 to-purple-600/10'
  },
  balance: {
    icon: Heart,
    label: { en: 'Balance', ro: 'Echilibru' },
    description: { en: 'Relationships, family', ro: 'Relații, familie' },
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    gradient: 'from-rose-500/20 to-rose-600/10'
  },
  business: {
    icon: Briefcase,
    label: { en: 'Business', ro: 'Business' },
    description: { en: 'Career, finances, impact', ro: 'Carieră, finanțe, impact' },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    gradient: 'from-blue-500/20 to-blue-600/10'
  }
};

// Child Missions Preview Component
const ChildMissionsPreview: React.FC<{
  goalId: string;
  config: typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG];
  language: string;
}> = ({ goalId, config, language }) => {
  const { children: monthlyMissions, loading } = useChildMissions(goalId, 'monthly');

  if (loading) return null;
  if (monthlyMissions.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/30 space-y-1">
      <p className="text-xs text-muted-foreground mb-1">
        {language === 'en' ? 'Monthly Missions:' : 'Misiuni Lunare:'}
      </p>
      {monthlyMissions.slice(0, 3).map((mission: any) => (
        <div key={mission.id} className="flex items-center gap-2 text-xs">
          <Flag className={cn("w-3 h-3", config.color)} />
          <span className="text-muted-foreground">{mission.period}:</span>
          <span className="text-foreground truncate">{mission.title}</span>
        </div>
      ))}
      {monthlyMissions.length > 3 && (
        <span className="text-xs text-muted-foreground">
          +{monthlyMissions.length - 3} {language === 'en' ? 'more' : 'altele'}
        </span>
      )}
    </div>
  );
};

export const QuarterlyGoalsTab: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [goals, setGoals] = useState<QuarterlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<QuarterlyGoal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy'>('grid');
  // Reminder dialog state
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderGoal, setReminderGoal] = useState<{ id: string; title: string } | null>(null);
  
  // Link missions dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkGoal, setLinkGoal] = useState<{ id: string; title: string; category: string } | null>(null);

  // Goal Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<GoalCategory>('body');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    measurableResult: '',
    progress: 0,
    keyActions: ['', '', '']
  });

  // Calculate current quarter on mount
  useEffect(() => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    setCurrentQuarter(quarter);
    setCurrentYear(now.getFullYear());
  }, []);

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const quarterKey = `Q${currentQuarter}-${currentYear}`;
        
        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('mission_type', 'quarterly')
          .eq('period', quarterKey);

        if (error) throw error;

        // Fetch parent missions for hierarchy display
        const parentIds = (data || [])
          .map((m: any) => m.parent_mission_id)
          .filter(Boolean);

        let parentMap: Record<string, any> = {};
        if (parentIds.length > 0) {
          const { data: parents } = await supabase
            .from('missions')
            .select('id, title, period')
            .in('id', parentIds);
          
          parents?.forEach((p: any) => {
            parentMap[p.id] = p;
          });
        }

        const mappedGoals: QuarterlyGoal[] = (data || []).map((m: any) => ({
          id: m.id,
          category: m.category,
          title: m.title || '',
          description: m.goal_data?.description || '',
          measurableResult: m.measurable_result || '',
          progress: m.goal_data?.progress || 0,
          keyActions: m.goal_data?.keyActions || [],
          parentMissionId: m.parent_mission_id,
          parentMission: m.parent_mission_id ? parentMap[m.parent_mission_id] : null
        }));

        setGoals(mappedGoals);
      } catch (error) {
        console.error('Error fetching quarterly goals:', error);
        toast({
          title: language === 'en' ? 'Error' : 'Eroare',
          description: language === 'en' ? 'Failed to load goals' : 'Nu s-au putut încărca obiectivele',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [currentQuarter, currentYear, language, toast]);

  const handlePreviousQuarter = () => {
    if (currentQuarter === 1) {
      setCurrentQuarter(4);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentQuarter(q => q - 1);
    }
  };

  const handleNextQuarter = () => {
    if (currentQuarter === 4) {
      setCurrentQuarter(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentQuarter(q => q + 1);
    }
  };

  const getQuarterMonths = () => {
    const months = {
      1: language === 'en' ? 'Jan - Mar' : 'Ian - Mar',
      2: language === 'en' ? 'Apr - Jun' : 'Apr - Iun',
      3: language === 'en' ? 'Jul - Sep' : 'Iul - Sep',
      4: language === 'en' ? 'Oct - Dec' : 'Oct - Dec'
    };
    return months[currentQuarter as keyof typeof months];
  };

  const handleAddGoal = (category: string) => {
    setSelectedCategory(category);
    setFormData({
      title: '',
      description: '',
      measurableResult: '',
      progress: 0,
      keyActions: ['', '', '']
    });
    setEditingGoal(null);
    setIsAddDialogOpen(true);
  };

  const handleEditGoal = (goal: QuarterlyGoal) => {
    setSelectedCategory(goal.category);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      measurableResult: goal.measurableResult || '',
      progress: goal.progress,
      keyActions: goal.keyActions?.length ? [...goal.keyActions, '', '', ''].slice(0, 3) : ['', '', '']
    });
    setEditingGoal(goal);
    setIsAddDialogOpen(true);
  };

  const handleSaveGoal = async () => {
    if (!selectedCategory || !formData.title.trim()) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const quarterKey = `Q${currentQuarter}-${currentYear}`;
      const goalData = {
        description: formData.description,
        progress: formData.progress,
        keyActions: formData.keyActions.filter(a => a.trim())
      };

      if (editingGoal) {
        // Update existing
        const { error } = await supabase
          .from('missions')
          .update({
            title: formData.title,
            measurable_result: formData.measurableResult,
            goal_data: goalData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingGoal.id);

        if (error) throw error;

        setGoals(prev => prev.map(g => 
          g.id === editingGoal.id 
            ? { ...g, ...formData, keyActions: goalData.keyActions }
            : g
        ));

        toast({
          title: language === 'en' ? 'Goal updated' : 'Obiectiv actualizat',
          description: formData.title
        });
      } else {
        // Create new
        const { data, error } = await supabase
          .from('missions')
          .insert({
            user_id: session.session.user.id,
            category: selectedCategory,
            mission_type: 'quarterly',
            period: quarterKey,
            title: formData.title,
            measurable_result: formData.measurableResult,
            goal_data: goalData
          })
          .select()
          .single();

        if (error) throw error;

        setGoals(prev => [...prev, {
          id: data.id,
          category: selectedCategory,
          title: formData.title,
          description: formData.description,
          measurableResult: formData.measurableResult,
          progress: formData.progress,
          keyActions: goalData.keyActions
        }]);

        toast({
          title: language === 'en' ? 'Goal created' : 'Obiectiv creat',
          description: formData.title
        });
      }

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save goal' : 'Nu s-a putut salva obiectivul',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== goalId));
      toast({
        title: language === 'en' ? 'Goal deleted' : 'Obiectiv șters'
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const { error } = await supabase
        .from('missions')
        .update({
          goal_data: {
            description: goal.description,
            progress: newProgress,
            keyActions: goal.keyActions
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, progress: newProgress } : g
      ));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getCategoryGoals = (category: string) => {
    return goals.filter(g => g.category === category);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Quarter Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'en' ? '90-Day Goals' : 'Obiective 90 Zile'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Focus on what matters most this quarter' : 'Concentrează-te pe ce contează cel mai mult în acest trimestru'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePreviousQuarter}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center min-w-[120px]">
            <div className="text-lg font-bold text-foreground">Q{currentQuarter} {currentYear}</div>
            <div className="text-sm text-muted-foreground">{getQuarterMonths()}</div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleNextQuarter}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
            {language === 'en' ? 'Grid' : 'Grilă'}
          </Button>
          <Button
            variant={viewMode === 'hierarchy' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setViewMode('hierarchy')}
          >
            <GitBranch className="w-4 h-4" />
            {language === 'en' ? 'Hierarchy' : 'Ierarhie'}
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'hierarchy' ? (
        <HierarchicalGoalsView 
          currentQuarter={currentQuarter} 
          currentYear={currentYear} 
        />
      ) : (
        <>
          {/* Category Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const categoryGoals = getCategoryGoals(key);
          const Icon = config.icon;
          const avgProgress = categoryGoals.length > 0
            ? Math.round(categoryGoals.reduce((sum, g) => sum + g.progress, 0) / categoryGoals.length)
            : 0;

          return (
            <Card 
              key={key} 
              className={cn(
                "overflow-hidden border-2 transition-all duration-300 hover:shadow-lg",
                config.borderColor
              )}
            >
              <CardHeader className={cn("bg-gradient-to-r", config.gradient)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl", config.bgColor)}>
                      <Icon className={cn("w-6 h-6", config.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {config.label[language === 'en' ? 'en' : 'ro']}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {config.description[language === 'en' ? 'en' : 'ro']}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className={cn("text-lg px-3 py-1", config.bgColor, config.color)}>
                    {avgProgress}%
                  </Badge>
                </div>
                
                <Progress value={avgProgress} className="h-2 mt-3" />
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {categoryGoals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="mb-4">{language === 'en' ? 'No goals set yet' : 'Niciun obiectiv setat încă'}</p>
                    <Button 
                      onClick={() => {
                        setWizardCategory(key as GoalCategory);
                        setWizardOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {language === 'en' ? 'Start Goal Setting' : 'Începe Setarea Obiectivelor'}
                    </Button>
                  </div>
                ) : (
                  categoryGoals.map((goal, idx) => (
                    <div 
                      key={goal.id}
                      className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      {/* Parent Hierarchy Badge */}
                      {goal.parentMission && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">
                            {language === 'en' ? 'From:' : 'Din:'}
                          </span>
                          <HierarchyBadge 
                            type="annual" 
                            title={goal.parentMission.title} 
                          />
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", config.color)}>#{idx + 1}</span>
                          <span className="font-medium text-foreground">{goal.title}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => {
                              setReminderGoal({ id: goal.id, title: goal.title });
                              setReminderDialogOpen(true);
                            }}
                            title={language === 'en' ? 'Set reminder' : 'Setează reminder'}
                          >
                            <Bell className={cn("w-3.5 h-3.5", goal.hasReminder && "text-primary")} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => {
                              setLinkGoal({ id: goal.id, title: goal.title, category: goal.category });
                              setLinkDialogOpen(true);
                            }}
                            title={language === 'en' ? 'Link monthly missions' : 'Leagă misiuni lunare'}
                          >
                            <Link2 className={cn("w-3.5 h-3.5", goal.linkedMissionsCount && goal.linkedMissionsCount > 0 && "text-primary")} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      
                      {goal.measurableResult && (
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {goal.measurableResult}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[goal.progress]}
                          onValueChange={([val]) => handleUpdateProgress(goal.id, val)}
                          max={100}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-10 text-right">{goal.progress}%</span>
                      </div>
                      
                      {/* Child Missions Section */}
                      <ChildMissionsPreview goalId={goal.id} config={config} language={language} />
                    </div>
                  ))
                )}

                {categoryGoals.length < 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full border-dashed"
                    onClick={() => handleAddGoal(key)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Add Goal' : 'Adaugă Obiectiv'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
        </>
      )}

      {/* Add/Edit Goal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGoal 
                ? (language === 'en' ? 'Edit Goal' : 'Editează Obiectiv')
                : (language === 'en' ? 'Add 90-Day Goal' : 'Adaugă Obiectiv 90 Zile')
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label>{language === 'en' ? 'Goal Title' : 'Titlu Obiectiv'}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={language === 'en' ? 'e.g., Lose 10kg' : 'ex: Slăbește 10kg'}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Measurable Result' : 'Rezultat Măsurabil'}</Label>
              <Input
                value={formData.measurableResult}
                onChange={(e) => setFormData(prev => ({ ...prev, measurableResult: e.target.value }))}
                placeholder={language === 'en' ? 'e.g., Weight: 75kg → 65kg' : 'ex: Greutate: 75kg → 65kg'}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Description' : 'Descriere'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={language === 'en' ? 'Why is this goal important?' : 'De ce este important acest obiectiv?'}
                rows={2}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Key Actions' : 'Acțiuni Cheie'}</Label>
              {formData.keyActions.map((action, idx) => (
                <Input
                  key={idx}
                  value={action}
                  onChange={(e) => {
                    const newActions = [...formData.keyActions];
                    newActions[idx] = e.target.value;
                    setFormData(prev => ({ ...prev, keyActions: newActions }));
                  }}
                  placeholder={`${language === 'en' ? 'Action' : 'Acțiune'} ${idx + 1}`}
                  className="mt-2"
                />
              ))}
            </div>

            {editingGoal && (
              <div>
                <Label>{language === 'en' ? 'Progress' : 'Progres'}: {formData.progress}%</Label>
                <Slider
                  value={[formData.progress]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, progress: val }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Anulează'}
              </Button>
              <Button className="flex-1" onClick={handleSaveGoal} disabled={!formData.title.trim()}>
                {language === 'en' ? 'Save Goal' : 'Salvează'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      {reminderGoal && (
        <GoalReminderDialog
          open={reminderDialogOpen}
          onOpenChange={setReminderDialogOpen}
          goalId={reminderGoal.id}
          goalTitle={reminderGoal.title}
        />
      )}

      {/* Link Missions Dialog */}
      {linkGoal && (
        <LinkedMissionsSelector
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          quarterlyGoalId={linkGoal.id}
          quarterlyGoalTitle={linkGoal.title}
          category={linkGoal.category}
        />
      )}

      {/* Goal Wizard Modal */}
      <GoalWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        category={wizardCategory}
        missionType="quarterly"
        period={`Q${currentQuarter}-${currentYear}`}
        onComplete={() => {
          // Refresh goals
          window.location.reload();
        }}
      />
    </div>
  );
};
