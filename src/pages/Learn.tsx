import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AdminCourseProvider } from '@/components/AdminCourseProvider';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { CourseUploadModal } from '@/components/CourseUploadModal';
import { LearnCourses } from '@/components/LearnCourses';
import { Upload } from 'lucide-react';

const LearnPage = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { language } = useLanguage();

  return (
    <AdminCourseProvider>
      <Layout>
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">
                {language === 'en' ? 'Learn' : 'Învață'}
              </h1>
              
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {language === 'en' ? 'Upload Course' : 'Încarcă Curs'}
              </Button>
            </div>

            <LearnCourses 
              activeCategory={null}
              activeSubcategory="courses"
            />
          </div>
        </div>

        {showUploadModal && (
          <CourseUploadModal 
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            category="body"
            subcategory="courses"
            language={language}
            isStripeConnected={true}
            onCourseUploaded={() => {
              setShowUploadModal(false);
            }}
          />
        )}
      </Layout>
    </AdminCourseProvider>
  );
};

export default LearnPage;
