import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Target, Sparkles, Mic, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useObjectivesCheck } from '@/hooks/useObjectivesCheck';
import { useTranslation } from 'react-i18next';
import { format, addDays, startOfWeek } from 'date-fns';
import { ro } from 'date-fns/locale';
import { DoorPlanningModal } from '@/components/door/DoorPlanningModal';
import { VoicePlanningModal } from '@/components/door/VoicePlanningModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SundayPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG = {
  body: { emoji: '💪', labelRo: 'Body', labelEn: 'Body', color: 'text-green-500' },
  being: { emoji: '🧠', labelRo: 'Being', labelEn: 'Being', color: 'text-purple-500' },
  balance: { emoji: '⚖️', labelRo: 'Balance', labelEn: 'Balance', color: 'text-blue-500' },
  business: { emoji: '💼', labelRo: 'Business', labelEn: 'Business', color: 'text-amber-500' },
};

export const SundayPlanningModal: React.FC<SundayPlanningModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { hasAnnual, hasQuarterly, hasMonthly, isLoading, objectivesByCategory, availableCategories } = useObjectivesCheck();
  
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedObjectives, setSelectedObjectives] = useState<Map<string, Set<string>>>(new Map());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAIPlanningModal, setShowAIPlanningModal] = useState(false);
  const [showVoicePlanningModal, setShowVoicePlanningModal] = useState(false);
  
  const dateLocale = i18n.language === 'ro' ? ro : undefined;
  
  const today = new Date();
  const nextMonday = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
  const nextSunday = addDays(nextMonday, 6);
  
  const hasAnyObjective = hasAnnual || hasQuarterly || hasMonthly;

  const handleSetObjectives = () => {
    onClose();
    navigate('/door?tab=annual');
  };

  const handleSkip = () => {
    localStorage.setItem('sundayPlanningShown', format(today, 'yyyy-ww'));
    onClose();
  };

  const toggleCategory = (category: string) => {
    const newSelected = new Set(selectedCategories);
    const newExpanded = new Set(expandedCategories);
    
    if (newSelected.has(category)) {
      newSelected.delete(category);
      newExpanded.delete(category);
      // Clear selected objectives for this category
      const newObjectives = new Map(selectedObjectives);
      newObjectives.delete(category);
      setSelectedObjectives(newObjectives);
    } else {
      newSelected.add(category);
      newExpanded.add(category);
    }
    
    setSelectedCategories(newSelected);
    setExpandedCategories(newExpanded);
  };

  const toggleExpanded = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleObjective = (category: string, objectiveId: string) => {
    const newObjectives = new Map(selectedObjectives);
    const categoryObjectives = newObjectives.get(category) || new Set();
    
    if (categoryObjectives.has(objectiveId)) {
      categoryObjectives.delete(objectiveId);
    } else {
      categoryObjectives.add(objectiveId);
    }
    
    if (categoryObjectives.size > 0) {
      newObjectives.set(category, categoryObjectives);
    } else {
      newObjectives.delete(category);
    }
    
    setSelectedObjectives(newObjectives);
  };

  const getTotalSelectedCount = () => {
    let count = 0;
    selectedObjectives.forEach(set => {
      count += set.size;
    });
    return count;
  };

  const getSelectedCategoriesCount = () => {
    return selectedObjectives.size;
  };

  const getSelectedObjectivesForPlanning = () => {
    const objectives: Array<{ category: string; objectiveId: string; title: string }> = [];
    
    selectedObjectives.forEach((objectiveIds, category) => {
      const catData = objectivesByCategory[category as keyof typeof objectivesByCategory];
      objectiveIds.forEach(id => {
        const obj = catData.monthly.find(o => o.id === id);
        if (obj) {
          objectives.push({
            category,
            objectiveId: id,
            title: obj.title || obj.goal_data?.title || 'Obiectiv',
          });
        }
      });
    });
    
    return objectives;
  };

  const handleStartAIPlanning = () => {
    setShowAIPlanningModal(true);
  };

  const handleStartVoicePlanning = () => {
    setShowVoicePlanningModal(true);
  };

  const handlePlanningComplete = () => {
    setShowAIPlanningModal(false);
    setShowVoicePlanningModal(false);
    localStorage.setItem('sundayPlanningShown', format(today, 'yyyy-ww'));
    onClose();
  };

  const getObjectiveTitle = (obj: any) => obj.title || obj.goal_data?.title || 'Obiectiv';

  if (isLoading) {
    return null;
  }

  // If no objectives at all, show setup prompt
  if (!hasAnyObjective) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {i18n.language === 'ro' ? 'Setează-ți Obiectivele pentru 2026' : 'Set Your 2026 Objectives'}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'ro' 
                ? 'Pentru o planificare eficientă a săptămânii, recomandăm să setezi mai întâi obiectivele anuale, pe 90 de zile și lunare.'
                : 'For effective weekly planning, we recommend setting your annual, 90-day, and monthly objectives first.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    {i18n.language === 'ro' ? 'Nu ai obiective setate' : 'No objectives set'}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {i18n.language === 'ro' 
                      ? 'Obiectivele te ajută să îți planifici săptămânile în funcție de ce contează cu adevărat.'
                      : 'Objectives help you plan your weeks around what truly matters.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={handleSetObjectives} className="w-full">
                <Target className="h-4 w-4 mr-2" />
                {i18n.language === 'ro' ? 'Setez obiectivele' : 'Set objectives'}
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="w-full">
                {i18n.language === 'ro' ? 'Sari peste' : 'Skip for now'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen && !showAIPlanningModal && !showVoicePlanningModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {i18n.language === 'ro' ? 'Planifică Săptămâna Viitoare' : 'Plan Next Week'}
            </DialogTitle>
            <DialogDescription>
              {format(nextMonday, 'd MMM', { locale: dateLocale })} - {format(nextSunday, 'd MMM yyyy', { locale: dateLocale })}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              {/* Domain Selection Grid */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {i18n.language === 'ro' ? 'La ce domenii lucrezi săptămâna aceasta?' : 'Which domains are you working on this week?'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const catData = objectivesByCategory[key as keyof typeof objectivesByCategory];
                    const hasObjectives = catData.annual.length > 0 || catData.quarterly.length > 0 || catData.monthly.length > 0;
                    const isSelected = selectedCategories.has(key);
                    const monthlyCount = catData.monthly.length;
                    
                    return (
                      <button
                        key={key}
                        onClick={() => hasObjectives && toggleCategory(key)}
                        disabled={!hasObjectives}
                        className={`
                          p-3 rounded-lg border-2 transition-all text-left
                          ${isSelected 
                            ? 'border-primary bg-primary/10' 
                            : hasObjectives 
                              ? 'border-border hover:border-primary/50 bg-card' 
                              : 'border-border/50 bg-muted/30 opacity-50 cursor-not-allowed'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={isSelected} 
                              disabled={!hasObjectives}
                              className="pointer-events-none"
                            />
                            <span className="text-lg">{config.emoji}</span>
                            <span className="font-medium text-sm">
                              {i18n.language === 'ro' ? config.labelRo : config.labelEn}
                            </span>
                          </div>
                          {monthlyCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {monthlyCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expanded Category Panels */}
              {Array.from(selectedCategories).map(category => {
                const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
                const catData = objectivesByCategory[category as keyof typeof objectivesByCategory];
                const isExpanded = expandedCategories.has(category);
                const selectedForCategory = selectedObjectives.get(category) || new Set();
                
                return (
                  <Collapsible 
                    key={category} 
                    open={isExpanded} 
                    onOpenChange={() => toggleExpanded(category)}
                  >
                    <Card className="p-0 overflow-hidden">
                      <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config.emoji}</span>
                          <span className="font-semibold text-sm uppercase tracking-wide">
                            {i18n.language === 'ro' ? config.labelRo : config.labelEn}
                          </span>
                          {selectedForCategory.size > 0 && (
                            <Badge className="text-xs">
                              {selectedForCategory.size} {i18n.language === 'ro' ? 'selectat' : 'selected'}
                            </Badge>
                          )}
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-0 space-y-3 border-t">
                          {/* Connected objectives info */}
                          <div className="text-xs text-muted-foreground space-y-1 pt-3">
                            {catData.annual.length > 0 && (
                              <div>
                                <span className="font-medium">📅 {i18n.language === 'ro' ? 'Anual:' : 'Annual:'}</span>{' '}
                                {catData.annual.map(o => getObjectiveTitle(o)).join(', ')}
                              </div>
                            )}
                            {catData.quarterly.length > 0 && (
                              <div>
                                <span className="font-medium">🎯 {i18n.language === 'ro' ? '90 Zile:' : '90 Days:'}</span>{' '}
                                {catData.quarterly.map(o => getObjectiveTitle(o)).join(', ')}
                              </div>
                            )}
                          </div>
                          
                          {/* Monthly objectives checkboxes */}
                          {catData.monthly.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                📌 {i18n.language === 'ro' ? 'Selectează obiectivele lunare:' : 'Select monthly objectives:'}
                              </p>
                              {catData.monthly.map(obj => (
                                <label
                                  key={obj.id}
                                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                  <Checkbox
                                    checked={selectedForCategory.has(obj.id)}
                                    onCheckedChange={() => toggleObjective(category, obj.id)}
                                  />
                                  <span className="text-sm">{getObjectiveTitle(obj)}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          
                          {catData.monthly.length === 0 && (
                            <p className="text-xs text-muted-foreground italic py-2">
                              {i18n.language === 'ro' 
                                ? 'Nu ai obiective lunare pentru acest domeniu.' 
                                : 'No monthly objectives for this domain.'}
                            </p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}

              {/* Selection Summary */}
              {getTotalSelectedCount() > 0 && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-center">
                    📊 {getTotalSelectedCount()} {i18n.language === 'ro' ? 'obiective selectate din' : 'objectives selected from'} {getSelectedCategoriesCount()} {i18n.language === 'ro' ? 'domenii' : 'domains'}
                  </p>
                </div>
              )}

              {/* Planning Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  onClick={handleStartAIPlanning}
                  className="flex items-center gap-2"
                  disabled={getTotalSelectedCount() === 0}
                >
                  <Sparkles className="h-4 w-4" />
                  AI Planning
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleStartVoicePlanning}
                  className="flex items-center gap-2"
                  disabled={getTotalSelectedCount() === 0}
                >
                  <Mic className="h-4 w-4" />
                  Voice Planning
                </Button>
              </div>

              <Button variant="ghost" onClick={handleSkip} className="w-full">
                {i18n.language === 'ro' ? 'Mai târziu' : 'Later'}
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* AI Planning Modal */}
      <DoorPlanningModal
        isOpen={showAIPlanningModal}
        onClose={() => setShowAIPlanningModal(false)}
        onPlanningComplete={handlePlanningComplete}
        selectedObjectives={getSelectedObjectivesForPlanning()}
      />

      {/* Voice Planning Modal */}
      <VoicePlanningModal
        isOpen={showVoicePlanningModal}
        onClose={() => setShowVoicePlanningModal(false)}
        onPlanningComplete={handlePlanningComplete}
        selectedObjectives={getSelectedObjectivesForPlanning()}
      />
    </>
  );
};
