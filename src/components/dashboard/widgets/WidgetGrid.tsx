import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DashboardWidget } from '@/types/dashboardWidget';
import { MacroWidget } from './MacroWidget';
import { WorkoutWidget } from './WorkoutWidget';
import { CaloriesWidget } from './CaloriesWidget';
import { GratitudeWidget } from './GratitudeWidget';
import { StreakWidget } from './StreakWidget';
import { TasksWidget } from './TasksWidget';
import { ReadingWidget } from './ReadingWidget';
import { WaterWidget } from './WaterWidget';
import { ChampionRoutineWidget } from './ChampionRoutineWidget';
import { IdeasWidget } from './IdeasWidget';
import { JournalWidget } from './JournalWidget';
import { NapoleonHillCoachWidget } from './NapoleonHillCoachWidget';
import { ChallengeProgressWidget } from './ChallengeProgressWidget';
import { VibeCanvasWidget } from './VibeCanvasWidget';
import { CustomWidgetRenderer } from './CustomWidgetRenderer';
import type { CustomWidget, WidgetData } from '@/types/customWidget';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Fix for react-beautiful-dnd with React 18 StrictMode
const StrictModeDroppable = ({ children, ...props }: React.ComponentProps<typeof Droppable>) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

interface WidgetGridProps {
  widgets: DashboardWidget[];
  customWidgets?: CustomWidget[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (widgetId: string) => void;
  onResize: (widgetId: string, size: DashboardWidget['size']) => void;
  onRemoveCustomWidget?: (widgetId: string) => void;
  streakData?: { currentStreak: number; longestStreak: number };
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets,
  customWidgets = [],
  onReorder,
  onRemove,
  onResize,
  onRemoveCustomWidget,
  streakData
}) => {
  const { user } = useAuth();
  const [customWidgetData, setCustomWidgetData] = useState<Record<string, WidgetData | null>>({});

  const enabledWidgets = widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  // Fetch custom widget data
  useEffect(() => {
    const fetchCustomWidgetData = async () => {
      if (!user?.id || customWidgets.length === 0) return;

      const today = new Date().toISOString().split('T')[0];
      const dataMap: Record<string, WidgetData | null> = {};

      for (const widget of customWidgets) {
        const { data } = await supabase
          .from('widget_data')
          .select('*')
          .eq('widget_id', widget.id)
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        dataMap[widget.id] = data ? {
          ...data,
          data: data.data as Record<string, unknown>,
        } as WidgetData : null;
      }

      setCustomWidgetData(dataMap);
    };

    fetchCustomWidgetData();
  }, [user?.id, customWidgets]);

  const handleSaveCustomWidgetData = async (widgetId: string, data: Record<string, unknown>) => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('widget_data')
      .upsert({
        widget_id: widgetId,
        user_id: user.id,
        date: today,
        data: data as any,
      }, {
        onConflict: 'widget_id,user_id,date',
      });

    setCustomWidgetData(prev => ({
      ...prev,
      [widgetId]: {
        id: widgetId,
        widget_id: widgetId,
        user_id: user.id,
        date: today,
        data,
      } as WidgetData,
    }));
  };

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
      case 'champion-routine':
        return <ChampionRoutineWidget />;
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
      case 'ideas':
        return <IdeasWidget {...commonProps} />;
      case 'journal':
        return <JournalWidget {...commonProps} />;
      case 'napoleon-coach':
        return <NapoleonHillCoachWidget {...commonProps} />;
      case 'challenge-progress':
        return <ChallengeProgressWidget />;
      case 'vibe-canvas':
        return <VibeCanvasWidget {...commonProps} />;
      default:
        return null;
    }
  };

  const hasWidgets = enabledWidgets.length > 0 || customWidgets.length > 0;

  if (!hasWidgets) {
    return null;
  }

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <StrictModeDroppable droppableId="widgets" direction="horizontal">
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
                      {...provided.dragHandleProps}
                      className={`${snapshot.isDragging ? 'opacity-75' : ''} ${
                        widget.id === 'champion-routine' ? 'md:col-span-2 lg:col-span-3' : ''
                      }`}
                    >
                      {renderWidget(widget, provided.dragHandleProps)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </StrictModeDroppable>
      </DragDropContext>

      {/* Custom Widgets Section */}
      {customWidgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customWidgets.map((widget) => (
            <CustomWidgetRenderer
              key={widget.id}
              widget={widget}
              data={customWidgetData[widget.id]}
              onSaveData={(data) => handleSaveCustomWidgetData(widget.id, data)}
              onDelete={onRemoveCustomWidget ? () => onRemoveCustomWidget(widget.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
