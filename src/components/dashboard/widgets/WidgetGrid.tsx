import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DashboardWidget } from '@/types/dashboardWidget';
import { MacroWidget } from './MacroWidget';
import { WorkoutWidget } from './WorkoutWidget';
import { CaloriesWidget } from './CaloriesWidget';
import { GratitudeWidget } from './GratitudeWidget';
import { StreakWidget } from './StreakWidget';
import { TasksWidget } from './TasksWidget';
import { ReadingWidget } from './ReadingWidget';
import { WaterWidget } from './WaterWidget';

interface WidgetGridProps {
  widgets: DashboardWidget[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (widgetId: string) => void;
  onResize: (widgetId: string, size: DashboardWidget['size']) => void;
  streakData?: { currentStreak: number; longestStreak: number };
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets,
  onReorder,
  onRemove,
  onResize,
  streakData
}) => {
  const enabledWidgets = widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  const renderWidget = (widget: DashboardWidget, dragHandleProps?: any) => {
    const commonProps = {
      size: widget.size,
      onRemove: () => onRemove(widget.id),
      onResize: (size: DashboardWidget['size']) => onResize(widget.id, size),
      dragHandleProps
    };

    switch (widget.id) {
      case 'macros':
        return <MacroWidget {...commonProps} />;
      case 'workout':
        return <WorkoutWidget {...commonProps} />;
      case 'calories':
        return <CaloriesWidget {...commonProps} />;
      case 'gratitude':
        return <GratitudeWidget {...commonProps} />;
      case 'streak':
        return <StreakWidget {...commonProps} currentStreak={streakData?.currentStreak} longestStreak={streakData?.longestStreak} />;
      case 'tasks':
        return <TasksWidget {...commonProps} />;
      case 'reading':
        return <ReadingWidget {...commonProps} />;
      case 'water':
        return <WaterWidget {...commonProps} />;
      default:
        return null;
    }
  };

  if (enabledWidgets.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="widgets" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {enabledWidgets.map((widget, index) => (
              <Draggable key={widget.id} draggableId={widget.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'opacity-75' : ''}
                  >
                    {renderWidget(widget, provided.dragHandleProps)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
