import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Sword, Loader2 } from 'lucide-react';
import { QUIZ_QUESTIONS, localizeQuestions } from '@/data/warriorTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

type Answer = { questionId: string; optionIndex: number };

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const COPY = {
  ro: {
    metaTitle: 'Quiz Rutină — Ce fel de Warrior ești? | CEO Mind OS',
    metaDesc: 'Descoperă tipul tău de Warrior în 2 minute și primești o rutină de dimineață personalizată — 100% gratuit.',
    ogTitle: 'Quiz Rutină Warrior — CEO Mind OS',
    ogDesc: 'Descoperă tipul tău de Warrior și primești o rutină de dimineață personalizată.',
    back: 'Înapoi',
    lastStep: 'Ultima etapă',
    question: (i: number, total: number) => `Întrebare ${i} / ${total}`,
    introBadge: 'Quiz • 2 minute • Gratuit',
    introTitle1: 'Ce fel de',
    introTitle2: 'ești?',
    introBody: (
      <>8 întrebări. Îți descopăr tipul de personalitate în rutină și îți dau un template
      de dimineață <strong>personalizat</strong> — pe care îl activezi cu un singur click.</>
    ),
    startBtn: 'Începe quiz-ul',
    emailTitle: 'Ultimul pas ⚡',
    emailBody: 'Lasă-mi email-ul ca să-ți trimit rezultatul personalizat + raportul complet.',
    emailLabel: 'Email',
    emailPlaceholder: 'tu@example.com',
    seeResult: 'Vezi rezultatul',
    noSpam: 'Fără spam. Doar rezultatul tău + rutina personalizată.',
    invalidEmail: 'Ai nevoie de un email valid ca să primești rezultatul.',
    submitError: 'Nu am putut trimite quiz-ul. Încearcă din nou.',
    submitting: 'Îți calculez tipul de Warrior...',
    unknownError: 'Eroare necunoscută',
  },
  en: {
    metaTitle: 'Routine Quiz — What kind of Warrior are you? | CEO Mind OS',
    metaDesc: 'Discover your Warrior type in 2 minutes and get a personalized morning routine — 100% free.',
    ogTitle: 'Warrior Routine Quiz — CEO Mind OS',
    ogDesc: 'Discover your Warrior type and get a personalized morning routine.',
    back: 'Back',
    lastStep: 'Final step',
    question: (i: number, total: number) => `Question ${i} / ${total}`,
    introBadge: 'Quiz • 2 minutes • Free',
    introTitle1: 'What kind of',
    introTitle2: 'are you?',
    introBody: (
      <>8 questions. I identify your routine personality and give you a
      <strong> personalized</strong> morning template — activated with a single click.</>
    ),
    startBtn: 'Start the quiz',
    emailTitle: 'Final step ⚡',
    emailBody: 'Leave your email so I can send you the personalized result + full report.',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    seeResult: 'See my result',
    noSpam: 'No spam. Just your result + personalized routine.',
    invalidEmail: 'You need a valid email to receive the result.',
    submitError: 'We couldn\'t send the quiz. Please try again.',
    submitting: 'Calculating your Warrior type...',
    unknownError: 'Unknown error',
  },
} as const;

