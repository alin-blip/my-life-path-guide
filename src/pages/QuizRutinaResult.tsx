import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Check, Sword, Loader2, Sparkles, Lock, Mail, CheckCircle2 } from 'lucide-react';
import { WARRIOR_TYPES, WARRIOR_TEMPLATES, type WarriorType } from '@/data/warriorTypes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const QuizRutinaResult = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const warriorType = params.get('type') as WarriorType | null;
  const resultId = params.get('rid');
  const source = params.get('source') || 'quiz';

  const [activating, setActivating] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  const meta = warriorType ? WARRIOR_TYPES[warriorType] : null;
  const template = warriorType ? WARRIOR_TEMPLATES[warriorType] : null;

  // Preview: show only first 3 steps in the soft-gate variant
  const previewSteps = useMemo(() => template?.active_steps.slice(0, 3) ?? [], [template]);
  const lockedStepsCount = (template?.active_steps.length ?? 0) - previewSteps.length;

  useEffect(() => {
    if (!warriorType || !WARRIOR_TYPES[warriorType]) {
      navigate('/quiz-rutina', { replace: true });
    }
  }, [warriorType, navigate]);

  // Auto-activate if logged in user came back with a pending activation
  useEffect(() => {
    if (!user || authLoading || !warriorType) return;
    try {
      const pending = localStorage.getItem('pending_warrior_activation');
      if (!pending) return;
      const parsed = JSON.parse(pending);
      if (parsed?.warrior_type === warriorType) {
        localStorage.removeItem('pending_warrior_activation');
        activateDirect();
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, warriorType]);

  const activateDirect = async () => {
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

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      toast.error('Email invalid');
      return;
    }
    setEmailSubmitting(true);
    try {
      const utm = (() => {
        try { return JSON.parse(localStorage.getItem('warrior_funnel_utm') || '{}'); } catch { return {}; }
      })();
      const { data, error } = await supabase.functions.invoke('send-warrior-report', {
        body: {
          email: email.trim().toLowerCase(),
          warrior_type: warriorType,
          result_id: resultId,
          language: (navigator.language || 'ro').startsWith('en') ? 'en' : 'ro',
          utm: { ...utm, source },
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Eroare');
      setLeadId(data.lead_id);
      setEmailSent(true);
      toast.success('Raportul a fost trimis pe email 📧');
    } catch (err) {
      console.error(err);
      toast.error('Nu am putut trimite raportul. Încearcă din nou.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const goToCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const utm = (() => {
        try { return JSON.parse(localStorage.getItem('warrior_funnel_utm') || '{}'); } catch { return {}; }
      })();
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: 'starter',
          source: 'warrior-onboarding',
          guest_email: email.trim().toLowerCase() || undefined,
          language: (navigator.language || 'ro').startsWith('en') ? 'en' : 'ro',
          utm: { ...utm, warrior_type: warriorType, lead_id: leadId },
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL');

      // Mark lead as checkout_started for funnel analytics
      if (leadId) {
        supabase.from('warrior_funnel_leads')
          .update({ checkout_started_at: new Date().toISOString(), status: 'checkout' })
          .eq('id', leadId)
          .then(() => {}, () => {});
      }
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      toast.error('Nu am putut porni checkout-ul. Încearcă din nou.');
      setCheckoutLoading(false);
    }
  };

  if (!meta || !template) {
    return (
      <div className="min-h-screen bg-[#0B1733] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A84A]" />
      </div>
    );
  }

  // ------- Logged-in user: keep original one-click activation flow -------
  if (user) {
    return (
      <>
        <Helmet>
          <title>Ești {meta.name} — Rutina ta Warrior | CEO Mind OS</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-[#0B1733] via-[#0f1e42] to-[#0B1733] text-white">
          <header className="p-4 md:p-6 max-w-4xl mx-auto flex items-center gap-2">
            <Sword className="w-5 h-5 text-[#D4A84A]" />
            <span className="font-semibold text-sm tracking-wide">CEO MIND OS</span>
          </header>
          <main className="max-w-3xl mx-auto px-4 py-4 md:py-8 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
              <div className="text-7xl">{meta.emoji}</div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Ești <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', meta.color)}>{meta.name}</span>
              </h1>
              <p className="text-xl text-white/80 max-w-xl mx-auto">{meta.tagline}</p>
            </motion.div>
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
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sword className="w-4 h-4 text-[#D4A84A]" /> Rutina ta ({template.active_steps.length} pași)
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {template.active_steps.map((step) => (
                  <div key={step} className="flex items-center gap-2 text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#D4A84A] flex-shrink-0" />
                    <span className="capitalize">{step.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="text-center space-y-3">
              <Button size="lg" onClick={activateDirect} disabled={activating}
                className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-8 text-base w-full md:w-auto">
                {activating ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Se activează...</>
                  : <>Activează-mi rutina Warrior <ArrowRight className="ml-2 w-4 h-4" /></>}
              </Button>
            </div>
          </main>
        </div>
      </>
    );
  }

  // ------- Anon user: soft-gate variant -------
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A84A]/10 border border-[#D4A84A]/30 text-[#D4A84A] text-xs uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Rezultatul tău
            </div>
            <div className="text-7xl">{meta.emoji}</div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Ești <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', meta.color)}>{meta.name}</span>
            </h1>
            <p className="text-xl text-white/80 max-w-xl mx-auto">{meta.tagline}</p>
          </motion.div>

          {/* Free insight teaser */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
            </Card>
          </motion.div>

          {/* Locked routine preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-white/5 border-white/10 p-6 relative overflow-hidden">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sword className="w-4 h-4 text-[#D4A84A]" /> Rutina ta ({template.active_steps.length} pași)
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {previewSteps.map((step) => (
                  <div key={step} className="flex items-center gap-2 text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#D4A84A] flex-shrink-0" />
                    <span className="capitalize">{step.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  </div>
                ))}
                {lockedStepsCount > 0 && Array.from({ length: Math.min(lockedStepsCount, 5) }).map((_, i) => (
                  <div key={`locked-${i}`} className="flex items-center gap-2 text-white/30">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="italic">Deblochează pentru a vedea</span>
                  </div>
                ))}
              </div>
              {lockedStepsCount > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-center text-[#D4A84A]">
                  🔒 Încă {lockedStepsCount} pași personalizați + focus rutină + autosuggestion
                </div>
              )}
            </Card>
          </motion.div>

          {/* Email gate + CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="bg-gradient-to-br from-[#D4A84A]/10 to-[#D4A84A]/5 border-[#D4A84A]/30 p-6 md:p-8 space-y-4">
              {!emailSent ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A84A]/15 text-[#D4A84A] text-xs uppercase tracking-wider">
                      <Mail className="w-3 h-3" /> Raport complet gratuit
                    </div>
                    <h3 className="text-2xl font-bold">Îți trimit rutina completă pe email</h3>
                    <p className="text-sm text-white/70 max-w-md mx-auto">
                      Toți cei {template.active_steps.length} pași · focus rutină · autosuggestion personalizat · plan 30 zile
                    </p>
                  </div>
                  <form onSubmit={submitEmail} className="space-y-3 max-w-md mx-auto">
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="adresa@email.com"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12"
                    />
                    <Button
                      type="submit"
                      disabled={emailSubmitting}
                      className="w-full bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-12"
                    >
                      {emailSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Trimite-mi raportul <ArrowRight className="ml-2 w-4 h-4" /></>}
                    </Button>
                    <p className="text-xs text-center text-white/50">Fără spam · Un singur email · Anulezi când vrei</p>
                  </form>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-emerald-400 text-sm">
                      <CheckCircle2 className="w-5 h-5" /> Raport trimis pe {email}
                    </div>
                    <h3 className="text-2xl font-bold">Activează rutina în cont acum</h3>
                    <p className="text-sm text-white/70 max-w-md mx-auto">
                      7 zile trial gratuit · Apoi <span className="text-[#D4A84A] font-semibold">7€/lună</span> · Anulezi oricând
                    </p>
                  </div>
                  <Button
                    onClick={goToCheckout}
                    disabled={checkoutLoading}
                    size="lg"
                    className="w-full bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14"
                  >
                    {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <>Activează rutina — 7 zile trial <ArrowRight className="ml-2 w-4 h-4" /></>}
                  </Button>
                  <div className="text-xs text-center text-white/50 space-y-1">
                    <div>🔒 Plată securizată prin Stripe · Card cerut pentru trial</div>
                    <div>Rutina se aplică automat în cont după plata trial-ului</div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          <div className="text-center pt-2">
            <Link to="/quiz-rutina" className="text-xs text-white/40 hover:text-white/70">← Refă quiz-ul</Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default QuizRutinaResult;
