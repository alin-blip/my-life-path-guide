import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Sword, Loader2 } from 'lucide-react';
import { QUIZ_QUESTIONS } from '@/data/warriorTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Answer = { questionId: string; optionIndex: number };

const QuizRutina = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'intro' | number | 'email' | 'submitting'>('intro');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [email, setEmail] = useState('');

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentIndex = typeof step === 'number' ? step : -1;
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / (totalQuestions + 1)) * 100 : 0;

  const selectOption = (optionIndex: number) => {
    if (typeof step !== 'number') return;
    const question = QUIZ_QUESTIONS[step];
    const newAnswers = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, optionIndex },
    ];
    setAnswers(newAnswers);

    // Auto-advance
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
    setStep('submitting');
    try {
      const { data, error } = await supabase.functions.invoke('submit-quiz-routine', {
        body: {
          answers,
          email: email.trim() || null,
          language: 'ro',
          source: 'quiz-rutina',
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Eroare necunoscută');

      navigate(`/quiz-rutina/result?type=${data.warrior_type}&rid=${data.result_id}`);
    } catch (e) {
      console.error(e);
      toast.error('Nu am putut trimite quiz-ul. Încearcă din nou.');
      setStep('email');
    }
  };

  const selectedForCurrent =
    typeof step === 'number' ? answers.find((a) => a.questionId === QUIZ_QUESTIONS[step].id)?.optionIndex : null;

  return (
    <>
      <Helmet>
        <title>Quiz Rutină — Ce fel de Warrior ești? | CEO Mind OS</title>
        <meta name="description" content="Descoperă tipul tău de Warrior în 2 minute și primești o rutină de dimineață personalizată — 100% gratuit." />
        <meta property="og:title" content="Quiz Rutină Warrior — CEO Mind OS" />
        <meta property="og:description" content="Descoperă tipul tău de Warrior și primești o rutină de dimineață personalizată." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
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
              <ArrowLeft className="w-4 h-4" /> Înapoi
            </button>
          )}
        </header>

        {/* Progress */}
        {currentIndex >= 0 && (
          <div className="px-4 md:px-6 max-w-4xl mx-auto w-full">
            <Progress value={progress} className="h-1 bg-white/10" />
            <div className="text-xs text-white/50 mt-1 text-right">
              {step === 'email' ? 'Ultima etapă' : `Întrebare ${currentIndex + 1} / ${totalQuestions}`}
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
                    Quiz • 2 minute • Gratuit
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    Ce fel de <span className="text-[#D4A84A]">Warrior</span> ești?
                  </h1>
                  <p className="text-lg text-white/70 max-w-lg mx-auto">
                    8 întrebări. Îți descopăr tipul de personalitate în rutină și îți dau un template
                    de dimineață <strong>personalizat</strong> — pe care îl activezi cu un singur click.
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
                    Începe quiz-ul <ArrowRight className="ml-2 w-4 h-4" />
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
                    {QUIZ_QUESTIONS[step].question}
                  </h2>
                  <div className="space-y-3">
                    {QUIZ_QUESTIONS[step].options.map((opt, i) => (
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
                    <h2 className="text-3xl font-bold">Aproape gata! ⚡</h2>
                    <p className="text-white/70">
                      Lasă-mi email-ul (opțional) ca să-ți trimit rezultatul și tips-uri pentru
                      tipul tău de Warrior în următoarele zile.
                    </p>
                  </div>

                  <Card className="bg-white/5 border-white/10 p-6 space-y-4">
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">Email (opțional)</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@example.com"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <Button
                      onClick={submitQuiz}
                      size="lg"
                      className="w-full bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-12"
                    >
                      Vezi rezultatul <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <p className="text-xs text-white/50 text-center">
                      Fără spam. Poți opta la orice moment.
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
                  <p className="text-white/70">Îți calculez tipul de Warrior...</p>
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
