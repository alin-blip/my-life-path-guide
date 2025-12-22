import React, { useState, useEffect } from 'react';
import { VoiceTextarea } from '@/components/ui/VoiceTextarea';
import { Info, Check, Plus, KeyRound, Sparkles, Flame, Trophy, Rocket, Mic, RefreshCw } from 'lucide-react';
import { HotListItem, DominoKeyPoint, PlanningResult } from '@/types/door';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { DoorPlanningModal } from './DoorPlanningModal';
import { VoicePlanningModal } from './VoicePlanningModal';
import { WeeklyPlanningHistory } from './WeeklyPlanningHistory';
import { WeeklyAnalyticsDashboard } from './WeeklyAnalyticsDashboard';
import { DoorExplanation } from './DoorExplanation';
import { DoorActionsMenu } from './DoorActionsMenu';
import { useToast } from '@/hooks/use-toast';
import { KeyPointMetadataPopover } from './KeyPointMetadataPopover';
import { weeklyPlanningService, WeeklyPlanningData } from '@/services/weeklyPlanningService';
import { exportWeeklyPlanToPDF } from '@/services/pdfExportService';
import { getISOWeek, getYear } from 'date-fns';

interface DominoDoorProps {
  selectedDomino: HotListItem | null;
  dominoKeyPoints: DominoKeyPoint[];
  updateKeyPointText: (id: string, text: string) => void;
  handleDragOverDomino: (e: React.DragEvent) => void;
  handleDropOnDomino: (e: React.DragEvent) => void;
  handleKeyPointDragStart: (e: React.DragEvent, keyPoint: DominoKeyPoint) => void;
  isMobile?: boolean;
  isCompleted?: boolean;
  moveKeyPointToHotList?: (keyPoint: DominoKeyPoint) => void;
  addNewKeyPoint?: () => void;
  handleDropOnKeyPoint?: (keyPointId: string) => void;
  setSelectedDomino?: (domino: HotListItem | null) => void;
  setDominoKeyPoints?: (keyPoints: DominoKeyPoint[]) => void;
}

const KeyPointIcons = [
  { icon: KeyRound, color: 'text-yellow-500' },
  { icon: Sparkles, color: 'text-purple-500' },
  { icon: Flame, color: 'text-orange-500' },
  { icon: Trophy, color: 'text-blue-500' }
];

