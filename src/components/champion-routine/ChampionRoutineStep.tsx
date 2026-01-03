import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Droplets, Sun, Wind, Timer, Heart, Sparkles, Eye, BookOpen, 
  PenTool, Dumbbell, Target, Settings, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { MeditationTimer } from './MeditationTimer';
import { GratitudeInput } from './GratitudeInput';
import { AutosuggestionCard } from './AutosuggestionCard';
import { PrioritiesInput } from './PrioritiesInput';
import { RelationshipCard } from './RelationshipCard';
import { ChampionRoutineSettings } from './ChampionRoutineSettings';
import { ActivitySelector, ActivityType } from './ActivitySelector';
import { useLanguage } from '@/context/LanguageContext';
import { debounce } from '@/lib/utils';

interface ChampionRoutineStepProps {
  onComplete?: () => void;
}

interface RoutineStep {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  type: 'checkbox' | 'timer' | 'gratitude' | 'autosuggestion' | 'priorities' | 'activity';
}

const ROUTINE_STEPS: RoutineStep[] = [
  { id: 'water', icon: Droplets, label: 'Ai băut un pahar de apă?', color: 'text-blue-500', type: 'checkbox' },
  { id: 'light', icon: Sun, label: '5 minute în lumină naturală', color: 'text-yellow-500', type: 'checkbox' },
  { id: 'breathing', icon: Wind, label: '5 minute respirații profunde', color: 'text-cyan-500', type: 'checkbox' },
  { id: 'meditation', icon: Timer, label: 'Meditație', color: 'text-purple-500', type: 'timer' },
  { id: 'gratitude', icon: Heart, label: 'Recunoștință', color: 'text-pink-500', type: 'gratitude' },
  { id: 'autosuggestion', icon: Sparkles, label: 'Autosugestie', color: 'text-amber-500', type: 'autosuggestion' },
  { id: 'visualization', icon: Eye, label: 'Vizualizează ziua perfectă', color: 'text-indigo-500', type: 'checkbox' },
  { id: 'reading', icon: BookOpen, label: 'Citit minimum 10 pagini', color: 'text-emerald-500', type: 'checkbox' },
  { id: 'journaling', icon: PenTool, label: 'Journaling / Reflecție', color: 'text-orange-500', type: 'checkbox' },
  { id: 'exercise', icon: Dumbbell, label: 'Activitate fizică', color: 'text-red-500', type: 'activity' },
  { id: 'priorities', icon: Target, label: 'Top 3 Priorități', color: 'text-green-500', type: 'priorities' },
];

