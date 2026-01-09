import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { GripVertical, Sparkles, Droplets, Timer, Brain, Dumbbell, Utensils, FileText, ListTodo, Heart, Settings2, Wind, Sun, Eye, PenTool } from 'lucide-react';
import { 
  ExerciseStepConfigComponent, 
  MeditationStepConfigComponent, 
  ReadingStepConfigComponent,
  BreathingStepConfigComponent,
  LightExposureStepConfigComponent,
  GratitudeStepConfigComponent,
  VisualizationStepConfigComponent,
  JournalingStepConfigComponent 
} from './config';

interface StepsOrderEditorProps {
  activeSteps: string[];
  stepsOrder: string[];
  onActiveStepsChange: (steps: string[]) => void;
  onStepsOrderChange: (order: string[]) => void;
}

export const ALL_STEPS = [
  { id: 'lightExposure', label: 'Lumină Naturală', icon: Sun, category: 'being', hasConfig: true },
  { id: 'hydration', label: 'Hidratare', icon: Droplets, category: 'being', hasConfig: false },
  { id: 'breathing', label: 'Respirație', icon: Wind, category: 'being', hasConfig: true },
  { id: 'meditation', label: 'Meditație', icon: Timer, category: 'being', hasConfig: true },
  { id: 'gratitude', label: 'Recunoștință', icon: Heart, category: 'being', hasConfig: true },
  { id: 'visualization', label: 'Vizualizare', icon: Eye, category: 'being', hasConfig: true },
  { id: 'autosuggestion', label: 'Autosugestie', icon: Brain, category: 'being', hasConfig: false },
  { id: 'journaling', label: 'Journaling', icon: PenTool, category: 'being', hasConfig: true },
  { id: 'reading', label: 'Citit', icon: FileText, category: 'being', hasConfig: true },
  { id: 'exercise', label: 'Exerciții', icon: Dumbbell, category: 'body', hasConfig: true },
  { id: 'mealPlanning', label: 'Meal Planning', icon: Utensils, category: 'body', hasConfig: false },
  { id: 'contentCreation', label: 'Content Creation', icon: FileText, category: 'business', hasConfig: false },
  { id: 'dailyTasks', label: 'Daily Tasks', icon: ListTodo, category: 'business', hasConfig: false },
  { id: 'relationships', label: 'Relații', icon: Heart, category: 'balance', hasConfig: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  being: 'border-l-purple-500',
  body: 'border-l-orange-500',
  business: 'border-l-blue-500',
  balance: 'border-l-pink-500',
};

export function StepsOrderEditor({ 
  activeSteps, 
  stepsOrder, 
  onActiveStepsChange, 
  onStepsOrderChange 
}: StepsOrderEditorProps) {
  const [configDialogOpen, setConfigDialogOpen] = useState<string | null>(null);

  // Ensure we have a valid order (include all steps)
  const orderedSteps = stepsOrder.length > 0 
    ? stepsOrder.filter(id => ALL_STEPS.some(s => s.id === id))
    : ALL_STEPS.map(s => s.id);
  
  // Add any missing steps at the end
  const missingSteps = ALL_STEPS.filter(s => !orderedSteps.includes(s.id)).map(s => s.id);
  const fullOrder = [...orderedSteps, ...missingSteps];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(fullOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onStepsOrderChange(items);
  };

  const toggleStep = (stepId: string) => {
    const newActiveSteps = activeSteps.includes(stepId)
      ? activeSteps.filter(id => id !== stepId)
      : [...activeSteps, stepId];
    onActiveStepsChange(newActiveSteps);
  };

  const getStepData = (stepId: string) => {
    return ALL_STEPS.find(s => s.id === stepId);
  };

  const handleConfigClick = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    setConfigDialogOpen(stepId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Ordinea Pașilor</h3>
        <p className="text-xs text-muted-foreground">
          Trage pentru a reordona
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {fullOrder.map((stepId, index) => {
                const step = getStepData(stepId);
                if (!step) return null;

                const Icon = step.icon;
                const isActive = activeSteps.includes(stepId);

                return (
                  <Draggable key={stepId} draggableId={stepId} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          p-3 flex items-center gap-3 border-l-4 transition-all
                          ${CATEGORY_COLORS[step.category]}
                          ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}
                          ${!isActive ? 'opacity-50' : ''}
                        `}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{step.label}</span>
                        </div>

                        {step.hasConfig && isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 gap-1.5 text-xs"
                            onClick={(e) => handleConfigClick(e, stepId)}
                            title="Configurare pas"
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                            Setări
                          </Button>
                        )}

                        <Switch
                          checked={isActive}
                          onCheckedChange={() => toggleStep(stepId)}
                        />
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <p className="text-xs text-muted-foreground text-center pt-2">
        Dezactivează pașii pe care nu vrei să îi incluzi în rutina zilnică. 
        <br />
        Apasă <Settings2 className="h-3 w-3 inline mx-1" /> pentru a configura pașii.
      </p>

      {/* Config Dialogs */}
      <ExerciseStepConfigComponent 
        open={configDialogOpen === 'exercise'} 
        onOpenChange={(open) => !open && setConfigDialogOpen(null)} 
      />
      <MeditationStepConfigComponent 
        open={configDialogOpen === 'meditation'} 
        onOpenChange={(open) => !open && setConfigDialogOpen(null)} 
      />
      <ReadingStepConfigComponent 
        open={configDialogOpen === 'reading'} 
        onOpenChange={(open) => !open && setConfigDialogOpen(null)} 
      />
      <BreathingStepConfigComponent 
        open={configDialogOpen === 'breathing'} 
        onOpenChange={(open) => !open && setConfigDialogOpen(null)} 
      />
      <LightExposureStepConfigComponent 
        open={configDialogOpen === 'lightExposure'} 
        onOpenChange={(open) => !open && setConfigDialogOpen(null)} 
      />
      <GratitudeStepConfigComponent 
        open={configDialogOpen === 'gratitude'} 
        onOpenChange={(open) => !open && setConfigDialogOpen(null)} 
      />
      <VisualizationStepConfigComponent 
        open={configDialogOpen === 'visualization'} 
        onOpenChange={(open) => !open && setConfigDialogOpen(null)} 
      />
      <JournalingStepConfigComponent 
        open={configDialogOpen === 'journaling'} 
        onOpenChange={(open) => !open && setConfigDialogOpen(null)} 
      />
    </div>
  );
}
