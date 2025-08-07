
import React from 'react';
import { HitListItem, DoListItem, DayOfWeek } from '@/types/door';
import { TaskListHeader } from './task-list/TaskListHeader';
import { DayNavigation } from './task-list/DayNavigation';
import { TaskItem } from './task-list/TaskItem';
import { EmptyTaskList } from './task-list/EmptyTaskList';

interface TaskListProps {
  activeList: 'hit' | 'do';
  setActiveList: (list: 'hit' | 'do') => void;
  activeDay: DayOfWeek;
  selectDayOfWeek: (day: DayOfWeek) => void;
  hitList: HitListItem[];
  doList: DoListItem[];
  toggleHitListItemCompletion: (id: string) => void;
  toggleDoListItemCompletion: (id: string) => void;
  hitAchievedCount: number;
  hitDoneCount: number;
  doAchievedCount: number;
  doDoneCount: number;
  isMobile?: boolean;
  moveTaskBackToHotList?: (taskId: string, listType: 'hit' | 'do') => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  activeList,
  setActiveList,
  activeDay,
  selectDayOfWeek,
  hitList,
  doList,
  toggleHitListItemCompletion,
  toggleDoListItemCompletion,
  hitAchievedCount,
  hitDoneCount,
  doAchievedCount,
  doDoneCount,
  isMobile = false,
  moveTaskBackToHotList
}) => {
  const filteredHitList = hitList.filter(item => item.day === activeDay);
  const filteredDoList = doList.filter(item => item.day === activeDay);
  
  const hitStats = `${hitDoneCount}/${hitAchievedCount}`;
  const doStats = `${doDoneCount}/${doAchievedCount}`;
  
  return (
    <div 
      className={`bg-[#1E293B] rounded-xl ${isMobile ? 'max-h-[70vh] overflow-auto p-3' : 'h-full p-4'}`}
    >
      <TaskListHeader
        activeList={activeList}
        setActiveList={setActiveList}
        hitStats={hitStats}
        doStats={doStats}
        isMobile={isMobile}
      />
      
      <DayNavigation
        activeDay={activeDay}
        selectDayOfWeek={selectDayOfWeek}
        isMobile={isMobile}
      />
      
      <div className={`space-y-2 ${isMobile ? 'max-h-[calc(70vh-200px)] overflow-y-auto space-y-1.5' : ''}`}>
        {activeList === 'hit' ? (
          filteredHitList.length > 0 ? (
            filteredHitList.map(item => (
              <TaskItem
                key={item.id}
                id={item.id}
                text={item.text}
                completed={item.completed}
                priority={item.priority}
                isKeyPoint={item.isKeyPoint}
                onToggleCompletion={toggleHitListItemCompletion}
                onMoveBack={moveTaskBackToHotList ? (id) => moveTaskBackToHotList(id, 'hit') : undefined}
                isMobile={isMobile}
              />
            ))
          ) : (
            <EmptyTaskList activeList="hit" isMobile={isMobile} />
          )
        ) : (
          filteredDoList.length > 0 ? (
            filteredDoList.map(item => (
              <TaskItem
                key={item.id}
                id={item.id}
                text={item.text}
                completed={item.completed}
                priority={item.priority}
                onToggleCompletion={toggleDoListItemCompletion}
                onMoveBack={moveTaskBackToHotList ? (id) => moveTaskBackToHotList(id, 'do') : undefined}
                isMobile={isMobile}
              />
            ))
          ) : (
            <EmptyTaskList activeList="do" isMobile={isMobile} />
          )
        )}
      </div>
    </div>
  );
};
