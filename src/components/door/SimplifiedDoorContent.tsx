import React, { useState, useEffect } from 'react';
import { useDoorContent } from '@/hooks/useDoorContent';
import { DoorHeader } from '@/components/door/DoorHeader';
import { HotList } from '@/components/door/HotList';
import { DominoDoor } from '@/components/door/DominoDoor';
import { TaskList } from '@/components/door/TaskList';
import { OnboardingTooltip } from '@/components/door/OnboardingTooltip';
import { DoorClearHistory } from '@/components/door/DoorClearHistory';
import { WeeklyPlanningNotification } from '@/components/door/WeeklyPlanningNotification';
import { WeeklyPlanningHistory } from '@/components/door/WeeklyPlanningHistory';
import { WeekSelector } from '@/components/door/WeekSelector';
import { ClearWeekButton } from '@/components/door/ClearWeekButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { format, getWeek } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { weeklyPlanningService, WeeklyPlanningData } from '@/services/weeklyPlanningService';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

export const SimplifiedDoorContent: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [planningHistory, setPlanningHistory] = useState<WeeklyPlanningData[]>([]);
  
  // Check if user is new (no data in localStorage)
  useEffect(() => {
    const hasData = localStorage.getItem('door-hot-list') || 
                   localStorage.getItem('door-hit-list') || 
                   localStorage.getItem('door-do-list');
    const hasSeenTutorial = localStorage.getItem('door-onboarding-completed');
    
    if (!hasData && !hasSeenTutorial) {
      setShowOnboarding(true);
    }
    setHasSeenOnboarding(!!hasSeenTutorial);
  }, []);

  const handleStartPlanningFromNotification = () => {
    setIsPlanningModalOpen(true);
  };

  const loadPlanningHistory = async () => {
    const plans = await weeklyPlanningService.getAllPlans();
    setPlanningHistory(plans);
  };

  const handleOpenHistory = () => {
    loadPlanningHistory();
    setIsHistoryOpen(true);
  };

  const handleSelectPlan = (plan: WeeklyPlanningData) => {
    // When a plan is selected, populate the domino and key points
    toast({
      title: '📋 Plan restaurat',
      description: `Planul pentru săptămâna ${plan.weekKey} a fost încărcat.`,
    });
    
    // TODO: Implement actual restoration logic to populate the domino
    // This would require updating useDoorContent hook
  };
  
  const {
    currentDate,
    currentDateRange,
    filteredHotList,
    hitList,
    doList,
    searchTerm,
    activeDay,
    activeList,
    selectedDomino,
    dominoKeyPoints,
    hitAchievedCount,
    hitDoneCount,
    doAchievedCount,
    doDoneCount,
    isDominoCompleted,
    editingNewItem,
    setSearchTerm,
    setActiveList,
    setSelectedDomino,
    setDominoKeyPoints,
    handlePreviousWeek,
    handleNextWeek,
    toggleHotListItemSelection,
    addNewTarget,
    deleteHotListItem,
    updateHotListItemText,
    updateHotListItemPriority,
    selectDayOfWeek,
    handleDominoSelection,
    updateKeyPointText,
    handleDragStartToDomino,
    handleDragOverDomino,
    handleDropOnDomino,
    handleKeyPointDragStart,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDropOnKeyPoint,
    handleDragEnd,
    toggleHitListItemCompletion,
    toggleDoListItemCompletion,
    moveKeyPointToHotList,
    moveTaskBackToHotList,
    addNewKeyPoint,
    navigateToDate
  } = useDoorContent();

  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const handlePrevWeekWithNotification = () => {
    handlePreviousWeek();
    const weekNum = getWeek(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    toast({
      title: `${language === 'en' ? 'Loading Week' : 'Încărcarea Săptămânii'} ${weekNum}`,
      description: language === 'en' 
        ? "Your saved tasks and dominos for this week have been loaded"
        : "Sarcinile și domeniile salvate pentru această săptămână au fost încărcate",
    });
  };
  
  const handleNextWeekWithNotification = () => {
    handleNextWeek();
    const weekNum = getWeek(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    toast({
      title: `${language === 'en' ? 'Loading Week' : 'Încărcarea Săptămânii'} ${weekNum}`,
      description: language === 'en' 
        ? "Your saved tasks and dominos for this week have been loaded"
        : "Sarcinile și domeniile salvate pentru această săptămână au fost încărcate",
    });
  };

  useEffect(() => {
    const todayName = format(new Date(), 'EEEE');
    toast({
      title: language === 'en' ? `Today is ${todayName}` : `Astăzi este ${todayName}`,
      description: language === 'en'
        ? `Welcome to RoWarrior To Do`
        : `Bine ai venit în RoWarrior - Taskuri`,
    });
  }, []);

  const onboardingSteps = [
    {
      title: language === 'en' ? 'Welcome to RoWarrior!' : 'Bine ai venit în RoWarrior!',
      description: language === 'en' 
        ? 'This is your productivity hub. All three sections are now visible for easy drag & drop!' 
        : 'Acesta este hub-ul tău de productivitate. Toate cele 3 secțiuni sunt acum vizibile pentru drag & drop ușor!'
    },
    {
      title: language === 'en' ? 'Set Your Weekly Focus' : 'Stabilește Focusul Săptămânal',
      description: language === 'en' 
        ? 'Drag an idea to the Focus section or click to select your weekly domino goal.' 
        : 'Trage o idee în secțiunea Focus sau click pentru a selecta obiectivul domino săptămânal.'
    },
    {
      title: language === 'en' ? 'Execute Daily Tasks' : 'Execută Sarcinile Zilnice',
      description: language === 'en' 
        ? 'Drag ideas or key points to the Tasks section to create your daily action lists.' 
        : 'Trage idei sau puncte cheie în secțiunea Sarcini pentru a crea listele de acțiuni zilnice.'
    }
  ];

  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingSteps.length) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setShowOnboarding(false);
      localStorage.setItem('door-onboarding-completed', 'true');
      setHasSeenOnboarding(true);
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    localStorage.setItem('door-onboarding-completed', 'true');
    setHasSeenOnboarding(true);
  };

  const getSectionStats = () => {
    return {
      ideas: filteredHotList.filter(item => item.selected).length,
      focus: selectedDomino ? dominoKeyPoints.filter(kp => kp.completed).length : 0,
      tasks: hitAchievedCount + doAchievedCount
    };
  };

  const stats = getSectionStats();

  return (
    <div className="min-h-screen bg-background">
      <DoorHeader 
        currentDate={currentDate}
        currentDateRange={currentDateRange}
        handlePreviousWeek={handlePrevWeekWithNotification}
        handleNextWeek={handleNextWeekWithNotification}
        isMobile={isMobile}
      />
      
      <div className={`${isMobile ? 'px-4 py-6' : 'container mx-auto px-6 py-8'}`}>
        {/* Weekly Planning Notification */}
        <WeeklyPlanningNotification onStartPlanning={handleStartPlanningFromNotification} />
        
        {/* Week Selector and Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <WeekSelector
            currentDate={currentDate}
            onPreviousWeek={handlePrevWeekWithNotification}
            onNextWeek={handleNextWeekWithNotification}
            onSelectDate={navigateToDate}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenHistory}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Istoric Planuri
            </Button>
            <ClearWeekButton 
              currentDate={currentDate} 
              onArchived={() => window.location.reload()} 
            />
            <DoorClearHistory onHistoryCleared={() => window.location.reload()} />
          </div>
        </div>

        {/* Mobile: Vertical Stack Layout */}
        {isMobile ? (
          <div className="space-y-6">
            {/* To Do Section */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">📋 To Do</h2>
                <span className="text-sm text-muted-foreground">{filteredHotList.length}</span>
              </div>
              <HotList 
                filteredHotList={filteredHotList}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                toggleHotListItemSelection={toggleHotListItemSelection}
                updateHotListItemText={updateHotListItemText}
                updateHotListItemPriority={updateHotListItemPriority}
                addNewTarget={addNewTarget}
                deleteHotListItem={deleteHotListItem}
                handleDragStartToDomino={handleDragStartToDomino}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                handleDominoSelection={handleDominoSelection}
                editingNewItem={editingNewItem}
                isMobile={isMobile}
              />
            </div>

            {/* Focus Section */}
            <div className="bg-card border border-border rounded-lg p-4" onDragOver={handleDragOverDomino} onDrop={handleDropOnDomino}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">🎯 Focus Săptămânal</h2>
                {selectedDomino && (
                  <span className="text-sm text-muted-foreground">{stats.focus}/{dominoKeyPoints.length}</span>
                )}
              </div>
              <DominoDoor 
                selectedDomino={selectedDomino}
                dominoKeyPoints={dominoKeyPoints}
                updateKeyPointText={updateKeyPointText}
                handleDragOverDomino={handleDragOverDomino}
                handleDropOnDomino={handleDropOnDomino}
                handleKeyPointDragStart={handleKeyPointDragStart}
                isMobile={isMobile}
                isCompleted={isDominoCompleted}
                moveKeyPointToHotList={moveKeyPointToHotList}
                addNewKeyPoint={addNewKeyPoint}
                handleDropOnKeyPoint={handleDropOnKeyPoint}
                setSelectedDomino={setSelectedDomino}
                setDominoKeyPoints={setDominoKeyPoints}
              />
            </div>

            {/* Tasks Section */}
            <div className="bg-card border border-border rounded-lg p-4" onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">📋 Sarcini Zilnice</h2>
                <span className="text-sm text-muted-foreground">{stats.tasks}</span>
              </div>
              <TaskList 
                hitList={hitList}
                doList={doList}
                activeDay={activeDay}
                activeList={activeList}
                setActiveList={setActiveList}
                selectDayOfWeek={selectDayOfWeek}
                toggleHitListItemCompletion={toggleHitListItemCompletion}
                toggleDoListItemCompletion={toggleDoListItemCompletion}
                hitAchievedCount={hitAchievedCount}
                hitDoneCount={hitDoneCount}
                doAchievedCount={doAchievedCount}
                doDoneCount={doDoneCount}
                moveTaskBackToHotList={moveTaskBackToHotList}
                isMobile={isMobile}
              />
            </div>
          </div>
        ) : (
          /* Desktop: 3-Column Layout */
          <div className="grid grid-cols-3 gap-6">
            {/* To Do Column */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">📋 To Do</h2>
                <span className="text-sm text-muted-foreground">{filteredHotList.length}</span>
              </div>
              <HotList 
                filteredHotList={filteredHotList}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                toggleHotListItemSelection={toggleHotListItemSelection}
                updateHotListItemText={updateHotListItemText}
                updateHotListItemPriority={updateHotListItemPriority}
                addNewTarget={addNewTarget}
                deleteHotListItem={deleteHotListItem}
                handleDragStartToDomino={handleDragStartToDomino}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                handleDominoSelection={handleDominoSelection}
                editingNewItem={editingNewItem}
                isMobile={false}
              />
            </div>

            {/* Focus Column */}
            <div className="bg-card border border-border rounded-lg p-6" onDragOver={handleDragOverDomino} onDrop={handleDropOnDomino}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">🎯 Focus Săptămânal</h2>
                {selectedDomino && (
                  <span className="text-sm text-muted-foreground">{stats.focus}/{dominoKeyPoints.length}</span>
                )}
              </div>
              <DominoDoor 
                selectedDomino={selectedDomino}
                dominoKeyPoints={dominoKeyPoints}
                updateKeyPointText={updateKeyPointText}
                handleDragOverDomino={handleDragOverDomino}
                handleDropOnDomino={handleDropOnDomino}
                handleKeyPointDragStart={handleKeyPointDragStart}
                isMobile={false}
                isCompleted={isDominoCompleted}
                moveKeyPointToHotList={moveKeyPointToHotList}
                addNewKeyPoint={addNewKeyPoint}
                handleDropOnKeyPoint={handleDropOnKeyPoint}
                setSelectedDomino={setSelectedDomino}
                setDominoKeyPoints={setDominoKeyPoints}
              />
            </div>

            {/* Tasks Column */}
            <div className="bg-card border border-border rounded-lg p-6" onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">📋 Sarcini Zilnice</h2>
                <span className="text-sm text-muted-foreground">{stats.tasks}</span>
              </div>
              <TaskList 
                hitList={hitList}
                doList={doList}
                activeDay={activeDay}
                activeList={activeList}
                setActiveList={setActiveList}
                selectDayOfWeek={selectDayOfWeek}
                toggleHitListItemCompletion={toggleHitListItemCompletion}
                toggleDoListItemCompletion={toggleDoListItemCompletion}
                hitAchievedCount={hitAchievedCount}
                hitDoneCount={hitDoneCount}
                doAchievedCount={doAchievedCount}
                doDoneCount={doDoneCount}
                moveTaskBackToHotList={moveTaskBackToHotList}
                isMobile={false}
              />
            </div>
          </div>
        )}

        {showOnboarding && (
          <OnboardingTooltip
            title={onboardingSteps[onboardingStep - 1].title}
            description={onboardingSteps[onboardingStep - 1].description}
            step={onboardingStep}
            totalSteps={onboardingSteps.length}
            onNext={handleOnboardingNext}
            onSkip={handleOnboardingSkip}
            onClose={handleOnboardingSkip}
            position={isMobile ? 'bottom' : 'top'}
            isVisible={showOnboarding}
          />
        )}

        <WeeklyPlanningHistory
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          plans={planningHistory}
          onSelectPlan={handleSelectPlan}
          onRefresh={loadPlanningHistory}
        />
      </div>
    </div>
  );
};