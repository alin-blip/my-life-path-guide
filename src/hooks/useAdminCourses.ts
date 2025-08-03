
import { useState, useEffect } from 'react';

export interface AdminCourse {
  id: string;
  title: string;
  subTitle?: string;
  image?: string;
  imageUrl?: string;
  status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  progress: number;
  category: 'body' | 'balance' | 'being' | 'business';
  type: 'video' | 'book' | 'audio' | 'challenge';
  subcategory: string;
  url?: string;
  embedUrl?: string;
  hasPlayButton?: boolean;
  isLocked?: boolean;
  author?: string;
  isPremium?: boolean;
  price?: number;
  description?: string;
  duration?: string;
  accessLevel?: 'free' | 'basic' | 'premium' | 'enterprise';
  purchaseUrl?: string;
  createdAt?: string;
}

export const useAdminCourses = () => {
  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = () => {
      try {
        setLoading(true);
        const savedCourses = localStorage.getItem('adminCourses');
        
        if (savedCourses) {
          const rawCourses = JSON.parse(savedCourses);
          
          // Transform admin courses to match the LearnCourses component format
          const formattedCourses = rawCourses.map((course: any) => {
            // Ensure status is one of the allowed values
            let courseStatus: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
            if (course.status === 'APPROVED') {
              courseStatus = 'APPROVED';
            } else if (course.status === 'REJECTED') {
              courseStatus = 'REJECTED';
            }
            
            return {
              id: course.id,
              title: course.title,
              subTitle: course.subcategory === 'ebook' ? 'E-BOOK' : 
                        course.subcategory === 'audiobook' ? 'AUDIOBOOK' : 
                        course.subcategory === 'courses' ? 'VIDEOBOOK' : 
                        course.subcategory?.toUpperCase() || 'COURSE',
              image: course.imageUrl || '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
              status: courseStatus,
              progress: 0,
              category: course.category as 'body' | 'balance' | 'being' | 'business',
              type: course.type || 'video' as const,
              subcategory: course.subcategory || 'courses',
              url: course.url,
              embedUrl: course.embedUrl,
              hasPlayButton: course.type === 'video' || course.type === 'audio',
              isLocked: course.isLocked || false,
              author: course.author,
              isPremium: course.price > 0,
              price: course.price,
              description: course.description,
              duration: course.duration,
              accessLevel: course.accessLevel,
              purchaseUrl: course.purchaseUrl,
              createdAt: course.createdAt
            };
          });
          
          setAdminCourses(formattedCourses);
        }
      } catch (err) {
        console.error('Error loading admin courses:', err);
        setError('Failed to load admin courses');
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
    
    // Set up listener for changes to localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminCourses') {
        loadCourses();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { adminCourses, loading, error };
};
