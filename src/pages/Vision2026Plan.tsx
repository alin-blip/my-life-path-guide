import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Rocket, Target, Zap, Heart, Briefcase, Brain, CheckCircle2, Calendar, Download } from 'lucide-react';
import { QuizCategory, categoryLabels, getScoreLevel } from '@/components/vision-quiz/quizData';
import { useLanguage } from '@/context/LanguageContext';

interface ActionItem {
  title: string;
  description: string;
  timeframe: string;
}

interface CategoryPlan {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  actions: ActionItem[];
  monthlyGoal: string;
  weeklyHabit: string;
}

const getCategoryPlans = (language: 'en' | 'ro'): Record<QuizCategory, CategoryPlan> => ({
  body: {
    icon: <Zap className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    actions: language === 'en' ? [
      { title: 'Morning Movement', description: 'Start every day with 20 minutes of movement before checking your phone', timeframe: 'Daily' },
      { title: 'Sleep Optimization', description: 'Set a consistent bedtime and create a wind-down routine', timeframe: 'Week 1' },
      { title: 'Nutrition Reset', description: 'Eliminate processed foods and focus on whole foods for 30 days', timeframe: 'Month 1' },
      { title: 'Energy Audit', description: 'Track your energy levels for 2 weeks to find patterns', timeframe: 'Week 1-2' },
    ] : [
      { title: 'Mișcare Matinală', description: 'Începe fiecare zi cu 20 de minute de mișcare înainte de a verifica telefonul', timeframe: 'Zilnic' },
      { title: 'Optimizare Somn', description: 'Setează o oră de culcare consistentă și creează o rutină de relaxare', timeframe: 'Săptămâna 1' },
      { title: 'Reset Nutrițional', description: 'Elimină alimentele procesate și concentrează-te pe alimente integrale timp de 30 de zile', timeframe: 'Luna 1' },
      { title: 'Audit Energie', description: 'Urmărește nivelurile de energie timp de 2 săptămâni pentru a găsi tipare', timeframe: 'Săpt. 1-2' },
    ],
    monthlyGoal: language === 'en' ? 'Complete 20 workouts this month' : 'Completează 20 de antrenamente luna aceasta',
    weeklyHabit: language === 'en' ? '7 hours sleep + daily movement' : '7 ore somn + mișcare zilnică',
  },
  being: {
    icon: <Brain className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    actions: language === 'en' ? [
      { title: 'Morning Stack', description: 'Dedicate the first 30 minutes of each day to meditation and journaling', timeframe: 'Daily' },
      { title: 'Gratitude Practice', description: 'Write 3 things you\'re grateful for every evening', timeframe: 'Daily' },
      { title: 'Purpose Clarity', description: 'Complete a vision mapping exercise for all life areas', timeframe: 'Week 1' },
      { title: 'Stress Protocol', description: 'Learn and practice box breathing for stress management', timeframe: 'Week 2' },
    ] : [
      { title: 'Stack Matinal', description: 'Dedică primele 30 de minute ale fiecărei zile meditației și jurnalului', timeframe: 'Zilnic' },
      { title: 'Practică de Recunoștință', description: 'Scrie 3 lucruri pentru care ești recunoscător în fiecare seară', timeframe: 'Zilnic' },
      { title: 'Claritate Scop', description: 'Completează un exercițiu de mapare a viziunii pentru toate ariile vieții', timeframe: 'Săptămâna 1' },
      { title: 'Protocol Stres', description: 'Învață și practică respirația box pentru gestionarea stresului', timeframe: 'Săptămâna 2' },
    ],
    monthlyGoal: language === 'en' ? 'Complete 30 days of morning meditation' : 'Completează 30 de zile de meditație matinală',
    weeklyHabit: language === 'en' ? 'Daily journaling + evening reflection' : 'Jurnal zilnic + reflecție seara',
  },
  balance: {
    icon: <Heart className="w-6 h-6" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
    actions: language === 'en' ? [
      { title: 'Quality Time Block', description: 'Schedule 2 hours of phone-free time with family weekly', timeframe: 'Weekly' },
      { title: 'Relationship Audit', description: 'Identify your 5 most important relationships and rate their health', timeframe: 'Week 1' },
      { title: 'Reconnection Calls', description: 'Reach out to 3 friends you\'ve lost touch with', timeframe: 'Month 1' },
      { title: 'Date Night Protocol', description: 'Plan and execute weekly date nights (partner or self)', timeframe: 'Weekly' },
    ] : [
      { title: 'Bloc de Timp de Calitate', description: 'Programează 2 ore fără telefon cu familia săptămânal', timeframe: 'Săptămânal' },
      { title: 'Audit Relații', description: 'Identifică cele mai importante 5 relații și evaluează-le sănătatea', timeframe: 'Săptămâna 1' },
      { title: 'Apeluri de Reconectare', description: 'Contactează 3 prieteni cu care ai pierdut legătura', timeframe: 'Luna 1' },
      { title: 'Protocol Seară Romantică', description: 'Planifică și execută seri romantice săptămânale', timeframe: 'Săptămânal' },
    ],
    monthlyGoal: language === 'en' ? 'Have 4 meaningful deep conversations' : 'Ai 4 conversații profunde semnificative',
    weeklyHabit: language === 'en' ? 'Weekly family time + monthly friend meetup' : 'Timp săptămânal cu familia + întâlnire lunară cu prietenii',
  },
  business: {
    icon: <Briefcase className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    actions: language === 'en' ? [
      { title: 'Weekly Planning', description: 'Every Sunday, plan your week with your top 3 priorities', timeframe: 'Weekly' },
      { title: 'Revenue Audit', description: 'Analyze your income sources and identify the 20% generating 80%', timeframe: 'Week 1' },
      { title: 'Productivity System', description: 'Implement a time-blocking system for focused work', timeframe: 'Week 1' },
      { title: 'Quarterly Goals', description: 'Set 3 measurable goals for Q1 2026 with clear KPIs', timeframe: 'Week 1' },
    ] : [
      { title: 'Planificare Săptămânală', description: 'În fiecare duminică, planifică săptămâna cu top 3 priorități', timeframe: 'Săptămânal' },
      { title: 'Audit Venituri', description: 'Analizează sursele de venit și identifică 20% care generează 80%', timeframe: 'Săptămâna 1' },
      { title: 'Sistem Productivitate', description: 'Implementează un sistem de time-blocking pentru muncă focusată', timeframe: 'Săptămâna 1' },
      { title: 'Obiective Trimestriale', description: 'Setează 3 obiective măsurabile pentru Q1 2026 cu KPI clari', timeframe: 'Săptămâna 1' },
    ],
    monthlyGoal: language === 'en' ? 'Increase revenue by 10% or save 5 hours/week' : 'Crește veniturile cu 10% sau economisește 5 ore/săptămână',
    weeklyHabit: language === 'en' ? 'Sunday planning + daily top 3 priorities' : 'Planificare duminica + top 3 priorități zilnice',
  },
});

