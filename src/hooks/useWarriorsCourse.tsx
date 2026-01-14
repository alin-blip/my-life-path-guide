import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ModuleProgress {
  module_id: string;
  completed: boolean;
  watched_seconds: number;
  completed_at: string | null;
}

export const useWarriorsCourse = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's course progress
  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('module_id, completed, watched_seconds, completed_at')
        .eq('user_id', user.id);

      if (error) throw error;

      setProgress(data?.map(d => ({
        module_id: d.module_id || '',
        completed: d.completed || false,
        watched_seconds: d.watched_seconds || 0,
        completed_at: d.completed_at
      })) || []);
    } catch (error) {
      console.error('Error fetching course progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Check if a specific module is completed
  const isModuleCompleted = useCallback((moduleId: string): boolean => {
    return progress.some(p => p.module_id === moduleId && p.completed);
  }, [progress]);

  // Mark a module as complete
  const markModuleComplete = useCallback(async (moduleId: string) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a salva progresul');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,module_id'
        });

      if (error) throw error;

      // Update local state
      setProgress(prev => {
        const existing = prev.find(p => p.module_id === moduleId);
        if (existing) {
          return prev.map(p => 
            p.module_id === moduleId 
              ? { ...p, completed: true, completed_at: new Date().toISOString() }
              : p
          );
        }
        return [...prev, {
          module_id: moduleId,
          completed: true,
          watched_seconds: 0,
          completed_at: new Date().toISOString()
        }];
      });

      toast.success('Modul marcat ca finalizat! 🎉');
    } catch (error) {
      console.error('Error marking module complete:', error);
      toast.error('Eroare la salvarea progresului');
    }
  }, [user]);

  // Update watch progress
  const updateWatchProgress = useCallback(async (moduleId: string, seconds: number) => {
    if (!user) return;

    try {
      await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          watched_seconds: seconds,
        }, {
          onConflict: 'user_id,module_id'
        });
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  }, [user]);

  // Calculate overall progress
  const totalModules = 42; // Total modules in the course
  const completedCount = progress.filter(p => p.completed).length;
  const overallProgress = Math.round((completedCount / totalModules) * 100);

  return {
    progress,
    isLoading,
    isModuleCompleted,
    markModuleComplete,
    updateWatchProgress,
    overallProgress,
    completedCount,
    totalModules,
    refetch: fetchProgress,
  };
};
