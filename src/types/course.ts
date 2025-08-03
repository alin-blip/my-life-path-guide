
export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: string;
  videoUrl?: string;
  textContent?: string;
  pdfUrl?: string;
  isCompleted?: boolean;
  submodules?: CourseSubmodule[];
}

export interface CourseSubmodule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: string;
  videoUrl?: string;
  textContent?: string;
  pdfUrl?: string;
  isCompleted?: boolean;
}

export interface EnhancedCourse {
  id: string;
  title: string;
  subTitle?: string;
  image: string;
  status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED';
  progress: number;
  category: 'body' | 'balance' | 'being' | 'business';
  type: 'video' | 'book' | 'audio' | 'challenge';
  subcategory: string;
  url?: string;
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
  modules?: CourseModule[];
  totalModules?: number;
  completedModules?: number;
}
