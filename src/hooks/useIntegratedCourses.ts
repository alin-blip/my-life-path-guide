import { useState, useEffect } from 'react';
import { useSupabaseCourses } from './useSupabaseCourses';
import { EnhancedCourse } from '@/types/course';

// Static courses removed - all courses now come from Supabase
const staticCoursesByType = {
  masterclass: [],
  ebook: [],
  audiobook: [],
  challenge: []
};

export const useIntegratedCourses = () => {
  const { courses: supabaseCourses, loading, migrateCourses } = useSupabaseCourses();
  const [allCourses, setAllCourses] = useState<EnhancedCourse[]>([]);
  const [hasCheckedMigration, setHasCheckedMigration] = useState(false);

  const loadCourses = () => {
    console.log('Loading integrated courses...', { supabaseCoursesCount: supabaseCourses.length });
    
    // Combine static courses
    const staticCourses: EnhancedCourse[] = [
      ...staticCoursesByType.masterclass.map(course => ({ ...course, subcategory: course.subcategory || 'courses' })),
      ...staticCoursesByType.ebook.map(course => ({ ...course, subcategory: course.subcategory || 'ebook' })),
      ...staticCoursesByType.audiobook.map(course => ({ ...course, subcategory: course.subcategory || 'audiobook' })),
      ...staticCoursesByType.challenge.map(course => ({ ...course, subcategory: course.subcategory || 'events' }))
    ];

    // Combine all courses (Supabase + static)
    const combined = [...staticCourses, ...supabaseCourses];
    console.log('All combined courses:', combined);
    setAllCourses(combined);
  };

  // Check for localStorage courses and migrate if needed
  useEffect(() => {
    if (!hasCheckedMigration && !loading) {
      const localCourses = localStorage.getItem('adminCourses');
      if (localCourses) {
        try {
          const courses = JSON.parse(localCourses);
          if (courses.length > 0) {
            console.log('Found localStorage courses, migrating...');
            migrateCourses();
          }
        } catch (error) {
          console.error('Error parsing localStorage courses:', error);
        }
      }
      setHasCheckedMigration(true);
    }
  }, [loading, hasCheckedMigration, migrateCourses]);

  useEffect(() => {
    loadCourses();
  }, [supabaseCourses]);

  return { 
    allCourses, 
    refreshCourses: loadCourses,
    loading 
  };
};
