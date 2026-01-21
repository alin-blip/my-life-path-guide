import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Crown, Dumbbell, Brain, Heart, Briefcase, Plus, Edit2, Star, Sparkles, ChevronDown, Target, Flag, Sword, CheckCircle2, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { GoalWizardModal } from '@/components/goal-wizard/GoalWizardModal';
import { CategorySelectionDialog } from '@/components/goal-wizard/CategorySelectionDialog';
import { GoalCategory } from '@/types/goalWizard';
import { useChildMissions } from '@/hooks/useHierarchyData';
import { UpgradePromptModal } from '@/components/membership/UpgradePromptModal';
import type { WarriorPowerScores } from '@/data/warriorPowerQuestions';

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
    label: { en: 'Spirituality', ro: 'Spiritualitate' },
    question: { en: 'What does your most evolved self look like?', ro: 'Cum arată versiunea ta cea mai evoluată?' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    gradient: 'from-purple-600 to-purple-400'
  },
  balance: {
    icon: Heart,
    label: { en: 'Relationships', ro: 'Relații' },
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const incomingState = location.state as { 
    fromWarriorPower?: boolean; 
    fromVisionQuiz?: boolean;
    fromBusinessLeadMagnet?: boolean;
    userName?: string;
    scores?: WarriorPowerScores | Record<string, number>;
    suggestedCategory?: string;
  } | null;
  
  const { language } = useLanguage();
  const { subscribed, subscriptionTier } = useAuth();
  const { toast } = useToast();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [visions, setVisions] = useState<AnnualVision[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVision, setEditingVision] = useState<AnnualVision | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(!!incomingState?.fromWarriorPower || !!incomingState?.fromVisionQuiz || !!incomingState?.fromBusinessLeadMagnet);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Determine if user can edit (subscribed and not on trial)
  const isTrial = subscriptionTier?.toLowerCase().includes('trial');
  const hasActiveSubscription = subscribed && !isTrial;
  
  // Check if from business lead magnet via URL
  const fromBusinessLeadMagnet = searchParams.get('source') === 'business-lead-magnet' || !!incomingState?.fromBusinessLeadMagnet;
  
  const [formData, setFormData] = useState({
    bigGoal: '',
    why: '',
    oneWord: '',
    milestones: ['', '', '', '']
  });

  // Goal Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<GoalCategory>('body');
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  
  // Check for startWizard parameter from onboarding or Vision Quiz
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('startWizard') === 'true') {
      // If coming from Vision Quiz, pre-select the suggested category (lowest score)
      if (incomingState?.fromVisionQuiz && incomingState.suggestedCategory) {
        setWizardCategory(incomingState.suggestedCategory as GoalCategory);
      }
      // Open category selection dialog
      setShowCategorySelection(true);
      // Clean the parameter from URL
      const newUrl = `${window.location.pathname}?tab=annual`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, incomingState]);
  
  // Check for checkout success
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === 'success') {
      toast({
        title: language === 'en' ? 'Payment successful!' : 'Plată reușită!',
        description: language === 'en' 
          ? 'Welcome to Pro! Now create your annual goals.' 
          : 'Bun venit în Pro! Acum creează-ți obiectivele anuale.',
      });
    }
  }, [location.search]);

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

  useEffect(() => {
    fetchVisions();
  }, [currentYear]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchVisions();
    };
    
    window.addEventListener('annualGoalsUpdated', handleRefresh);
    return () => {
      window.removeEventListener('annualGoalsUpdated', handleRefresh);
    };
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
    // Block editing for trial users
    if (!hasActiveSubscription) {
      setShowUpgradeModal(true);
      return;
    }
    
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
      <div className="p-2 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6">
      {/* Welcome from Warrior Power, Vision Quiz, or Business Lead Magnet */}
      {showWelcome && (
        <Card className={cn(
          "mb-6 border",
          fromBusinessLeadMagnet
            ? "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-purple-500/10 border-blue-500/30"
            : incomingState?.fromVisionQuiz 
              ? "bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10 border-amber-500/30"
              : "bg-gradient-to-r from-primary/10 via-background to-accent/10 border-primary/30"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                fromBusinessLeadMagnet 
                  ? "bg-blue-500/20" 
                  : incomingState?.fromVisionQuiz 
                    ? "bg-amber-500/20" 
                    : "bg-primary/20"
              )}>
                {fromBusinessLeadMagnet ? (
                  <Briefcase className="h-6 w-6 text-blue-500" />
                ) : incomingState?.fromVisionQuiz ? (
                  <Sparkles className="h-6 w-6 text-amber-500" />
                ) : (
                  <Sword className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {fromBusinessLeadMagnet
                      ? (language === 'en' 
                          ? `Welcome${incomingState?.userName ? `, ${incomingState.userName}` : ''}! Let's create your 2026 Business Plan` 
                          : `Bun venit${incomingState?.userName ? `, ${incomingState.userName}` : ''}! Hai să îți creăm planul de business pentru 2026`)
                      : incomingState?.fromVisionQuiz
                        ? (language === 'en' 
                            ? 'Great! Now set your 2025 goals' 
                            : 'Excelent! Acum setează obiectivele pentru 2025')
                        : (language === 'en' 
                            ? 'Excellent! Now define your annual goals' 
                            : 'Excelent! Acum definește obiectivele tale anuale')
                    }
                  </h3>
                  {(incomingState?.scores || fromBusinessLeadMagnet) && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {fromBusinessLeadMagnet 
                        ? (language === 'en' ? '3 Days Free' : '3 Zile Gratuit')
                        : incomingState?.fromVisionQuiz ? 'Vision 2026 Complet' : 'Warrior Power Complet'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {fromBusinessLeadMagnet
                    ? (language === 'en'
                        ? 'Start with the Business category to define your "impossible" goals for 2026. The AI wizard will guide you step by step.'
                        : 'Începe cu categoria Business pentru a-ți defini obiectivele "imposibile" pentru 2026. Wizard-ul AI te va ghida pas cu pas.')
                    : incomingState?.fromVisionQuiz
                      ? (language === 'en' 
                          ? 'Based on your quiz results, start with your weakest area for maximum impact. The AI Goal Wizard will help you create powerful objectives.'
                          : 'Pe baza rezultatelor quiz-ului, începe cu zona ta cea mai slabă pentru impact maxim. Wizard-ul AI te va ajuta să creezi obiective puternice.')
                      : (language === 'en'
                          ? 'Based on your Warrior Power assessment, create one "impossible" goal for each life dimension. These will be your north star for the year.'
                          : 'Bazat pe evaluarea ta Warrior Power, creează câte un obiectiv "imposibil" pentru fiecare dimensiune a vieții. Acestea vor fi steaua ta călăuzitoare pentru tot anul.')
                  }
                </p>
                {fromBusinessLeadMagnet && (
                  <Button 
                    className="mt-3 gap-2"
                    onClick={() => {
                      setWizardCategory('business');
                      setWizardOpen(true);
                      setShowWelcome(false);
                    }}
                  >
                    <Briefcase className="w-4 h-4" />
                    {language === 'en' ? 'Start with Business' : 'Începe cu Business'}
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWelcome(false)}
                className="text-muted-foreground"
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Trial user notice */}
      {isTrial && (
        <Card className="mb-6 bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-foreground">
                  {language === 'en' ? 'Trial Mode' : 'Mod Trial'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'You can create goals but editing is locked. Upgrade to unlock all features.'
                    : 'Poți crea obiective dar editarea este blocată. Fă upgrade pentru toate funcțiile.'}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowUpgradeModal(true)} size="sm" className="gap-2">
              <Crown className="w-4 h-4" />
              {language === 'en' ? 'Upgrade' : 'Upgrade'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Year Navigation - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-0 sm:block">
          <Crown className="w-5 h-5 sm:hidden text-goddess-gold" />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Crown className="hidden sm:block w-6 h-6 text-goddess-gold" />
              {language === 'en' ? 'Annual Vision' : 'Viziune Anuală'}
            </h1>
            <p className="text-xs sm:text-base text-muted-foreground hidden sm:block">
              {language === 'en' ? 'Your big picture goals for the year' : 'Obiectivele tale mari pentru an'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setCurrentYear(y => y - 1)}>
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          
          <div className="text-center min-w-[60px] sm:min-w-[80px]">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{currentYear}</div>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setCurrentYear(y => y + 1)}>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      {/* Vision Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
              <div className={cn("h-1.5 sm:h-2 bg-gradient-to-r", config.gradient)} />
              
              <CardHeader className={cn(config.bgColor, "p-3 sm:pb-4 sm:p-6")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-background/50">
                      <Icon className={cn("w-5 h-5 sm:w-7 sm:h-7", config.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-xl">
                        {config.label[language === 'en' ? 'en' : 'ro']}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
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
                      className="gap-1 h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3"
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

      {/* Category Selection Dialog for Onboarding */}
      <CategorySelectionDialog
        isOpen={showCategorySelection}
        onClose={() => setShowCategorySelection(false)}
        onSelectCategory={(category) => {
          setShowCategorySelection(false);
          setWizardCategory(category);
          setWizardOpen(true);
        }}
      />

      {/* Goal Wizard Modal */}
      <GoalWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        category={wizardCategory}
        missionType="annual"
        period={`${currentYear}`}
        onComplete={() => {
          // Refresh data without page reload
          setWizardOpen(false);
          // Trigger refetch by toggling state
          window.dispatchEvent(new CustomEvent('annualGoalsUpdated'));
        }}
      />

      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={language === 'en' ? 'Edit Goals' : 'Editare Obiective'}
      />
    </div>
  );
};
