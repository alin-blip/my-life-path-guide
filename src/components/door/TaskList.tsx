import React, { useState } from 'react';
import { HitListItem, DoListItem, DayOfWeek } from '@/types/door';
import { DayNavigation } from './task-list/DayNavigation';
import { TaskItem } from './task-list/TaskItem';
import { SwipeableTaskItem } from './SwipeableTaskItem';
import { EmptyTaskList } from './task-list/EmptyTaskList';
import { cn } from '@/lib/utils';
import { ArrowDown, Check } from 'lucide-react';

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
  onTasksAdded?: () => void;
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  weekKey: string;
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
  onDeleteTask,
  onTasksAdded,
  isDragOver: propIsDragOver,
  onDragOver: propOnDragOver,
  onDrop: propOnDrop,
  weekKey = ''
}) => {
  const [localIsDragOver, setLocalIsDragOver] = useState(false);
  const [showDropSuccess, setShowDropSuccess] = useState(false);
  
  const isDragOver = propIsDragOver !== undefined ? propIsDragOver : localIsDragOver;
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setLocalIsDragOver(true);
    propOnDragOver?.(e);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setLocalIsDragOver(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setLocalIsDragOver(false);
    propOnDrop?.(e);
    
    // Show success indicator
    setShowDropSuccess(true);
    setTimeout(() => setShowDropSuccess(false), 1000);
  };
  
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
  
  // Filter by day
  const filteredHitList = hitList.filter(item => normalizeDay(item.day) === activeDay);
  const filteredDoList = doList.filter(item => normalizeDay(item.day) === activeDay);
  
  const hitStats = `${hitDoneCount}/${hitAchievedCount}`;
  const doStats = `${doDoneCount}/${doAchievedCount}`;
  
  return (
    <div 
      className={cn(
        "relative transition-all duration-200",
        isMobile ? 'max-h-[70vh] overflow-y-auto overflow-x-hidden w-full max-w-full' : '',
        isDragOver && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background rounded-xl"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-primary/10 border-2 border-dashed border-primary animate-drop-zone-pulse pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
              <ArrowDown className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">
              Add to tasks
            </span>
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
      {/* Task Type Tabs - Simplified */}
      <div className="flex mb-3 bg-muted/50 p-1 rounded-lg">
        <button
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            activeList === 'hit' 
              ? 'bg-card text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveList('hit')}
        >
          To Do ({hitStats})
        </button>
        <button
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            activeList === 'do' 
              ? 'bg-card text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveList('do')}
        >
          Done ({doStats})
        </button>
      </div>
      
      {/* Day Navigation */}
      <DayNavigation
        activeDay={activeDay}
        selectDayOfWeek={selectDayOfWeek}
        isMobile={isMobile}
      />
      
      {/* Task List */}
      <div className={`space-y-1 ${isMobile ? 'max-h-[calc(70vh-120px)] overflow-y-auto' : ''}`}>
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
            <EmptyTaskList activeList="hit" isMobile={isMobile} onTasksAdded={onTasksAdded} weekKey={weekKey || ''} activeDay={activeDay} />
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
            <EmptyTaskList activeList="do" isMobile={isMobile} onTasksAdded={onTasksAdded} weekKey={weekKey || ''} activeDay={activeDay} />
          )
        )}
      </div>
    </div>
  );
};
