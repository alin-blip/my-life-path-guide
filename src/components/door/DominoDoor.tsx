
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Info, Share2, Check, ArrowLeft, Plus, KeyRound, Sparkles, Flame, Trophy, Rocket } from 'lucide-react';
import { HotListItem, DominoKeyPoint, PlanningResult } from '@/types/door';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { DoorPlanningModal } from './DoorPlanningModal';
import { useToast } from '@/hooks/use-toast';
import { KeyPointMetadataPopover } from './KeyPointMetadataPopover';

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
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);

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

    setIsPlanningModalOpen(false);
    
    toast({
      title: "✅ Planificare completată!",
      description: `Domino Door și cele 4 chei au fost setate pentru săptămâna aceasta.`,
    });
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
  
  return (
    <div 
      className={`bg-gradient-to-br from-[#1E293B] to-[#2A3A53] rounded-xl p-4 shadow-lg ${
        isMobile ? 'max-h-[70vh] overflow-auto' : 'h-full'
      } ${isMobile ? 'p-3' : 'p-6'}`}
      onDragOver={handleDragOverDomino}
      onDrop={handleDropOnDomino}
    >
      <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600`}>
          {t('weeklyMassiveGoal')} {selectedDomino ? '1/1' : '0/1'}
        </h2>
        <div className="flex items-center space-x-2">
          {setSelectedDomino && setDominoKeyPoints && (
            <Button
              onClick={() => setIsPlanningModalOpen(true)}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Rocket className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              {isMobile ? 'Start' : 'Start Planning'}
            </Button>
          )}
          <Info className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 hover:text-blue-400 transition-colors cursor-pointer`} />
          <Share2 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 hover:text-blue-400 transition-colors cursor-pointer`} />
        </div>
      </div>
      
      {isPlanningModalOpen && setSelectedDomino && setDominoKeyPoints && (
        <DoorPlanningModal
          isOpen={isPlanningModalOpen}
          onClose={() => setIsPlanningModalOpen(false)}
          onPlanningComplete={handlePlanningComplete}
        />
      )}
      
      {selectedDomino ? (
        <div className={`space-y-4 animate-fade-in ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
          <div className={`${
            isCompleted 
              ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-l-4 border-green-500' 
              : 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-l-4 border-blue-500'
          } p-4 rounded-lg shadow-md ${isMobile ? 'p-3' : 'p-5'}`}>
            <p className={`text-white font-medium mb-2 opacity-80 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {t('mainGoal')}
            </p>
            <p className={`text-white ${isMobile ? 'text-sm' : 'text-base'} leading-relaxed`}>
              {selectedDomino.text}
            </p>
            {isCompleted && (
              <div className={`flex items-center text-green-400 mt-3 bg-green-500/10 p-2 rounded inline-block ${isMobile ? 'text-xs' : 'text-xs'}`}>
                <Check className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                <span>{t('completed')}</span>
              </div>
            )}
          </div>
          
          <div className={`space-y-3 ${isMobile ? 'max-h-[calc(70vh-200px)] overflow-y-auto space-y-2' : ''}`}>
            <div className="flex justify-between items-center">
              <p className={`text-white font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                {t('keyPoints')}
              </p>
              {addNewKeyPoint && displayKeyPoints.length < 4 && (
                <Button 
                  onClick={addNewKeyPoint} 
                  variant="ghost" 
                  size="sm" 
                  className={`text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all ${isMobile ? 'p-1' : 'p-1'}`}
                >
                  <Plus className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </Button>
              )}
            </div>
            
            <div className={`grid gap-2 ${isMobile ? 'gap-2' : 'gap-3'}`}>
              {displayKeyPoints.map((point, index) => (
                <KeyPointMetadataPopover key={point.id} keyPoint={point}>
                  <div 
                    className={`flex items-start space-x-2 rounded-lg hover:shadow-md transition-all ${
                      point.completed ? 'bg-green-500/10' : 'bg-blue-500/10'
                    } ${isMobile ? 'p-2 space-x-2' : 'p-3 space-x-3'}`}
                    draggable={point.text && point.text.trim().length > 0}
                    onDragStart={(e) => handleKeyPointDragStart(e, point)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnKeyPoint && handleDropOnKeyPoint(point.id)}
                  >
                    <div className={`flex-shrink-0 rounded-full flex items-center justify-center text-xs text-white shadow-md ${
                      point.completed 
                        ? 'bg-gradient-to-br from-green-400 to-green-600' 
                        : 'bg-gradient-to-br from-blue-400 to-purple-600'
                    } ${isMobile ? 'w-6 h-6' : 'w-7 h-7'}`}>
                      {point.completed ? (
                        <Check className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      ) : (
                        React.createElement(KeyPointIcons[index % 4].icon, { 
                          className: `${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${KeyPointIcons[index % 4].color}` 
                        })
                      )}
                    </div>
                    
                    <Textarea
                      className={`flex-grow bg-transparent border-none focus:ring-0 focus:ring-offset-0 p-0 min-h-0 resize-none ${
                        point.completed 
                          ? 'text-gray-400 line-through' 
                          : 'text-white'
                      } ${isMobile ? 'text-sm' : 'text-sm'}`}
                      placeholder={`${t('keyPoint')} ${index + 1}`}
                      value={point.text}
                      onChange={(e) => updateKeyPointText(point.id, e.target.value)}
                      rows={1}
                    />
                    
                    {point.text && point.text.trim().length > 0 && moveKeyPointToHotList && (
                      <button 
                        onClick={() => moveKeyPointToHotList(point)}
                        className={`text-gray-400 hover:text-blue-400 transition-colors ${isMobile ? 'p-0.5' : 'p-1'}`}
                        title={t('moveBackToIdeaList')}
                      >
                        <ArrowLeft className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      </button>
                    )}
                  </div>
                </KeyPointMetadataPopover>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex justify-center items-center ${isMobile ? 'h-[40vh]' : 'h-[60vh]'}`}>
          <div className="text-center px-4">
            <div className={`mx-auto mb-4 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center opacity-50 ${
              isMobile ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-5'
            }`}>
              <KeyRound className={`text-white ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
            <p className={`text-gray-300 mb-1 ${isMobile ? 'text-sm' : 'text-base'}`}>
              {t('noGoalSelected')}
            </p>
            <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'} max-w-sm`}>
              {t('dragGoalToSet')}
            </p>
            <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'} max-w-sm mt-1`}>
              {t('orClickToSelect')}
            </p>
            
            {setSelectedDomino && setDominoKeyPoints && (
              <div className="mt-6">
                <p className={`text-gray-400 mb-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>sau</p>
                <Button
                  onClick={() => setIsPlanningModalOpen(true)}
                  variant="default"
                  size={isMobile ? 'sm' : 'default'}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Start AI Planning
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
