
import React from 'react';
import { HitListItem, DoListItem, DayOfWeek } from '@/types/door';
import { TaskListHeader } from './task-list/TaskListHeader';
import { DayNavigation } from './task-list/DayNavigation';
import { TaskItem } from './task-list/TaskItem';
import { SwipeableTaskItem } from './SwipeableTaskItem';
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
  onDeleteTask?: (taskId: string, listType: 'hit' | 'do') => void;
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
  moveTaskBackToHotList,
  onDeleteTask
}) => {
  const normalizeDay = (d: any): DayOfWeek => {
    if (typeof d !== 'string') return d as DayOfWeek;
    const map: Record<string, DayOfWeek> = {
      monday: 'M',
      tuesday: 'T',
      wednesday: 'W',
      thursday: 'Th',
      friday: 'F',
      saturday: 'Sa',
      sunday: 'Su',
      m: 'M',
      t: 'T',
      w: 'W',
      th: 'Th',
      f: 'F',
      sa: 'Sa',
      su: 'Su',
    };
    const key = d.toLowerCase() as keyof typeof map;
    return (map[key] || d) as DayOfWeek;
  };
  
  const filteredHitList = hitList.filter(item => normalizeDay(item.day) === activeDay);
  const filteredDoList = doList.filter(item => normalizeDay(item.day) === activeDay);
  
  // Debug
  console.debug('[TaskList] activeDay', activeDay, {
    hitTotal: hitList.length,
    doTotal: doList.length,
    hitFiltered: filteredHitList.length,
    doFiltered: filteredDoList.length,
  });
  
  const hitStats = `${hitDoneCount}/${hitAchievedCount}`;
  const doStats = `${doDoneCount}/${doAchievedCount}`;
  
  return (
    <div 
      className={isMobile ? 'max-h-[70vh] overflow-y-auto overflow-x-hidden w-full max-w-full' : ''}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        console.debug('[TaskList] Drop ignored (tasks column)');
      }}
    >
      {/* Task Type Tabs */}
      <div className="flex mb-4">
        <button
          className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
            activeList === 'hit' 
              ? 'bg-primary/10 text-primary border-primary/20' 
              : 'bg-muted text-muted-foreground border-border hover:bg-accent'
          }`}
          onClick={() => setActiveList('hit')}
        >
          📋 To Do ({hitStats})
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
            activeList === 'do' 
              ? 'bg-primary/10 text-primary border-primary/20' 
              : 'bg-muted text-muted-foreground border-border hover:bg-accent'
          }`}
          onClick={() => setActiveList('do')}
        >
          ✅ Do ({doStats})
        </button>
      </div>
      
      <DayNavigation
        activeDay={activeDay}
        selectDayOfWeek={selectDayOfWeek}
        isMobile={isMobile}
      />
      
      <div className={`space-y-2 ${isMobile ? 'max-h-[calc(70vh-120px)] overflow-y-auto' : ''}`}>
        {activeList === 'hit' ? (
          filteredHitList.length > 0 ? (
            filteredHitList.map(item => (
              isMobile ? (
                <SwipeableTaskItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  completed={item.completed}
                  priority={item.priority}
                  isKeyPoint={item.isKeyPoint}
                  onToggleCompletion={toggleHitListItemCompletion}
                  onDelete={onDeleteTask ? (id) => onDeleteTask(id, 'hit') : undefined}
                  onMoveBack={moveTaskBackToHotList ? (id) => moveTaskBackToHotList(id, 'hit') : undefined}
                  isMobile={isMobile}
                />
              ) : (
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
              )
            ))
          ) : (
            <EmptyTaskList activeList="hit" isMobile={isMobile} />
          )
        ) : (
          filteredDoList.length > 0 ? (
            filteredDoList.map(item => (
              isMobile ? (
                <SwipeableTaskItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  completed={item.completed}
                  priority={item.priority}
                  onToggleCompletion={toggleDoListItemCompletion}
                  onDelete={onDeleteTask ? (id) => onDeleteTask(id, 'do') : undefined}
                  onMoveBack={moveTaskBackToHotList ? (id) => moveTaskBackToHotList(id, 'do') : undefined}
                  isMobile={isMobile}
                />
              ) : (
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
              )
            ))
          ) : (
            <EmptyTaskList activeList="do" isMobile={isMobile} />
          )
        )}
      </div>
    </div>
  );
};
