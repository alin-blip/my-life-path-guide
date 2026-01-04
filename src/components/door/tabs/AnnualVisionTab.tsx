import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Crown, Dumbbell, Brain, Heart, Briefcase, Plus, Edit2, Star, Sparkles, ChevronDown, Target, Flag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { GoalWizardModal } from '@/components/goal-wizard/GoalWizardModal';
import { GoalCategory } from '@/types/goalWizard';
import { useChildMissions } from '@/hooks/useHierarchyData';

interface AnnualVision {
  id: string;
  category: string;
  bigGoal: string;
  why: string;
  oneWord?: string;
  milestones?: string[];
}

const CATEGORY_CONFIG = {
  body: {
    icon: Dumbbell,
    label: { en: 'Body', ro: 'Corp' },
    question: { en: 'What does your healthiest self look like?', ro: 'Cum arată versiunea ta cea mai sănătoasă?' },
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    gradient: 'from-emerald-600 to-emerald-400'
  },
  being: {
    icon: Brain,
    label: { en: 'Being', ro: 'Ființă' },
    question: { en: 'What does your most evolved self look like?', ro: 'Cum arată versiunea ta cea mai evoluată?' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    gradient: 'from-purple-600 to-purple-400'
  },
  balance: {
    icon: Heart,
    label: { en: 'Balance', ro: 'Echilibru' },
    question: { en: 'What do your ideal relationships look like?', ro: 'Cum arată relațiile tale ideale?' },
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    gradient: 'from-rose-600 to-rose-400'
  },
  business: {
    icon: Briefcase,
    label: { en: 'Business', ro: 'Business' },
    question: { en: 'What does your ideal career/business look like?', ro: 'Cum arată cariera/business-ul tău ideal?' },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    gradient: 'from-blue-600 to-blue-400'
  }
};

// Child Goals Section Component
const ChildGoalsSection: React.FC<{
  visionId: string;
  category: string;
  config: typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG];
  language: string;
}> = ({ visionId, category, config, language }) => {
  const { children: quarterlyGoals, loading } = useChildMissions(visionId, 'quarterly');
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return <div className="h-8 bg-muted/50 animate-pulse rounded mt-3" />;
  }

  if (quarterlyGoals.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4 pt-3 border-t border-border/50">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between gap-2 h-auto py-2">
          <div className="flex items-center gap-2">
            <Target className={cn("w-4 h-4", config.color)} />
            <span className="text-sm font-medium">
              {language === 'en' ? 'Linked Goals' : 'Obiective Legate'} ({quarterlyGoals.length})
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {quarterlyGoals.map((goal: any) => (
          <div 
            key={goal.id} 
            className={cn("p-3 rounded-lg border", config.bgColor, config.borderColor)}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {goal.period}
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground">{goal.title}</p>
            {goal.measurable_result && (
              <p className="text-xs text-muted-foreground mt-1">{goal.measurable_result}</p>
            )}
            <ChildMonthlySection goalId={goal.id} config={config} language={language} />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

// Child Monthly Section Component
const ChildMonthlySection: React.FC<{
  goalId: string;
  config: typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG];
  language: string;
}> = ({ goalId, config, language }) => {
  const { children: monthlyMissions } = useChildMissions(goalId, 'monthly');

  if (monthlyMissions.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
      {monthlyMissions.map((mission: any) => (
        <div key={mission.id} className="flex items-center gap-2 text-xs">
          <Flag className={cn("w-3 h-3", config.color)} />
          <span className="text-muted-foreground">{mission.period}:</span>
          <span className="text-foreground truncate">{mission.title}</span>
        </div>
      ))}
    </div>
  );
};

export const AnnualVisionTab: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [visions, setVisions] = useState<AnnualVision[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVision, setEditingVision] = useState<AnnualVision | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    bigGoal: '',
    why: '',
    oneWord: '',
    milestones: ['', '', '', '']
  });

  // Goal Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<GoalCategory>('body');

  useEffect(() => {
    const fetchVisions = async () => {
      try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const yearKey = `${currentYear}`;

        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('mission_type', 'annual')
          .eq('period', yearKey);

        if (error) throw error;

        const mapped: AnnualVision[] = (data || []).map((m: any) => ({
          id: m.id,
          category: m.category,
          bigGoal: m.title || '',
          why: m.goal_data?.why || '',
          oneWord: m.goal_data?.oneWord || '',
          milestones: m.goal_data?.milestones || []
        }));

        setVisions(mapped);
      } catch (error) {
        console.error('Error fetching annual visions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisions();
  }, [currentYear]);

  const handleAddVision = (category: string) => {
    setSelectedCategory(category);
    setFormData({
      bigGoal: '',
      why: '',
      oneWord: '',
      milestones: ['', '', '', '']
    });
    setEditingVision(null);
    setIsDialogOpen(true);
  };

  const handleEditVision = (vision: AnnualVision) => {
    setSelectedCategory(vision.category);
    setFormData({
      bigGoal: vision.bigGoal,
      why: vision.why,
      oneWord: vision.oneWord || '',
      milestones: [...(vision.milestones || []), '', '', '', ''].slice(0, 4)
    });
    setEditingVision(vision);
    setIsDialogOpen(true);
  };

  const handleSaveVision = async () => {
    if (!selectedCategory || !formData.bigGoal.trim()) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const yearKey = `${currentYear}`;
      const goalData = {
        why: formData.why,
        oneWord: formData.oneWord,
        milestones: formData.milestones.filter(m => m.trim())
      };

      if (editingVision) {
        const { error } = await supabase
          .from('missions')
          .update({
            title: formData.bigGoal,
            goal_data: goalData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVision.id);

        if (error) throw error;

        setVisions(prev => prev.map(v => 
          v.id === editingVision.id 
            ? { ...v, bigGoal: formData.bigGoal, why: formData.why, oneWord: formData.oneWord, milestones: goalData.milestones }
            : v
        ));

        toast({ title: language === 'en' ? 'Vision updated' : 'Viziune actualizată' });
      } else {
        const { data, error } = await supabase
          .from('missions')
          .insert({
            user_id: session.session.user.id,
            category: selectedCategory,
            mission_type: 'annual',
            period: yearKey,
            title: formData.bigGoal,
            goal_data: goalData
          })
          .select()
          .single();

        if (error) throw error;

        setVisions(prev => [...prev, {
          id: data.id,
          category: selectedCategory,
          bigGoal: formData.bigGoal,
          why: formData.why,
          oneWord: formData.oneWord,
          milestones: goalData.milestones
        }]);

        toast({ title: language === 'en' ? 'Vision created' : 'Viziune creată' });
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving vision:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        variant: 'destructive'
      });
    }
  };

  const getCategoryVisions = (category: string) => {
    return visions.filter(v => v.category === category);
  };

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Year Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="w-6 h-6 text-goddess-gold" />
            {language === 'en' ? 'Annual Vision' : 'Viziune Anuală'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Your big picture goals for the year' : 'Obiectivele tale mari pentru an'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentYear(y => y - 1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center min-w-[80px]">
            <div className="text-2xl font-bold text-foreground">{currentYear}</div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={() => setCurrentYear(y => y + 1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Vision Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const categoryVisions = getCategoryVisions(key);
          const Icon = config.icon;

          return (
            <Card 
              key={key} 
              className={cn(
                "overflow-hidden border-2 transition-all duration-300 hover:shadow-xl",
                config.borderColor,
                categoryVisions.length === 0 && 'border-dashed'
              )}
            >
              {/* Gradient Header */}
              <div className={cn("h-2 bg-gradient-to-r", config.gradient)} />
              
              <CardHeader className={cn(config.bgColor, "pb-4")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-background/50">
                      <Icon className={cn("w-7 h-7", config.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {config.label[language === 'en' ? 'en' : 'ro']}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {config.question[language === 'en' ? 'en' : 'ro']}
                      </p>
                    </div>
                  </div>
                  
                  {categoryVisions.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setWizardCategory(key as GoalCategory);
                        setWizardOpen(true);
                      }}
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5">
                {categoryVisions.length > 0 ? (
                  <div className="space-y-4">
                    {categoryVisions.map((vision, idx) => (
                      <div key={vision.id} className={cn(
                        "space-y-3",
                        idx > 0 && "pt-4 border-t border-border/50"
                      )}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className={cn("w-5 h-5", config.color)} />
                              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                {language === 'en' ? 'Big Goal' : 'Obiectiv Mare'}
                                {categoryVisions.length > 1 && ` ${idx + 1}`}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground leading-tight">
                              {vision.bigGoal}
                            </h3>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditVision(vision)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {vision.why && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground italic">
                              "{vision.why}"
                            </p>
                          </div>
                        )}

                        {vision.milestones && vision.milestones.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 text-muted-foreground">
                              {language === 'en' ? 'Key Milestones' : 'Repere Importante'}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {vision.milestones.map((milestone, midx) => (
                                <div 
                                  key={midx} 
                                  className={cn(
                                    "p-2 rounded-lg text-sm text-center",
                                    config.bgColor
                                  )}
                                >
                                  Q{midx + 1}: {milestone}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Child Goals Section */}
                        <ChildGoalsSection 
                          visionId={vision.id} 
                          category={key} 
                          config={config} 
                          language={language} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Crown className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground mb-4">
                      {language === 'en' ? 'No vision set for this year' : 'Nicio viziune setată pentru acest an'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button 
                        onClick={() => {
                          setWizardCategory(key as GoalCategory);
                          setWizardOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {language === 'en' ? 'AI Goal Wizard' : 'Wizard Obiective AI'}
                      </Button>
                      <Button variant="outline" onClick={() => handleAddVision(key)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Quick Add' : 'Adaugă Rapid'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Vision Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-goddess-gold" />
              {editingVision 
                ? (language === 'en' ? 'Edit Annual Vision' : 'Editează Viziune Anuală')
                : (language === 'en' ? 'Create Annual Vision' : 'Creează Viziune Anuală')
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-goddess-gold" />
                {language === 'en' ? 'Your Big Goal for the Year' : 'Obiectivul Tău Mare pentru An'}
              </Label>
              <Textarea
                value={formData.bigGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, bigGoal: e.target.value }))}
                placeholder={language === 'en' 
                  ? 'What do you want to achieve or become this year?'
                  : 'Ce vrei să realizezi sau să devii anul acesta?'
                }
                rows={2}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Why is this important to you?' : 'De ce este important pentru tine?'}</Label>
              <Textarea
                value={formData.why}
                onChange={(e) => setFormData(prev => ({ ...prev, why: e.target.value }))}
                placeholder={language === 'en' 
                  ? 'What will achieving this mean for your life?'
                  : 'Ce va însemna realizarea acestuia pentru viața ta?'
                }
                rows={2}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'One Word Theme' : 'Tema într-un Cuvânt'}</Label>
              <Input
                value={formData.oneWord}
                onChange={(e) => setFormData(prev => ({ ...prev, oneWord: e.target.value }))}
                placeholder={language === 'en' ? 'e.g., Transform, Breakthrough, Freedom' : 'ex: Transformare, Descoperire, Libertate'}
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Quarterly Milestones' : 'Repere Trimestriale'}</Label>
              {formData.milestones.map((milestone, idx) => (
                <Input
                  key={idx}
                  value={milestone}
                  onChange={(e) => {
                    const newMilestones = [...formData.milestones];
                    newMilestones[idx] = e.target.value;
                    setFormData(prev => ({ ...prev, milestones: newMilestones }));
                  }}
                  placeholder={`Q${idx + 1}: ${language === 'en' ? 'What milestone by end of Q' : 'Ce reper până la finalul Q'}${idx + 1}?`}
                  className="mt-2"
                />
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Anulează'}
              </Button>
              <Button className="flex-1" onClick={handleSaveVision} disabled={!formData.bigGoal.trim()}>
                {language === 'en' ? 'Save Vision' : 'Salvează Viziune'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Wizard Modal */}
      <GoalWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        category={wizardCategory}
        missionType="annual"
        period={`${currentYear}`}
        onComplete={() => window.location.reload()}
      />
    </div>
  );
};
