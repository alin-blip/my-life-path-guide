import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sunrise, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ALL_STEPS } from '@/components/champion-routine/StepsOrderEditor';
import { cn } from '@/lib/utils';

interface RoutineData {
  active_steps: string[];
  routine_steps_order: string[];
}

interface RoutineStepProps {
  data: RoutineData;
  onChange: (data: Partial<RoutineData>) => void;
}

export function RoutineStep({ data, onChange }: RoutineStepProps) {
  const [localData, setLocalData] = useState<RoutineData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Build ordered steps list
  const orderedSteps = (localData.routine_steps_order?.length 
    ? localData.routine_steps_order 
    : ALL_STEPS.map(s => s.id)
  ).map(id => ALL_STEPS.find(s => s.id === id)).filter(Boolean) as typeof ALL_STEPS;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(orderedSteps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const newOrder = items.map(s => s.id);
    const newData = { ...localData, routine_steps_order: newOrder };
    setLocalData(newData);
    onChange({ routine_steps_order: newOrder });
  };

  const toggleStep = (stepId: string) => {
    const current = localData.active_steps || [];
    const updated = current.includes(stepId)
      ? current.filter(s => s !== stepId)
      : [...current, stepId];
    
    const newData = { ...localData, active_steps: updated };
    setLocalData(newData);
    onChange({ active_steps: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Sunrise className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Rutina Campionului</h2>
          <p className="text-muted-foreground text-sm">Selectează și ordonează pașii din rutina ta de dimineață</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pașii Rutinei</CardTitle>
          <CardDescription>
            Trage pentru a reordona, activează/dezactivează cu switch-ul
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="routine-steps">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {orderedSteps.map((step, index) => {
                    const isActive = (localData.active_steps || []).includes(step.id);
                    const Icon = step.icon;
                    
                    return (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all",
                              snapshot.isDragging && "shadow-lg",
                              isActive 
                                ? "bg-primary/5 border-primary/20" 
                                : "bg-muted/30 border-muted"
                            )}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                            </div>
                            
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              isActive ? "bg-primary/10" : "bg-muted"
                            )}>
                              <Icon className={cn(
                                "w-4 h-4",
                                isActive ? "text-primary" : "text-muted-foreground"
                              )} />
                            </div>
                            
                            <div className="flex-1">
                              <span className={cn(
                                "font-medium text-sm",
                                !isActive && "text-muted-foreground"
                              )}>
                                {step.label}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {step.category}
                              </span>
                            </div>
                            
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => toggleStep(step.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">💡 Sfat</h4>
        <p className="text-sm text-muted-foreground">
          Începe cu pașii esențiali și adaugă treptat mai mulți pe măsură ce rutina devine un obicei.
          O rutină de 15-20 minute este ideală pentru început.
        </p>
      </div>
    </div>
  );
}
