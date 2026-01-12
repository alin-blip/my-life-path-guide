import React, { useState, useEffect } from 'react';
import { useDoorContent } from '@/hooks/useDoorContent';
import { useDoorUndo } from '@/hooks/useDoorUndo';
import { useStreakTracking } from '@/hooks/useStreakTracking';
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
import { MobileBottomNav } from '@/components/door/MobileBottomNav';
import { SwipeableSection } from '@/components/door/SwipeableSection';
import { WeeklyProgressRing } from '@/components/door/WeeklyProgressRing';
import { DoorHelpButton } from '@/components/door/DoorHelpButton';
import { QuickActionBar } from '@/components/door/QuickActionBar';
import { ConfettiCelebration } from '@/components/door/ConfettiCelebration';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { format, getWeek } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { weeklyPlanningService, WeeklyPlanningData } from '@/services/weeklyPlanningService';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { Button } from '@/components/ui/button';
import { History, ListTodo, Target, CheckSquare } from 'lucide-react';

export const SimplifiedDoorContent: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [planningHistory, setPlanningHistory] = useState<WeeklyPlanningData[]>([]);
  const [mobileSection, setMobileSection] = useState<'todo' | 'focus' | 'tasks'>('focus');
  
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

  const handleCleanDuplicates = async () => {
    try {
      const result = await doorUserTasksService.removeDuplicateTasks();
      if (result.removed > 0) {
        toast({
          title: '🧹 Dubluri eliminate',
          description: `Am eliminat ${result.removed} task-uri duplicate. Au rămas ${result.kept} task-uri unice.`,
        });
        // Refresh data without page reload
        setTimeout(() => refreshLists(), 500);
      } else {
        toast({
          title: '✅ Niciun duplicat',
          description: 'Nu am găsit task-uri duplicate în baza de date.',
        });
      }
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast({
        title: '❌ Eroare',
        description: 'Nu am putut curăța duplicatele. Încearcă din nou.',
        variant: 'destructive',
      });
    }
  };

  const handleSelectPlan = (plan: WeeklyPlanningData) => {
    // Populate the domino
    if (plan.dominoTitle) {
      setSelectedDomino({
        id: `domino-${plan.weekKey}`,
        text: plan.dominoTitle,
        priority: 'none',
        selected: false,
      });
    }

    // Map and populate ALL 4 key points with full metadata
    const mappedKeyPoints: typeof dominoKeyPoints = [];
    for (let i = 0; i < 4; i++) {
      const kp = plan.keyPoints[i];
      if (kp) {
        mappedKeyPoints.push({
          id: kp.id ? `key${kp.id}` : `key${i + 1}`,
          text: kp.title || '',
          completed: false,
          metadata: {
            objective: kp.objective || '',
            why: kp.why || '',
            positiveImpact: kp.positiveImpact || '',
            negativeImpact: kp.negativeImpact || '',
            steps: kp.steps || [],
            responsible: kp.responsible || 'Eu',
            deadline: kp.deadline || '',
          },
        });
      } else {
        // Empty key point with metadata structure
        mappedKeyPoints.push({
          id: `key${i + 1}`,
          text: '',
          completed: false,
          metadata: {
            objective: '',
            why: '',
            positiveImpact: '',
            negativeImpact: '',
            steps: [],
            responsible: 'Eu',
            deadline: '',
          },
        });
      }
    }

    setDominoKeyPoints(mappedKeyPoints);

    toast({
      title: '📋 Plan restaurat din cloud',
      description: `Planul pentru săptămâna ${plan.weekKey} a fost încărcat cu succes (${plan.keyPoints.length} chei).`,
    });
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
    navigateToDate,
    refreshLists
  } = useDoorContent();

  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // Streak tracking
  const { streakData, updateDailyProgress } = useStreakTracking();
  
  // Update progress when tasks change
  useEffect(() => {
    const totalTasks = hitAchievedCount + doAchievedCount;
    const completedTasks = hitDoneCount + doDoneCount;
    if (totalTasks > 0) {
      updateDailyProgress(
        totalTasks,
        completedTasks,
        filteredHotList.length,
        hitAchievedCount,
        doAchievedCount
      );
    }
  }, [hitDoneCount, doDoneCount, hitAchievedCount, doAchievedCount]);

  // Undo/Redo functionality
  const { undo, redo, canUndo, canRedo } = useDoorUndo({
    selectedDomino,
    dominoKeyPoints,
    setSelectedDomino,
    setDominoKeyPoints,
  });

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (undo()) {
          toast({
            title: '↩️ Undo',
            description: language === 'en' 
              ? 'Restored previous focus' 
              : 'Focus anterior restaurat',
          });
        }
      }
      // Ctrl+Shift+Z or Ctrl+Y or Cmd+Shift+Z for redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        if (redo()) {
          toast({
            title: '↪️ Redo',
            description: language === 'en' 
              ? 'Restored next focus' 
              : 'Focus următor restaurat',
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, toast, language]);
  
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
        ? `Welcome to Napoleon Hill Academy To Do`
        : `Bine ai venit în Napoleon Hill Academy - Taskuri`,
    });
  }, []);

  const onboardingSteps = [
    {
      title: language === 'en' ? 'Welcome to Napoleon Hill Academy!' : 'Bine ai venit în Napoleon Hill Academy!',
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

  // Handle mobile section swipe navigation
  const handleSwipeLeft = () => {
    if (mobileSection === 'todo') setMobileSection('focus');
    else if (mobileSection === 'focus') setMobileSection('tasks');
  };

  const handleSwipeRight = () => {
    if (mobileSection === 'tasks') setMobileSection('focus');
    else if (mobileSection === 'focus') setMobileSection('todo');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-full">
      <DoorHeader
        currentDate={currentDate}
        currentDateRange={currentDateRange}
        handlePreviousWeek={handlePrevWeekWithNotification}
        handleNextWeek={handleNextWeekWithNotification}
        isMobile={isMobile}
        onOpenHistory={handleOpenHistory}
        onCleanDuplicates={handleCleanDuplicates}
        onClearWeek={() => {
          toast({
            title: '✅ Săptămână arhivată',
            description: 'Reîncărcare date...',
          });
          // Refresh data without page reload
          setTimeout(() => refreshLists(), 500);
        }}
        onClearHistory={() => refreshLists()}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      <div className={`${isMobile ? 'px-2 pt-2 pb-20 w-full max-w-full overflow-hidden' : 'container mx-auto px-6 py-8'}`}>
        {/* Weekly Planning Notification - hide on mobile for cleaner UI */}
        {!isMobile && <WeeklyPlanningNotification onStartPlanning={handleStartPlanningFromNotification} />}
        
        {/* Confetti Celebration */}
        <ConfettiCelebration
          totalTasks={hitAchievedCount + doAchievedCount}
          completedTasks={hitDoneCount + doDoneCount}
        />
        
        {/* Week Selector with Progress Ring - inline on mobile */}
        {!isMobile && (
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <WeeklyProgressRing
                totalTasks={hitAchievedCount + doAchievedCount}
                completedTasks={hitDoneCount + doDoneCount}
                focusKeyPoints={dominoKeyPoints.length}
                completedKeyPoints={dominoKeyPoints.filter(kp => kp.completed).length}
                streak={streakData.currentStreak}
              />
              <DoorHelpButton />
            </div>
            
            <WeekSelector
              currentDate={currentDate}
              onPreviousWeek={handlePrevWeekWithNotification}
              onNextWeek={handleNextWeekWithNotification}
              onSelectDate={navigateToDate}
            />
          </div>
        )}

        {/* Mobile: Swipeable Single Section View with Bottom Navigation */}
        {isMobile ? (
          <>
            <SwipeableSection
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              className="min-h-[60vh] w-full max-w-full overflow-hidden"
            >
              {mobileSection === 'todo' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-blue-500" />
                      Idei
                    </h2>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{filteredHotList.length}</span>
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
              )}

              {mobileSection === 'focus' && (
                <div className="animate-fade-in" onDragOver={handleDragOverDomino} onDrop={handleDropOnDomino}>
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
              )}

              {mobileSection === 'tasks' && (
                <div className="animate-fade-in" onDragOver={handleDragOver} onDrop={handleDrop}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-green-500" />
                      Sarcini
                    </h2>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{stats.tasks}</span>
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
                    onTasksAdded={refreshLists}
                  />
                </div>
              )}
            </SwipeableSection>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
              activeSection={mobileSection}
              onSectionChange={setMobileSection}
              stats={stats}
              streak={streakData.currentStreak}
            />
          </>
        ) : (
          /* Desktop: 3-Column Layout */
          <div className="grid grid-cols-3 gap-6 animate-fade-in">
            {/* To Do Column */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">📋 To Do</h2>
                <span className="text-sm text-muted-foreground px-2 py-1 bg-accent/30 rounded-lg">{filteredHotList.length}</span>
              </div>
              
              {/* Quick Action Bar */}
              <div className="mb-4">
                <QuickActionBar 
                  onAddIdea={addNewTarget}
                  onAddTemplate={(text) => {
                    // Add item with template text
                    addNewTarget();
                  }}
                  isMobile={false}
                />
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

            {/* Focus Column - No extra wrapper, DominoDoor has its own styling */}
            <div onDragOver={handleDragOverDomino} onDrop={handleDropOnDomino}>
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
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300" onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">📋 Sarcini Zilnice</h2>
                <span className="text-sm text-muted-foreground px-2 py-1 bg-accent/30 rounded-lg">{stats.tasks}</span>
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
                onTasksAdded={refreshLists}
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