import React, { useState, useEffect } from 'react';
import { VoiceTextarea } from '@/components/ui/VoiceTextarea';
import { Info, Check, Plus, KeyRound, Sparkles, Flame, Trophy, Rocket, RefreshCw } from 'lucide-react';
import { HotListItem, DominoKeyPoint, PlanningResult } from '@/types/door';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showAIPlanningModal, setShowAIPlanningModal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

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

  return (
    <div 
      className={`bg-card rounded-xl border border-border ${
        isMobile ? 'p-4' : 'h-full p-5'
      }`}
      onDragOver={handleDragOverDomino}
      onDrop={handleDropOnDomino}
    >
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
              {/* AI Planning Button */}
              <Button
                onClick={() => setShowAIPlanningModal(true)}
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
          <div className={`${
            isCompleted 
              ? 'bg-green-500/10 border-l-4 border-green-500' 
              : 'bg-primary/5 border-l-4 border-primary'
          } p-4 rounded-lg`}>
            <p className="text-foreground font-medium">
              {selectedDomino.text}
            </p>
            {isCompleted && (
              <div className="flex items-center text-green-600 mt-2 text-sm gap-1">
                <Check className="w-4 h-4" />
                <span>{t('completed')}</span>
              </div>
            )}
          </div>
          
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
              onClick={() => setShowAIPlanningModal(true)}
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
          onClose={() => setShowAIPlanningModal(false)}
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
    </div>
  );
};
