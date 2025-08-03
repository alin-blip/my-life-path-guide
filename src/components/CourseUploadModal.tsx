import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ModuleEditor } from './course/ModuleEditor';
import { CourseModule } from '@/types/course';
import { useSupabaseCourses } from '@/hooks/useSupabaseCourses';

interface CourseUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'body' | 'balance' | 'being' | 'business';
  subcategory: string;
  language: 'en' | 'ro';
  isStripeConnected: boolean;
  onCourseUploaded: () => void;
}

export const CourseUploadModal: React.FC<CourseUploadModalProps> = ({
  isOpen,
  onClose,
  category,
  subcategory,
  language,
  isStripeConnected,
  onCourseUploaded
}) => {
  const { createCourse } = useSupabaseCourses();
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    author: '',
    duration: '',
    price: '',
    url: '',
    image: '',
    type: 'video' as 'video' | 'audio' | 'book' | 'challenge',
    accessLevel: 'free' as 'free' | 'basic' | 'premium' | 'enterprise'
  });

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStripeConnected && courseData.price && parseFloat(courseData.price) > 0) {
      toast({
        title: "Stripe Required",
        description: "Please connect Stripe to upload paid courses.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        author: courseData.author,
        duration: courseData.duration,
        price: courseData.price ? parseFloat(courseData.price) : 0,
        url: courseData.url,
        image: courseData.image || '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
        type: courseData.type,
        category,
        subcategory,
        access_level: courseData.accessLevel
      };

      await createCourse(coursePayload, modules);

      // Reset form
      setCourseData({
        title: '',
        description: '',
        author: '',
        duration: '',
        price: '',
        url: '',
        image: '',
        type: 'video',
        accessLevel: 'free'
      });
      setModules([]);
      
      onCourseUploaded();
      onClose();

      toast({
        title: language === 'en' ? "Success!" : "Succes!",
        description: language === 'en' ? "Course uploaded successfully!" : "Cursul a fost încărcat cu succes!"
      });
    } catch (error) {
      console.error('Error uploading course:', error);
      // Error is already handled in useSupabaseCourses hook
    } finally {
      setIsUploading(false);
    }
  };

  const getTranslatedText = (key: string, en: string, ro: string) => {
    return language === 'en' ? en : ro;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {getTranslatedText('uploadCourse', 'Upload New Course', 'Încarcă un curs nou')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">
                {getTranslatedText('title', 'Course Title', 'Titlu curs')} *
              </Label>
              <Input
                id="title"
                value={courseData.title}
                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={getTranslatedText('titlePlaceholder', 'Enter course title', 'Introdu titlul cursului')}
                required
              />
            </div>

            <div>
              <Label htmlFor="author">
                {getTranslatedText('author', 'Author', 'Autor')} *
              </Label>
              <Input
                id="author"
                value={courseData.author}
                onChange={(e) => setCourseData(prev => ({ ...prev, author: e.target.value }))}
                placeholder={getTranslatedText('authorPlaceholder', 'Enter author name', 'Introdu numele autorului')}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">
              {getTranslatedText('description', 'Description', 'Descriere')} *
            </Label>
            <Textarea
              id="description"
              value={courseData.description}
              onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={getTranslatedText('descriptionPlaceholder', 'Enter course description', 'Introdu descrierea cursului')}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">
                {getTranslatedText('type', 'Course Type', 'Tip curs')} *
              </Label>
              <Select 
                value={courseData.type} 
                onValueChange={(value: 'video' | 'audio' | 'book' | 'challenge') => 
                  setCourseData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="challenge">Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">
                {getTranslatedText('duration', 'Duration', 'Durata')}
              </Label>
              <Input
                id="duration"
                value={courseData.duration}
                onChange={(e) => setCourseData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder={getTranslatedText('durationPlaceholder', 'e.g., 2 hours', 'ex: 2 ore')}
              />
            </div>

            <div>
              <Label htmlFor="price">
                {getTranslatedText('price', 'Price (LEI)', 'Preț (LEI)')}
              </Label>
              <Input
                id="price"
                type="number"
                value={courseData.price}
                onChange={(e) => setCourseData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="url">
                {getTranslatedText('mainUrl', 'Main Course URL', 'URL principal curs')}
              </Label>
              <Input
                id="url"
                value={courseData.url}
                onChange={(e) => setCourseData(prev => ({ ...prev, url: e.target.value }))}
                placeholder={getTranslatedText('urlPlaceholder', 'https://example.com/course', 'https://example.com/curs')}
              />
            </div>

            <div>
              <Label htmlFor="image">
                {getTranslatedText('image', 'Course Image URL', 'URL imagine curs')}
              </Label>
              <Input
                id="image"
                value={courseData.image}
                onChange={(e) => setCourseData(prev => ({ ...prev, image: e.target.value }))}
                placeholder={getTranslatedText('imagePlaceholder', 'https://example.com/image.jpg', 'https://example.com/imagine.jpg')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accessLevel">
              {getTranslatedText('accessLevel', 'Access Level', 'Nivel acces')} *
            </Label>
            <Select 
              value={courseData.accessLevel} 
              onValueChange={(value: 'free' | 'basic' | 'premium' | 'enterprise') => 
                setCourseData(prev => ({ ...prev, accessLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ModuleEditor 
            modules={modules} 
            onModulesChange={setModules}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {getTranslatedText('cancel', 'Cancel', 'Anulează')}
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 
                getTranslatedText('uploading', 'Uploading...', 'Se încarcă...') : 
                getTranslatedText('upload', 'Upload Course', 'Încarcă cursul')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
