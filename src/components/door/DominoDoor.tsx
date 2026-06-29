import React, { useState, useEffect } from 'react';
import { getWeekKeyForPlanning } from '@/utils/weekUtils';
import { VoiceTextarea } from '@/components/ui/VoiceTextarea';
import { Info, Check, Plus, KeyRound, Sparkles, Flame, Trophy, Rocket, RefreshCw, Loader2, ArrowDown, X, History } from 'lucide-react';
import { DominoVersionHistory } from './DominoVersionHistory';
import { HotListItem, DominoKeyPoint, PlanningResult } from '@/types/door';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/context/LanguageContext';
import { DoorPlanningModal } from './DoorPlanningModal';
import { DoorExplanation } from './DoorExplanation';
import { useToast } from '@/hooks/use-toast';
import { KeyPointMetadataPopover } from './KeyPointMetadataPopover';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { getISOWeek, getYear } from 'date-fns';
import { useWeeklyHierarchy } from '@/hooks/useWeeklyHierarchy';
import { HierarchyChain } from './HierarchyBadge';
import { WeeklyPlanSaveStatus } from './WeeklyPlanSaveStatus';
import { cn } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

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
  weekKey?: string;
  saveStatus?: SaveStatus;
  lastSaveTime?: Date | null;
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
  setDominoKeyPoints,
  weekKey,
  saveStatus = 'idle',
  lastSaveTime
}) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [showAIPlanningModal, setShowAIPlanningModal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAIKeyPointsPrompt, setShowAIKeyPointsPrompt] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const [showDropSuccess, setShowDropSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Use centralized week key logic (same as DoorPlanningModal)
  const planningWeekKey = React.useMemo(() => getWeekKeyForPlanning(), []);

  const planningDraftKey = `doorPlanningDraft_${planningWeekKey}`;
  const planningDismissedKey = `doorPlanningDismissed_${planningWeekKey}`;

  useEffect(() => {
    if (showAIPlanningModal) return;
    if (localStorage.getItem(planningDismissedKey) === '1') return;

    const raw = localStorage.getItem(planningDraftKey);
    if (!raw) return;

    try {
      const draft = JSON.parse(raw);
      if (Array.isArray(draft?.messages) && draft.messages.length > 0) {
        setShowAIPlanningModal(true);
      }
    } catch {
      // ignore
    }
  }, [showAIPlanningModal, planningDraftKey, planningDismissedKey]);

  // Fetch hierarchy for the current week
  const { hierarchy } = useWeeklyHierarchy(weekKey || null);

  // Build hierarchy chain for display
  const hierarchyChain = React.useMemo(() => {
    const chain: Array<{ type: 'annual' | 'quarterly' | 'monthly' | 'weekly'; title: string }> = [];
    
    if (hierarchy.annual?.title) {
      chain.push({ type: 'annual', title: hierarchy.annual.title });
    }
    if (hierarchy.quarterly?.title) {
      chain.push({ type: 'quarterly', title: hierarchy.quarterly.title });
    }
    if (hierarchy.monthly?.title) {
      chain.push({ type: 'monthly', title: hierarchy.monthly.title });
    }
    
    return chain;
  }, [hierarchy]);

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
    
    toast({
      title: "✅ Planificare completată!",
      description: `Domino Door și cele 4 chei au fost setate pentru săptămâna aceasta.`,
    });
  };

  // Ensure we always render exactly 4 key points
  const limitedKeyPoints = dominoKeyPoints.slice(0, 4);
  
  // If we have fewer than 4 key points, pad with empty ones
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

  // Handle drop directly for monthly missions when setters are available
  const handleLocalDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Show processing state
    setIsProcessingDrop(true);
    
    // Try to handle monthly mission drop directly
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData && setSelectedDomino && setDominoKeyPoints) {
      try {
        const data = JSON.parse(jsonData);
        if (data.type === 'idea-bank-item') {
          // Handle idea from Ideas Bank dropped on Domino
          await new Promise(resolve => setTimeout(resolve, 200));
          
          setSelectedDomino({
            id: `idea-${data.id}`,
            text: data.text,
            selected: true,
            priority: 'urgent-important'
          });
          
          // Reset key points for manual/AI filling
          setDominoKeyPoints([
            { id: 'key1', text: '', completed: false },
            { id: 'key2', text: '', completed: false },
            { id: 'key3', text: '', completed: false },
            { id: 'key4', text: '', completed: false }
          ]);
          setShowAIKeyPointsPrompt(true);
          
          // Archive the idea from ideas_bank
          try {
            const { ideasBankService } = await import('@/services/ideasBankService');
            await ideasBankService.updateIdea(data.id, { status: 'archived' });
          } catch (err) {
            console.warn('[DominoDoor] Could not archive idea:', err);
          }
          
          setIsProcessingDrop(false);
          setShowDropSuccess(true);
          setTimeout(() => setShowDropSuccess(false), 1000);
          
          toast({
            title: '🎯 Domino setat din Idei!',
            description: `"${data.text}" este acum focusul tău săptămânal. Generează key points cu AI!`
          });
          
          console.debug('[DominoDoor] Idea bank item dropped as Domino', { id: data.id, text: data.text });
          return;
        }
        
        if (data.type === 'monthly-mission') {
          // Brief delay for processing animation
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Set the mission as domino
          setSelectedDomino({
            id: `monthly-${data.id}`,
            text: data.text,
            selected: true,
            priority: 'urgent-important'
          });
          
          // Auto-populate key points from keyActions
          if (data.keyActions && data.keyActions.length > 0) {
            const newKeyPoints = data.keyActions.slice(0, 4).map((action: string, idx: number) => ({
              id: `key${idx + 1}`,
              text: action,
              completed: false
            }));
            setDominoKeyPoints(newKeyPoints);
          } else {
            // No keyActions, show prompt to generate with AI
            setDominoKeyPoints([
              { id: 'key1', text: '', completed: false },
              { id: 'key2', text: '', completed: false },
              { id: 'key3', text: '', completed: false },
              { id: 'key4', text: '', completed: false }
            ]);
            setShowAIKeyPointsPrompt(true);
          }
          
          // Show success state
          setIsProcessingDrop(false);
          setShowDropSuccess(true);
          setTimeout(() => setShowDropSuccess(false), 1000);
          
          toast({
            title: '🎯 Domino setat!',
            description: data.keyActions?.length > 0 
              ? `"${data.text}" este acum focusul tău săptămânal.`
              : `"${data.text}" setat. Generează key points cu AI!`
          });
          
          console.debug('[DominoDoor] Monthly mission dropped directly', { id: data.id, text: data.text });
          return;
        }
      } catch (parseError) {
        console.debug('[DominoDoor] Drop data parse failed, falling back to handler');
      }
    }
    
    // Fall back to the provided handler
    setIsProcessingDrop(false);
    handleDropOnDomino(e);
    
    // Show success for regular drops too
    setShowDropSuccess(true);
    setTimeout(() => setShowDropSuccess(false), 1000);
  };

  return (
    <div 
      className={cn(
        "relative bg-card rounded-xl border transition-all duration-200",
        isDragOver 
          ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background" 
          : "border-border",
        isMobile ? 'p-4' : 'h-full p-5'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        handleDragOverDomino(e);
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        // Only set false if leaving the container entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      }}
      onDrop={handleLocalDrop}
    >
      {/* Processing Overlay */}
      {isProcessingDrop && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
          <div className="flex items-center gap-2 text-primary animate-fade-in">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Se procesează...</span>
          </div>
        </div>
      )}
      
      {/* Success Overlay */}
      {showDropSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-green-500/10 rounded-xl pointer-events-none">
          <div className="flex items-center gap-2 text-green-600 animate-success-pop">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      )}
      
      {/* Drop Zone Indicator */}
      {isDragOver && !isProcessingDrop && !showDropSuccess && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-primary/10 border-2 border-dashed border-primary animate-drop-zone-pulse pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
              <ArrowDown className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">
              {t('setWeeklyFocus') || 'Set as weekly focus'}
            </span>
          </div>
        </div>
      )}
      
      {selectedDomino ? (
        <div className={`space-y-4 animate-fade-in`}>
          {/* Header - Simplified */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                Focus
              </h2>
              {totalKeys > 0 && (
                <Badge 
                  variant={completedKeys === totalKeys ? "default" : "secondary"}
                  className={`${
                    completedKeys === totalKeys 
                      ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                      : 'bg-muted text-muted-foreground'
                  } text-xs`}
                >
                  {completedKeys}/{totalKeys}
                </Badge>
              )}
            </div>
            
            {/* Save Status Indicator */}
            <WeeklyPlanSaveStatus 
              status={saveStatus} 
              lastSaveTime={lastSaveTime}
              className="mr-2"
            />
            
            <div className="flex items-center gap-1">
              {/* History Button */}
              <Button
                onClick={() => setShowVersionHistory(true)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground p-1.5"
                title="Istoric versiuni"
              >
                <History className="w-4 h-4" />
              </Button>
              
              {/* AI Planning Button */}
              <Button
                onClick={() => {
                  localStorage.removeItem(planningDismissedKey);
                  setShowAIPlanningModal(true);
                }}
                variant="ghost"
                size="sm"
                className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
              >
                <Rocket className="w-4 h-4" />
                {!isMobile && <span className="text-xs">AI Planning</span>}
              </Button>
              
              {/* Info Button */}
              <Button
                onClick={() => setShowExplanation(true)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground p-1.5"
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Hierarchy Chain - Shows linked goals */}
          {hierarchyChain.length > 0 && (
            <div className="animate-fade-in">
              <HierarchyChain chain={hierarchyChain} />
            </div>
          )}

          {/* Selected Domino Goal */}
          <div className={`relative group ${
            isCompleted 
              ? 'bg-green-500/10 border-l-4 border-green-500' 
              : 'bg-primary/5 border-l-4 border-primary'
          } p-4 rounded-lg`}>
            <p className="text-foreground font-medium pr-8">
              {selectedDomino.text}
            </p>
            {isCompleted && (
              <div className="flex items-center text-green-600 mt-2 text-sm gap-1">
                <Check className="w-4 h-4" />
                <span>{t('completed')}</span>
              </div>
            )}
            
            {/* Delete button - only show if setSelectedDomino is available */}
            {setSelectedDomino && !isCompleted && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                title={language === 'en' ? 'Remove weekly focus' : 'Șterge focusul săptămânal'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {!isCompleted && (
              <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  🪞 Iei această decizie din <span className="font-medium">smerenie</span> sau din <span className="font-medium">aroganță</span>?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    sessionStorage.setItem('beliefs-arrogance-prefill', JSON.stringify({
                      decision: selectedDomino.text,
                    }));
                    window.open('/credinte/anti-aroganta', '_blank');
                  }}
                >
                  Verifică în 60s →
                </Button>
              </div>
            )}
          </div>

          {/* AI Key Points Generation Prompt */}
          {(showAIKeyPointsPrompt || dominoKeyPoints.every(kp => !kp.text.trim())) && (
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <p className="text-sm text-foreground">
                    Generează cele 4 chei cu AI pentru obiectivul tău
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowAIKeyPointsPrompt(false);
                    localStorage.removeItem(planningDismissedKey);
                    setShowAIPlanningModal(true);
                  }}
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Rocket className="w-4 h-4" />
                  Generează Key Points
                </Button>
              </div>
            </div>
          )}
          
          {/* Key Points - Clean List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t('keyPoints')}
            </p>
            
            <div className="space-y-2">
              {displayKeyPoints.map((point, index) => (
                <KeyPointMetadataPopover key={point.id} keyPoint={point}>
                  <div 
                    className={`group flex items-center gap-3 rounded-lg p-3 transition-all cursor-pointer border ${
                      point.completed 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : point.isContinued
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-muted/30 border-transparent hover:border-border'
                    }`}
                    draggable={point.text && point.text.trim().length > 0}
                    onDragStart={(e) => handleKeyPointDragStart(e, point)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnKeyPoint && handleDropOnKeyPoint(point.id)}
                  >
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      point.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {point.completed ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow flex flex-col gap-1 min-w-0">
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
                        } text-sm`}
                        placeholder={`${t('keyPoint')} ${index + 1}`}
                        value={point.text}
                        onChange={(e) => updateKeyPointText(point.id, e.target.value)}
                        rows={1}
                        language="ro"
                      />
                    </div>
                    
                    {/* Move back button */}
                    {point.text && point.text.trim().length > 0 && moveKeyPointToHotList && (
                      <button 
                        onClick={() => moveKeyPointToHotList(point)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all p-1"
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
        /* Empty State */
        <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-8' : 'py-12'} px-4`}>
          <div className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-xl bg-primary/10 flex items-center justify-center mb-3`}>
            <KeyRound className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} text-primary`} />
          </div>
          <p className={`text-foreground font-medium ${isMobile ? 'text-base' : 'text-lg'} mb-1`}>
            {t('noGoalSelected')}
          </p>
          <p className="text-muted-foreground text-sm text-center max-w-xs mb-4">
            {t('dragGoalToSet')}
          </p>
          
          {setSelectedDomino && setDominoKeyPoints && (
            <Button
              onClick={() => {
                localStorage.removeItem(planningDismissedKey);
                setShowAIPlanningModal(true);
              }}
              size={isMobile ? 'sm' : 'default'}
              className="gap-2"
            >
              <Rocket className="w-4 h-4" />
              AI Planning
            </Button>
          )}
        </div>
      )}

      {/* AI Planning Modal */}
      {showAIPlanningModal && setSelectedDomino && setDominoKeyPoints && (
        <DoorPlanningModal
          isOpen={showAIPlanningModal}
          onClose={() => {
            localStorage.setItem(planningDismissedKey, '1');
            setShowAIPlanningModal(false);
          }}
          onPlanningComplete={handlePlanningComplete}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Remove weekly focus?' : 'Ștergi focusul săptămânal?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? 'Are you sure? You will lose the weekly focus and the 4 key points set for this week.'
                : 'Ești sigur? Vei pierde focusul săptămânal și cele 4 chei setate pentru această săptămână.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'en' ? 'Cancel' : 'Anulează'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (setSelectedDomino && setDominoKeyPoints && weekKey) {
                  // Reset local state
                  setSelectedDomino(null);
                  setDominoKeyPoints([
                    { id: '1', text: '', completed: false },
                    { id: '2', text: '', completed: false },
                    { id: '3', text: '', completed: false },
                    { id: '4', text: '', completed: false },
                  ]);
                  
                  // Save empty state to database
                  try {
                    await weeklyPlanningService.savePlan({
                      weekKey: weekKey,
                      dominoTitle: '',
                      weekGoal: '',
                      keyPoints: [
                        { id: 1, title: '', objective: '', why: '', positiveImpact: '', negativeImpact: '', steps: [], responsible: 'Eu', deadline: '' },
                        { id: 2, title: '', objective: '', why: '', positiveImpact: '', negativeImpact: '', steps: [], responsible: 'Eu', deadline: '' },
                        { id: 3, title: '', objective: '', why: '', positiveImpact: '', negativeImpact: '', steps: [], responsible: 'Eu', deadline: '' },
                        { id: 4, title: '', objective: '', why: '', positiveImpact: '', negativeImpact: '', steps: [], responsible: 'Eu', deadline: '' },
                      ],
                    });
                    console.log('✅ Weekly focus cleared from database');
                  } catch (error) {
                    console.error('❌ Failed to clear weekly focus from database:', error);
                  }
                  
                  toast({
                    title: language === 'en' ? 'Focus removed' : 'Focus șters',
                    description: language === 'en' 
                      ? 'Weekly focus has been cleared' 
                      : 'Focusul săptămânal a fost șters',
                  });
                }
                setShowDeleteConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === 'en' ? 'Yes, remove' : 'Da, șterge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Version History Drawer */}
      <DominoVersionHistory
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        weekKey={weekKey || ''}
        currentDomino={selectedDomino}
        currentKeyPoints={dominoKeyPoints}
        onRestore={(domino, keyPoints) => {
          if (setSelectedDomino && setDominoKeyPoints) {
            setSelectedDomino(domino);
            setDominoKeyPoints(keyPoints);
          }
        }}
      />
    </div>
  );
};