const QuizRutina = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const c = isEn ? COPY.en : COPY.ro;
  const questions = useMemo(() => localizeQuestions(QUIZ_QUESTIONS, isEn ? 'en' : 'ro'), [isEn]);

  const autostart = searchParams.get('autostart') === '1';
  const [step, setStep] = useState<'intro' | number | 'email' | 'submitting'>(autostart ? 0 : 'intro');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (autostart && step === 'intro') setStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart]);

  const totalQuestions = questions.length;
  const currentIndex = typeof step === 'number' ? step : -1;
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / (totalQuestions + 1)) * 100 : 0;

  const selectOption = (optionIndex: number) => {
    if (typeof step !== 'number') return;
    const question = questions[step];
    const newAnswers = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, optionIndex },
    ];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (step + 1 < totalQuestions) {
        setStep(step + 1);
      } else {
        setStep('email');
      }
    }, 250);
  };

  const goBack = () => {
    if (step === 'email') setStep(totalQuestions - 1);
    else if (typeof step === 'number' && step > 0) setStep(step - 1);
    else if (step === 0) setStep('intro');
  };

  const submitQuiz = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      toast.error(c.invalidEmail);
      return;
    }
    setStep('submitting');
    try {
      const { data, error } = await supabase.functions.invoke('submit-quiz-routine', {
        body: {
          answers,
          email: email.trim().toLowerCase(),
          language: isEn ? 'en' : 'ro',
          source: 'quiz-rutina',
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || c.unknownError);

      const emailParam = encodeURIComponent(email.trim().toLowerCase());
      const base = isEn ? '/en' : '';
      navigate(`${base}/quiz-rutina/result?type=${data.warrior_type}&rid=${data.result_id}&email=${emailParam}`);
    } catch (e) {
      console.error(e);
      toast.error(c.submitError);
      setStep('email');
    }
  };

  const selectedForCurrent =
    typeof step === 'number' ? answers.find((a) => a.questionId === questions[step].id)?.optionIndex : null;

  return (
    <>
      <Helmet>
        <html lang={isEn ? 'en' : 'ro'} />
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDesc} />
        <meta property="og:title" content={c.ogTitle} />
        <meta property="og:description" content={c.ogDesc} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="alternate" hrefLang="ro" href="https://ceomindos.com/quiz-rutina" />
        <link rel="alternate" hrefLang="en" href="https://ceomindos.com/en/quiz-rutina" />
        <link rel="alternate" hrefLang="x-default" href="https://ceomindos.com/quiz-rutina" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0B1733] via-[#0f1e42] to-[#0B1733] text-white flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-6 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-[#D4A84A]" />
            <span className="font-semibold text-sm tracking-wide">CEO MIND OS</span>
          </div>
          {currentIndex >= 0 && (
            <button onClick={goBack} className="text-sm text-white/60 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> {c.back}
            </button>
          )}
        </header>

        {/* Progress */}
        {currentIndex >= 0 && (
          <div className="px-4 md:px-6 max-w-4xl mx-auto w-full">
            <Progress value={progress} className="h-1 bg-white/10" />
            <div className="text-xs text-white/50 mt-1 text-right">
              {step === 'email' ? c.lastStep : c.question(currentIndex + 1, totalQuestions)}
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {step === 'intro' && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A84A]/10 border border-[#D4A84A]/30 text-[#D4A84A] text-xs uppercase tracking-wider">
                    {c.introBadge}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {c.introTitle1} <span className="text-[#D4A84A]">Warrior</span> {c.introTitle2}
                  </h1>
                  <p className="text-lg text-white/70 max-w-lg mx-auto">
                    {c.introBody}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 max-w-xl mx-auto text-xs">
                    {[
                      { emoji: '⚡', name: 'Reactor' },
                      { emoji: '🎯', name: 'Disciplined' },
                      { emoji: '🔬', name: 'Experimenter' },
                      { emoji: '⚔️', name: 'Warrior' },
                    ].map((t) => (
                      <div key={t.name} className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-2xl mb-1">{t.emoji}</div>
                        <div className="text-white/80">{t.name}</div>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setStep(0)}
                    className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold px-8 h-12"
                  >
                    {c.startBtn} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {typeof step === 'number' && (
                <motion.div
                  key={`q-${step}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl md:text-3xl font-semibold leading-snug">
                    {questions[step].question}
                  </h2>
                  <div className="space-y-3">
                    {questions[step].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => selectOption(i)}
                        className={cn(
                          'w-full text-left p-4 rounded-xl border transition-all group',
                          'hover:border-[#D4A84A] hover:bg-[#D4A84A]/5',
                          selectedForCurrent === i
                            ? 'border-[#D4A84A] bg-[#D4A84A]/10'
                            : 'border-white/10 bg-white/5',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center',
                            selectedForCurrent === i ? 'border-[#D4A84A] bg-[#D4A84A]' : 'border-white/30',
                          )}>
                            {selectedForCurrent === i && (
                              <div className="w-2 h-2 rounded-full bg-[#0B1733]" />
                            )}
                          </div>
                          <span className="text-white/90 group-hover:text-white">{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold">{c.emailTitle}</h2>
                    <p className="text-white/70">
                      {c.emailBody}
                    </p>
                  </div>

                  <Card className="bg-white/5 border-white/10 p-6 space-y-4">
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">{c.emailLabel}</label>
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={c.emailPlaceholder}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <Button
                      onClick={submitQuiz}
                      size="lg"
                      disabled={!EMAIL_RE.test(email.trim())}
                      className="w-full bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-12 disabled:opacity-50"
                    >
                      {c.seeResult} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <p className="text-xs text-white/50 text-center">
                      {c.noSpam}
                    </p>
                  </Card>

                </motion.div>
              )}

              {step === 'submitting' && (
                <motion.div
                  key="submitting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#D4A84A]" />
                  <p className="text-white/70">{c.submitting}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
};

export default QuizRutina;
