import React, { useState, useEffect } from 'react';
import { useCoachWorkoutPrograms, CoachWorkoutProgram, CoachWorkoutDay } from '@/hooks/useCoachWorkoutPrograms';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Dumbbell, Users, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { DAYS_OF_WEEK } from '@/types/workout';

const content = {
  ro: {
    title: 'Programe de Antrenament',
    subtitle: 'Creează programe și atribuie-le grupurilor tale',
    createProgram: 'Program Nou',
    name: 'Nume Program',
    description: 'Descriere',
    tribe: 'Grup Asociat',
    noTribe: 'Fără Grup',
    save: 'Salvează',
    cancel: 'Anulează',
    delete: 'Șterge',
    edit: 'Editează',
    applyToTribe: 'Trimite la Membrii',
    applyConfirm: 'Sigur vrei să aplici acest program? Programele active ale membrilor vor fi dezactivate.',
    noPrograms: 'Nu ai programe create încă.',
    restDay: 'Zi de Odihnă',
    addExercise: 'Adaugă Exercițiu',
    exerciseName: 'Nume Exercițiu',
    sets: 'Seturi',
    reps: 'Repetări',
    weight: 'Greutate (kg)',
    notes: 'Note',
    members: 'membrii',
    programSent: 'Program trimis!',
    exercises: 'exerciții',
  },
  en: {
    title: 'Workout Programs',
    subtitle: 'Create programs and assign them to your groups',
    createProgram: 'New Program',
    name: 'Program Name',
    description: 'Description',
    tribe: 'Associated Group',
    noTribe: 'No Group',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    applyToTribe: 'Send to Members',
    applyConfirm: 'Are you sure you want to apply this program? Members\' active programs will be deactivated.',
    noPrograms: 'No programs created yet.',
    restDay: 'Rest Day',
    addExercise: 'Add Exercise',
    exerciseName: 'Exercise Name',
    sets: 'Sets',
    reps: 'Reps',
    weight: 'Weight (kg)',
    notes: 'Notes',
    members: 'members',
    programSent: 'Program sent!',
    exercises: 'exercises',
  },
};

interface Props {
  coachProfileId: string;
  userId: string;
}

