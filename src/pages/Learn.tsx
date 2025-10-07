import React from 'react';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { EmptyStateCard } from '@/components/door/EmptyStateCard';
import { BookOpen } from 'lucide-react';

const LearnPage = () => {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            {language === 'en' ? 'Learn' : 'Învață'}
          </h1>
          
          <EmptyStateCard
            icon={BookOpen}
            title={language === 'en' ? 'Coming Soon' : 'În Lucru'}
            description={language === 'en' 
              ? 'We are working on bringing you amazing courses. Stay tuned!' 
              : 'Lucrăm pentru a vă aduce cursuri incredibile. Rămâneți pe fază!'}
            actionLabel={language === 'en' ? 'Back to Dashboard' : 'Înapoi la Dashboard'}
            onAction={() => window.location.href = '/'}
            emoji="🚧"
          />
        </div>
      </div>
    </Layout>
  );
};

export default LearnPage;
