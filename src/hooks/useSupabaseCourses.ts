
import { useState, useEffect } from 'react';
import { CourseService } from '@/services/courseService';
import { EnhancedCourse, CourseModule } from '@/types/course';
import { toast } from '@/hooks/use-toast';

export const useSupabaseCourses = () => {
  const [courses, setCourses] = useState<EnhancedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCourses = await CourseService.getCourses();
      setCourses(fetchedCourses);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses');
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: any, modules: CourseModule[] = []) => {
    try {
      await CourseService.createCourse(courseData, modules);
      await loadCourses(); // Refresh the list
      toast({
        title: "Success",
        description: "Course created successfully!"
      });
    } catch (err) {
      console.error('Error creating course:', err);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateCourse = async (courseId: string, updates: any) => {
    try {
      await CourseService.updateCourse(courseId, updates);
      await loadCourses(); // Refresh the list
      toast({
        title: "Success",
        description: "Course updated successfully!"
      });
    } catch (err) {
      console.error('Error updating course:', err);
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await CourseService.deleteCourse(courseId);
      await loadCourses(); // Refresh the list
      toast({
        title: "Success",
        description: "Course deleted successfully!"
      });
    } catch (err) {
      console.error('Error deleting course:', err);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const migrateCourses = async () => {
    try {
      await CourseService.migrateLocalStorageCourses();
      await loadCourses(); // Refresh after migration
      toast({
        title: "Migration Complete",
        description: "Courses have been migrated to Supabase successfully!"
      });
    } catch (err) {
      console.error('Error during migration:', err);
      toast({
        title: "Migration Failed",
        description: "Failed to migrate courses. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    loadCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    migrateCourses
  };
};
