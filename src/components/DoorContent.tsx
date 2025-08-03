import React, { useEffect } from 'react';
import { useDoorContent } from '@/hooks/useDoorContent';
import { DoorHeader } from '@/components/door/DoorHeader';
import { HotList } from '@/components/door/HotList';
import { DominoDoor } from '@/components/door/DominoDoor';
import { TaskList } from '@/components/door/TaskList';
import { DoorExplanation } from '@/components/door/DoorExplanation';
import { QuickNavigation } from '@/components/door/QuickNavigation';
import { DoorStorageMonitor } from '@/components/door/DoorStorageMonitor';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { getWeek } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

export const DoorContent: React.FC = () => {
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
        ? `Welcome to your Door dashboard for ${format(new Date(), 'MMMM do')}`
        : `Bine ai venit la panoul Door pentru ${format(new Date(), 'MMMM do')}`,
    });
  }, []);

  return (
    <div className={`container mx-auto ${isMobile ? 'px-2 py-4' : 'px-4 py-6'}`}>
      <DoorHeader 
        currentDate={currentDate}
        currentDateRange={currentDateRange}
        handlePreviousWeek={handlePrevWeekWithNotification}
        handleNextWeek={handleNextWeekWithNotification}
        isMobile={isMobile}
      />

      <DoorExplanation />

      <QuickNavigation
        currentDate={currentDate}
        onNavigateToYesterday={handleNavigateToYesterday}
        onNavigateToToday={handleNavigateToToday}
        isMobile={isMobile}
      />

      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-1' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
      } ${isMobile ? 'gap-4' : 'gap-6'}`}>
        {isMobile ? (
          <>
            <div className="order-1">
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
            
            <div className="order-2">
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
            </div>
            
            <div className="order-3">
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
            </div>
          </>
        ) : (
          <>
            <div className="lg:col-span-1">
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

            <div className="lg:col-span-1">
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
            </div>

            <div className="lg:col-span-1 md:col-span-2 lg:col-span-1">
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
            </div>
          </>
        )}
        
        {/* Storage Monitor - Only visible to power users */}
        <div className="mt-6">
          <DoorStorageMonitor />
        </div>
      </div>
    </div>
  );
};
