import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Flag, Dumbbell, Brain, Heart, Briefcase, Plus, Edit2, Target, CheckCircle, Crown, Eye, GripVertical } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { HierarchyBadge } from '@/components/door/HierarchyBadge';
import { MissionDetailsModal } from '@/components/door/MissionDetailsModal';
import { useDoor } from '@/context/DoorContext';

interface MonthlyMission {
  id: string;
  category: string;
  title: string;
  description?: string;
  measurableResult?: string;
  progress: number;
  keyActions?: string[];
  parentMissionId?: string | null;
  parentMission?: {
    id: string;
    title: string;
    period: string;
    mission_type: string;
  } | null;
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

export const MonthlyMissionTab: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [missions, setMissions] = useState<MonthlyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<MonthlyMission | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [detailMission, setDetailMission] = useState<MonthlyMission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [draggingMissionId, setDraggingMissionId] = useState<string | null>(null);
  
  // Get DoorContext for setting domino - wrapped in try/catch for safety
  let doorContext: ReturnType<typeof useDoor> | null = null;
  try {
    doorContext = useDoor();
  } catch {
    // Component might be used outside DoorProvider
  }
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    measurableResult: '',
    progress: 0,
    keyActions: ['', '', '', '', '']
  });

  const monthKey = format(currentDate, 'yyyy-MM');
  const monthName = format(currentDate, 'MMMM yyyy', { locale: language === 'en' ? enUS : ro });

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('mission_type', 'monthly')
          .eq('period', monthKey);

        if (error) throw error;

        // Fetch parent missions for hierarchy display
        const parentIds = (data || [])
          .map((m: any) => m.parent_mission_id)
          .filter(Boolean);

        let parentMap: Record<string, any> = {};
        if (parentIds.length > 0) {
          const { data: parents } = await supabase
            .from('missions')
            .select('id, title, period, mission_type')
            .in('id', parentIds);
          
          parents?.forEach((p: any) => {
            parentMap[p.id] = p;
          });
        }

        const mapped: MonthlyMission[] = (data || []).map((m: any) => ({
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

        setMissions(mapped);
      } catch (error) {
        console.error('Error fetching monthly missions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [monthKey]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleAddMission = (category: string) => {
    setSelectedCategory(category);
    setFormData({
      title: '',
      description: '',
      measurableResult: '',
      progress: 0,
      keyActions: ['', '', '', '', '']
    });
    setEditingMission(null);
    setIsDialogOpen(true);
  };

  const handleEditMission = (mission: MonthlyMission) => {
    setSelectedCategory(mission.category);
    setFormData({
      title: mission.title,
      description: mission.description || '',
      measurableResult: mission.measurableResult || '',
      progress: mission.progress,
      keyActions: [...(mission.keyActions || []), '', '', '', '', ''].slice(0, 5)
    });
    setEditingMission(mission);
    setIsDialogOpen(true);
  };

  const handleSaveMission = async () => {
    if (!selectedCategory || !formData.title.trim()) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const goalData = {
        description: formData.description,
        progress: formData.progress,
        keyActions: formData.keyActions.filter(a => a.trim())
      };

      if (editingMission) {
        const { error } = await supabase
          .from('missions')
          .update({
            title: formData.title,
            measurable_result: formData.measurableResult,
            goal_data: goalData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMission.id);

        if (error) throw error;

        setMissions(prev => prev.map(m => 
          m.id === editingMission.id 
            ? { ...m, ...formData, keyActions: goalData.keyActions }
            : m
        ));

        toast({ title: language === 'en' ? 'Mission updated' : 'Misiune actualizată' });
      } else {
        const { data, error } = await supabase
          .from('missions')
          .insert({
            user_id: session.session.user.id,
            category: selectedCategory,
            mission_type: 'monthly',
            period: monthKey,
            title: formData.title,
            measurable_result: formData.measurableResult,
            goal_data: goalData
          })
          .select()
          .single();

        if (error) throw error;

        setMissions(prev => [...prev, {
          id: data.id,
          category: selectedCategory,
          title: formData.title,
          description: formData.description,
          measurableResult: formData.measurableResult,
          progress: formData.progress,
          keyActions: goalData.keyActions
        }]);

        toast({ title: language === 'en' ? 'Mission created' : 'Misiune creată' });
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving mission:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateProgress = async (missionId: string, newProgress: number) => {
    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) return;

      const { error } = await supabase
        .from('missions')
        .update({
          goal_data: {
            description: mission.description,
            progress: newProgress,
            keyActions: mission.keyActions
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', missionId);

      if (error) throw error;

      setMissions(prev => prev.map(m => 
        m.id === missionId ? { ...m, progress: newProgress } : m
      ));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getCategoryMissions = (category: string) => {
    return missions.filter(m => m.category === category);
  };

  // Handle opening detail modal
  const openDetailModal = (mission: MonthlyMission) => {
    setDetailMission(mission);
    setIsDetailModalOpen(true);
  };

  // Handle drag start for monthly mission
  const handleMissionDragStart = (e: React.DragEvent, mission: MonthlyMission) => {
    setDraggingMissionId(mission.id);
    
    const dominoData = {
      type: 'monthly-mission',
      id: mission.id,
      text: mission.title,
      measurableResult: mission.measurableResult,
      keyActions: mission.keyActions,
      category: mission.category
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dominoData));
    e.dataTransfer.setData('text/plain', mission.title);
    e.dataTransfer.effectAllowed = 'copyMove';
    console.debug('[DnD] MonthlyMission dragStart', { id: mission.id, effectAllowed: 'copyMove' });
  };

  const handleMissionDragEnd = () => {
    setDraggingMissionId(null);
  };

  // Handle setting mission as domino from modal
  const handleSetAsDomino = (mission: MonthlyMission) => {
    if (!doorContext) {
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' 
          ? 'Cannot set domino from this context' 
          : 'Nu se poate seta domino din acest context',
        variant: 'destructive'
      });
      return;
    }

    doorContext.setSelectedDomino({
      id: `monthly-${mission.id}`,
      text: mission.title,
      selected: true,
      priority: 'urgent-important'
    });

    // Auto-populate key points from keyActions
    if (mission.keyActions && mission.keyActions.length > 0) {
      const newKeyPoints = mission.keyActions.slice(0, 4).map((action, idx) => ({
        id: `key${idx + 1}`,
        text: action,
        completed: false
      }));
      doorContext.setDominoKeyPoints(newKeyPoints);
    }

    toast({
      title: '🎯 Domino setat!',
      description: `"${mission.title}" este acum focusul tău săptămânal.`
    });

    setIsDetailModalOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Flag className="w-6 h-6 text-primary" />
            {language === 'en' ? 'Monthly Mission' : 'Misiune Lunară'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'One focused mission per category' : 'O misiune focusată per categorie'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center min-w-[140px]">
            <div className="text-lg font-bold text-foreground capitalize">{monthName}</div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const categoryMissions = getCategoryMissions(key);
          const Icon = config.icon;
          const hasMissions = categoryMissions.length > 0;
          const avgProgress = hasMissions 
            ? Math.round(categoryMissions.reduce((sum, m) => sum + m.progress, 0) / categoryMissions.length)
            : 0;

          return (
            <Card 
              key={key} 
              className={cn(
                "overflow-hidden border-2 transition-all duration-300",
                config.borderColor,
                hasMissions ? 'hover:shadow-lg' : 'border-dashed'
              )}
            >
              <CardHeader className={cn(config.bgColor, "pb-4")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl bg-background/50")}>
                      <Icon className={cn("w-6 h-6", config.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {config.label[language === 'en' ? 'en' : 'ro']}
                      </CardTitle>
                      {hasMissions && categoryMissions.length > 1 && (
                        <p className="text-sm text-muted-foreground">
                          {categoryMissions.length} {language === 'en' ? 'missions' : 'misiuni'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {hasMissions && (
                    <Badge variant="secondary" className={cn("text-lg px-3 py-1", config.color)}>
                      {avgProgress}%
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5">
                {hasMissions ? (
                  <div className="space-y-6">
                    {categoryMissions.map((mission, missionIndex) => (
                      <div 
                        key={mission.id}
                        className={cn(
                          "rounded-lg p-3 -m-3 transition-all",
                          "cursor-grab active:cursor-grabbing",
                          "hover:bg-muted/50 hover:ring-2 hover:ring-primary/20",
                          draggingMissionId === mission.id && "opacity-50 ring-2 ring-primary",
                          missionIndex > 0 && "mt-4 pt-4 border-t border-border/50"
                        )}
                        draggable
                        onDragStart={(e) => handleMissionDragStart(e, mission)}
                        onDragEnd={handleMissionDragEnd}
                      >
                        {/* Parent Hierarchy Badge */}
                        {mission.parentMission && (
                          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border/30">
                            <span className="text-xs text-muted-foreground">
                              {language === 'en' ? 'Part of:' : 'Parte din:'}
                            </span>
                            <HierarchyBadge 
                              type="quarterly" 
                              title={mission.parentMission.title} 
                            />
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            {/* Drag Handle */}
                            <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-1 flex-shrink-0" />
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {categoryMissions.length > 1 && (
                                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", config.bgColor, config.color)}>
                                    #{missionIndex + 1}
                                  </span>
                                )}
                                <h3 className="font-semibold text-lg text-foreground">{mission.title}</h3>
                              </div>
                              {mission.measurableResult && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                  <Target className="w-3.5 h-3.5" />
                                  {mission.measurableResult}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {/* View Details Button */}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openDetailModal(mission)}
                              title={language === 'en' ? 'View details' : 'Vezi detalii'}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {/* Edit Button */}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditMission(mission)}
                              title={language === 'en' ? 'Edit' : 'Editează'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {mission.description && (
                          <p className="text-sm text-muted-foreground mt-2">{mission.description}</p>
                        )}

                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">
                              {language === 'en' ? 'Progress' : 'Progres'}
                            </span>
                            <span className="font-medium">{mission.progress}%</span>
                          </div>
                          <Slider
                            value={[mission.progress]}
                            onValueChange={([val]) => handleUpdateProgress(mission.id, val)}
                            max={100}
                            step={5}
                          />
                        </div>

                        {mission.keyActions && mission.keyActions.length > 0 && (
                          <div className="pt-2 mt-2">
                            <p className="text-sm font-medium mb-2">
                              {language === 'en' ? 'Key Actions' : 'Acțiuni Cheie'}
                            </p>
                            <div className="space-y-1.5">
                              {mission.keyActions.map((action, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className={cn("w-3.5 h-3.5", config.color)} />
                                  <span className="text-foreground">{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add More Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleAddMission(key)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Add Mission' : 'Adaugă Misiune'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Flag className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground mb-4">
                      {language === 'en' ? 'No mission set for this month' : 'Nicio misiune setată pentru această lună'}
                    </p>
                    <Button variant="outline" onClick={() => handleAddMission(key)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Set Mission' : 'Setează Misiune'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Mission Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMission 
                ? (language === 'en' ? 'Edit Mission' : 'Editează Misiune')
                : (language === 'en' ? 'Set Monthly Mission' : 'Setează Misiune Lunară')
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label>{language === 'en' ? 'Mission Title' : 'Titlu Misiune'}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={language === 'en' ? 'e.g., Complete marathon training' : 'ex: Finalizează antrenamentul pentru maraton'}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Measurable Result' : 'Rezultat Măsurabil'}</Label>
              <Input
                value={formData.measurableResult}
                onChange={(e) => setFormData(prev => ({ ...prev, measurableResult: e.target.value }))}
                placeholder={language === 'en' ? 'e.g., Run 42km in under 4 hours' : 'ex: Aleargă 42km în sub 4 ore'}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Why is this important?' : 'De ce este important?'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Key Actions (max 5)' : 'Acțiuni Cheie (max 5)'}</Label>
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

            {editingMission && (
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
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Anulează'}
              </Button>
              <Button className="flex-1" onClick={handleSaveMission} disabled={!formData.title.trim()}>
                {language === 'en' ? 'Save Mission' : 'Salvează'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mission Details Modal */}
      <MissionDetailsModal
        mission={detailMission}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSetAsDomino={doorContext ? handleSetAsDomino : undefined}
        onUpdateProgress={handleUpdateProgress}
      />
    </div>
  );
};
