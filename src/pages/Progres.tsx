import React from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { Dumbbell, Brain, Heart, Sparkles, Briefcase, LineChart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { BodyProgressChart } from '@/components/progres/BodyProgressChart';
import { MindProgressChart } from '@/components/progres/MindProgressChart';
import { RelationsProgressChart } from '@/components/progres/RelationsProgressChart';
import { SpiritualityProgressChart } from '@/components/progres/SpiritualityProgressChart';
import { BusinessProgressChart } from '@/components/progres/BusinessProgressChart';

const Progres: React.FC = () => {
  const { language } = useLanguage();
  const t = (ro: string, en: string) => (language === 'ro' ? ro : en);
  const [params, setParams] = useSearchParams();
  const tab = params.get('cat') || 'corp';

  const setTab = (v: string) => {
    if (v === 'corp') setParams({}); else setParams({ cat: v });
  };

  return (
    <Layout>
      <Helmet>
        <title>{t('Progres & Istoric — Toate ariile', 'Progress & History — All areas')}</title>
        <meta name="description" content={t(
          'Istoric și progres pe Corp, Minte, Relații, Spiritualitate, Business.',
          'History and progress for Body, Mind, Relationships, Spirituality, Business.'
        )} />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-gradient-primary text-primary-foreground shadow-lg">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('Progres & Istoric', 'Progress & History')}</h1>
            <p className="text-muted-foreground mt-1">
              {t(
                'Vezi ce ai făcut, când, și cum ai evoluat pe fiecare arie din viața ta.',
                'See what you did, when, and how you progressed in each life area.'
              )}
            </p>
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="corp" className="gap-2 py-2"><Dumbbell className="w-4 h-4" /> {t('Corp', 'Body')}</TabsTrigger>
            <TabsTrigger value="minte" className="gap-2 py-2"><Brain className="w-4 h-4" /> {t('Minte', 'Mind')}</TabsTrigger>
            <TabsTrigger value="relatii" className="gap-2 py-2"><Heart className="w-4 h-4" /> {t('Relații', 'Relations')}</TabsTrigger>
            <TabsTrigger value="spiritualitate" className="gap-2 py-2"><Sparkles className="w-4 h-4" /> {t('Spirit', 'Spirit')}</TabsTrigger>
            <TabsTrigger value="business" className="gap-2 py-2"><Briefcase className="w-4 h-4" /> Business</TabsTrigger>
          </TabsList>

          <TabsContent value="corp" className="mt-6"><BodyProgressChart /></TabsContent>
          <TabsContent value="minte" className="mt-6"><MindProgressChart /></TabsContent>
          <TabsContent value="relatii" className="mt-6"><RelationsProgressChart /></TabsContent>
          <TabsContent value="spiritualitate" className="mt-6"><SpiritualityProgressChart /></TabsContent>
          <TabsContent value="business" className="mt-6"><BusinessProgressChart /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Progres;
