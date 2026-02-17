import React, { useState, useEffect } from 'react';
import { useCoachRoutineTemplates, CoachRoutineTemplate } from '@/hooks/useCoachRoutineTemplates';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { CoachApplyDialog } from './CoachApplyDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Trash2,
  Edit,
  Star,
  Users,
  Send,
  Loader2,
  LayoutList,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  coachProfileId: string;
  userId: string;
}

const DEFAULT_STEPS = [
  { id: 'exercise', label: { ro: 'Exercițiu fizic', en: 'Exercise' } },
  { id: 'meditation', label: { ro: 'Meditație', en: 'Meditation' } },
  { id: 'reading', label: { ro: 'Lectură', en: 'Reading' } },
  { id: 'lightExposure', label: { ro: 'Expunere la lumină', en: 'Light Exposure' } },
  { id: 'hydration', label: { ro: 'Hidratare', en: 'Hydration' } },
  { id: 'breathing', label: { ro: 'Respirație', en: 'Breathing' } },
  { id: 'gratitude', label: { ro: 'Recunoștință', en: 'Gratitude' } },
  { id: 'visualization', label: { ro: 'Vizualizare', en: 'Visualization' } },
  { id: 'autosuggestion', label: { ro: 'Autosugestie', en: 'Autosuggestion' } },
  { id: 'journaling', label: { ro: 'Jurnal', en: 'Journaling' } },
  { id: 'mealPlanning', label: { ro: 'Planificare mese', en: 'Meal Planning' } },
  { id: 'contentCreation', label: { ro: 'Creare conținut', en: 'Content Creation' } },
  { id: 'dailyTasks', label: { ro: 'Sarcini zilnice', en: 'Daily Tasks' } },
  { id: 'relationships', label: { ro: 'Relații', en: 'Relationships' } },
];

const content = {
  ro: {
    title: 'Template-uri Rutină',
    subtitle: 'Creează rutine personalizate și aplică-le grupurilor tale',
    createNew: 'Rutină nouă',
    name: 'Nume rutină',
    description: 'Descriere',
    namePlaceholder: 'ex: Rutina Dimineții de Campion',
    descPlaceholder: 'Descrie rutina pentru clienții tăi...',
    tribe: 'Grup asociat',
    noTribe: 'Fără grup specific',
    isDefault: 'Rutină default pentru clienți noi',
    activeSteps: 'Pași activi',
    save: 'Salvează',
    cancel: 'Anulează',
    applyToTribe: 'Aplică la grup',
    applyConfirm: 'Aplici rutina la toți membrii grupului?',
    applyConfirmDesc: 'Aceasta va suprascrie rutina existentă a fiecărui membru din grup.',
    apply: 'Aplică',
    delete: 'Șterge',
    deleteConfirm: 'Sigur vrei să ștergi acest template?',
    deleteConfirmDesc: 'Acțiunea este ireversibilă.',
    noTemplates: 'Nu ai template-uri create',
    noTemplatesDesc: 'Creează primul template de rutină pentru clienții tăi.',
    default: 'Default',
    members: 'membri',
    edit: 'Editează',
    stepsOrder: 'Ordinea pașilor',
  },
  en: {
    title: 'Routine Templates',
    subtitle: 'Create personalized routines and apply them to your groups',
    createNew: 'New Routine',
    name: 'Routine name',
    description: 'Description',
    namePlaceholder: 'e.g. Champion Morning Routine',
    descPlaceholder: 'Describe the routine for your clients...',
    tribe: 'Associated group',
    noTribe: 'No specific group',
    isDefault: 'Default routine for new clients',
    activeSteps: 'Active steps',
    save: 'Save',
    cancel: 'Cancel',
    applyToTribe: 'Apply to group',
    applyConfirm: 'Apply routine to all group members?',
    applyConfirmDesc: "This will overwrite each member's existing routine.",
    apply: 'Apply',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this template?',
    deleteConfirmDesc: 'This action cannot be undone.',
    noTemplates: 'No templates created',
    noTemplatesDesc: 'Create your first routine template for your clients.',
    default: 'Default',
    members: 'members',
    edit: 'Edit',
    stepsOrder: 'Steps order',
  },
};