export const DominoDoor: React.FC<DominoDoorProps> = ({
  selectedDomino,
  dominoKeyPoints,
  updateKeyPointText,
  handleDragOverDomino,
  handleDropOnDomino,
  handleKeyPointDragStart,
  isMobile = false,
  isCompleted = false,
  moveKeyPointToHotList,
  addNewKeyPoint,
  handleDropOnKeyPoint,
  setSelectedDomino,
  setDominoKeyPoints
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showAIPlanningModal, setShowAIPlanningModal] = useState(false);
  const [showVoicePlanningModal, setShowVoicePlanningModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [allPlans, setAllPlans] = useState<WeeklyPlanningData[]>([]);

  useEffect(() => {
    loadAllPlans();
  }, []);

  const loadAllPlans = async () => {
    const plans = await weeklyPlanningService.getAllPlans();
    setAllPlans(plans);
  };

  const handlePlanningComplete = (result: PlanningResult) => {
    if (!setSelectedDomino || !setDominoKeyPoints) return;

    // Set Domino Door
    setSelectedDomino({
      id: `domino-${Date.now()}`,
      text: result.dominoTitle,
      selected: true,
      priority: 'urgent-important'
    });

    // Set 4 key points with metadata
    setDominoKeyPoints(result.keyPoints.map((kp) => ({
      id: `key${kp.id}`,
      text: kp.title,
      completed: false,
      metadata: {
        objective: kp.objective,
        why: kp.why,
        positiveImpact: kp.positiveImpact,
        negativeImpact: kp.negativeImpact,
        steps: kp.steps,
        responsible: kp.responsible,
        deadline: kp.deadline
      }
    })));

    setShowAIPlanningModal(false);
    setShowVoicePlanningModal(false);
    loadAllPlans(); // Reload plans after completion
    
    toast({
      title: "✅ Planificare completată!",
      description: `Domino Door și cele 4 chei au fost setate pentru săptămâna aceasta.`,
    });
  };

  const handleExportPDF = async () => {
    if (!selectedDomino || !setSelectedDomino || !setDominoKeyPoints) return;

    const today = new Date();
    const currentWeekKey = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
    
    const currentPlan: WeeklyPlanningData = {
      weekKey: currentWeekKey,
      dominoTitle: selectedDomino.text,
      weekGoal: '',
      keyPoints: dominoKeyPoints.map(kp => ({
        id: parseInt(kp.id.replace('key', '')),
        title: kp.text,
        objective: kp.metadata?.objective || '',
        why: kp.metadata?.why || '',
        positiveImpact: kp.metadata?.positiveImpact || '',
        negativeImpact: kp.metadata?.negativeImpact || '',
        steps: kp.metadata?.steps || [],
        responsible: kp.metadata?.responsible || '',
        deadline: kp.metadata?.deadline || '',
      })),
    };

    try {
      await exportWeeklyPlanToPDF(currentPlan);
      toast({
        title: 'PDF Export Successful',
        description: 'Planul săptămânal a fost exportat cu succes!',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Eroare Export',
        description: 'Nu s-a putut exporta PDF-ul',
        variant: 'destructive',
      });
    }
  };

  const handleSelectHistoryPlan = (plan: WeeklyPlanningData) => {
    if (!setSelectedDomino || !setDominoKeyPoints) return;

    setSelectedDomino({
      id: `domino-history-${Date.now()}`,
      text: plan.dominoTitle,
      selected: true,
      priority: 'urgent-important'
    });

    setDominoKeyPoints(plan.keyPoints.map((kp) => ({
      id: `key${kp.id}`,
      text: kp.title,
      completed: false,
      metadata: {
        objective: kp.objective,
        why: kp.why,
        positiveImpact: kp.positiveImpact,
        negativeImpact: kp.negativeImpact,
        steps: kp.steps,
        responsible: kp.responsible,
        deadline: kp.deadline
      }
    })));

    toast({
      title: 'Plan Încărcat',
      description: `Planul din ${plan.weekKey} a fost încărcat cu succes`,
    });
  };

  const handleDeleteCurrentPlan = async () => {
    if (!setSelectedDomino || !setDominoKeyPoints) return;

    const confirm = window.confirm('Ștergi focusul săptămânal (Domino + Chei) pentru săptămâna curentă?');
    if (!confirm) return;

    try {
      const today = new Date();
      const currentWeekKey = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
      const plan = await weeklyPlanningService.getPlanForWeek(currentWeekKey);

      if (plan?.id) {
        const ok = await weeklyPlanningService.deletePlan(plan.id);
        if (!ok) throw new Error('Nu s-a putut șterge planul din cloud');
      }

      // Reset local state (avoid re-creare plan gol la auto-save)
      setSelectedDomino(null);
      setDominoKeyPoints([
        { id: 'key1', text: '', completed: false },
        { id: 'key2', text: '', completed: false },
        { id: 'key3', text: '', completed: false },
        { id: 'key4', text: '', completed: false },
      ]);

      toast({
        title: '🗑️ Focus șters',
        description: 'Focusul săptămânal și cheile au fost eliminate pentru săptămâna curentă.',
      });

      // Refresh lists (history/analytics)
      loadAllPlans();
    } catch (e: any) {
      console.error('Delete plan error:', e);
      toast({
        title: 'Eroare',
        description: e?.message || 'Nu s-a putut șterge focusul',
        variant: 'destructive',
      });
    }
  };
  
  // Ensure we always render exactly 4 key points
  const limitedKeyPoints = dominoKeyPoints.slice(0, 4);
  
  // If we have fewer than 4 key points, pad with empty ones (for display purposes only)
  const displayKeyPoints = [...limitedKeyPoints];
  while (displayKeyPoints.length < 4) {
    displayKeyPoints.push({
      id: `placeholder-${displayKeyPoints.length}`,
      text: '',
    });
  }
  
  // Calculate completion badge
  const completedKeys = dominoKeyPoints.filter(kp => kp.completed && kp.text.trim()).length;
  const totalKeys = dominoKeyPoints.filter(kp => kp.text.trim()).length;

  return (
    <div 
      className={`bg-card rounded-xl shadow-sm border border-border ${
        isMobile ? 'p-4' : 'h-full p-6'
      }`}
      onDragOver={handleDragOverDomino}
      onDrop={handleDropOnDomino}
    >
      {selectedDomino ? (
        <div className={`space-y-4 animate-fade-in ${isMobile ? '' : 'space-y-6'}`}>
          {/* Header with Primary Actions */}
          <div className={`flex items-center justify-between gap-2 pb-3 border-b border-border ${isMobile ? 'flex-wrap' : ''}`}>
            <div className="flex flex-wrap items-center gap-2">
              {/* Primary Action Buttons - Larger with Gradients */}
              <Button
                onClick={() => setShowAIPlanningModal(true)}
                variant="default"
                size={isMobile ? 'sm' : 'default'}
                className="gap-2 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl font-semibold h-10"
              >
                <Rocket className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} transition-transform group-hover:rotate-12`} />
                {!isMobile && <span>AI Planning</span>}
              </Button>
              
              <Button
                onClick={() => setShowVoicePlanningModal(true)}
                variant="secondary"
                size={isMobile ? 'sm' : 'default'}
                className="gap-2 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl font-semibold h-10 border-0"
              >
                <Mic className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} transition-transform group-hover:scale-110`} />
                {!isMobile && <span>Voice</span>}
              </Button>

              {/* Secondary Actions Dropdown */}
              <DoorActionsMenu
                onViewHistory={() => {
                  loadAllPlans();
                  setShowHistory(true);
                }}
                onExportPDF={handleExportPDF}
                onViewAnalytics={() => {
                  loadAllPlans();
                  setShowAnalytics(true);
                }}
                onDelete={handleDeleteCurrentPlan}
                disabled={!selectedDomino}
                isMobile={isMobile}
              />
            </div>

            {/* Completion Badge + Info */}
            <div className="flex items-center gap-2">
              {totalKeys > 0 && (
                <Badge 
                  variant={completedKeys === totalKeys ? "default" : "secondary"}
                  className={`${
                    completedKeys === totalKeys 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                      : 'bg-accent/50 text-accent-foreground border border-border/50'
                  } px-3 py-1.5 rounded-lg font-bold text-sm`}
                >
                  {completedKeys}/{totalKeys} ✓
                </Badge>
              )}
              <Button
                onClick={() => setShowExplanation(true)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg"
                title="Veți explicația Domino Door"
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Selected Domino Goal Display */}
          <div className={`${
            isCompleted 
              ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-l-4 border-green-500' 
              : 'bg-gradient-to-r from-primary/20 to-accent/20 border-l-4 border-primary'
          } p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-scale-in`}>
            <p className="text-muted-foreground font-semibold mb-2 text-xs uppercase tracking-wide">
              {t('mainGoal')}
            </p>
            <p className="text-foreground text-lg font-medium leading-relaxed">
              {selectedDomino.text}
            </p>
            {isCompleted && (
              <div className="flex items-center text-green-400 mt-3 bg-green-500/10 px-3 py-1.5 rounded-lg inline-flex gap-1">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">{t('completed')}</span>
              </div>
            )}
          </div>
          
          {/* Key Points Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-foreground font-semibold text-base">
                {t('keyPoints')}
              </p>
              {addNewKeyPoint && displayKeyPoints.length < 4 && (
                <Button 
                  onClick={addNewKeyPoint} 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-all rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="grid gap-3">
              {displayKeyPoints.map((point, index) => (
                <KeyPointMetadataPopover key={point.id} keyPoint={point}>
                  <div 
                    className={`flex items-start gap-3 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02] border cursor-pointer ${
                      point.completed 
                        ? 'bg-green-500/10 border-green-500/30 animate-scale-in' 
                        : point.isContinued
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-accent/30 border-border/50'
                    }`}
                    draggable={point.text && point.text.trim().length > 0}
                    onDragStart={(e) => handleKeyPointDragStart(e, point)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnKeyPoint && handleDropOnKeyPoint(point.id)}
                  >
                    <div className={`flex-shrink-0 rounded-full flex items-center justify-center shadow-md ${
                      point.completed 
                        ? 'bg-gradient-to-br from-green-400 to-green-600' 
                        : point.isContinued
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                        : 'bg-gradient-to-br from-primary to-accent'
                    } w-8 h-8`}>
                      {point.completed ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        React.createElement(KeyPointIcons[index % 4].icon, { 
                          className: `w-4 h-4 text-white` 
                        })
                      )}
                    </div>
                    
                    <div className="flex-grow flex flex-col gap-1">
                      {point.isContinued && (
                        <Badge 
                          variant="secondary" 
                          className="self-start text-xs bg-amber-500/20 text-amber-600 border-amber-500/30 mb-1"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Continuat
                        </Badge>
                      )}
                      <VoiceTextarea
                        className={`flex-grow bg-transparent border-none focus:ring-0 focus:ring-offset-0 p-0 min-h-0 resize-none ${
                          point.completed 
                            ? 'text-muted-foreground line-through' 
                            : 'text-foreground'
                        } text-sm font-medium`}
                        placeholder={`${t('keyPoint')} ${index + 1}`}
                        value={point.text}
                        onChange={(e) => updateKeyPointText(point.id, e.target.value)}
                        rows={1}
                        language="ro"
                      />
                    </div>
                    
                    {point.text && point.text.trim().length > 0 && moveKeyPointToHotList && (
                      <button 
                        onClick={() => moveKeyPointToHotList(point)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-accent"
                        title={t('moveBackToIdeaList')}
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </button>
                    )}
                  </div>
                </KeyPointMetadataPopover>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State - Clean & Compact for mobile */
        <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-8' : 'py-12'} px-4`}>
          <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl bg-primary/10 flex items-center justify-center mb-3`}>
            <KeyRound className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-primary`} />
          </div>
          <p className={`text-foreground font-semibold ${isMobile ? 'text-base' : 'text-lg'} mb-1`}>
            {t('noGoalSelected')}
          </p>
          <p className="text-muted-foreground text-sm text-center max-w-xs mb-4">
            {t('dragGoalToSet')}
          </p>
          
          {setSelectedDomino && setDominoKeyPoints && (
            <Button
              onClick={() => setShowAIPlanningModal(true)}
              variant="default"
              size={isMobile ? 'sm' : 'default'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium gap-2"
            >
              <Rocket className="w-4 h-4" />
              Start Planning
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {showAIPlanningModal && setSelectedDomino && setDominoKeyPoints && (
        <DoorPlanningModal
          isOpen={showAIPlanningModal}
          onClose={() => setShowAIPlanningModal(false)}
          onPlanningComplete={handlePlanningComplete}
        />
      )}

      {showVoicePlanningModal && setSelectedDomino && setDominoKeyPoints && (
        <VoicePlanningModal
          isOpen={showVoicePlanningModal}
          onClose={() => setShowVoicePlanningModal(false)}
          onPlanningComplete={handlePlanningComplete}
        />
      )}

      {showHistory && (
        <WeeklyPlanningHistory
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          plans={allPlans}
          onSelectPlan={handleSelectHistoryPlan}
          onRefresh={loadAllPlans}
        />
      )}

      {showAnalytics && (
        <WeeklyAnalyticsDashboard
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)}
          plans={allPlans}
        />
      )}

      {/* Explanation Dialog */}
      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ce este Domino Door?</DialogTitle>
          </DialogHeader>
          <DoorExplanation />
        </DialogContent>
      </Dialog>
    </div>
  );
};
