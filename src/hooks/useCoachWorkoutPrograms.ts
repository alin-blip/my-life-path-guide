import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface CoachWorkoutProgram {
  id: string;
  coach_id: string;
  tribe_id: string | null;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_coach_template: boolean;
  created_at: string;
  updated_at: string;
  days?: CoachWorkoutDay[];
}

export interface CoachWorkoutDay {
  id: string;
  program_id: string;
  day_of_week: number;
  name: string | null;
  is_rest_day: boolean;
  order_index: number;
  exercises?: CoachWorkoutExercise[];
}

export interface CoachWorkoutExercise {
  id: string;
  day_id: string;
  exercise_name: string;
  target_sets: number;
  target_reps: string | null;
  target_weight_kg: number | null;
  notes: string | null;
  order_index: number;
}

export function useCoachWorkoutPrograms(coachId: string | undefined) {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<CoachWorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    if (!coachId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_coach_template', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coach programs:', error);
    } else {
      setPrograms((data as any[]) || []);
    }
    setLoading(false);
  }, [coachId]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const fetchProgramDetails = useCallback(async (programId: string): Promise<CoachWorkoutProgram | null> => {
    const { data: program, error: pErr } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('id', programId)
      .single();
    if (pErr || !program) return null;

    const { data: days } = await supabase
      .from('workout_program_days')
      .select('*')
      .eq('program_id', programId)
      .order('day_of_week');

    const daysWithExercises = await Promise.all(
      (days || []).map(async (day: any) => {
        const { data: exercises } = await supabase
          .from('workout_day_exercises')
          .select('*')
          .eq('day_id', day.id)
          .order('order_index');
        return { ...day, exercises: exercises || [] };
      })
    );

    return { ...program, days: daysWithExercises } as any;
  }, []);

  const createProgram = useCallback(async (data: {
    name: string;
    description?: string;
    tribe_id?: string | null;
  }) => {
    if (!coachId) return null;

    // We need the user_id of the coach
    const { data: coachProfile } = await supabase
      .from('coach_profiles')
      .select('user_id')
      .eq('id', coachId)
      .single();

    if (!coachProfile) return null;

    const { data: program, error } = await supabase
      .from('workout_programs')
      .insert({
        coach_id: coachId,
        user_id: coachProfile.user_id,
        name: data.name,
        description: data.description || null,
        tribe_id: data.tribe_id || null,
        is_coach_template: true,
        is_active: false,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating program:', error);
      toast({ title: 'Error', description: 'Could not create program.', variant: 'destructive' });
      return null;
    }

    // Create 7 days
    const daysToCreate = Array.from({ length: 7 }, (_, i) => ({
      program_id: (program as any).id,
      day_of_week: i,
      is_rest_day: i >= 5,
      order_index: i,
    }));
    await supabase.from('workout_program_days').insert(daysToCreate);

    toast({ title: 'Success', description: 'Program created!' });
    await fetchPrograms();
    return program as any;
  }, [coachId, toast, fetchPrograms]);

  const deleteProgram = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('workout_programs')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Could not delete program.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Deleted', description: 'Program removed.' });
    await fetchPrograms();
  }, [toast, fetchPrograms]);

  const addExercise = useCallback(async (dayId: string, exercise: {
    exercise_name: string;
    target_sets?: number;
    target_reps?: string;
    target_weight_kg?: number;
    notes?: string;
    order_index?: number;
  }) => {
    const { error } = await supabase
      .from('workout_day_exercises')
      .insert({
        day_id: dayId,
        exercise_name: exercise.exercise_name,
        target_sets: exercise.target_sets || 3,
        target_reps: exercise.target_reps || '10',
        target_weight_kg: exercise.target_weight_kg || null,
        notes: exercise.notes || null,
        order_index: exercise.order_index || 0,
      });

    if (error) {
      toast({ title: 'Error', description: 'Could not add exercise.', variant: 'destructive' });
    }
  }, [toast]);

  const updateExercise = useCallback(async (exerciseId: string, updates: Partial<CoachWorkoutExercise>) => {
    const { error } = await supabase
      .from('workout_day_exercises')
      .update(updates)
      .eq('id', exerciseId);

    if (error) {
      toast({ title: 'Error', description: 'Could not update exercise.', variant: 'destructive' });
    }
  }, [toast]);

  const deleteExercise = useCallback(async (exerciseId: string) => {
    const { error } = await supabase
      .from('workout_day_exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) {
      toast({ title: 'Error', description: 'Could not delete exercise.', variant: 'destructive' });
    }
  }, [toast]);

  const updateDay = useCallback(async (dayId: string, updates: { name?: string; is_rest_day?: boolean }) => {
    const { error } = await supabase
      .from('workout_program_days')
      .update(updates)
      .eq('id', dayId);

    if (error) {
      toast({ title: 'Error', description: 'Could not update day.', variant: 'destructive' });
    }
  }, [toast]);

  const applyProgramToTribe = useCallback(async (programId: string, tribeId: string) => {
    // Get full program details
    const program = await fetchProgramDetails(programId);
    if (!program || !program.days) {
      toast({ title: 'Error', description: 'Could not load program.', variant: 'destructive' });
      return;
    }

    // Get tribe members
    const { data: members, error: membersError } = await supabase
      .from('tribe_members')
      .select('user_id')
      .eq('tribe_id', tribeId);

    if (membersError || !members?.length) {
      toast({ title: 'Error', description: 'No members found.', variant: 'destructive' });
      return;
    }

    let successCount = 0;
    for (const member of members) {
      try {
        // Deactivate existing programs
        await supabase
          .from('workout_programs')
          .update({ is_active: false } as any)
          .eq('user_id', member.user_id)
          .eq('is_coach_template', false);

        // Create a copy for the member
        const { data: newProg, error: progErr } = await supabase
          .from('workout_programs')
          .insert({
            user_id: member.user_id,
            name: program.name,
            description: program.description,
            is_active: true,
            is_coach_template: false,
          } as any)
          .select()
          .single();

        if (progErr || !newProg) continue;

        // Copy days and exercises
        for (const day of program.days) {
          const { data: newDay } = await supabase
            .from('workout_program_days')
            .insert({
              program_id: (newProg as any).id,
              day_of_week: day.day_of_week,
              name: day.name,
              is_rest_day: day.is_rest_day,
              order_index: day.order_index,
            })
            .select()
            .single();

          if (newDay && day.exercises?.length) {
            await supabase.from('workout_day_exercises').insert(
              day.exercises.map((ex: any) => ({
                day_id: (newDay as any).id,
                exercise_name: ex.exercise_name,
                target_sets: ex.target_sets,
                target_reps: ex.target_reps,
                target_weight_kg: ex.target_weight_kg,
                notes: ex.notes,
                order_index: ex.order_index,
              }))
            );
          }
        }
        successCount++;
      } catch (e) {
        console.error('Error applying to member:', e);
      }
    }

    toast({
      title: 'Applied!',
      description: `Program applied to ${successCount}/${members.length} members.`,
    });
  }, [fetchProgramDetails, toast]);

  return {
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
    refreshPrograms: fetchPrograms,
  };
}