export function ChampionRoutineStep({ onComplete }: ChampionRoutineStepProps) {
  const { t } = useLanguage();
  const { 
    people, 
    todayLog, 
    isLoading, 
    isConfigured, 
    autosuggestion,
    updateLog,
    updateAutosuggestion
  } = useChampionRoutine();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  // Debounced update for text inputs
  const debouncedUpdateLog = useCallback(
    debounce((field: string, value: any) => updateLog(field as any, value), 500),
    [updateLog]
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getCheckboxValue = (stepId: string): boolean => {
    if (!todayLog) return false;
    const fieldMap: Record<string, keyof typeof todayLog> = {
      water: 'water_drunk',
      light: 'light_exposure',
      breathing: 'breathing_completed',
      visualization: 'visualization_completed',
      reading: 'reading_completed',
      journaling: 'journaling_completed',
      exercise: 'exercise_completed',
    };
    return Boolean(todayLog[fieldMap[stepId]]);
  };

  const handleCheckboxChange = (stepId: string, checked: boolean) => {
    const fieldMap: Record<string, string> = {
      water: 'water_drunk',
      light: 'light_exposure',
      breathing: 'breathing_completed',
      visualization: 'visualization_completed',
      reading: 'reading_completed',
      journaling: 'journaling_completed',
      exercise: 'exercise_completed',
    };
    updateLog(fieldMap[stepId] as any, checked);
  };

  const handleRelationshipAction = (personId: string, action: string) => {
    const currentActions = todayLog?.relationship_actions || [];
    const existingIndex = currentActions.findIndex(a => a.person_id === personId);
    
    let newActions;
    if (existingIndex >= 0) {
      newActions = [...currentActions];
      newActions[existingIndex] = { ...newActions[existingIndex], action };
    } else {
      newActions = [...currentActions, { person_id: personId, action, completed: false }];
    }
    
    debouncedUpdateLog('relationship_actions', newActions);
  };

  const handleRelationshipCompleted = (personId: string, completed: boolean) => {
    const currentActions = todayLog?.relationship_actions || [];
    const existingIndex = currentActions.findIndex(a => a.person_id === personId);
    
    let newActions;
    if (existingIndex >= 0) {
      newActions = [...currentActions];
      newActions[existingIndex] = { ...newActions[existingIndex], completed };
    } else {
      newActions = [...currentActions, { person_id: personId, action: '', completed }];
    }
    
    updateLog('relationship_actions', newActions);
  };

  // Calculate progress
  const completedSteps = ROUTINE_STEPS.filter(step => {
    if (step.type === 'checkbox') return getCheckboxValue(step.id);
    if (step.id === 'meditation') return (todayLog?.meditation_duration_seconds || 0) > 0;
    if (step.id === 'gratitude') return (todayLog?.gratitude_items || []).some(item => item?.trim());
    if (step.id === 'autosuggestion') return todayLog?.autosuggestion_completed;
    if (step.id === 'priorities') return (todayLog?.priorities || []).some(item => item?.trim());
    if (step.id === 'exercise') return todayLog?.exercise_completed;
    return false;
  }).length;

  const progress = (completedSteps / ROUTINE_STEPS.length) * 100;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  // Show setup UI for new users
  if (!isConfigured) {
    return (
      <>
        <Card className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Rutina de Campion</h2>
            <p className="text-muted-foreground">
              Configurează-ți rutina personalizată pentru cele 4 arii ale vieții
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Dumbbell, label: 'Body', color: 'from-orange-500/20 to-red-500/20' },
              { icon: Sparkles, label: 'Being', color: 'from-purple-500/20 to-indigo-500/20' },
              { icon: Heart, label: 'Balance', color: 'from-pink-500/20 to-rose-500/20' },
              { icon: Target, label: 'Business', color: 'from-blue-500/20 to-cyan-500/20' },
            ].map(({ icon: Icon, label, color }) => (
              <Card
                key={label}
                className={`p-6 bg-gradient-to-br ${color} cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => setSettingsOpen(true)}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="h-10 w-10" />
                  <span className="font-medium">{label}</span>
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={() => setSettingsOpen(true)} size="lg" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Personalizează Rutina de Campion
          </Button>
        </Card>

        <ChampionRoutineSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      </>
    );
  }

  return (
    <>
      <Card className="p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Rutina de Campion</h2>
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progres</span>
            <span className="font-medium">{completedSteps}/{ROUTINE_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Steps Section */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('main')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium">Pași Rutină</span>
            {expandedSections.includes('main') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {expandedSections.includes('main') && (
            <div className="space-y-3">
              {ROUTINE_STEPS.map((step) => {
                const Icon = step.icon;

                if (step.type === 'checkbox') {
                  return (
                    <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Checkbox
                        id={step.id}
                        checked={getCheckboxValue(step.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(step.id, checked === true)}
                      />
                      <Icon className={`h-5 w-5 ${step.color}`} />
                      <label htmlFor={step.id} className="flex-1 cursor-pointer">
                        {step.label}
                      </label>
                    </div>
                  );
                }

                if (step.type === 'timer') {
                  return (
                    <MeditationTimer
                      key={step.id}
                      initialDuration={todayLog?.meditation_duration_seconds || 0}
                      onComplete={(seconds) => updateLog('meditation_duration_seconds', seconds)}
                    />
                  );
                }

                if (step.type === 'gratitude') {
                  return (
                    <GratitudeInput
                      key={step.id}
                      items={todayLog?.gratitude_items || []}
                      onChange={(items) => debouncedUpdateLog('gratitude_items', items)}
                    />
                  );
                }

                if (step.type === 'autosuggestion') {
                  return (
                    <AutosuggestionCard
                      key={step.id}
                      text={autosuggestion}
                      completed={todayLog?.autosuggestion_completed || false}
                      onTextChange={updateAutosuggestion}
                      onCompletedChange={(completed) => updateLog('autosuggestion_completed', completed)}
                    />
                  );
                }

                if (step.type === 'priorities') {
                  return (
                    <PrioritiesInput
                      key={step.id}
                      items={todayLog?.priorities || []}
                      onChange={(items) => debouncedUpdateLog('priorities', items)}
                    />
                  );
                }

                if (step.type === 'activity') {
                  return (
                    <div key={step.id} className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Selectează activitatea</span>
                      </div>
                      <ActivitySelector
                        selected={selectedActivity}
                        onSelect={(type) => {
                          setSelectedActivity(type);
                          if (type !== 'workout') {
                            handleCheckboxChange('exercise', true);
                          }
                        }}
                      />
                      {selectedActivity && selectedActivity !== 'workout' && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <Checkbox
                            id="activity-done"
                            checked={getCheckboxValue('exercise')}
                            onCheckedChange={(checked) => handleCheckboxChange('exercise', checked === true)}
                          />
                          <label htmlFor="activity-done" className="cursor-pointer">
                            Am completat {selectedActivity}
                          </label>
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>

        {/* Relationships Section */}
        {people.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('relationships')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                Relații ({people.length})
              </span>
              {expandedSections.includes('relationships') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {expandedSections.includes('relationships') && (
              <div className="space-y-3">
                {people.map((person) => {
                  const personAction = todayLog?.relationship_actions?.find(a => a.person_id === person.id);
                  return (
                    <RelationshipCard
                      key={person.id}
                      personId={person.id}
                      personName={person.name}
                      relationshipType={person.relationship_type}
                      action={personAction?.action || ''}
                      completed={personAction?.completed || false}
                      onActionChange={(action) => handleRelationshipAction(person.id, action)}
                      onCompletedChange={(completed) => handleRelationshipCompleted(person.id, completed)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Complete Button */}
        {onComplete && progress === 100 && (
          <Button onClick={onComplete} className="w-full" size="lg">
            Completează Rutina
          </Button>
        )}
      </Card>

      <ChampionRoutineSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
