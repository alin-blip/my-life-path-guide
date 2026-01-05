import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { WorkoutProgram, WorkoutProgramDay, WorkoutDayExercise, WorkoutTemplate } from '@/types/workout';

export function useWorkoutProgram() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [activeProgram, setActiveProgram] = useState<WorkoutProgram | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
      
      const active = data?.find(p => p.is_active);
      if (active) {
        await fetchProgramDetails(active.id);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchProgramDetails = async (programId: string) => {
    try {
      const { data: program, error: programError } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (programError) throw programError;

      const { data: days, error: daysError } = await supabase
        .from('workout_program_days')
        .select('*')
        .eq('program_id', programId)
        .order('day_of_week');

      if (daysError) throw daysError;

      const daysWithExercises = await Promise.all(
        (days || []).map(async (day) => {
          const { data: exercises } = await supabase
            .from('workout_day_exercises')
            .select('*')
            .eq('day_id', day.id)
            .order('order_index');
          return { ...day, exercises: exercises || [] };
        })
      );

      setActiveProgram({ ...program, days: daysWithExercises });
    } catch (error) {
      console.error('Error fetching program details:', error);
    }
  };

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .order('is_official', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
    fetchTemplates();
  }, [fetchPrograms, fetchTemplates]);

  const createProgram = async (name: string, description?: string): Promise<WorkoutProgram | null> => {
    if (!user?.id) return null;

    try {
      // Deactivate other programs
      await supabase
        .from('workout_programs')
        .update({ is_active: false })
        .eq('user_id', user.id);

      const { data, error } = await supabase
        .from('workout_programs')
        .insert({
          user_id: user.id,
          name,
          description,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Create 7 days
      const daysToCreate = Array.from({ length: 7 }, (_, i) => ({
        program_id: data.id,
        day_of_week: i,
        is_rest_day: i >= 5, // Sat & Sun rest by default
        order_index: i,
      }));

      await supabase.from('workout_program_days').insert(daysToCreate);

      await fetchPrograms();
      toast.success('Program creat cu succes!');
      return data;
    } catch (error) {
      console.error('Error creating program:', error);
      toast.error('Eroare la crearea programului');
      return null;
    }
  };

  const updateProgram = async (programId: string, updates: Partial<WorkoutProgram>) => {
    try {
      const { error } = await supabase
        .from('workout_programs')
        .update(updates)
        .eq('id', programId);

      if (error) throw error;
      await fetchPrograms();
      toast.success('Program actualizat!');
    } catch (error) {
      console.error('Error updating program:', error);
      toast.error('Eroare la actualizare');
    }
  };

  const deleteProgram = async (programId: string) => {
    try {
      const { error } = await supabase
        .from('workout_programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;
      await fetchPrograms();
      toast.success('Program șters!');
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error('Eroare la ștergere');
    }
  };

  const updateDay = async (dayId: string, updates: Partial<WorkoutProgramDay>) => {
    try {
      const { error } = await supabase
        .from('workout_program_days')
        .update(updates)
        .eq('id', dayId);

      if (error) throw error;
      if (activeProgram) {
        await fetchProgramDetails(activeProgram.id);
      }
    } catch (error) {
      console.error('Error updating day:', error);
      toast.error('Eroare la actualizare zi');
    }
  };

  const addExercise = async (dayId: string, exercise: Partial<WorkoutDayExercise>) => {
    try {
      const { error } = await supabase
        .from('workout_day_exercises')
        .insert({
          day_id: dayId,
          exercise_name: exercise.exercise_name || 'Exercițiu nou',
          target_sets: exercise.target_sets || 3,
          target_reps: exercise.target_reps || '10',
          order_index: exercise.order_index || 0,
        });

      if (error) throw error;
      if (activeProgram) {
        await fetchProgramDetails(activeProgram.id);
      }
      toast.success('Exercițiu adăugat!');
    } catch (error) {
      console.error('Error adding exercise:', error);
      toast.error('Eroare la adăugare exercițiu');
    }
  };

  const updateExercise = async (exerciseId: string, updates: Partial<WorkoutDayExercise>) => {
    try {
      const { error } = await supabase
        .from('workout_day_exercises')
        .update(updates)
        .eq('id', exerciseId);

      if (error) throw error;
      if (activeProgram) {
        await fetchProgramDetails(activeProgram.id);
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast.error('Eroare la actualizare exercițiu');
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    try {
      const { error } = await supabase
        .from('workout_day_exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) throw error;
      if (activeProgram) {
        await fetchProgramDetails(activeProgram.id);
      }
      toast.success('Exercițiu șters!');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Eroare la ștergere exercițiu');
    }
  };

  const saveAsTemplate = async (programId: string, name: string, description?: string, category?: string, difficulty?: string) => {
    if (!user?.id || !activeProgram) return;

    try {
      const programData = {
        days: activeProgram.days?.map(day => ({
          day_of_week: day.day_of_week,
          name: day.name,
          is_rest_day: day.is_rest_day,
          exercises: day.exercises?.map(ex => ({
            exercise_name: ex.exercise_name,
            target_sets: ex.target_sets,
            target_reps: ex.target_reps,
            order_index: ex.order_index,
          })),
        })),
      };

      const { error } = await supabase
        .from('workout_templates')
        .insert({
          source_program_id: programId,
          name,
          description,
          category,
          difficulty,
          days_per_week: activeProgram.days?.filter(d => !d.is_rest_day).length || 0,
          creator_user_id: user.id,
          program_data: programData,
        });

      if (error) throw error;
      await fetchTemplates();
      toast.success('Template salvat!');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Eroare la salvare template');
    }
  };

  const applyTemplate = async (template: WorkoutTemplate) => {
    if (!user?.id || !template.program_data) return;

    try {
      // Create new program from template
      const { data: newProgram, error: programError } = await supabase
        .from('workout_programs')
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          is_active: true,
        })
        .select()
        .single();

      if (programError) throw programError;

      // Deactivate other programs
      await supabase
        .from('workout_programs')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('id', newProgram.id);

      // Create days and exercises from template
      const templateData = template.program_data as { days: any[] };
      
      for (const dayData of templateData.days || []) {
        const { data: newDay, error: dayError } = await supabase
          .from('workout_program_days')
          .insert({
            program_id: newProgram.id,
            day_of_week: dayData.day_of_week,
            name: dayData.name,
            is_rest_day: dayData.is_rest_day,
            order_index: dayData.day_of_week,
          })
          .select()
          .single();

        if (dayError) throw dayError;

        if (dayData.exercises?.length) {
          const exercisesToInsert = dayData.exercises.map((ex: any) => ({
            day_id: newDay.id,
            exercise_name: ex.exercise_name,
            target_sets: ex.target_sets,
            target_reps: ex.target_reps,
            order_index: ex.order_index,
          }));

          await supabase.from('workout_day_exercises').insert(exercisesToInsert);
        }
      }

      // Increment usage count
      await supabase
        .from('workout_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', template.id);

      await fetchPrograms();
      toast.success('Template aplicat cu succes!');
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Eroare la aplicare template');
    }
  };

  const getTodayWorkout = () => {
    if (!activeProgram?.days) return null;
    const today = new Date().getDay();
    // Convert JS day (0=Sunday) to our format (0=Monday)
    const ourDay = today === 0 ? 6 : today - 1;
    return activeProgram.days.find(d => d.day_of_week === ourDay);
  };

  return {
    programs,
    activeProgram,
    templates,
    loading,
    createProgram,
    updateProgram,
    deleteProgram,
    updateDay,
    addExercise,
    updateExercise,
    deleteExercise,
    saveAsTemplate,
    applyTemplate,
    getTodayWorkout,
    fetchProgramDetails,
    refetch: fetchPrograms,
  };
}
