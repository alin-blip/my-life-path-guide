import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Rocket, Target, Zap, Heart, Briefcase, Brain, CheckCircle2, Calendar, Download } from 'lucide-react';
import { QuizCategory, categoryLabels, getScoreLevel } from '@/components/vision-quiz/quizData';
import { useLanguage } from '@/context/LanguageContext';
import { GoalsWizard } from '@/components/vision-plan/GoalsWizard';
import { PlanUpsell } from '@/components/vision-plan/PlanUpsell';

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

type PlanStep = 'goals' | 'plan' | 'upsell';

const getCategoryPlans = (language: 'en' | 'ro', userGoals?: Record<QuizCategory, string>): Record<QuizCategory, CategoryPlan> => ({
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
    monthlyGoal: userGoals?.body || (language === 'en' ? 'Complete 20 workouts this month' : 'Completează 20 de antrenamente luna aceasta'),
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
    monthlyGoal: userGoals?.being || (language === 'en' ? 'Complete 30 days of morning meditation' : 'Completează 30 de zile de meditație matinală'),
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
    monthlyGoal: userGoals?.balance || (language === 'en' ? 'Have 4 meaningful deep conversations' : 'Ai 4 conversații profunde semnificative'),
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
    monthlyGoal: userGoals?.business || (language === 'en' ? 'Increase revenue by 10% or save 5 hours/week' : 'Crește veniturile cu 10% sau economisește 5 ore/săptămână'),
    weeklyHabit: language === 'en' ? 'Sunday planning + daily top 3 priorities' : 'Planificare duminica + top 3 priorități zilnice',
  },
});

const Vision2026Plan: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [scores, setScores] = useState<Record<QuizCategory, number> | null>(null);
  const [userGoals, setUserGoals] = useState<Record<QuizCategory, string> | null>(null);
  const [step, setStep] = useState<PlanStep>('goals');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');
    
    if (scoresParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(scoresParam));
        setScores(parsed);
      } catch (e) {
        console.error('Failed to parse scores', e);
        // Default scores if parsing fails
        setScores({ body: 8, being: 8, balance: 8, business: 8 });
      }
    } else {
      // Default scores if none provided
      setScores({ body: 8, being: 8, balance: 8, business: 8 });
    }

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    if (nameParam) {
      setName(decodeURIComponent(nameParam));
    }
  }, [searchParams]);

  const handleGoalsComplete = (goals: Record<QuizCategory, string>) => {
    setUserGoals(goals);
    setStep('plan');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToUpsell = () => {
    setStep('upsell');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueFree = () => {
    navigate('/door?tab=annual&welcome=true');
  };

  const categoryPlans = getCategoryPlans(lang, userGoals || undefined);
  const categories: QuizCategory[] = ['body', 'being', 'balance', 'business'];

  const getPriorityCategories = () => {
    if (!scores) return categories;
    return [...categories].sort((a, b) => scores[a] - scores[b]);
  };

  const priorityCategories = getPriorityCategories();

  // Show loading until scores are parsed
  if (!scores) {
    return (
      <div className="light min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  // Step 1: Goals Wizard
  if (step === 'goals') {
    return (
      <div className="light min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Helmet>
          <title>{lang === 'en' ? 'Set Your 2026 Goals | LifeOS' : 'Setează Obiectivele 2026 | LifeOS'}</title>
        </Helmet>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {lang === 'en' ? 'Create Your 2026 Vision Plan' : 'Creează Planul Viziunii 2026'}
            </h1>
            <p className="text-slate-600">
              {lang === 'en' 
                ? 'Based on your quiz results, let\'s set specific goals for each life area.' 
                : 'Pe baza rezultatelor quiz-ului, hai să setăm obiective specifice pentru fiecare arie a vieții.'}
            </p>
          </div>

          <GoalsWizard
            language={lang}
            scores={scores}
            email={email}
            name={name}
            onComplete={handleGoalsComplete}
          />
        </div>
      </div>
    );
  }

  // Step 3: Upsell
  if (step === 'upsell') {
    return (
      <div className="light min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Helmet>
          <title>{lang === 'en' ? 'Start Your Journey | LifeOS' : 'Începe Călătoria | LifeOS'}</title>
        </Helmet>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <PlanUpsell language={lang} onContinueFree={handleContinueFree} />
        </div>
      </div>
    );
  }

  // Step 2: Show Plan
  return (
    <div className="light min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Helmet>
        <title>{lang === 'en' ? 'Your 2026 Action Plan | LifeOS' : 'Planul Tău de Acțiune 2026 | LifeOS'}</title>
        <meta name="description" content={lang === 'en' ? 'Your personalized action plan for 2026' : 'Planul tău personalizat de acțiune pentru 2026'} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setStep('goals')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {lang === 'en' ? 'Your 2026 Action Plan' : 'Planul Tău de Acțiune 2026'}
            </h1>
            <p className="text-slate-600">
              {lang === 'en' ? 'Personalized based on your goals and assessment' : 'Personalizat pe baza obiectivelor și evaluării tale'}
            </p>
          </div>
        </div>

        {/* User Goals Summary */}
        {userGoals && (
          <Card className="mb-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-slate-900 mb-3">
                  {lang === 'en' ? 'Your 2026 Goals' : 'Obiectivele Tale pentru 2026'}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(userGoals).filter(([_, goal]) => goal.trim()).map(([category, goal]) => {
                    const catLabel = category as QuizCategory;
                    return (
                      <div key={category} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-1" />
                        <div>
                          <p className="text-xs font-medium text-slate-500">
                            {lang === 'en' ? categoryLabels[catLabel].en : categoryLabels[catLabel].ro}
                          </p>
                          <p className="text-sm text-slate-700">{goal}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Priority Message */}
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

        {/* Category Plans */}
        <div className="space-y-6 mb-8">
          {priorityCategories.map((category, index) => {
            const plan = categoryPlans[category];
            const score = scores[category];
            const level = getScoreLevel(score);
            const userGoal = userGoals?.[category];
            
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
                        <span className="text-sm" style={{ color: level.color }}>
                          {lang === 'en' ? level.level : level.levelRo} ({score}/16)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* User's Annual Goal */}
                  {userGoal && (
                    <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-slate-700">
                          {lang === 'en' ? 'Your 2026 Goal' : 'Obiectivul Tău 2026'}
                        </p>
                        <p className="text-slate-800 text-sm font-medium">{userGoal}</p>
                      </div>
                    </div>
                  )}

                  {/* Monthly Goal */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-700">
                        {lang === 'en' ? 'Monthly Focus' : 'Focus Lunar'}
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
              ? 'Your goals are saved. Get daily action tasks delivered to your dashboard and track your progress.'
              : 'Obiectivele sunt salvate. Primește task-uri zilnice în dashboard și urmărește-ți progresul.'}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={handleContinueToUpsell}
            className="w-full sm:w-auto animate-pulse hover:animate-none"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Continue - See Options' : 'Continuă - Vezi Opțiuni'}
          </Button>
          <p className="text-white/60 text-xs mt-3">
            {lang === 'en' 
              ? '✓ An email with your plan has been sent' 
              : '✓ Un email cu planul tău a fost trimis'}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Vision2026Plan;