export const CoachWorkoutPrograms: React.FC<Props> = ({ coachProfileId, userId }) => {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  const {
    programs,
    loading,
    createProgram,
    deleteProgram,
    fetchProgramDetails,
    addExercise,
    updateExercise,
    deleteExercise,
    updateDay,
    applyProgramToTribe,
    refreshPrograms,
  } = useCoachWorkoutPrograms(coachProfileId);

  const [tribes, setTribes] = useState<{ id: string; name: string; member_count: number }[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTribeId, setFormTribeId] = useState<string>('none');

  // Program editing
  const [editingProgram, setEditingProgram] = useState<CoachWorkoutProgram | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('3');
  const [newExerciseReps, setNewExerciseReps] = useState('10');

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

  const handleCreate = async () => {
    if (!formName.trim()) return;
    const result = await createProgram({
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      tribe_id: formTribeId === 'none' ? null : formTribeId,
    });
    if (result) {
      setShowCreateDialog(false);
      setFormName('');
      setFormDesc('');
      setFormTribeId('none');
      // Open for editing
      const details = await fetchProgramDetails(result.id);
      if (details) setEditingProgram(details);
    }
  };

  const handleOpenEdit = async (programId: string) => {
    const details = await fetchProgramDetails(programId);
    if (details) setEditingProgram(details);
  };

  const handleAddExercise = async (dayId: string) => {
    if (!newExerciseName.trim() || !editingProgram) return;
    const day = editingProgram.days?.find(d => d.id === dayId);
    await addExercise(dayId, {
      exercise_name: newExerciseName.trim(),
      target_sets: parseInt(newExerciseSets) || 3,
      target_reps: newExerciseReps || '10',
      order_index: (day?.exercises?.length || 0),
    });
    setNewExerciseName('');
    setNewExerciseSets('3');
    setNewExerciseReps('10');
    // Refresh
    const updated = await fetchProgramDetails(editingProgram.id);
    if (updated) setEditingProgram(updated);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!editingProgram) return;
    await deleteExercise(exerciseId);
    const updated = await fetchProgramDetails(editingProgram.id);
    if (updated) setEditingProgram(updated);
  };

  const handleToggleRestDay = async (dayId: string, isRest: boolean) => {
    if (!editingProgram) return;
    await updateDay(dayId, { is_rest_day: isRest });
    const updated = await fetchProgramDetails(editingProgram.id);
    if (updated) setEditingProgram(updated);
  };

  const handleApply = async (programId: string, tribeId: string) => {
    if (!window.confirm(t.applyConfirm)) return;
    await applyProgramToTribe(programId, tribeId);
  };

  const getDayLabel = (dayOfWeek: number) => {
    const day = DAYS_OF_WEEK[dayOfWeek];
    return language === 'en' ? day?.labelEn : day?.label;
  };

  const getTribeName = (tribeId: string | null) => {
    if (!tribeId) return null;
    return tribes.find(t => t.id === tribeId)?.name;
  };

  const countExercises = (program: CoachWorkoutProgram) => {
    // We only have summary data in list view, show from details if available
    return '—';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.createProgram}
        </Button>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t.noPrograms}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {programs.map((program: any) => (
            <Card key={program.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      {program.name}
                    </h3>
                    {program.description && (
                      <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {program.tribe_id && (
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {getTribeName(program.tribe_id)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(program.id)}>
                      {t.edit}
                    </Button>
                    {program.tribe_id && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApply(program.id, program.tribe_id!)}
                        className="gap-1"
                      >
                        <Users className="h-4 w-4" />
                        {t.applyToTribe}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProgram(program.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createProgram}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.name}</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} />
            </div>
            <div>
              <Label>{t.description}</Label>
              <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} />
            </div>
            <div>
              <Label>{t.tribe}</Label>
              <Select value={formTribeId} onValueChange={setFormTribeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>{t.cancel}</Button>
            <Button onClick={handleCreate} disabled={!formName.trim()}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <Dialog open={!!editingProgram} onOpenChange={(open) => { if (!open) { setEditingProgram(null); setExpandedDay(null); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              {editingProgram?.name}
            </DialogTitle>
          </DialogHeader>

          {editingProgram?.days && (
            <div className="space-y-3">
              {editingProgram.days.map((day: CoachWorkoutDay) => (
                <Card key={day.id} className={day.is_rest_day ? 'opacity-60' : ''}>
                  <CardHeader className="py-3 px-4 cursor-pointer" onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{getDayLabel(day.day_of_week)}</span>
                        {day.is_rest_day && <Badge variant="outline">{t.restDay}</Badge>}
                        {!day.is_rest_day && day.exercises && (
                          <Badge variant="secondary">{day.exercises.length} {t.exercises}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <Label className="text-xs">{t.restDay}</Label>
                          <Switch
                            checked={day.is_rest_day}
                            onCheckedChange={(checked) => handleToggleRestDay(day.id, checked)}
                          />
                        </div>
                        {expandedDay === day.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardHeader>

                  {expandedDay === day.id && !day.is_rest_day && (
                    <CardContent className="pt-0 space-y-3">
                      {/* Existing exercises */}
                      {day.exercises?.map((ex) => (
                        <div key={ex.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                          <span className="flex-1 text-sm font-medium">{ex.exercise_name}</span>
                          <span className="text-xs text-muted-foreground">{ex.target_sets}×{ex.target_reps}</span>
                          {ex.target_weight_kg && (
                            <span className="text-xs text-muted-foreground">{ex.target_weight_kg}kg</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={() => handleDeleteExercise(ex.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      {/* Add exercise form */}
                      <div className="flex items-end gap-2 pt-2 border-t">
                        <div className="flex-1">
                          <Label className="text-xs">{t.exerciseName}</Label>
                          <Input
                            value={newExerciseName}
                            onChange={e => setNewExerciseName(e.target.value)}
                            placeholder="Bench Press..."
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="w-16">
                          <Label className="text-xs">{t.sets}</Label>
                          <Input
                            value={newExerciseSets}
                            onChange={e => setNewExerciseSets(e.target.value)}
                            className="h-8 text-sm"
                            type="number"
                          />
                        </div>
                        <div className="w-16">
                          <Label className="text-xs">{t.reps}</Label>
                          <Input
                            value={newExerciseReps}
                            onChange={e => setNewExerciseReps(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={() => handleAddExercise(day.id)}
                          disabled={!newExerciseName.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
