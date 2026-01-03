import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Target, Sparkles, Mic, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useObjectivesCheck } from '@/hooks/useObjectivesCheck';
import { useTranslation } from 'react-i18next';
import { format, addDays, startOfWeek } from 'date-fns';
import { ro } from 'date-fns/locale';
import { DoorPlanningModal } from '@/components/door/DoorPlanningModal';
import { VoicePlanningModal } from '@/components/door/VoicePlanningModal';

interface SundayPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SundayPlanningModal: React.FC<SundayPlanningModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { hasAnnual, hasQuarterly, hasMonthly, isLoading, annualObjectives, quarterlyObjectives, monthlyObjectives } = useObjectivesCheck();
  
  const [selectedObjective, setSelectedObjective] = useState<string>('');
  const [showAIPlanningModal, setShowAIPlanningModal] = useState(false);
  const [showVoicePlanningModal, setShowVoicePlanningModal] = useState(false);
  
  const dateLocale = i18n.language === 'ro' ? ro : undefined;
  
  // Calculate next week dates
  const today = new Date();
  const nextMonday = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
  const nextSunday = addDays(nextMonday, 6);
  
  const hasAllObjectives = hasAnnual && hasQuarterly && hasMonthly;
  const hasAnyObjective = hasAnnual || hasQuarterly || hasMonthly;

  const handleSetObjectives = () => {
    onClose();
    navigate('/door?tab=annual');
  };

  const handleSkip = () => {
    // Mark as shown for this week
    localStorage.setItem('sundayPlanningShown', format(today, 'yyyy-ww'));
    onClose();
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

  // Show planning modal with objectives
  return (
    <>
      <Dialog open={isOpen && !showAIPlanningModal && !showVoicePlanningModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {i18n.language === 'ro' ? 'Planifică Săptămâna Viitoare' : 'Plan Next Week'}
            </DialogTitle>
            <DialogDescription>
              {format(nextMonday, 'd MMM', { locale: dateLocale })} - {format(nextSunday, 'd MMM yyyy', { locale: dateLocale })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Connected Objectives Display */}
            <Card className="p-4 bg-muted/50">
              <h4 className="text-sm font-medium mb-3">
                {i18n.language === 'ro' ? 'Obiective conectate' : 'Connected Objectives'}
              </h4>
              <div className="space-y-2 text-sm">
                {hasAnnual && annualObjectives[0] && (
                  <div className="flex items-start gap-2">
                    <span className="text-primary">📅</span>
                    <div>
                      <span className="text-muted-foreground">{i18n.language === 'ro' ? 'Anual:' : 'Annual:'}</span>
                      <span className="ml-1">{annualObjectives[0].title || annualObjectives[0].goal_data?.title || 'Obiectiv anual'}</span>
                    </div>
                  </div>
                )}
                {hasQuarterly && quarterlyObjectives[0] && (
                  <div className="flex items-start gap-2">
                    <span className="text-primary">🎯</span>
                    <div>
                      <span className="text-muted-foreground">{i18n.language === 'ro' ? '90 Zile:' : '90 Days:'}</span>
                      <span className="ml-1">{quarterlyObjectives[0].title || quarterlyObjectives[0].goal_data?.title || 'Obiectiv 90 zile'}</span>
                    </div>
                  </div>
                )}
                {hasMonthly && monthlyObjectives[0] && (
                  <div className="flex items-start gap-2">
                    <span className="text-primary">📌</span>
                    <div>
                      <span className="text-muted-foreground">{i18n.language === 'ro' ? 'Lunar:' : 'Monthly:'}</span>
                      <span className="ml-1">{monthlyObjectives[0].title || monthlyObjectives[0].goal_data?.title || 'Obiectiv lunar'}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {!hasAllObjectives && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-2 p-0 h-auto"
                  onClick={handleSetObjectives}
                >
                  {i18n.language === 'ro' ? 'Completează obiectivele lipsă →' : 'Complete missing objectives →'}
                </Button>
              )}
            </Card>

            {/* Objective Selection */}
            {monthlyObjectives.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {i18n.language === 'ro' ? 'La ce obiectiv lunar lucrezi săptămâna aceasta?' : 'Which monthly objective are you working on this week?'}
                </label>
                <Select value={selectedObjective} onValueChange={setSelectedObjective}>
                  <SelectTrigger>
                    <SelectValue placeholder={i18n.language === 'ro' ? 'Selectează obiectiv' : 'Select objective'} />
                  </SelectTrigger>
                  <SelectContent>
                    {monthlyObjectives.map(obj => (
                      <SelectItem key={obj.id} value={obj.id}>
                        {obj.title || obj.goal_data?.title || 'Obiectiv lunar'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Planning Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                onClick={handleStartAIPlanning}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {i18n.language === 'ro' ? 'AI Planning' : 'AI Planning'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleStartVoicePlanning}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                {i18n.language === 'ro' ? 'Voice Planning' : 'Voice Planning'}
              </Button>
            </div>

            <Button variant="ghost" onClick={handleSkip} className="w-full">
              {i18n.language === 'ro' ? 'Mai târziu' : 'Later'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Planning Modal */}
      <DoorPlanningModal
        isOpen={showAIPlanningModal}
        onClose={() => setShowAIPlanningModal(false)}
        onPlanningComplete={handlePlanningComplete}
      />

      {/* Voice Planning Modal */}
      <VoicePlanningModal
        isOpen={showVoicePlanningModal}
        onClose={() => setShowVoicePlanningModal(false)}
        onPlanningComplete={handlePlanningComplete}
      />
    </>
  );
};
