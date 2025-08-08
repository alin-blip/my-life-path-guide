import React, { useState, useEffect } from 'react';
import { useDoorContent } from '@/hooks/useDoorContent';
import { DoorHeader } from '@/components/door/DoorHeader';
import { HotList } from '@/components/door/HotList';
import { DominoDoor } from '@/components/door/DominoDoor';
import { TaskList } from '@/components/door/TaskList';
import { OnboardingTooltip } from '@/components/door/OnboardingTooltip';
import { EmptyStateCard } from '@/components/door/EmptyStateCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, getWeek } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Target, CheckSquare, Plus } from 'lucide-react';

export const SimplifiedDoorContent: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  
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
        ? `Welcome to RoWarrior Command Center`
        : `Bine ai venit în RoWarrior - Centrul de Comandă`,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className={`${isMobile ? 'w-full max-w-full px-2 py-2' : 'container mx-auto px-4 py-6'}`}>
        <DoorHeader 
          currentDate={currentDate}
          currentDateRange={currentDateRange}
          handlePreviousWeek={handlePrevWeekWithNotification}
          handleNextWeek={handleNextWeekWithNotification}
          isMobile={isMobile}
        />

        {/* Mobile: Vertical Stack Layout */}
        {isMobile ? (
          <div className="space-y-4 pb-4">
            {/* Ideas Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  💡 Lista de Idei
                  <Badge variant="outline" className="ml-auto text-xs">
                    {filteredHotList.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {filteredHotList.length === 0 ? (
                  <div className="text-center py-4">
                    <Button onClick={addNewTarget} size="sm" className="text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Adaugă prima idee
                    </Button>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>

            {/* Focus Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-primary" />
                  🎯 Focus Săptămânal
                  {selectedDomino && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {stats.focus}/{dominoKeyPoints.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0" onDragOver={handleDragOverDomino} onDrop={handleDropOnDomino}>
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
                />
              </CardContent>
            </Card>

            {/* Tasks Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  📋 Sarcini Zilnice
                  <Badge variant="outline" className="ml-auto text-xs">
                    {stats.tasks}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent 
                className="pt-0"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
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
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Desktop: 3-Column Layout */
          <div className="grid grid-cols-3 gap-6 animate-fade-in">
            {/* Ideas Column */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  💡 Lista de Idei
                  <Badge variant="outline" className="ml-auto">
                    {filteredHotList.length}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Capturează și prioritizează ideile de acțiune
                </p>
              </CardHeader>
              <CardContent>
                {filteredHotList.length === 0 ? (
                  <EmptyStateCard
                    icon={Lightbulb}
                    emoji="💡"
                    title="Încă nu ai idei!"
                    description="Începe prin a captura prima ta idee de acțiune."
                    actionLabel="Adaugă Prima Idee"
                    onAction={addNewTarget}
                  />
                ) : (
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
                )}
              </CardContent>
            </Card>

            {/* Focus Column */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  🎯 Focus Săptămânal
                  {selectedDomino && (
                    <Badge variant="outline" className="ml-auto">
                      {stats.focus}/{dominoKeyPoints.length}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Stabilește obiectivul săptămânal masiv
                </p>
              </CardHeader>
              <CardContent>
                {!selectedDomino ? (
                  <EmptyStateCard
                    icon={Target}
                    emoji="🎯"
                    title="Alege Domino-ul!"
                    description="Selectează o idee importantă ca focus săptămânal prin drag & drop sau click."
                    actionLabel="📋 Vezi Ghidul"
                    onAction={() => {}}
                  />
                ) : (
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
                  />
                )}
              </CardContent>
            </Card>

            {/* Tasks Column */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  📋 Sarcini Zilnice
                  <Badge variant="outline" className="ml-auto">
                    {stats.tasks}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Execută listele zilnice de sarcini
                </p>
              </CardHeader>
              <CardContent
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
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
              </CardContent>
            </Card>
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
            position={isMobile ? 'bottom' : 'top'}
            isVisible={showOnboarding}
            onClose={handleOnboardingSkip}
          />
        )}
      </div>
    </div>
  );
};