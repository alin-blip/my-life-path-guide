import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, BookOpen, Pen, Check, GripVertical, Settings } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface MorningRoutineStepProps {
  onComplete: () => void;
}

interface RoutineItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
}

const DEFAULT_ITEMS: RoutineItem[] = [
  {
    id: 'meditation',
    label: 'Meditație',
    description: '10-20 minute de liniște și prezență',
    icon: <Brain className="h-5 w-5" />,
    iconColor: 'text-purple-500'
  },
  {
    id: 'reading',
    label: 'Citit',
    description: 'Cel puțin 10 pagini din cartea curentă',
    icon: <BookOpen className="h-5 w-5" />,
    iconColor: 'text-blue-500'
  },
  {
    id: 'journaling',
    label: 'Journaling / Stack',
    description: 'Scrie gândurile și intențiile pentru azi',
    icon: <Pen className="h-5 w-5" />,
    iconColor: 'text-green-500'
  }
];

const STORAGE_KEY = 'morning-routine-order';

export const MorningRoutineStep = ({ onComplete }: MorningRoutineStepProps) => {
  const [items, setItems] = useState<RoutineItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedOrder = JSON.parse(saved) as string[];
        return savedOrder
          .map(id => DEFAULT_ITEMS.find(item => item.id === id))
          .filter((item): item is RoutineItem => item !== undefined);
      } catch {
        // JSON parse failed – return safe fallback
        return DEFAULT_ITEMS;
      }
    }
    return DEFAULT_ITEMS;
  });

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    meditation: false,
    reading: false,
    journaling: false
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const allCompleted = Object.values(checklist).every(Boolean);

  const toggleItem = (key: string) => {
    if (isEditMode) return;
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.map(item => item.id)));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-500">
            <Brain className="h-5 w-5" />
            Rutina de Dimineață
          </CardTitle>
          <Button
            variant={isEditMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            {isEditMode ? 'Gata' : 'Ordine'}
          </Button>
        </div>
        {isEditMode && (
          <p className="text-sm text-muted-foreground mt-2">
            Trage elementele pentru a schimba ordinea
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="morning-routine" isDropDisabled={!isEditMode}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {items.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}
                    isDragDisabled={!isEditMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-4 p-4 rounded-lg bg-muted/50 transition-colors ${
                          isEditMode 
                            ? 'cursor-grab border-2 border-dashed border-muted-foreground/30' 
                            : 'cursor-pointer hover:bg-muted'
                        } ${snapshot.isDragging ? 'shadow-lg bg-muted' : ''}`}
                        onClick={() => toggleItem(item.id)}
                      >
                        {isEditMode && (
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        {!isEditMode && (
                          <Checkbox checked={checklist[item.id] || false} />
                        )}
                        <div className={item.iconColor}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        {isEditMode && (
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {!isEditMode && (
          <Button 
            className="w-full gap-2" 
            onClick={onComplete}
            disabled={!allCompleted}
          >
            <Check className="h-4 w-4" />
            {allCompleted ? 'Completează Pasul' : 'Bifează toate pentru a continua'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
