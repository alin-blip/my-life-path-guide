
import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseCourses } from '@/hooks/useSupabaseCourses';
import { EnhancedCourse } from '@/types/course';

interface AdminCourseContextType {
  adminCourses: EnhancedCourse[];
  loading: boolean;
  error: string | null;
  refreshCourses: () => void;
  createCourse: (courseData: any, modules: any[]) => Promise<void>;
  updateCourse: (courseId: string, updates: any) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
}

const AdminCourseContext = createContext<AdminCourseContextType>({
  adminCourses: [],
  loading: false,
  error: null,
  refreshCourses: () => {},
  createCourse: async () => {},
  updateCourse: async () => {},
  deleteCourse: async () => {}
});

export const useAdminCourseContext = () => useContext(AdminCourseContext);

interface AdminCourseProviderProps {
  children: ReactNode;
}

export const AdminCourseProvider: React.FC<AdminCourseProviderProps> = ({ children }) => {
  const { 
    courses: adminCourses, 
    loading, 
    error,
    loadCourses: refreshCourses,
    createCourse,
    updateCourse,
    deleteCourse
  } = useSupabaseCourses();
  
  return (
    <AdminCourseContext.Provider value={{ 
      adminCourses, 
      loading, 
      error,
      refreshCourses,
      createCourse,
      updateCourse,
      deleteCourse
    }}>
      {children}
    </AdminCourseContext.Provider>
  );
};
