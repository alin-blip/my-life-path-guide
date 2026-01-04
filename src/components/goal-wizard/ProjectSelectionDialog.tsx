import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ListChecks, Crown, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { GoalCategory, GoalProject, CATEGORY_INFO } from '@/types/goalWizard';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface KeyItem {
  id: number;
  text: string;
  day: DayOfWeek | null;
}

export interface ProjectSaveSelection {
  projectIndex: number;
  projectName: string;
  saveType: 'hit' | 'massive';
  keys?: KeyItem[];
}

interface ProjectSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projects: GoalProject[];
  category: GoalCategory;
  onSaveProjects: (selections: ProjectSaveSelection[]) => Promise<void>;
}

const DAYS_OF_WEEK: { value: DayOfWeek; labelEn: string; labelRo: string }[] = [
  { value: 'monday', labelEn: 'Monday', labelRo: 'Luni' },
  { value: 'tuesday', labelEn: 'Tuesday', labelRo: 'Marți' },
  { value: 'wednesday', labelEn: 'Wednesday', labelRo: 'Miercuri' },
  { value: 'thursday', labelEn: 'Thursday', labelRo: 'Joi' },
  { value: 'friday', labelEn: 'Friday', labelRo: 'Vineri' },
  { value: 'saturday', labelEn: 'Saturday', labelRo: 'Sâmbătă' },
  { value: 'sunday', labelEn: 'Sunday', labelRo: 'Duminică' },
];

export const ProjectSelectionDialog: React.FC<ProjectSelectionDialogProps> = ({
  isOpen,
  onClose,
  projects,
  category,
  onSaveProjects
}) => {
  const { language } = useLanguage();
  const [selections, setSelections] = useState<Record<number, ProjectSaveSelection>>({});
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
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
          keys: [
            { id: 1, text: '', day: null },
            { id: 2, text: '', day: null },
            { id: 3, text: '', day: null },
            { id: 4, text: '', day: null }
          ]
        };
      });
      setSelections(initialSelections);
      setExpandedProjects(new Set());
    }
  }, [isOpen, projects]);

  const toggleProjectSelection = (index: number) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      if (newSelections[index]) {
        delete newSelections[index];
        setExpandedProjects(p => {
          const newSet = new Set(p);
          newSet.delete(index);
          return newSet;
        });
      } else {
        newSelections[index] = {
          projectIndex: index,
          projectName: projects[index].name,
          saveType: 'hit',
          keys: [
            { id: 1, text: '', day: null },
            { id: 2, text: '', day: null },
            { id: 3, text: '', day: null },
            { id: 4, text: '', day: null }
          ]
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
    if (type === 'massive') {
      setExpandedProjects(p => new Set([...p, index]));
    }
  };

  const toggleExpanded = (index: number) => {
    setExpandedProjects(p => {
      const newSet = new Set(p);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const updateKeyText = (projectIndex: number, keyId: number, text: string) => {
    setSelections(prev => ({
      ...prev,
      [projectIndex]: {
        ...prev[projectIndex],
        keys: prev[projectIndex].keys?.map(k =>
          k.id === keyId ? { ...k, text } : k
        )
      }
    }));
  };

  const updateKeyDay = (projectIndex: number, keyId: number, day: DayOfWeek | null) => {
    setSelections(prev => ({
      ...prev,
      [projectIndex]: {
        ...prev[projectIndex],
        keys: prev[projectIndex].keys?.map(k =>
          k.id === keyId ? { ...k, day } : k
        )
      }
    }));
  };

  const canSave = () => {
    const selectedProjects = Object.values(selections);
    if (selectedProjects.length === 0) return false;

    return selectedProjects.every(sel => {
      if (sel.saveType === 'hit') return true;
      // For massive, at least 1 key must have text
      return sel.keys?.some(k => k.text.trim() !== '');
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            {language === 'en' ? 'Save Projects' : 'Salvează Proiecte'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en'
              ? 'Select projects to save and choose how to save each one.'
              : 'Selectează proiectele de salvat și alege cum să le salvezi.'}
          </DialogDescription>
        </DialogHeader>

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
              const isExpanded = expandedProjects.has(index);

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

                        {/* Expand Button for Massive Objective */}
                        {selection.saveType === 'massive' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-muted-foreground"
                            onClick={() => toggleExpanded(index)}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                {language === 'en' ? 'Hide keys' : 'Ascunde cheile'}
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                {language === 'en' ? 'Define 4 keys' : 'Definește 4 chei'}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Keys Editor (Expanded) */}
                  {isSelected && selection.saveType === 'massive' && isExpanded && (
                    <div className="border-t bg-muted/30 p-4 space-y-3">
                      <p className="text-sm font-medium mb-3">
                        {language === 'en' ? 'Define the 4 keys for this objective:' : 'Definește cele 4 chei pentru acest obiectiv:'}
                      </p>
                      {selection.keys?.map((key) => (
                        <div key={key.id} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <Input
                              value={key.text}
                              onChange={(e) => updateKeyText(index, key.id, e.target.value)}
                              placeholder={language === 'en' ? `Key ${key.id}...` : `Cheia ${key.id}...`}
                              className="text-sm"
                            />
                          </div>
                          <div className="w-32">
                            <Select
                              value={key.day || 'none'}
                              onValueChange={(val) => updateKeyDay(index, key.id, val === 'none' ? null : val as DayOfWeek)}
                            >
                              <SelectTrigger className="text-sm">
                                <Calendar className="w-3 h-3 mr-1" />
                                <SelectValue placeholder={language === 'en' ? 'Day' : 'Zi'} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  {language === 'en' ? 'No day' : 'Fără zi'}
                                </SelectItem>
                                {DAYS_OF_WEEK.map((day) => (
                                  <SelectItem key={day.value} value={day.value}>
                                    {language === 'en' ? day.labelEn : day.labelRo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedCount > 0 && (
              <span>
                {selectedCount} {language === 'en' ? 'project(s) selected' : 'proiect(e) selectat(e)'}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
