import React from 'react';
import { Layout } from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import {
  Dumbbell,
  Brain,
  Heart,
  Sparkles,
  Briefcase,
  ChevronRight,
  SlidersHorizontal,
  LineChart,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

type ConfigCard = {
  title: string;
  description: string;
  to: string;
  cta: string;
};

const CoreCEO: React.FC = () => {
  const { language } = useLanguage();
  const t = (ro: string, en: string) => (language === 'ro' ? ro : en);

  const sections: Array<{
    id: string;
    label: string;
    icon: React.ElementType;
    intro: string;
    cards: ConfigCard[];
  }> = [
    {
      id: 'corp',
      label: t('Corp', 'Body'),
      icon: Dumbbell,
      intro: t(
        'Setează programul tău de antrenament, mese și tracking-ul zilnic.',
        'Configure your workout program, meals, and daily tracking.'
      ),
      cards: [
        {
          title: t('Programul de Antrenament', 'Workout Program'),
          description: t(
            'Alege programul activ și setează exercițiile pe zile.',
            'Choose the active program and set exercises per day.'
          ),
          to: '/workout',
          cta: t('Configurează', 'Configure'),
        },
        {
          title: t('Istoric Antrenamente', 'Workout History'),
          description: t('Revizuiește sesiunile și progresul.', 'Review sessions and progress.'),
          to: '/workout-history',
          cta: t('Deschide', 'Open'),
        },
        {
          title: t('Nutriție', 'Nutrition'),
          description: t('Meal plans și obiceiuri alimentare.', 'Meal plans and nutrition habits.'),
          to: '/nutrition',
          cta: t('Configurează', 'Configure'),
        },
      ],
    },
    {
      id: 'minte',
      label: t('Minte', 'Mind'),
      icon: Brain,
      intro: t(
        'Reprogramarea credințelor, Mind Coach și instrumentele mentale.',
        'Belief reprogramming, Mind Coach, and mental tools.'
      ),
      cards: [
        {
          title: t('Brain Map', 'Brain Map'),
          description: t('Vizualizează axele minții tale.', 'Visualize your mind axes.'),
          to: '/minte',
          cta: t('Deschide', 'Open'),
        },
        {
          title: t('Reprogramator Credințe', 'Belief Reprogrammer'),
          description: t('Rescrie credințele-rădăcină.', 'Rewrite root beliefs.'),
          to: '/minte/credinte-fundamentale/reprogrammer',
          cta: t('Configurează', 'Configure'),
        },
        {
          title: t('Mind Coach', 'Mind Coach'),
          description: t('Sesiuni AI pentru claritate mentală.', 'AI sessions for mental clarity.'),
          to: '/mind-coach',
          cta: t('Deschide', 'Open'),
        },
      ],
    },
    {
      id: 'relatii',
      label: t('Relații', 'Relationships'),
      icon: Heart,
      intro: t(
        'Căsătorie, parenting și profiluri de partener.',
        'Marriage, parenting, and partner profiles.'
      ),
      cards: [
        {
          title: t('Căsătorie', 'Marriage'),
          description: t('Audit conflict, profil partener, timeline.', 'Conflict audit, partner profile, timeline.'),
          to: '/marriage',
          cta: t('Configurează', 'Configure'),
        },
        {
          title: 'Parenting',
          description: t('Copii, tool-uri zilnice, scanare toxicitate.', 'Children, daily tools, toxicity scan.'),
          to: '/parenting',
          cta: t('Configurează', 'Configure'),
        },
      ],
    },
    {
      id: 'spiritualitate',
      label: t('Spiritualitate', 'Spirituality'),
      icon: Sparkles,
      intro: t(
        'Meditații, mantre și practici spirituale zilnice.',
        'Meditations, mantras, and daily spiritual practices.'
      ),
      cards: [
        {
          title: t('Empowerment Meditation', 'Empowerment Meditation'),
          description: t('Meditații generate pentru starea ta.', 'Meditations generated for your state.'),
          to: '/empowerment-meditation',
          cta: t('Deschide', 'Open'),
        },
        {
          title: t('Biblioteca Credințelor', 'Belief Library'),
          description: t('Explorează credințe și mantre.', 'Explore beliefs and mantras.'),
          to: '/biblioteca-credintelor',
          cta: t('Deschide', 'Open'),
        },
      ],
    },
    {
      id: 'business',
      label: 'Business',
      icon: Briefcase,
      intro: t(
        'Obiective, hot list și instrumente business.',
        'Objectives, hot list, and business tools.'
      ),
      cards: [
        {
          title: t('Business Dashboard', 'Business Dashboard'),
          description: t('Analiză completă a afacerii.', 'Full business analysis.'),
          to: '/business',
          cta: t('Deschide', 'Open'),
        },
        {
          title: t('Business Coach (Hormozi)', 'Business Coach (Hormozi)'),
          description: t('Sesiuni de coaching business.', 'Business coaching sessions.'),
          to: '/stack?type=hormozi-coaching',
          cta: t('Deschide', 'Open'),
        },
        {
          title: t('Hormozi Analysis', 'Hormozi Analysis'),
          description: t('Analiză de platformă.', 'Platform analysis.'),
          to: '/business/hormozi-analysis',
          cta: t('Deschide', 'Open'),
        },
      ],
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t('Core CEO — Configurare', 'Core CEO — Configuration')}</title>
        <meta
          name="description"
          content={t(
            'Hub central de configurare pentru Corp, Minte, Relații, Spiritualitate și Business.',
            'Central configuration hub for Body, Mind, Relationships, Spirituality, and Business.'
          )}
        />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-gradient-primary text-primary-foreground shadow-lg">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Core CEO</h1>
            <p className="text-muted-foreground mt-1">
              {t(
                'Locul unic unde setezi antrenamentele și tot ce ține de fiecare arie din viața ta.',
                'The single place where you set workouts and everything for each life area.'
              )}
            </p>
          </div>
        </header>

        <Tabs defaultValue="corp" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <TabsTrigger key={s.id} value={s.id} className="flex items-center gap-2 py-2">
                  <Icon className="w-4 h-4" />
                  <span>{s.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {sections.map((s) => (
            <TabsContent key={s.id} value={s.id} className="mt-6 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground flex-1 min-w-[240px]">{s.intro}</p>
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <Link to={`/progres?cat=${s.id}`}>
                    <LineChart className="w-4 h-4" />
                    {t('Vezi progres & istoric', 'View progress & history')}
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {s.cards.map((card) => (
                  <Card key={card.to} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Button asChild variant="secondary" className="w-full justify-between">
                        <Link to={card.to}>
                          {card.cta}
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default CoreCEO;
