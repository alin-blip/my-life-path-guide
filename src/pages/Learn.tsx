import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AdminCourseProvider } from '@/components/AdminCourseProvider';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { CourseUploadModal } from '@/components/CourseUploadModal';
import { Upload } from 'lucide-react';

const LearnPage = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { language } = useLanguage();

  return (
    <AdminCourseProvider>
      <Layout>
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold">
              {language === 'en' ? 'Learn' : 'Învață'}
            </h1>
            
            <div className="bg-card border rounded-lg p-8 space-y-4">
              <div className="flex justify-center">
                <Upload className="w-16 h-16 text-muted-foreground" />
              </div>
              
              <h2 className="text-xl font-semibold">
                {language === 'en' ? 'Upload Your Course' : 'Încarcă Cursul Tău'}
              </h2>
              
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'Start by uploading your first course to share knowledge with others.'
                  : 'Începe prin a încărca primul tău curs pentru a împărtăși cunoștințe cu alții.'}
              </p>
              
              <Button 
                onClick={() => setShowUploadModal(true)}
                size="lg"
                className="mt-4"
              >
                {language === 'en' ? 'Upload Course' : 'Încarcă Curs'}
              </Button>
            </div>
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
