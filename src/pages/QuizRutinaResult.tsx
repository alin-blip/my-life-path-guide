import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Check, Sword, Loader2, Sparkles } from 'lucide-react';
import { WARRIOR_TYPES, WARRIOR_TEMPLATES, type WarriorType } from '@/data/warriorTypes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const QuizRutinaResult = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const warriorType = params.get('type') as WarriorType | null;
  const resultId = params.get('rid');

  const [activating, setActivating] = useState(false);

  const meta = warriorType ? WARRIOR_TYPES[warriorType] : null;
  const template = warriorType ? WARRIOR_TEMPLATES[warriorType] : null;

  useEffect(() => {
    if (!warriorType || !WARRIOR_TYPES[warriorType]) {
      navigate('/quiz-rutina', { replace: true });
    }
  }, [warriorType, navigate]);

  // Auto-activate if user just came back from auth with a pending activation
  useEffect(() => {
    if (!user || authLoading || !warriorType) return;
    try {
      const pending = localStorage.getItem('pending_warrior_activation');
      if (!pending) return;
      const parsed = JSON.parse(pending);
      if (parsed?.warrior_type === warriorType) {
        localStorage.removeItem('pending_warrior_activation');
        activate();
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, warriorType]);

  const activate = async () => {
    if (!user) {
      // Persist activation intent, then send to auth
      if (warriorType) {
        localStorage.setItem('pending_warrior_activation', JSON.stringify({
          warrior_type: warriorType,
          result_id: resultId,
        }));
      }
      navigate(`/auth?redirect=/quiz-rutina/result?type=${warriorType}&rid=${resultId || ''}`);
      return;
    }

    setActivating(true);
    try {
      const { data, error } = await supabase.functions.invoke('activate-warrior-routine', {
        body: { warrior_type: warriorType, result_id: resultId },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Eroare necunoscută');
      toast.success('Rutina Warrior a fost activată! ⚔️');
      navigate(data.redirect_url || '/daily-flow?new=1');
    } catch (e) {
      console.error(e);
      toast.error('Nu am putut activa rutina. Încearcă din nou.');
      setActivating(false);
    }
  };

  if (!meta || !template) {
    return (
      <div className="min-h-screen bg-[#0B1733] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A84A]" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Ești {meta.name} — Rutina ta Warrior | CEO Mind OS</title>
        <meta name="description" content={`Ești tip ${meta.name}: ${meta.tagline}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0B1733] via-[#0f1e42] to-[#0B1733] text-white">
        <header className="p-4 md:p-6 max-w-4xl mx-auto flex items-center gap-2">
          <Sword className="w-5 h-5 text-[#D4A84A]" />
          <span className="font-semibold text-sm tracking-wide">CEO MIND OS</span>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-4 md:py-8 space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A84A]/10 border border-[#D4A84A]/30 text-[#D4A84A] text-xs uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Rezultatul tău
            </div>
            <div className="text-7xl">{meta.emoji}</div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Ești <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', meta.color)}>{meta.name}</span>
            </h1>
            <p className="text-xl text-white/80 max-w-xl mx-auto">{meta.tagline}</p>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-white/5 border-white/10 p-6 space-y-4">
              <p className="text-white/90 leading-relaxed">{meta.description}</p>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <div className="text-xs uppercase tracking-wider text-emerald-400 mb-1">Puncte forte</div>
                  <div className="text-sm text-white/85">{meta.strengths}</div>
                </div>
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="text-xs uppercase tracking-wider text-red-400 mb-1">Provocări</div>
                  <div className="text-sm text-white/85">{meta.challenges}</div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#D4A84A]/5 border border-[#D4A84A]/20">
                <div className="text-xs uppercase tracking-wider text-[#D4A84A] mb-1">Focus rutină</div>
                <div className="text-sm text-white/85">{meta.routineFocus}</div>
              </div>
            </Card>
          </motion.div>

          {/* Template preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sword className="w-4 h-4 text-[#D4A84A]" /> Ce include rutina ta ({template.active_steps.length} pași)
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {template.active_steps.map((step) => (
                  <div key={step} className="flex items-center gap-2 text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#D4A84A] flex-shrink-0" />
                    <span className="capitalize">{step.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-xs text-white/70">
                <div><span className="text-white/50">Meditație:</span> {template.meditation_default_duration} min</div>
                <div><span className="text-white/50">Antrenament:</span> {template.workout_days_per_week}×/săpt</div>
                <div><span className="text-white/50">Citit:</span> {template.reading_pages_per_day} pag/zi</div>
              </div>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-center space-y-3"
          >
            <Button
              size="lg"
              onClick={activate}
              disabled={activating || authLoading}
              className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-8 text-base w-full md:w-auto"
            >
              {activating ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Se activează...</>
              ) : (
                <>Activează-mi rutina Warrior <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>
            <p className="text-xs text-white/50">
              {user ? 'Se aplică pe contul tău — poți modifica oricând în Setări.' : 'Îți creez cont gratuit ca să-ți salvez rutina.'}
            </p>
            <div className="pt-2">
              <Link to="/quiz-rutina" className="text-xs text-white/40 hover:text-white/70">
                Refă quiz-ul
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default QuizRutinaResult;
