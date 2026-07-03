import React, { useState, useEffect } from 'react';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle, ResponsiveModalDescription, ResponsiveModalFooter } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, ListChecks, Crown, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { GoalCategory, GoalProject, CATEGORY_INFO } from '@/types/goalWizard';

export interface KeyItem {
  id: number;
  text: string;
}

export interface ProjectSaveSelection {
  projectIndex: number;
  projectName: string;
  saveType: 'hit' | 'massive';
}

interface ProjectSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projects: GoalProject[];
  category: GoalCategory;
  onSaveProjects: (selections: ProjectSaveSelection[]) => Promise<void>;
}

export const ProjectSelectionDialog: React.FC<ProjectSelectionDialogProps> = ({
  isOpen,
  onClose,
  projects,
  category,
  onSaveProjects
}) => {
  const { language } = useLanguage();
  const [selections, setSelections] = useState<Record<number, ProjectSaveSelection>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState({ current: 0, total: 0 });

  const categoryInfo = CATEGORY_INFO[category];

  // Initialize selections when dialog opens
  useEffect(() => {
    if (isOpen) {
      const initialSelections: Record<number, ProjectSaveSelection> = {};
      projects.forEach((project, index) => {
        initialSelections[index] = {
          projectIndex: index,
          projectName: project.name,
          saveType: 'hit',
        };
      });
      setSelections(initialSelections);
    }
  }, [isOpen, projects]);

  const toggleProjectSelection = (index: number) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      if (newSelections[index]) {
        delete newSelections[index];
      } else {
        newSelections[index] = {
          projectIndex: index,
          projectName: projects[index].name,
          saveType: 'hit',
        };
      }
      return newSelections;
    });
  };

  const updateSaveType = (index: number, type: 'hit' | 'massive') => {
    setSelections(prev => ({
      ...prev,
      [index]: { ...prev[index], saveType: type }
    }));
  };

  const canSave = () => {
    return Object.keys(selections).length > 0;
  };

  const handleSave = async () => {
    const projectsToSave = Object.values(selections);
    if (projectsToSave.length === 0) return;

    setIsSaving(true);
    setSavingProgress({ current: 0, total: projectsToSave.length });

    try {
      await onSaveProjects(projectsToSave);
    } finally {
      setIsSaving(false);
      setSavingProgress({ current: 0, total: 0 });
    }
  };

  const selectedCount = Object.keys(selections).length;
  const hasMassiveSelection = Object.values(selections).some(s => s.saveType === 'massive');

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose} className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            {language === 'en' ? 'Save Projects' : 'Salvează Proiecte'}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {language === 'en'
              ? 'Select projects to save and choose how to save each one.'
              : 'Selectează proiectele de salvat și alege cum să le salvezi.'}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="space-y-4 py-4">
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn(categoryInfo.bgColor, categoryInfo.color, "border-0")}>
              {categoryInfo.label[language === 'en' ? 'en' : 'ro']}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {projects.length} {language === 'en' ? 'projects defined' : 'proiecte definite'}
            </span>
          </div>

          {/* Projects List */}
          <div className="space-y-3">
            {projects.map((project, index) => {
              const isSelected = index in selections;
              const selection = selections[index];

              return (
                <div
                  key={project.id}
                  className={cn(
                    "border rounded-lg transition-all duration-200",
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  {/* Project Header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`project-${index}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleProjectSelection(index)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`project-${index}`}
                          className="text-base font-medium cursor-pointer"
                        >
                          {index + 1}. {project.name}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === 'en' ? 'Week 1:' : 'Săpt. 1:'} {project.milestones?.weekOne || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Save Type Selection */}
                    {isSelected && (
                      <div className="mt-4 ml-7">
                        <RadioGroup
                          value={selection.saveType}
                          onValueChange={(val) => updateSaveType(index, val as 'hit' | 'massive')}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hit" id={`hit-${index}`} />
                            <Label htmlFor={`hit-${index}`} className="cursor-pointer flex items-center gap-1.5">
                              <ListChecks className="w-4 h-4" />
                              Hit List
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="massive" id={`massive-${index}`} />
                            <Label htmlFor={`massive-${index}`} className="cursor-pointer flex items-center gap-1.5">
                              <Crown className="w-4 h-4 text-amber-500" />
                              {language === 'en' ? 'Massive Objective' : 'Obiectiv Masiv'}
                            </Label>
                          </div>
                        </RadioGroup>

                        {/* AI Planning Message for Massive Objective */}
                        {selection.saveType === 'massive' && (
                          <div className="mt-3 border-t bg-muted/30 p-4 rounded-b-lg -mx-4 -mb-4">
                            <div className="flex items-center gap-2 text-primary">
                              <Sparkles className="w-4 h-4" />
                              <p className="text-sm font-medium">
                                {language === 'en' 
                                  ? 'AI will guide you step-by-step to define the 4 keys'
                                  : 'AI-ul te va ghida pas cu pas să definești cele 4 chei'}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {language === 'en'
                                ? 'Each key will have objectives, steps, and daily assignments'
                                : 'Fiecare cheie va avea obiective, pași și alocări pe zile'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ResponsiveModalFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedCount > 0 && (
              <span>
                {selectedCount} {language === 'en' ? 'project(s) selected' : 'proiect(e) selectat(e)'}
                {hasMassiveSelection && (
                  <span className="ml-2 text-primary">
                    • {language === 'en' ? 'AI Planning will start' : 'AI Planning va porni'}
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              {language === 'en' ? 'Cancel' : 'Anulează'}
            </Button>
            <Button onClick={handleSave} disabled={!canSave() || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {savingProgress.current}/{savingProgress.total}
                </>
              ) : (
                language === 'en' ? 'Save Selected' : 'Salvează Selectate'
              )}
            </Button>
          </div>
        </ResponsiveModalFooter>
      </ResponsiveModal>
  );
};
