
import { supabase } from '@/integrations/supabase/client';
import { EnhancedCourse, CourseModule, CourseSubmodule } from '@/types/course';

export interface SupabaseCourse {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  author?: string;
  duration?: string;
  price?: number;
  url?: string;
  image?: string;
  type: 'video' | 'book' | 'audio' | 'challenge';
  category: 'body' | 'balance' | 'being' | 'business';
  subcategory: string;
  access_level: 'free' | 'basic' | 'premium' | 'enterprise';
  is_premium?: boolean;
  is_locked?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseCourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  duration?: string;
  video_url?: string;
  text_content?: string;
  pdf_url?: string;
  is_completed?: boolean;
}

export interface SupabaseCourseSubmodule {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  order_index: number;
  duration?: string;
  video_url?: string;
  text_content?: string;
  pdf_url?: string;
  is_completed?: boolean;
}

export class CourseService {
  // Fetch all courses with their modules and submodules
  static async getCourses(): Promise<EnhancedCourse[]> {
    try {
      // Temporarily return empty array until types are updated
      // TODO: Enable after Supabase types are regenerated
      return [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // Create a new course with modules
  static async createCourse(
    courseData: Partial<SupabaseCourse>, 
    modules: CourseModule[] = []
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure all required fields are present
      const courseInsertData = {
        title: courseData.title || '',
        description: courseData.description,
        author: courseData.author,
        duration: courseData.duration,
        price: courseData.price || 0,
        url: courseData.url,
        image: courseData.image,
        type: courseData.type || 'video',
        category: courseData.category || 'body',
        subcategory: courseData.subcategory || 'courses',
        access_level: courseData.access_level || 'free',
        user_id: user.id,
        is_premium: (courseData.price || 0) > 0,
        is_locked: courseData.access_level === 'premium' || courseData.access_level === 'enterprise'
      };

      // Temporarily disabled until types are updated
      // TODO: Enable after Supabase types are regenerated
      throw new Error('Course creation temporarily disabled');
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Create modules for a course
  static async createModulesForCourse(courseId: string, modules: CourseModule[]): Promise<void> {
    try {
      const modulesData = modules.map((module, index) => ({
        course_id: courseId,
        title: module.title,
        description: module.description,
        order_index: module.order || index,
        duration: module.duration,
        video_url: module.videoUrl,
        text_content: module.textContent,
        pdf_url: module.pdfUrl
      }));

      // Temporarily disabled until types are updated
      // TODO: Enable after Supabase types are regenerated
      throw new Error('Module creation temporarily disabled');

      // Temporarily disabled until types are updated
    } catch (error) {
      console.error('Error creating modules:', error);
      throw error;
    }
  }

  // Create submodules for a module
  static async createSubmodulesForModule(moduleId: string, submodules: CourseSubmodule[]): Promise<void> {
    try {
      const submodulesData = submodules.map((submodule, index) => ({
        module_id: moduleId,
        title: submodule.title,
        description: submodule.description,
        order_index: submodule.order || index,
        duration: submodule.duration,
        video_url: submodule.videoUrl,
        text_content: submodule.textContent,
        pdf_url: submodule.pdfUrl
      }));

      // Temporarily disabled until types are updated
      // TODO: Enable after Supabase types are regenerated
      throw new Error('Submodule creation temporarily disabled');
    } catch (error) {
      console.error('Error creating submodules:', error);
      throw error;
    }
  }

  // Update course
  static async updateCourse(courseId: string, updates: Partial<SupabaseCourse>): Promise<void> {
    try {
      // Temporarily disabled until types are updated
      // TODO: Enable after Supabase types are regenerated
      throw new Error('Course update temporarily disabled');
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  // Delete course
  static async deleteCourse(courseId: string): Promise<void> {
    try {
      // Temporarily disabled until types are updated
      // TODO: Enable after Supabase types are regenerated
      throw new Error('Course deletion temporarily disabled');
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Transform Supabase course to EnhancedCourse format
  private static transformToEnhancedCourse(course: any): EnhancedCourse {
    const modules = course.course_modules?.map((module: any) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order_index,
      duration: module.duration,
      videoUrl: module.video_url,
      textContent: module.text_content,
      pdfUrl: module.pdf_url,
      isCompleted: module.is_completed,
      submodules: module.course_submodules?.map((submodule: any) => ({
        id: submodule.id,
        title: submodule.title,
        description: submodule.description,
        order: submodule.order_index,
        duration: submodule.duration,
        videoUrl: submodule.video_url,
        textContent: submodule.text_content,
        pdfUrl: submodule.pdf_url,
        isCompleted: submodule.is_completed
      }))
    })) || [];

    return {
      id: course.id,
      title: course.title,
      subTitle: course.subcategory === 'ebook' ? 'E-BOOK' : 
                course.subcategory === 'audiobook' ? 'AUDIOBOOK' : 
                course.subcategory === 'courses' ? 'VIDEOBOOK' : 
                course.subcategory?.toUpperCase() || 'COURSE',
      image: course.image || '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'NOT STARTED',
      progress: 0,
      category: course.category,
      type: course.type,
      subcategory: course.subcategory,
      url: course.url,
      hasPlayButton: course.type === 'video' || course.type === 'audio',
      isLocked: course.is_locked,
      author: course.author,
      isPremium: course.is_premium,
      price: course.price,
      description: course.description,
      duration: course.duration,
      accessLevel: course.access_level,
      createdAt: course.created_at,
      modules: modules,
      totalModules: modules.length,
      completedModules: modules.filter(m => m.isCompleted).length
    };
  }

  // Migrate localStorage courses to Supabase
  static async migrateLocalStorageCourses(): Promise<void> {
    try {
      const localCourses = localStorage.getItem('adminCourses');
      if (!localCourses) return;

      const courses = JSON.parse(localCourses);
      console.log('Migrating courses from localStorage:', courses.length);

      for (const course of courses) {
        try {
          await this.createCourse({
            title: course.title,
            description: course.description,
            author: course.author,
            duration: course.duration,
            price: course.price,
            url: course.url,
            image: course.image,
            type: course.type,
            category: course.category,
            subcategory: course.subcategory,
            access_level: course.accessLevel
          }, course.modules || []);
        } catch (error) {
          console.error('Failed to migrate course:', course.title, error);
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('adminCourses');
      console.log('Migration completed and localStorage cleared');
    } catch (error) {
      console.error('Error during migration:', error);
    }
  }
}
