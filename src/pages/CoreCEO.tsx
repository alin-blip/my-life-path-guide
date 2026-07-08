import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Link, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import {
  Dumbbell, Brain, Heart, Sparkles, Briefcase, ChevronRight,
  SlidersHorizontal, LineChart, Utensils, History, Baby, BookOpen,
  Target, Flame, Grid3x3, Map, Users, Wrench, ClipboardList,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { BodyProgressChart } from '@/components/progres/BodyProgressChart';
import { MindProgressChart } from '@/components/progres/MindProgressChart';
import { RelationsProgressChart } from '@/components/progres/RelationsProgressChart';
import { SpiritualityProgressChart } from '@/components/progres/SpiritualityProgressChart';
import { BusinessProgressChart } from '@/components/progres/BusinessProgressChart';

type ConfigCard = {
  title: string;
  description: string;
  to: string;
  cta: string;
  icon: React.ElementType;
  badge?: string;
  featured?: boolean;
};

const VALID_TABS = ['corp', 'minte', 'relatii', 'spiritualitate', 'business'] as const;
type TabId = typeof VALID_TABS[number];

const CoreCEO: React.FC = () => {
  const { language } = useLanguage();
  const t = (ro: string, en: string) => (language === 'ro' ? ro : en);
  const [params, setParams] = useSearchParams();
  const initial = (params.get('cat') as TabId) || 'corp';
  const [tab, setTab] = React.useState<TabId>(VALID_TABS.includes(initial) ? initial : 'corp');

  useEffect(() => {
    const p = params.get('cat') as TabId;
    if (p && VALID_TABS.includes(p) && p !== tab) setTab(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleTabChange = (val: string) => {
    setTab(val as TabId);
    const next = new URLSearchParams(params);
    next.set('cat', val);
    setParams(next, { replace: true });
  };

  const sections: Array<{
    id: TabId;
    label: string;
    icon: React.ElementType;
    intro: string;
    cards: ConfigCard[];
    chart: React.ReactNode;
  }> = [
    {
      id: 'corp',
      label: t('Corp', 'Body'),
      icon: Dumbbell,
      intro: t('Antrenamente, nutriție, istoric și progres — toate într-un singur loc.', 'Workouts, nutrition, history and progress — all in one place.'),
      cards: [
        { title: t('Antrenament Azi', 'Workout Today'), description: t('Începe sesiunea de azi și loghează exercițiile.', 'Start today\'s session and log exercises.'), to: '/workout', cta: t('Deschide', 'Open'), icon: Dumbbell, featured: true },
        { title: t('Programul de Antrenament', 'Workout Program'), description: t('Setează program activ, exerciții pe zile, template-uri.', 'Set active program, exercises per day, templates.'), to: '/workout?tab=program', cta: t('Configurează', 'Configure'), icon: ClipboardList },
        { title: t('Istoric Antrenamente', 'Workout History'), description: t('Toate sesiunile, greutăți, reps și progres per exercițiu.', 'All sessions, weights, reps and progress per exercise.'), to: '/workout-history', cta: t('Vezi istoric', 'View history'), icon: History },
        { title: t('Nutriție & Meal Planning', 'Nutrition & Meal Planning'), description: t('Smoothie obligatoriu, target macro, bază de alimente.', 'Required smoothie, macro targets, food database.'), to: '/nutrition', cta: t('Deschide', 'Open'), icon: Utensils, featured: true },
      ],
      chart: <BodyProgressChart />,
    },
    {
      id: 'minte',
      label: t('Minte', 'Mind'),
      icon: Brain,
      intro: t('Brain Map, credințe, teste, PSA și Mind Coach.', 'Brain Map, beliefs, tests, PSA and Mind Coach.'),
      cards: [
        { title: t('Brain Map (6 axe)', 'Brain Map (6 axes)'), description: t('Vizualizează axele minții tale și scorurile.', 'Visualize your mind axes and scores.'), to: '/minte', cta: t('Deschide', 'Open'), icon: Brain, featured: true },
        { title: t('Cele 5 Credințe ale Liderului', 'The 5 Leader Beliefs'), description: t('Audio, prezentări, Fish Bowl și Audit 90 zile.', 'Audio, presentations, Fish Bowl and 90-day audit.'), to: '/minte/credinte-fundamentale', cta: t('Deschide', 'Open'), icon: Sparkles, featured: true },
        { title: t('Reprogramator Credințe', 'Belief Reprogrammer'), description: t('Rescrie credințele-rădăcină în 4 faze.', 'Rewrite root beliefs in 4 phases.'), to: '/minte/credinte-fundamentale/reprogrammer', cta: t('Configurează', 'Configure'), icon: Wrench },
        { title: t('Matricea Credințelor CEO', 'CEO Belief Matrix'), description: t('10 credințe fundamentale cu plan de acțiune.', '10 fundamental beliefs with action plan.'), to: '/minte/credinte', cta: t('Deschide', 'Open'), icon: Grid3x3 },
        { title: t('Teste de Minte', 'Mind Tests'), description: t('8 chestionare, 10 întrebări, 3 minute fiecare.', '8 quizzes, 10 questions, 3 minutes each.'), to: '/minte/teste', cta: t('Începe', 'Start'), icon: ClipboardList },
        { title: t('PSA Reconstrucție', 'PSA Reconstruction'), description: t('Problemă → Substituție → Acțiune pentru credințe toxice.', 'Problem → Substitute → Action for toxic beliefs.'), to: '/minte/psa', cta: t('Deschide', 'Open'), icon: Wrench },
        { title: t('Mind Coach', 'Mind Coach'), description: t('Sesiuni AI pentru claritate mentală.', 'AI sessions for mental clarity.'), to: '/mind-coach', cta: t('Deschide', 'Open'), icon: Brain, badge: 'NEW' },
        { title: t('Mind Shifting', 'Mind Shifting'), description: t('Transformă intensitatea emoțională.', 'Transform emotional intensity.'), to: '/mind-shifting', cta: t('Deschide', 'Open'), icon: Sparkles },
      ],
      chart: <MindProgressChart />,
    },
    {
      id: 'relatii',
      label: t('Relații', 'Relationships'),
      icon: Heart,
      intro: t('Căsătorie și parenting — audit, profiluri, timeline, coaching.', 'Marriage and parenting — audit, profiles, timeline, coaching.'),
      cards: [
        { title: t('Căsătorie — Hub', 'Marriage — Hub'), description: t('Audit conflict, matrice, sesiuni AI.', 'Conflict audit, matrix, AI sessions.'), to: '/marriage', cta: t('Deschide', 'Open'), icon: Heart, featured: true },
        { title: t('Audit Realitate Cuplu', 'Couple Reality Audit'), description: t('6 axe relaționale + Reality Triangle.', '6 relational axes + Reality Triangle.'), to: '/marriage/audit', cta: t('Începe', 'Start'), icon: Map },
        { title: t('Profil Partener', 'Partner Profile'), description: t('Nevoi, limbaje de iubire, red flags.', 'Needs, love languages, red flags.'), to: '/marriage/profile', cta: t('Configurează', 'Configure'), icon: Users },
        { title: t('Timeline Cuplu', 'Couple Timeline'), description: t('Evenimente cheie și pattern-uri.', 'Key events and patterns.'), to: '/marriage/timeline', cta: t('Deschide', 'Open'), icon: History },
        { title: 'Parenting — Hub', description: t('Copii, tool-uri zilnice, scanare toxicitate.', 'Children, daily tools, toxicity scan.'), to: '/parenting', cta: t('Deschide', 'Open'), icon: Baby, featured: true },
        { title: t('Profil Copii', 'Children Profile'), description: t('Vârstă, temperament, provocări.', 'Age, temperament, challenges.'), to: '/parenting/profile', cta: t('Configurează', 'Configure'), icon: Users },
        { title: t('Tool-uri Parenting', 'Parenting Tools'), description: t('Instrumente zilnice pe categorie.', 'Daily tools per category.'), to: '/parenting/tools', cta: t('Deschide', 'Open'), icon: Wrench },
        { title: t('Scanare Toxicitate', 'Toxicity Scan'), description: t('Detectează pattern-uri toxice.', 'Detect toxic patterns.'), to: '/parenting/toxicity-scan', cta: t('Rulează', 'Run'), icon: ClipboardList },
      ],
      chart: <RelationsProgressChart />,
    },
    {
      id: 'spiritualitate',
      label: t('Spiritualitate', 'Spirituality'),
      icon: Sparkles,
      intro: t('Meditații, mantre, coaching divin și practici zilnice.', 'Meditations, mantras, divine coaching and daily practices.'),
      cards: [
        { title: t('Empowerment Meditation', 'Empowerment Meditation'), description: t('Meditații generate pentru starea ta.', 'Meditations generated for your state.'), to: '/empowerment-meditation', cta: t('Deschide', 'Open'), icon: Sparkles, featured: true },
        { title: t('Biblioteca Credințelor', 'Belief Library'), description: t('Explorează credințe și mantre.', 'Explore beliefs and mantras.'), to: '/biblioteca-credintelor', cta: t('Deschide', 'Open'), icon: BookOpen, featured: true },
        { title: t('Recunoștință', 'Gratitude'), description: t('Practică zilnică de recunoștință.', 'Daily gratitude practice.'), to: '/credinte/gratitude', cta: t('Deschide', 'Open'), icon: Heart },
        { title: t('Iertare', 'Forgiveness'), description: t('Loguri și practici de iertare.', 'Forgiveness logs and practices.'), to: '/credinte/forgiveness', cta: t('Deschide', 'Open'), icon: Heart },
        { title: t('Grijă de Sine', 'Self Care'), description: t('Ritualuri de self-care.', 'Self-care rituals.'), to: '/credinte/grija-de-sine', cta: t('Deschide', 'Open'), icon: Sparkles },
        { title: t('Anti-Aroganță', 'Anti-Arrogance'), description: t('Smerenia ca practică zilnică.', 'Humility as daily practice.'), to: '/credinte/anti-aroganta', cta: t('Deschide', 'Open'), icon: Sparkles },
      ],
      chart: <SpiritualityProgressChart />,
    },
    {
      id: 'business',
      label: 'Business',
      icon: Briefcase,
      intro: t('Dashboard, obiective, Hot List, coaching și analize.', 'Dashboard, objectives, Hot List, coaching and analysis.'),
      cards: [
        { title: t('Business Dashboard', 'Business Dashboard'), description: t('KPI-uri, prospects, deals, content.', 'KPIs, prospects, deals, content.'), to: '/business', cta: t('Deschide', 'Open'), icon: Briefcase, featured: true },
        { title: t('Biz4 Report', 'Biz4 Report'), description: t('Raport zilnic pe cele 4 metrici cheie.', 'Daily report on 4 key metrics.'), to: '/biz4-report', cta: t('Deschide', 'Open'), icon: ClipboardList, featured: true },
        { title: t('Business Coach (Hormozi)', 'Business Coach (Hormozi)'), description: t('Sesiuni AI de coaching în stil Hormozi.', 'Hormozi-style AI coaching sessions.'), to: '/stack?type=hormozi-coaching', cta: t('Deschide', 'Open'), icon: Target },
        { title: t('Analiză Hormozi', 'Hormozi Analysis'), description: t('Analiză de platformă și ofertă.', 'Platform and offer analysis.'), to: '/business/hormozi-analysis', cta: t('Deschide', 'Open'), icon: Grid3x3 },
        { title: t('Obiective anuale', 'Annual Objectives'), description: t('Impossible Game și planuri 90 zile.', 'Impossible Game and 90-day plans.'), to: '/game-objectives?tab=annual', cta: t('Deschide', 'Open'), icon: Target },
        { title: t('Kill It Today', 'Kill It Today'), description: t('Focus tactic pe azi.', 'Tactical focus for today.'), to: '/stack?type=kill-it-today', cta: t('Deschide', 'Open'), icon: Flame, badge: 'NEW' },
      ],
      chart: <BusinessProgressChart />,
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t('Ariile mele — Core CEO', 'My Areas — Core CEO')}</title>
        <meta name="description" content={t('Hub unic: Corp, Minte, Relații, Spiritualitate, Business — instrumente + progres.', 'Single hub: Body, Mind, Relationships, Spirituality, Business — tools + progress.')} />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-gradient-primary text-primary-foreground shadow-lg">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('Ariile mele — Core CEO', 'My Areas — Core CEO')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('Un singur loc pentru toate instrumentele, istoricul și progresul tău pe cele 5 arii.', 'One place for all your tools, history and progress across 5 life areas.')}
            </p>
          </div>
        </header>

        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
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
            <TabsContent key={s.id} value={s.id} className="mt-6 space-y-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground flex-1 min-w-[240px]">{s.intro}</p>
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <Link to={`/progres?cat=${s.id}`}>
                    <LineChart className="w-4 h-4" />
                    {t('Vezi tot istoricul', 'View full history')}
                  </Link>
                </Button>
              </div>

              {/* Tools grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {s.cards.map((card) => {
                  const CardIcon = card.icon;
                  return (
                    <Card key={card.to} className={`flex flex-col ${card.featured ? 'border-primary/40 bg-primary/5' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <CardIcon className="w-4 h-4 text-primary" />
                            </div>
                            <CardTitle className="text-base leading-tight">{card.title}</CardTitle>
                          </div>
                          {card.badge && <Badge variant="secondary" className="text-[10px]">{card.badge}</Badge>}
                        </div>
                        <CardDescription className="mt-2">{card.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto pt-0">
                        <Button asChild variant={card.featured ? 'default' : 'secondary'} size="sm" className="w-full justify-between">
                          <Link to={card.to}>
                            {card.cta}
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Embedded progress */}
              <section className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">{t('Progres & Istoric', 'Progress & History')}</h2>
                </div>
                {s.chart}
              </section>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default CoreCEO;