export const CoachRoutineTemplates: React.FC<Props> = ({ coachProfileId, userId }) => {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  const {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplateToTribe,
    applyTemplateToMember,
  } = useCoachRoutineTemplates(coachProfileId);

  const [tribes, setTribes] = useState<{ id: string; name: string; member_count: number }[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CoachRoutineTemplate | null>(null);
  const [applyTarget, setApplyTarget] = useState<CoachRoutineTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CoachRoutineTemplate | null>(null);
  const [applying, setApplying] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTribeId, setFormTribeId] = useState<string>('none');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formActiveSteps, setFormActiveSteps] = useState<Record<string, boolean>>({});
  const [formStepsOrder, setFormStepsOrder] = useState<string[]>(DEFAULT_STEPS.map(s => s.id));

  // Fetch coach tribes
  useEffect(() => {
    const fetchTribes = async () => {
      const { data } = await supabase
        .from('tribes')
        .select('id, name, member_count')
        .eq('coach_id', coachProfileId);
      setTribes(data || []);
    };
    fetchTribes();
  }, [coachProfileId]);

  const openEditor = (template?: CoachRoutineTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormName(template.name);
      setFormDesc(template.description || '');
      setFormTribeId(template.tribe_id || 'none');
      setFormIsDefault(template.is_default);
      setFormActiveSteps((template.active_steps as Record<string, boolean>) || {});
      setFormStepsOrder(
        (template.routine_steps_order as string[]) || DEFAULT_STEPS.map(s => s.id)
      );
    } else {
      setEditingTemplate(null);
      setFormName('');
      setFormDesc('');
      setFormTribeId('none');
      setFormIsDefault(false);
      setFormActiveSteps(
        Object.fromEntries(DEFAULT_STEPS.map(s => [s.id, true]))
      );
      setFormStepsOrder(DEFAULT_STEPS.map(s => s.id));
    }
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      tribe_id: formTribeId === 'none' ? null : formTribeId,
      is_default: formIsDefault,
      active_steps: formActiveSteps,
      routine_steps_order: formStepsOrder,
    };

    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, payload);
    } else {
      await createTemplate(payload);
    }
    setShowEditor(false);
  };

  const handleApplyToTribe = async (tribeId: string) => {
    if (!applyTarget) return;
    await applyTemplateToTribe(applyTarget.id, tribeId);
  };

  const handleApplyToMember = async (userId: string) => {
    if (!applyTarget) return;
    await applyTemplateToMember(applyTarget.id, userId);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteTemplate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const toggleStep = (stepId: string) => {
    setFormActiveSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.createNew}
        </Button>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutList className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">{t.noTemplates}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.noTemplatesDesc}</p>
            <Button onClick={() => openEditor()} className="mt-4 gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              {t.createNew}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map(template => {
            const tribe = tribes.find(t => t.id === template.tribe_id);
            const activeCount = template.active_steps
              ? Object.values(template.active_steps as Record<string, boolean>).filter(Boolean).length
              : 0;

            return (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                        {template.is_default && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3" />
                            {t.default}
                          </Badge>
                        )}
                      </CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {activeCount} {t.activeSteps.toLowerCase()}
                    </span>
                    {tribe && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {tribe.name} ({tribe.member_count} {t.members})
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => openEditor(template)} className="gap-1">
                      <Edit className="h-3.5 w-3.5" />
                      {t.edit}
                    </Button>
                    {(template.tribe_id || tribes.length > 0) && (
                      <Button size="sm" variant="outline" onClick={() => setApplyTarget(template)} className="gap-1">
                        <Send className="h-3.5 w-3.5" />
                        {t.applyToTribe}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(template)}
                      className="gap-1 text-destructive hover:text-destructive ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? t.edit : t.createNew}
            </DialogTitle>
            <DialogDescription>{t.subtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>{t.name}</Label>
              <Input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder={t.namePlaceholder}
              />
            </div>

            <div>
              <Label>{t.description}</Label>
              <Textarea
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder={t.descPlaceholder}
                rows={2}
              />
            </div>

            <div>
              <Label>{t.tribe}</Label>
              <Select value={formTribeId} onValueChange={setFormTribeId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.noTribe} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.noTribe}</SelectItem>
                  {tribes.map(tribe => (
                    <SelectItem key={tribe.id} value={tribe.id}>
                      {tribe.name} ({tribe.member_count} {t.members})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={formIsDefault} onCheckedChange={setFormIsDefault} />
              <Label>{t.isDefault}</Label>
            </div>

            <div>
              <Label className="mb-2 block">{t.activeSteps}</Label>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_STEPS.map(step => (
                  <button
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      formActiveSteps[step.id]
                        ? 'bg-primary/10 border-primary/30 text-foreground'
                        : 'bg-muted/30 border-border text-muted-foreground'
                    }`}
                  >
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        formActiveSteps[step.id] ? 'text-primary' : 'text-muted-foreground/40'
                      }`}
                    />
                    {step.label[language] || step.label.ro}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>
              {t.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Dialog */}
      <CoachApplyDialog
        open={!!applyTarget}
        onOpenChange={(open) => { if (!open) setApplyTarget(null); }}
        tribes={tribes}
        defaultTribeId={applyTarget?.tribe_id}
        onApplyToTribe={handleApplyToTribe}
        onApplyToMember={handleApplyToMember}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteConfirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
