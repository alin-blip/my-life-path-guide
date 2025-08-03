
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EnhancedCourse, CourseModule, CourseSubmodule } from '@/types/course';
import { 
  FileText, 
  Video, 
  File,
  CheckCircle,
  Circle,
  Lock,
  Play
} from 'lucide-react';

interface CoursePlayerProps {
  isOpen: boolean;
  onClose: () => void;
  course: EnhancedCourse;
  isLocked?: boolean;
  purchaseUrl?: string;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ 
  isOpen, 
  onClose, 
  course,
  isLocked = false,
  purchaseUrl
}) => {
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [currentSubmodule, setCurrentSubmodule] = useState<CourseSubmodule | null>(null);
  const [activeContent, setActiveContent] = useState<'video' | 'text' | 'pdf'>('video');

  useEffect(() => {
    if (course.modules && course.modules.length > 0) {
      setCurrentModule(course.modules[0]);
      if (course.modules[0].submodules && course.modules[0].submodules.length > 0) {
        setCurrentSubmodule(course.modules[0].submodules[0]);
      }
    }
  }, [course]);

  const handleModuleSelect = (module: CourseModule) => {
    setCurrentModule(module);
    setCurrentSubmodule(null);
    // Auto-select first submodule if available
    if (module.submodules && module.submodules.length > 0) {
      setCurrentSubmodule(module.submodules[0]);
    }
  };

  const handleSubmoduleSelect = (submodule: CourseSubmodule) => {
    setCurrentSubmodule(submodule);
  };

  const getCurrentContent = () => {
    const content = currentSubmodule || currentModule;
    if (!content) return null;

    switch (activeContent) {
      case 'video':
        return content.videoUrl;
      case 'text':
        return content.textContent;
      case 'pdf':
        return content.pdfUrl;
      default:
        return null;
    }
  };

  const getAvailableContentTypes = () => {
    const content = currentSubmodule || currentModule;
    if (!content) return [];

    const types = [];
    if (content.videoUrl) types.push('video');
    if (content.textContent) types.push('text');
    if (content.pdfUrl) types.push('pdf');
    return types;
  };

  const convertToEmbedUrl = (url: string) => {
    if (!url) return url;
    
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Convert YouTube short URLs to embed URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  };

  const calculateProgress = () => {
    if (!course.modules || course.modules.length === 0) return 0;
    const totalItems = course.modules.reduce((acc, module) => {
      return acc + 1 + (module.submodules?.length || 0);
    }, 0);
    const completedItems = course.modules.reduce((acc, module) => {
      let completed = module.isCompleted ? 1 : 0;
      completed += (module.submodules?.filter(sub => sub.isCompleted).length || 0);
      return acc + completed;
    }, 0);
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  if (isLocked) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[900px] h-[80vh]">
          <div className="h-full flex flex-col items-center justify-center space-y-4 p-6 text-center">
            <Lock className="h-16 w-16 text-amber-500 mb-2" />
            <h3 className="text-xl font-semibold">Acest curs este blocat</h3>
            <p className="text-muted-foreground max-w-md">
              Nu aveți încă acces la acest curs. Achiziționați accesul pentru a debloca conținutul.
            </p>
            {purchaseUrl && (
              <Button className="mt-4" asChild>
                <a href={purchaseUrl} target="_blank" rel="noopener noreferrer">
                  Achiziționează acces
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If no modules, show simple course view
  if (!course.modules || course.modules.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[1000px] h-[80vh]">
          <DialogHeader>
            <DialogTitle>{course.title}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1">
            {course.url && (
              <iframe 
                src={convertToEmbedUrl(course.url)}
                className="w-full h-full rounded-lg"
                title={course.title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            )}
            
            {!course.url && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Play className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Nu există conținut disponibil pentru acest curs</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1200px] h-[90vh] max-h-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{course.title}</span>
            <div className="text-sm text-muted-foreground">
              Progres: {Math.round(calculateProgress())}%
            </div>
          </DialogTitle>
          <Progress value={calculateProgress()} className="w-full" />
        </DialogHeader>
        
        <div className="flex h-full gap-4">
          {/* Module Navigation Sidebar */}
          <div className="w-1/3 border-r pr-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Module curs</h3>
            
            {course.modules?.map((module, moduleIndex) => (
              <div key={module.id} className="mb-3">
                <Card 
                  className={`cursor-pointer transition-colors ${
                    currentModule?.id === module.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleModuleSelect(module)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {module.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="font-medium text-sm">
                            {moduleIndex + 1}. {module.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {module.duration}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submodules */}
                {module.submodules && module.submodules.length > 0 && (
                  <div className="ml-4 mt-2 space-y-1">
                    {module.submodules.map((submodule, subIndex) => (
                      <div
                        key={submodule.id}
                        className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                          currentSubmodule?.id === submodule.id 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setCurrentModule(module);
                          handleSubmoduleSelect(submodule);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {submodule.isCompleted ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Circle className="h-3 w-3 text-gray-400" />
                          )}
                          <span>
                            {moduleIndex + 1}.{subIndex + 1} {submodule.title}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 ml-5">
                          {submodule.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            {currentModule && (
              <>
                {/* Content Type Tabs */}
                <div className="flex gap-2 mb-4">
                  {getAvailableContentTypes().map((type) => (
                    <Button
                      key={type}
                      variant={activeContent === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveContent(type as any)}
                      className="flex items-center gap-2"
                    >
                      {type === 'video' && <Video className="h-4 w-4" />}
                      {type === 'text' && <FileText className="h-4 w-4" />}
                      {type === 'pdf' && <File className="h-4 w-4" />}
                      {type === 'video' && 'Video'}
                      {type === 'text' && 'Text'}
                      {type === 'pdf' && 'PDF'}
                    </Button>
                  ))}
                </div>

                {/* Content Display */}
                <div className="flex-1 border rounded-lg overflow-hidden">
                  {activeContent === 'video' && getCurrentContent() && (
                    <iframe 
                      src={convertToEmbedUrl(getCurrentContent() || '')}
                      className="w-full h-full"
                      title="Video content"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  )}
                  
                  {activeContent === 'text' && getCurrentContent() && (
                    <div className="p-6 overflow-y-auto h-full">
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">
                          {getCurrentContent()}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {activeContent === 'pdf' && getCurrentContent() && (
                    <iframe 
                      src={getCurrentContent() || ''}
                      className="w-full h-full"
                      title="PDF content"
                    />
                  )}

                  {!getCurrentContent() && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Nu există conținut disponibil pentru acest tip</p>
                    </div>
                  )}
                </div>

                {/* Module Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">
                    {currentSubmodule ? currentSubmodule.title : currentModule.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentSubmodule ? currentSubmodule.description : currentModule.description}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      Durata: {currentSubmodule ? currentSubmodule.duration : currentModule.duration}
                    </span>
                    <Button size="sm" variant="outline">
                      Marchează ca finalizat
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
