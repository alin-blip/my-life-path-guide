import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  X, 
  ChevronDown, 
  ChevronUp,
  Dumbbell, 
  Sparkles, 
  Heart, 
  Briefcase,
  Zap,
  Clock,
  Trophy,
  Save,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { CORE4_STEPS } from './RoutineSetupWizard';

interface QuickSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Core 4 steps that cannot be disabled
const CORE4_STEP_IDS = CORE4_STEPS as readonly string[];

const STEP_INFO: Record<string, { label: string; icon: React.ReactNode; category: string; isCore4?: boolean }> = {
  // Core 4 Steps (locked)
  exercise: { label: 'Exerciții', icon: <Dumbbell className="h-4 w-4" />, category: 'body', isCore4: true },
  mealPlanning: { label: 'Meal Planning', icon: <Dumbbell className="h-4 w-4" />, category: 'body', isCore4: true },
  meditation: { label: 'Meditație', icon: <Sparkles className="h-4 w-4" />, category: 'being', isCore4: true },
  journaling: { label: 'Journaling', icon: <Sparkles className="h-4 w-4" />, category: 'being', isCore4: true },
  relationships: { label: 'Relații', icon: <Heart className="h-4 w-4" />, category: 'balance', isCore4: true },
  learn: { label: 'Învață', icon: <Briefcase className="h-4 w-4" />, category: 'business', isCore4: true },
  apply: { label: 'Aplică/Predă', icon: <Briefcase className="h-4 w-4" />, category: 'business', isCore4: true },
  
  // Extra Steps (toggleable)
  emotionalCheck: { label: 'Check-in Emoțional', icon: <Heart className="h-4 w-4" />, category: 'emotional' },
  emotionalTransform: { label: 'Transformare', icon: <Sparkles className="h-4 w-4" />, category: 'emotional' },
  lightExposure: { label: 'Lumină Naturală', icon: <Sparkles className="h-4 w-4" />, category: 'being' },
  hydration: { label: 'Hidratare', icon: <Sparkles className="h-4 w-4" />, category: 'being' },
  breathing: { label: 'Respirație', icon: <Sparkles className="h-4 w-4" />, category: 'being' },
  gratitude: { label: 'Recunoștință', icon: <Sparkles className="h-4 w-4" />, category: 'being' },
  visualization: { label: 'Vizualizare', icon: <Sparkles className="h-4 w-4" />, category: 'being' },
  autosuggestion: { label: 'Autosugestie', icon: <Sparkles className="h-4 w-4" />, category: 'being' },
  visionDeclaration: { label: 'Declarație Viziune', icon: <Sparkles className="h-4 w-4" />, category: 'being' },
  reading: { label: 'Citit', icon: <Sparkles className="h-4 w-4" />, category: 'being' },
  contentCreation: { label: 'Content', icon: <Briefcase className="h-4 w-4" />, category: 'business' },
};

const TEMPLATES = [
  { id: 'core4', label: 'Core 4 Only', icon: <Lock className="h-4 w-4" />, steps: [...CORE4_STEP_IDS] },
  { id: 'balanced', label: 'Balanced', icon: <Clock className="h-4 w-4" />, steps: [...CORE4_STEP_IDS, 'hydration', 'breathing', 'gratitude', 'reading'] },
  { id: 'champion', label: 'Full Champion', icon: <Trophy className="h-4 w-4" />, steps: Object.keys(STEP_INFO) },
];

const HABIT_CATEGORIES = [
  { id: 'habit_body', label: 'Corp', icon: <Dumbbell className="h-4 w-4" />, color: 'text-red-400' },
  { id: 'habit_being', label: 'Spirit', icon: <Sparkles className="h-4 w-4" />, color: 'text-purple-400' },
  { id: 'habit_balance', label: 'Relații', icon: <Heart className="h-4 w-4" />, color: 'text-pink-400' },
  { id: 'habit_business', label: 'Business', icon: <Briefcase className="h-4 w-4" />, color: 'text-blue-400' },
];

