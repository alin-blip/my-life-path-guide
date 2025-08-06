import React, { useState, useEffect } from 'react';
import { useDoorContent } from '@/hooks/useDoorContent';
import { DoorHeader } from '@/components/door/DoorHeader';
import { HotList } from '@/components/door/HotList';
import { DominoDoor } from '@/components/door/DominoDoor';
import { TaskList } from '@/components/door/TaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, getWeek } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Target, CheckSquare, Info, HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const SimplifiedDoorContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ideas');
  const [showExplanation, setShowExplanation] = useState(false);
  
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
  const { t, language } = useLanguage();
  
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

  const handleNavigateToYesterday = () => {
    const yesterday = subDays(new Date(), 1);
    navigateToDate(yesterday);
    toast({
      title: "📅 Navigare la ieri",
      description: `Te-ai mutat la ${format(yesterday, 'dd.MM.yyyy')}`,
    });
  };

  const handleNavigateToToday = () => {
    const today = new Date();
    navigateToDate(today);
    toast({
      title: "🏠 Înapoi la astăzi", 
      description: `Te-ai întors la ${format(today, 'dd.MM.yyyy')}`,
    });
  };

  useEffect(() => {
    const todayName = format(new Date(), 'EEEE');
    toast({
      title: language === 'en' ? `Today is ${todayName}` : `Astăzi este ${todayName}`,
      description: language === 'en'
        ? `Welcome to your simplified Command Center`
        : `Bine ai venit la Centrul de Comandă simplificat`,
    });
  }, []);

  const getTabStats = (tab: string) => {
    switch (tab) {
      case 'ideas':
        return filteredHotList.filter(item => item.selected).length;
      case 'focus':
        return selectedDomino ? dominoKeyPoints.filter(kp => kp.completed).length : 0;
      case 'tasks':
        return hitAchievedCount + doAchievedCount;
      default:
        return 0;
    }
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case 'ideas':
        return language === 'en' ? 'Capture and prioritize your action ideas' : 'Capturează și prioritizează ideile de acțiune';
      case 'focus':
        return language === 'en' ? 'Set your weekly massive goal and key actions' : 'Stabilește obiectivul săptămânal masiv și acțiunile cheie';
      case 'tasks':
        return language === 'en' ? 'Execute your daily hit and do lists' : 'Execută listele zilnice de lovituri și sarcini';
      default:
        return '';
    }
  };

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

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full animate-fade-in"
        >
          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
              <TabsList className="grid w-full grid-cols-3 rounded-none bg-transparent h-16">
                <TabsTrigger 
                  value="ideas" 
                  className="flex flex-col gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-full"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span className="text-xs">Idei</span>
                  {getTabStats('ideas') > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 min-w-[16px] h-4">
                      {getTabStats('ideas')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="focus" 
                  className="flex flex-col gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-full"
                >
                  <Target className="w-5 h-5" />
                  <span className="text-xs">Focus</span>
                  {getTabStats('focus') > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 min-w-[16px] h-4">
                      {getTabStats('focus')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="flex flex-col gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-full"
                >
                  <CheckSquare className="w-5 h-5" />
                  <span className="text-xs">Sarcini</span>
                  {getTabStats('tasks') > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 min-w-[16px] h-4">
                      {getTabStats('tasks')}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-fit grid-cols-3 bg-muted/50">
                <TabsTrigger value="ideas" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  💡 Idei
                  {getTabStats('ideas') > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getTabStats('ideas')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="focus" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  🎯 Focus Săptămânal
                  {getTabStats('focus') > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getTabStats('focus')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  📋 Sarcini Zilnice
                  {getTabStats('tasks') > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getTabStats('tasks')}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Ajutor
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Cum funcționează</h4>
                    <p className="text-sm text-muted-foreground">
                      {getTabDescription(activeTab)}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Tab Content */}
          <div className={`${isMobile ? 'pb-20' : ''}`}>
            <TabsContent value="ideas" className="space-y-0">
              <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    💡 Lista de Idei
                    <Badge variant="outline" className="ml-auto">
                      {filteredHotList.length} idei
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getTabDescription('ideas')}
                  </p>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="focus" className="space-y-0">
              <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    🎯 Focus Săptămânal
                    {selectedDomino && (
                      <Badge variant="outline" className="ml-auto">
                        {dominoKeyPoints.filter(kp => kp.completed).length}/{dominoKeyPoints.length} completate
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getTabDescription('focus')}
                  </p>
                </CardHeader>
                <CardContent>
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
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-0">
              <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-primary" />
                    📋 Sarcini Zilnice
                    <Badge variant="outline" className="ml-auto">
                      {hitAchievedCount + doAchievedCount} completate
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getTabDescription('tasks')}
                  </p>
                </CardHeader>
                <CardContent>
                  <TaskList 
                    activeList={activeList}
                    setActiveList={setActiveList}
                    activeDay={activeDay}
                    selectDayOfWeek={selectDayOfWeek}
                    hitList={hitList}
                    doList={doList}
                    toggleHitListItemCompletion={toggleHitListItemCompletion}
                    toggleDoListItemCompletion={toggleDoListItemCompletion}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    hitAchievedCount={hitAchievedCount}
                    hitDoneCount={hitDoneCount}
                    doAchievedCount={doAchievedCount}
                    doDoneCount={doDoneCount}
                    isMobile={isMobile}
                    moveTaskBackToHotList={moveTaskBackToHotList}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};