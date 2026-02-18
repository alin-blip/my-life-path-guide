import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface TribeCourse {
  id: string;
  tribe_id: string;
  coach_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  position: number;
  created_at: string;
  modules_count?: number;
}

export interface TribeCourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content_type: string;
  content_text: string | null;
  video_url: string | null;
  pdf_url: string | null;
  position: number;
  is_free: boolean;
  created_at: string;
}

export function useCoachTribeLessons(tribeId?: string, coachId?: string) {
  const { toast } = useToast();
  const [courses, setCourses] = useState<TribeCourse[]>([]);
  const [modules, setModules] = useState<TribeCourseModule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (!tribeId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('tribe_courses')
        .select('*')
        .eq('tribe_id', tribeId)
        .order('position', { ascending: true });

      if (data) {
        // Get module counts
        const courseIds = data.map(c => c.id);
        const { data: modulesData } = await supabase
          .from('tribe_course_modules')
          .select('course_id')
          .in('course_id', courseIds);

        const countMap = new Map<string, number>();
        modulesData?.forEach(m => {
          countMap.set(m.course_id, (countMap.get(m.course_id) || 0) + 1);
        });

        setCourses(data.map(c => ({
          ...c,
          modules_count: countMap.get(c.id) || 0,
        })) as TribeCourse[]);
      }
    } finally {
      setLoading(false);
    }
  }, [tribeId]);

  const createCourse = useCallback(async (title: string, description?: string) => {
    if (!tribeId || !coachId) return null;
    const { data, error } = await supabase
      .from('tribe_courses')
      .insert({
        tribe_id: tribeId,
        coach_id: coachId,
        title,
        description: description || null,
        position: courses.length,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Could not create course.', variant: 'destructive' });
      return null;
    }
    await fetchCourses();
    toast({ title: 'Course Created', description: title });
    return data;
  }, [tribeId, coachId, courses.length, fetchCourses, toast]);

  const updateCourse = useCallback(async (courseId: string, updates: Partial<TribeCourse>) => {
    const { error } = await supabase
      .from('tribe_courses')
      .update(updates)
      .eq('id', courseId);
    if (error) {
      toast({ title: 'Error', description: 'Could not update course.', variant: 'destructive' });
      return;
    }
    await fetchCourses();
  }, [fetchCourses, toast]);

  const deleteCourse = useCallback(async (courseId: string) => {
    await supabase.from('tribe_courses').delete().eq('id', courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast({ title: 'Deleted' });
  }, [toast]);

  const fetchModules = useCallback(async (courseId: string) => {
    const { data } = await supabase
      .from('tribe_course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    setModules((data as TribeCourseModule[]) || []);
  }, []);

  const createModule = useCallback(async (courseId: string, moduleData: {
    title: string;
    description?: string;
    content_type: string;
    content_text?: string;
    video_url?: string;
    pdf_url?: string;
  }) => {
    const { error } = await supabase
      .from('tribe_course_modules')
      .insert({
        course_id: courseId,
        title: moduleData.title,
        description: moduleData.description || null,
        content_type: moduleData.content_type,
        content_text: moduleData.content_text || null,
        video_url: moduleData.video_url || null,
        pdf_url: moduleData.pdf_url || null,
        position: modules.length,
      });
    if (error) {
      toast({ title: 'Error', description: 'Could not create module.', variant: 'destructive' });
      return;
    }
    await fetchModules(courseId);
    await fetchCourses();
    toast({ title: 'Module Added' });
  }, [modules.length, fetchModules, fetchCourses, toast]);

  const updateModule = useCallback(async (moduleId: string, courseId: string, updates: Partial<TribeCourseModule>) => {
    await supabase.from('tribe_course_modules').update(updates).eq('id', moduleId);
    await fetchModules(courseId);
  }, [fetchModules]);

  const deleteModule = useCallback(async (moduleId: string, courseId: string) => {
    await supabase.from('tribe_course_modules').delete().eq('id', moduleId);
    await fetchModules(courseId);
    await fetchCourses();
    toast({ title: 'Module Deleted' });
  }, [fetchModules, fetchCourses, toast]);

  return {
    courses,
    modules,
    loading,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
  };
}
