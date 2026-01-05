import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  Flag, 
  Dumbbell, 
  Brain, 
  Heart, 
  Briefcase,
  CheckCircle2,
  Circle,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LinkedMission {
  id: string;
  title: string;
  period: string;
  progress: number;
  completed: boolean;
  position: number;
}

interface QuarterlyGoalWithMissions {
  id: string;
  category: string;
  title: string;
  description?: string;
  measurableResult?: string;
  progress: number;
  linkedMissions: LinkedMission[];
}

const CATEGORY_CONFIG = {
  body: {
    icon: Dumbbell,
    label: { en: 'Body', ro: 'Corp' },
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  being: {
    icon: Brain,
    label: { en: 'Spirituality', ro: 'Spiritualitate' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  balance: {
    icon: Heart,
    label: { en: 'Relationships', ro: 'Relații' },
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30'
  },
  business: {
    icon: Briefcase,
    label: { en: 'Business', ro: 'Business' },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  }
};

interface HierarchicalGoalsViewProps {
  currentQuarter: number;
  currentYear: number;
}

export const HierarchicalGoalsView: React.FC<HierarchicalGoalsViewProps> = ({
  currentQuarter,
  currentYear
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [goals, setGoals] = useState<QuarterlyGoalWithMissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  
  // Add mission dialog state
  const [addMissionDialogOpen, setAddMissionDialogOpen] = useState(false);
  const [selectedGoalForMission, setSelectedGoalForMission] = useState<QuarterlyGoalWithMissions | null>(null);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionMonth, setMissionMonth] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit mission state
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [editingMissionTitle, setEditingMissionTitle] = useState('');

  const getQuarterMonths = () => {
    const quarterMonths: Record<number, number[]> = {
      1: [1, 2, 3],
      2: [4, 5, 6],
      3: [7, 8, 9],
      4: [10, 11, 12]
    };
    return quarterMonths[currentQuarter] || [];
  };

  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ro: ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie']
  };

  const fetchHierarchicalData = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setLoading(false);
        return;
      }

      const quarterKey = `Q${currentQuarter}-${currentYear}`;

      const { data: quarterlyData, error: quarterlyError } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('mission_type', 'quarterly')
        .eq('period', quarterKey);

      if (quarterlyError) throw quarterlyError;

      const quarterlyIds = (quarterlyData || []).map(q => q.id);
      
      let linkedMissionsData: any[] = [];
      if (quarterlyIds.length > 0) {
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('mission_type', 'monthly')
          .in('parent_mission_id', quarterlyIds);

        if (monthlyError) throw monthlyError;
        linkedMissionsData = monthlyData || [];
      }

      const mappedGoals: QuarterlyGoalWithMissions[] = (quarterlyData || []).map((q: any) => ({
        id: q.id,
        category: q.category,
        title: q.title || '',
        description: q.goal_data?.description || '',
        measurableResult: q.measurable_result || '',
        progress: q.goal_data?.progress || 0,
        linkedMissions: linkedMissionsData
          .filter(m => m.parent_mission_id === q.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .map(m => ({
            id: m.id,
            title: m.title || '',
            period: m.period || '',
            progress: m.goal_data?.progress || 0,
            completed: m.completed || false,
            position: m.position || 0
          }))
      }));

      setGoals(mappedGoals);
      
      const goalsWithMissions = mappedGoals
        .filter(g => g.linkedMissions.length > 0)
        .map(g => g.id);
      setExpandedGoals(new Set(goalsWithMissions));
    } catch (error) {
      console.error('Error fetching hierarchical goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchicalData();
  }, [currentQuarter, currentYear]);

  const toggleExpanded = (goalId: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  };

  const formatMonth = (period: string) => {
    if (!period) return '';
    const months = {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ro: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    
    const match = period.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const monthIndex = parseInt(match[2], 10) - 1;
      return months[language === 'en' ? 'en' : 'ro'][monthIndex] || period;
    }
    return period;
  };

  const groupGoalsByCategory = () => {
    const grouped: Record<string, QuarterlyGoalWithMissions[]> = {};
    goals.forEach(goal => {
      if (!grouped[goal.category]) {
        grouped[goal.category] = [];
      }
      grouped[goal.category].push(goal);
    });
    return grouped;
  };

  const handleOpenAddMission = (goal: QuarterlyGoalWithMissions) => {
    setSelectedGoalForMission(goal);
    setMissionTitle('');
    const availableMonths = getQuarterMonths();
    if (availableMonths.length > 0) {
      setMissionMonth(`${currentYear}-${String(availableMonths[0]).padStart(2, '0')}`);
    }
    setAddMissionDialogOpen(true);
  };

  const handleSaveMission = async () => {
    if (!selectedGoalForMission || !missionTitle.trim() || !missionMonth) return;

    try {
      setSaving(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { error } = await supabase
        .from('missions')
        .insert({
          user_id: session.session.user.id,
          category: selectedGoalForMission.category,
          mission_type: 'monthly',
          period: missionMonth,
          title: missionTitle.trim(),
          parent_mission_id: selectedGoalForMission.id,
          goal_data: { progress: 0 }
        });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Mission created' : 'Misiune creată',
        description: missionTitle
      });

      setAddMissionDialogOpen(false);
      setExpandedGoals(prev => new Set([...prev, selectedGoalForMission.id]));
      fetchHierarchicalData();
    } catch (error) {
      console.error('Error creating mission:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to create mission' : 'Nu s-a putut crea misiunea',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Extract goalId from droppableId (format: "missions-{goalId}")
    const goalId = destination.droppableId.replace('missions-', '');
    const sourceGoalId = source.droppableId.replace('missions-', '');
    
    // Only handle reordering within the same goal
    if (goalId !== sourceGoalId) return;
    
    const goalIndex = goals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;
    
    const goal = goals[goalIndex];
    const newMissions = [...goal.linkedMissions];
    const [removed] = newMissions.splice(source.index, 1);
    newMissions.splice(destination.index, 0, removed);
    
    // Update positions
    const updatedMissions = newMissions.map((m, idx) => ({ ...m, position: idx }));
    
    // Optimistic update
    const newGoals = [...goals];
    newGoals[goalIndex] = { ...goal, linkedMissions: updatedMissions };
    setGoals(newGoals);
    
    // Persist positions to database
    try {
      const updates = updatedMissions.map(m => 
        supabase
          .from('missions')
          .update({ position: m.position })
          .eq('id', m.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error('Error saving positions:', error);
      fetchHierarchicalData(); // Revert on error
    }
  };

  const handleEditMission = (mission: LinkedMission) => {
    setEditingMissionId(mission.id);
    setEditingMissionTitle(mission.title);
  };

  const handleSaveEdit = async (missionId: string) => {
    if (!editingMissionTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('missions')
        .update({ title: editingMissionTitle.trim() })
        .eq('id', missionId);

      if (error) throw error;

      // Also update corresponding task if exists
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        await supabase
          .from('user_tasks')
          .update({ title: editingMissionTitle.trim() })
          .eq('user_id', session.session.user.id)
          .eq('task_id', missionId);
      }

      toast({
        title: language === 'en' ? 'Mission updated' : 'Misiune actualizată'
      });

      setEditingMissionId(null);
      fetchHierarchicalData();
    } catch (error) {
      console.error('Error updating mission:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to update mission' : 'Nu s-a putut actualiza misiunea',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      // Delete the mission
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', missionId);

      if (error) throw error;

      // Also delete corresponding task if exists
      await supabase
        .from('user_tasks')
        .delete()
        .eq('user_id', session.session.user.id)
        .eq('task_id', missionId);

      toast({
        title: language === 'en' ? 'Mission deleted' : 'Misiune ștearsă'
      });

      fetchHierarchicalData();
    } catch (error) {
      console.error('Error deleting mission:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to delete mission' : 'Nu s-a putut șterge misiunea',
        variant: 'destructive'
      });
    }
  };

  const syncMissionToTask = async (mission: LinkedMission, goalCategory: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      // Get current week key
      const now = new Date();
      const weekKey = `door-week-${now.getFullYear()}-${String(Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)).padStart(2, '0')}`;

      // Check if task already exists
      const { data: existingTask } = await supabase
        .from('user_tasks')
        .select('id')
        .eq('user_id', session.session.user.id)
        .eq('task_id', mission.id)
        .single();

      if (existingTask) {
        toast({
          title: language === 'en' ? 'Task already exists' : 'Taskul există deja'
        });
        return;
      }

      // Create task from mission
      const { error } = await supabase
        .from('user_tasks')
        .insert({
          user_id: session.session.user.id,
          task_id: mission.id,
          title: mission.title,
          list_type: 'hit',
          task_type: 'monthly_mission',
          week_key: weekKey,
          completed: mission.completed,
          priority: 1
        });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Synced to tasks' : 'Sincronizat cu taskuri',
        description: mission.title
      });
    } catch (error) {
      console.error('Error syncing to task:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to sync' : 'Sincronizare eșuată',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">
          {language === 'en' ? 'No quarterly goals set' : 'Nu ai obiective trimestriale setate'}
        </p>
        <p className="text-sm mt-1">
          {language === 'en' 
            ? 'Create quarterly goals first, then link monthly missions to them'
            : 'Creează întâi obiective trimestriale, apoi leagă misiunile lunare de ele'}
        </p>
      </div>
    );
  }

  const groupedGoals = groupGoalsByCategory();

  return (
    <>
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
          const categoryGoals = groupedGoals[category] || [];
          if (categoryGoals.length === 0) return null;

          const Icon = config.icon;
          const totalLinkedMissions = categoryGoals.reduce((sum, g) => sum + g.linkedMissions.length, 0);

          return (
            <Card 
              key={category} 
              className={cn("overflow-hidden border-2", config.borderColor)}
            >
              <CardHeader className={cn("py-3 px-4", config.bgColor)}>
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5", config.color)} />
                  <CardTitle className="text-base">
                    {config.label[language === 'en' ? 'en' : 'ro']}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-auto">
                    {categoryGoals.length} {language === 'en' ? 'goals' : 'obiective'}
                    {totalLinkedMissions > 0 && (
                      <span className="ml-1.5 text-muted-foreground">
                        • {totalLinkedMissions} {language === 'en' ? 'missions' : 'misiuni'}
                      </span>
                    )}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-3 space-y-2">
                {categoryGoals.map((goal) => {
                  const isExpanded = expandedGoals.has(goal.id);
                  const hasLinkedMissions = goal.linkedMissions.length > 0;

                  return (
                    <Collapsible 
                      key={goal.id} 
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(goal.id)}
                    >
                      <div className={cn(
                        "rounded-lg border transition-all",
                        isExpanded ? "bg-muted/50 border-border" : "bg-background hover:bg-muted/30 border-transparent"
                      )}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-3 flex items-start gap-3 text-left">
                            <div className={cn(
                              "mt-0.5 p-1 rounded transition-colors",
                              hasLinkedMissions ? config.bgColor : "bg-muted"
                            )}>
                              {isExpanded ? (
                                <ChevronDown className={cn("w-4 h-4", hasLinkedMissions ? config.color : "text-muted-foreground")} />
                              ) : (
                                <ChevronRight className={cn("w-4 h-4", hasLinkedMissions ? config.color : "text-muted-foreground")} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className={cn("w-4 h-4 shrink-0", config.color)} />
                                <span className="font-medium text-foreground truncate">{goal.title}</span>
                                <Badge variant="outline" className="shrink-0 text-xs">
                                  {goal.progress}%
                                </Badge>
                              </div>
                              
                              {goal.measurableResult && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{goal.measurableResult}</span>
                                </p>
                              )}
                              
                              <div className="mt-2">
                                <Progress value={goal.progress} className="h-1.5" />
                              </div>
                            </div>

                            {hasLinkedMissions && (
                              <Badge className={cn("shrink-0", config.bgColor, config.color, "border-0")}>
                                <Flag className="w-3 h-3 mr-1" />
                                {goal.linkedMissions.length}
                              </Badge>
                            )}
                          </button>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="px-3 pb-3">
                            <div className="ml-7 pl-4 border-l-2 border-dashed border-muted-foreground/30 space-y-2">
                              {hasLinkedMissions && (
                                <>
                                  <p className="text-xs text-muted-foreground font-medium mb-2">
                                    {language === 'en' ? 'Linked Monthly Missions:' : 'Misiuni Lunare Legate:'}
                                  </p>
                                  
                                  <Droppable droppableId={`missions-${goal.id}`}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={cn(
                                          "space-y-2 rounded-lg transition-colors",
                                          snapshot.isDraggingOver && "bg-primary/5"
                                        )}
                                      >
                                        {goal.linkedMissions.map((mission, missionIndex) => (
                                          <Draggable 
                                            key={mission.id} 
                                            draggableId={mission.id} 
                                            index={missionIndex}
                                          >
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={cn(
                                                  "flex items-center gap-2 p-2.5 rounded-lg bg-background border transition-all group",
                                                  snapshot.isDragging && "shadow-lg ring-2 ring-primary/20"
                                                )}
                                              >
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                  <GripVertical className="w-4 h-4" />
                                                </div>
                                                
                                                {editingMissionId === mission.id ? (
                                                  // Edit mode
                                                  <div className="flex items-center gap-2 flex-1">
                                                    <Input
                                                      value={editingMissionTitle}
                                                      onChange={(e) => setEditingMissionTitle(e.target.value)}
                                                      className="h-7 text-sm"
                                                      autoFocus
                                                      onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveEdit(mission.id);
                                                        if (e.key === 'Escape') setEditingMissionId(null);
                                                      }}
                                                    />
                                                    <Button
                                                      size="icon"
                                                      variant="ghost"
                                                      className="h-7 w-7 text-emerald-500"
                                                      onClick={() => handleSaveEdit(mission.id)}
                                                    >
                                                      <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                      size="icon"
                                                      variant="ghost"
                                                      className="h-7 w-7"
                                                      onClick={() => setEditingMissionId(null)}
                                                    >
                                                      <X className="w-4 h-4" />
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  // View mode
                                                  <>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                      {mission.completed ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                      ) : (
                                                        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                                                      )}
                                                      <Flag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                      <span className={cn(
                                                        "text-sm truncate",
                                                        mission.completed && "text-muted-foreground line-through"
                                                      )}>
                                                        {mission.title}
                                                      </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1 shrink-0">
                                                      <Badge variant="outline" className="text-xs">
                                                        {formatMonth(mission.period)}
                                                      </Badge>
                                                      <span className="text-xs font-medium w-8 text-right">
                                                        {mission.progress}%
                                                      </span>
                                                      
                                                      {/* Action buttons - visible on hover */}
                                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                                                        <Button
                                                          size="icon"
                                                          variant="ghost"
                                                          className="h-6 w-6"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            syncMissionToTask(mission, goal.category);
                                                          }}
                                                          title={language === 'en' ? 'Sync to tasks' : 'Sincronizează'}
                                                        >
                                                          <Target className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                          size="icon"
                                                          variant="ghost"
                                                          className="h-6 w-6"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditMission(mission);
                                                          }}
                                                        >
                                                          <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                          size="icon"
                                                          variant="ghost"
                                                          className="h-6 w-6 text-destructive hover:text-destructive"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMission(mission.id);
                                                          }}
                                                        >
                                                          <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                </>
                              )}
                              
                              {!hasLinkedMissions && (
                                <p className="text-sm text-muted-foreground py-2 flex items-center gap-2">
                                  <Flag className="w-4 h-4 opacity-50" />
                                  {language === 'en' 
                                    ? 'No monthly missions linked yet'
                                    : 'Nicio misiune lunară legată încă'}
                                </p>
                              )}

                              {/* Add Mission Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed mt-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAddMission(goal);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                {language === 'en' ? 'Add Monthly Mission' : 'Adaugă Misiune Lunară'}
                              </Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DragDropContext>

      {/* Add Monthly Mission Dialog */}
      <Dialog open={addMissionDialogOpen} onOpenChange={setAddMissionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Add Monthly Mission' : 'Adaugă Misiune Lunară'}
            </DialogTitle>
          </DialogHeader>

          {selectedGoalForMission && (
            <div className="space-y-4 pt-2">
              {/* Parent Goal Info */}
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en' ? 'Linked to quarterly goal:' : 'Legată de obiectivul trimestrial:'}
                </p>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{selectedGoalForMission.title}</span>
                </div>
              </div>

              {/* Mission Title */}
              <div>
                <Label>{language === 'en' ? 'Mission Title' : 'Titlu Misiune'}</Label>
                <Input
                  value={missionTitle}
                  onChange={(e) => setMissionTitle(e.target.value)}
                  placeholder={language === 'en' ? 'e.g., Complete 20 workouts' : 'ex: Completează 20 antrenamente'}
                  className="mt-1.5"
                />
              </div>

              {/* Month Selection */}
              <div>
                <Label>{language === 'en' ? 'Month' : 'Luna'}</Label>
                <Select value={missionMonth} onValueChange={setMissionMonth}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={language === 'en' ? 'Select month' : 'Selectează luna'} />
                  </SelectTrigger>
                  <SelectContent>
                    {getQuarterMonths().map((monthNum) => {
                      const monthKey = `${currentYear}-${String(monthNum).padStart(2, '0')}`;
                      const monthName = monthNames[language === 'en' ? 'en' : 'ro'][monthNum - 1];
                      return (
                        <SelectItem key={monthKey} value={monthKey}>
                          {monthName} {currentYear}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setAddMissionDialogOpen(false)}
                >
                  {language === 'en' ? 'Cancel' : 'Anulează'}
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSaveMission}
                  disabled={!missionTitle.trim() || !missionMonth || saving}
                >
                  {saving 
                    ? (language === 'en' ? 'Saving...' : 'Se salvează...')
                    : (language === 'en' ? 'Create Mission' : 'Creează Misiune')
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
