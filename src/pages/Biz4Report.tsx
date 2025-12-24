import React from 'react';
import { Layout } from '@/components/Layout';
import { Biz4WeeklyReport } from '@/components/biz4/Biz4WeeklyReport';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const Biz4ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/daily-four')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'en' ? 'Back to Biz 4' : 'Înapoi la Biz 4'}
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'en' ? 'Biz 4 Weekly Report' : 'Raport Săptămânal Biz 4'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Track your business growth activities' 
                : 'Urmărește activitățile de creștere a afacerii'}
            </p>
          </div>
        </div>

        {/* Report */}
        <Biz4WeeklyReport />
      </div>
    </Layout>
  );
};

export default Biz4ReportPage;