export function QuickSettingsPanel({ open, onOpenChange }: QuickSettingsPanelProps) {
  const { settings, saveSettings } = useChampionRoutine();
  const [activeSteps, setActiveSteps] = useState<string[]>([]);
  const [habitSteps, setHabitSteps] = useState<string[]>([]);
  const [includeDailyTasks, setIncludeDailyTasks] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('steps');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize from settings
  useEffect(() => {
    if (settings) {
      // Always ensure Core 4 is included
      const savedSteps = settings.active_steps || Object.keys(STEP_INFO);
      const stepsWithCore4 = [...new Set([...CORE4_STEP_IDS, ...savedSteps])];
      setActiveSteps(stepsWithCore4);
      setHabitSteps(settings.habit_steps || []);
      setIncludeDailyTasks(settings.include_daily_tasks !== false);
    }
  }, [settings]);

  const toggleStep = (stepId: string) => {
    // Prevent disabling Core 4 steps
    if (CORE4_STEP_IDS.includes(stepId)) {
      toast.error('Core 4 nu poate fi dezactivat');
      return;
    }
    
    setActiveSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(s => s !== stepId)
        : [...prev, stepId]
    );
    setHasChanges(true);
  };

  const toggleHabit = (habitId: string) => {
    setHabitSteps(prev => 
      prev.includes(habitId) 
        ? prev.filter(h => h !== habitId)
        : [...prev, habitId]
    );
    setHasChanges(true);
  };

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      // Always include Core 4 in any template
      const stepsWithCore4 = [...new Set([...CORE4_STEP_IDS, ...template.steps])];
      setActiveSteps(stepsWithCore4);
      setHasChanges(true);
      toast.success(`Template "${template.label}" aplicat`);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ensure Core 4 is always saved
      const stepsWithCore4 = [...new Set([...CORE4_STEP_IDS, ...activeSteps])];
      
      const { error } = await saveSettings({
        active_steps: stepsWithCore4,
        routine_steps_order: stepsWithCore4,
        habit_steps: habitSteps,
        include_daily_tasks: includeDailyTasks
      });

      if (error) {
        toast.error('Eroare la salvare');
        return;
      }

      toast.success('Setări salvate!');
      setHasChanges(false);
      onOpenChange(false);
    } catch (err) {
      toast.error('Eroare la salvare');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Separate Core 4 and Extra steps
  const core4Steps = Object.entries(STEP_INFO).filter(([_, info]) => info.isCore4);
  const extraSteps = Object.entries(STEP_INFO).filter(([_, info]) => !info.isCore4);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background/95 backdrop-blur-xl border-white/10 max-h-[85vh]">
        <DrawerHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-white">Setări Rapide</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="text-white/60">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Templates */}
          <div className="space-y-2">
            <p className="text-sm text-white/60 font-medium">Template-uri rapide</p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template.id)}
                  className="flex items-center gap-1.5 text-xs bg-white/5 border-white/10 hover:bg-white/10"
                >
                  {template.icon}
                  <span className="hidden sm:inline">{template.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Core 4 Section (Locked) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Core 4 - Obligatoriu ({core4Steps.length})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {core4Steps.map(([stepId, info]) => (
                <div
                  key={stepId}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-sm bg-primary/20 text-white border border-primary/30"
                >
                  {info.icon}
                  <span className="truncate">{info.label}</span>
                  <Lock className="h-3 w-3 text-primary/60 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Extra Steps Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('steps')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm text-white/80 font-medium">
                Pași Extra ({extraSteps.filter(([id]) => activeSteps.includes(id)).length})
              </span>
              {expandedSection === 'steps' ? (
                <ChevronUp className="h-4 w-4 text-white/40" />
              ) : (
                <ChevronDown className="h-4 w-4 text-white/40" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSection === 'steps' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {extraSteps.map(([stepId, info]) => (
                      <button
                        key={stepId}
                        onClick={() => toggleStep(stepId)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-all",
                          activeSteps.includes(stepId)
                            ? "bg-white/20 text-white border border-white/30"
                            : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10"
                        )}
                      >
                        {info.icon}
                        <span className="truncate">{info.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Habits Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('habits')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm text-white/80 font-medium">
                Habits Tracking
              </span>
              {expandedSection === 'habits' ? (
                <ChevronUp className="h-4 w-4 text-white/40" />
              ) : (
                <ChevronDown className="h-4 w-4 text-white/40" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSection === 'habits' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-2">
                    {HABIT_CATEGORIES.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <span className={habit.color}>{habit.icon}</span>
                          <span className="text-white text-sm">{habit.label}</span>
                        </div>
                        <Switch
                          checked={habitSteps.includes(habit.id)}
                          onCheckedChange={() => {
                            toggleHabit(habit.id);
                          }}
                        />
                      </div>
                    ))}
                    
                    {/* Include Daily Tasks */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 mt-3">
                      <div className="space-y-0.5">
                        <Label className="text-white text-sm">Sarcinile de Azi</Label>
                        <p className="text-xs text-white/50">Include review sarcinilor</p>
                      </div>
                      <Switch
                        checked={includeDailyTasks}
                        onCheckedChange={(checked) => {
                          setIncludeDailyTasks(checked);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DrawerFooter className="border-t border-white/10">
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Se salvează...' : hasChanges ? 'Salvează Modificările' : 'Salvat'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