const Vision2026Plan: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [scores, setScores] = useState<Record<QuizCategory, number> | null>(null);
  const lang = (language === 'en' || language === 'ro' ? language : 'ro') as 'en' | 'ro';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    
    return () => {
      root.classList.remove('light');
    };
  }, []);

  useEffect(() => {
    const scoresParam = searchParams.get('scores');
    if (scoresParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(scoresParam));
        setScores(parsed);
      } catch (e) {
        console.error('Failed to parse scores', e);
      }
    }
  }, [searchParams]);

  const categoryPlans = getCategoryPlans(lang);
  const categories: QuizCategory[] = ['body', 'being', 'balance', 'business'];

  const getPriorityCategories = () => {
    if (!scores) return categories;
    return [...categories].sort((a, b) => scores[a] - scores[b]);
  };

  const priorityCategories = getPriorityCategories();

  return (
    <div className="light min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Helmet>
        <title>{lang === 'en' ? 'Your 2026 Action Plan | LifeOS' : 'Planul Tău de Acțiune 2026 | LifeOS'}</title>
        <meta name="description" content={lang === 'en' ? 'Your personalized action plan for 2026' : 'Planul tău personalizat de acțiune pentru 2026'} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vision-2026')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {lang === 'en' ? 'Your 2026 Action Plan' : 'Planul Tău de Acțiune 2026'}
            </h1>
            <p className="text-slate-600">
              {lang === 'en' ? 'Personalized based on your assessment results' : 'Personalizat pe baza rezultatelor evaluării tale'}
            </p>
          </div>
        </div>

        {/* Priority Message */}
        {scores && (
          <Card className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-900 mb-1">
                  {lang === 'en' ? 'Your Priority Order for 2026' : 'Ordinea Ta de Priorități pentru 2026'}
                </h2>
                <p className="text-slate-600 text-sm mb-3">
                  {lang === 'en' 
                    ? 'Based on your scores, focus on these areas in order for maximum impact:'
                    : 'Pe baza scorurilor tale, concentrează-te pe aceste arii în ordine pentru impact maxim:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {priorityCategories.map((cat, index) => {
                    const level = getScoreLevel(scores[cat]);
                    return (
                      <span 
                        key={cat}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: `${level.color}20`, color: level.color }}
                      >
                        <span className="font-bold">{index + 1}.</span>
                        {lang === 'en' ? categoryLabels[cat].en : categoryLabels[cat].ro}
                        <span className="opacity-70">({scores[cat]}/16)</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Category Plans */}
        <div className="space-y-6 mb-8">
          {priorityCategories.map((category, index) => {
            const plan = categoryPlans[category];
            const score = scores?.[category];
            const level = score ? getScoreLevel(score) : null;
            
            return (
              <Card key={category} className="overflow-hidden">
                <div className={`p-4 ${plan.bgColor} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-white/50 flex items-center justify-center ${plan.color}`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {index + 1}. {lang === 'en' ? categoryLabels[category].en : categoryLabels[category].ro}
                        </h3>
                        {level && (
                          <span className="text-sm" style={{ color: level.color }}>
                            {lang === 'en' ? level.level : level.levelRo} ({score}/16)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Monthly Goal */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-700">
                        {lang === 'en' ? 'Monthly Goal' : 'Obiectiv Lunar'}
                      </p>
                      <p className="text-slate-600 text-sm">{plan.monthlyGoal}</p>
                    </div>
                  </div>

                  {/* Weekly Habit */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-700">
                        {lang === 'en' ? 'Weekly Habit' : 'Obicei Săptămânal'}
                      </p>
                      <p className="text-slate-600 text-sm">{plan.weeklyHabit}</p>
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <p className="font-medium text-sm text-slate-700 mb-2">
                      {lang === 'en' ? 'Action Steps' : 'Pași de Acțiune'}
                    </p>
                    <div className="grid gap-2">
                      {plan.actions.map((action, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                          <span className={`w-6 h-6 rounded-full ${plan.bgColor} ${plan.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm text-slate-900">{action.title}</p>
                              <span className="text-xs text-slate-500 shrink-0">{action.timeframe}</span>
                            </div>
                            <p className="text-slate-600 text-xs mt-0.5">{action.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-white text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">
            {lang === 'en' 
              ? 'Ready to Execute This Plan?' 
              : 'Gata să Execuți Acest Plan?'}
          </h3>
          <p className="text-white/80 text-sm mb-4 max-w-md mx-auto">
            {lang === 'en'
              ? 'We\'ll create your first week of tasks automatically based on this plan. Start seeing results in 48 hours!'
              : 'Vom crea automat task-urile primei săptămâni pe baza acestui plan. Vezi rezultate în 48 de ore!'}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => {
              const scoresParam = searchParams.get('scores') || '';
              navigate(`/auth?from=vision-plan&scores=${scoresParam}`);
            }}
            className="w-full sm:w-auto animate-pulse hover:animate-none"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Implement in LifeOS - 7 Days Free' : 'Implementează în LifeOS - 7 Zile Gratuit'}
          </Button>
          <p className="text-white/60 text-xs mt-3">
            {lang === 'en' 
              ? '✓ Tasks created automatically • No credit card required' 
              : '✓ Task-uri create automat • Fără card de credit'}
          </p>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Button variant="link" onClick={() => navigate('/vision-2026')} className="text-slate-600">
            ← {lang === 'en' ? 'Back to Assessment' : 'Înapoi la Evaluare'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Vision2026Plan;
