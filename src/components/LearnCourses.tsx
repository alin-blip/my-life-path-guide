import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Play, BookOpen, FileAudio, Video, Lock, FileText, BadgeDollarSign } from 'lucide-react';
import { CoursePlayer } from './course/CoursePlayer';
import { Button } from './ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useIntegratedCourses } from '@/hooks/useIntegratedCourses';
import { CourseUploadModal } from './CourseUploadModal';
import { EnhancedCourse } from '@/types/course';

interface LearnCoursesProps {
  activeCategory: string | null;
  activeSubcategory: string;
}

export const LearnCourses: React.FC<LearnCoursesProps> = ({ activeCategory, activeSubcategory }) => {
  const [selectedCourse, setSelectedCourse] = useState<EnhancedCourse | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { language } = useLanguage();
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const { allCourses, refreshCourses } = useIntegratedCourses();
  
  useEffect(() => {
    const checkStripeConnection = async () => {
      setTimeout(() => {
        setIsStripeConnected(localStorage.getItem('stripeConnected') === 'true');
      }, 500);
    };
    
    checkStripeConnection();
  }, []);

  useEffect(() => {
    const handleCourseAdded = (event: CustomEvent) => {
      console.log('Course added event received:', event.detail);
      refreshCourses();
    };

    window.addEventListener('courseAdded', handleCourseAdded as EventListener);
    
    return () => {
      window.removeEventListener('courseAdded', handleCourseAdded as EventListener);
    };
  }, [refreshCourses]);
  
  const filteredCourses = allCourses.filter(course => {
    if (!activeCategory) {
      return course.subcategory === activeSubcategory;
    }
    return course.category === activeCategory && course.subcategory === activeSubcategory;
  });

  console.log('LearnCourses - Current filters:', { activeCategory, activeSubcategory });
  console.log('LearnCourses - All courses:', allCourses);
  console.log('LearnCourses - Filtered courses:', filteredCourses);

  const getCourseTypeIcon = (type: string) => {
    switch(type) {
      case 'video':
        return <Video className="w-4 h-4 text-white/80" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-white/80" />;
      case 'audio':
        return <FileAudio className="w-4 h-4 text-white/80" />;
      case 'challenge':
        return <FileText className="w-4 h-4 text-white/80" />;
      default:
        return <FileText className="w-4 h-4 text-white/80" />;
    }
  };

  const getTranslatedText = (key: string, en: string, ro: string) => {
    return language === 'en' ? en : ro;
  };
  
  const handleConnectStripe = () => {
    alert("In a production app, this would redirect to Stripe Connect for creator onboarding.");
    localStorage.setItem('stripeConnected', 'true');
    setIsStripeConnected(true);
  };

  const handleCourseUploaded = () => {
    console.log('Course uploaded callback triggered');
    refreshCourses();
  };

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-medium pl-1 mt-4 mb-3 sm:mt-8 sm:mb-6">
        {getTranslatedText('resourcesTitle', 'Available Resources', 'Resurse disponibile')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredCourses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onClick={() => setSelectedCourse(course)} 
            getCourseTypeIcon={getCourseTypeIcon}
            language={language}
          />
        ))}
        
        {filteredCourses.length === 0 && (
          <div className="col-span-full text-center py-6 sm:py-8 text-gray-500 text-sm">
            {getTranslatedText(
              'noResourcesFiltered', 
              `No resources available for this ${activeCategory ? 'category and ' : ''}subcategory.`, 
              `Nu există resurse disponibile pentru această ${activeCategory ? 'categorie și ' : ''}subcategorie.`
            )}
          </div>
        )}
      </div>

      {selectedCourse && (
        <CoursePlayer
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          course={selectedCourse}
          isLocked={selectedCourse.isLocked}
          purchaseUrl="/pricing"
        />
      )}

      {showUploadModal && (
        <CourseUploadModal 
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          category={activeCategory as 'body' | 'balance' | 'being' | 'business' || 'body'}
          subcategory={activeSubcategory}
          language={language}
          isStripeConnected={isStripeConnected}
          onCourseUploaded={handleCourseUploaded}
        />
      )}
    </div>
  );
};

interface CourseCardProps {
  course: EnhancedCourse;
  onClick: () => void;
  getCourseTypeIcon: (type: string) => React.ReactNode;
  language: 'en' | 'ro';
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, getCourseTypeIcon, language }) => {
  const getStatusText = (status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED'): string => {
    if (language === 'en') {
      return status;
    } else {
      switch (status) {
        case 'NOT STARTED': return 'NEÎNCEPUT';
        case 'IN PROGRESS': return 'ÎN CURS';
        case 'COMPLETED': return 'FINALIZAT';
        default: return status;
      }
    }
  };

  return (
    <Card 
      key={course.id} 
      className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800"
      onClick={onClick}
    >
      <div className="relative h-40 bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }}>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          {course.hasPlayButton && (
            <button className="rounded-full bg-white/20 p-3 backdrop-blur-sm hover:bg-white/30 transition-all">
              <Play className="w-6 h-6 text-white fill-white" />
            </button>
          )}
        </div>
        <div className={`absolute top-2 right-2 text-xs font-medium py-1 px-2 rounded-full ${
          course.status === 'COMPLETED' ? 'bg-green-500/80' : 
          course.status === 'IN PROGRESS' ? 'bg-amber-500/80' : 
          'bg-blue-500/80'
        }`}>
          {getStatusText(course.status)}
        </div>
        {course.isLocked && (
          <div className="absolute bottom-2 right-2 bg-amber-500/80 text-xs py-1 px-2 rounded-full flex items-center">
            <Lock className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Premium' : 'Premium'}
          </div>
        )}
        {course.isPremium && course.price && (
          <div className="absolute bottom-2 left-2 bg-purple-500/80 text-xs py-1 px-2 rounded-full">
            {course.price} {language === 'en' ? 'LEI' : 'LEI'}
          </div>
        )}
        {course.author && (
          <div className="absolute bottom-2 left-2 text-xs py-1 px-2 text-white/90">
            {language === 'en' ? 'by' : 'de'} {course.author}
          </div>
        )}
      </div>
      <CardContent className="p-2 sm:p-3 md:p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">{course.title}</h3>
            {course.subTitle && (
              <div className="flex items-center mt-1 text-[10px] sm:text-xs text-white/60">
                {getCourseTypeIcon(course.type)}
                <span className="ml-1">{course.subTitle}</span>
              </div>
            )}
            {course.modules && course.modules.length > 0 && (
              <div className="text-[10px] sm:text-xs text-white/60 mt-1">
                {course.modules.length} module{course.modules.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <div className="w-full bg-gray-700 rounded-full h-1 sm:h-1.5">
            <div 
              className={`h-1 sm:h-1.5 rounded-full ${
                course.status === 'COMPLETED' ? 'bg-green-500' : 
                course.status === 'IN PROGRESS' ? 'bg-amber-500' : 
                'bg-blue-500'
              }`} 
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <div className="text-[10px] sm:text-xs mt-1 text-white/60 text-right">
            {course.progress}% {language === 'en' ? 'Complete' : 'Complet'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
