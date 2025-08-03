import { useState, useEffect } from 'react';
import { useSupabaseCourses } from './useSupabaseCourses';
import { EnhancedCourse } from '@/types/course';

// Static courses data (keeping for backward compatibility)
const staticCoursesByType = {
  masterclass: [
    {
      id: 'body-1',
      title: 'OPTIMIZAREA ENERGIEI FIZICE',
      subTitle: 'VIDEOBOOK',
      image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'IN PROGRESS' as const,
      progress: 45,
      category: 'body' as const,
      type: 'video' as const,
      subcategory: 'courses',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      hasPlayButton: true,
      author: 'Alin Radu',
      isPremium: true,
      price: 99,
      modules: [
        {
          id: 'module-1',
          title: 'Introducere în optimizarea energiei',
          description: 'Bazele înțelegerii energiei fizice',
          order: 1,
          duration: '15 min',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          textContent: 'Conținut text pentru primul modul...',
          isCompleted: false
        }
      ]
    },
    {
      id: 'balance-1',
      title: 'RELAȚII AUTENTICE',
      subTitle: 'VIDEOBOOK',
      image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'IN PROGRESS' as const,
      progress: 67,
      category: 'balance' as const,
      type: 'video' as const,
      subcategory: 'courses',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      hasPlayButton: true
    },
  ],
  ebook: [
    {
      id: 'being-2',
      title: 'CONECTAREA CU SINELE',
      subTitle: 'E-BOOK',
      image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'NOT STARTED' as const,
      progress: 0,
      category: 'being' as const,
      type: 'book' as const,
      subcategory: 'ebook',
      hasPlayButton: false
    },
  ],
  audiobook: [
    {
      id: 'body-2',
      title: 'ALIMENTAȚIA RĂZBOINICULUI',
      subTitle: 'AUDIOBOOK',
      image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'NOT STARTED' as const,
      progress: 0,
      category: 'body' as const,
      type: 'audio' as const,
      subcategory: 'audiobook',
    },
    {
      id: 'balance-2',
      title: 'COMUNICARE EFICIENTĂ',
      subTitle: 'AUDIOBOOK',
      image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'COMPLETED' as const,
      progress: 100,
      category: 'balance' as const,
      type: 'audio' as const,
      subcategory: 'audiobook',
    },
    {
      id: 'being-1',
      title: 'MEDITAȚIE ZILNICĂ',
      subTitle: 'AUDIOBOOK',
      image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'IN PROGRESS' as const,
      progress: 30,
      category: 'being' as const,
      type: 'audio' as const,
      subcategory: 'audiobook',
    },
    {
      id: 'business-2',
      title: 'LEADERSHIP EFICIENT',
      subTitle: 'AUDIOBOOK',
      image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'COMPLETED' as const,
      progress: 100,
      category: 'business' as const,
      type: 'audio' as const,
      subcategory: 'audiobook',
    }
  ],
  challenge: [
    {
      id: 'body-3',
      title: 'ANTRENAMENT FIZIC ZILNIC',
      subTitle: 'CHALLENGE',
      image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'NOT STARTED' as const,
      progress: 0,
      category: 'body' as const,
      type: 'challenge' as const,
      subcategory: 'events',
    },
    {
      id: 'business-1',
      title: 'STRATEGIE DE BUSINESS',
      subTitle: 'CHALLENGE',
      image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'IN PROGRESS' as const,
      progress: 75,
      category: 'business' as const,
      type: 'video' as const,
      subcategory: 'mastermind',
      hasPlayButton: true,
      isLocked: true
    },
  ]
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
