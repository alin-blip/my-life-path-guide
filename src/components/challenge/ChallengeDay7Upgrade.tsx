import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Crown, Zap, Rocket, Check, X, Clock, 
  Target, Brain, Heart, Briefcase, AlertTriangle, Gift,
  Share2, Copy, Users, Lightbulb, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useAffiliateLink } from '@/hooks/useAffiliateLink';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { plans, getLocalizedPlan } from '@/data/pricing';

interface ChallengeDay7UpgradeProps {
  completedDays: number;
}

export function ChallengeDay7Upgrade({ completedDays = 7 }: ChallengeDay7UpgradeProps) {
  const { language } = useLanguage();
  const { isEarlyBirdActive, earlyBirdExpiresAt, user } = useAuth();
  const { referralLink, shareWithMessage, isLoading: shareLoading } = useAffiliateLink();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState(false);

  // Get plans from centralized pricing
  const proPlan = getLocalizedPlan(plans.find(p => p.id === 'pro')!, language as 'en' | 'ro');

  // 24-hour countdown from when user reaches Day 7
  useEffect(() => {
    const day7StartTime = localStorage.getItem('challenge_day7_start');
    if (!day7StartTime) {
      localStorage.setItem('challenge_day7_start', new Date().toISOString());
    }

    const interval = setInterval(() => {
      const startTime = new Date(localStorage.getItem('challenge_day7_start') || new Date().toISOString());
      const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth', { state: { returnUrl: '/challenge/7', plan: planId } });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'challenge-day7' }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(language === 'ro' ? 'A apărut o eroare.' : 'An error occurred.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Referral message for Day 7
  const referralMessageRo = `Tocmai am terminat acest challenge anti-burnout.

În 7 zile am spart ciclul procrastinării și am construit momentum real.

Acum am:
– Claritate totală asupra direcției
– Un plan anti-burnout pe 4 arii
– Sistem de execuție săptămânală
– Rutină zilnică care nu epuizează
– Control asupra impulsurilor și ideilor

Și am o invitație exclusivă gratuită pentru tine.

Alătură-te aici 👇
${referralLink}`;

  const referralMessageEn = `I've just completed this anti-burnout challenge.

In 7 days I broke the procrastination cycle and built real momentum.

I now have:
– Total clarity on my direction
– An anti-burnout plan across 4 life areas
– Weekly execution system
– Daily routine that doesn't exhaust
– Control over impulses and ideas

And I have a free exclusive invite for you.

Join here 👇
${referralLink}`;

  const referralMessage = language === 'ro' ? referralMessageRo : referralMessageEn;

  const handleShareInvite = () => {
    shareWithMessage(referralMessage);
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(referralMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Updated achievements to match new curriculum
  const achievements = [
    { icon: Target, label: language === 'ro' ? 'Viziune Clară pentru 2026' : 'Clear Vision for 2026', area: 'all' },
    { icon: Briefcase, label: language === 'ro' ? 'Plan Anual + 90 Zile' : 'Yearly Plan + 90 Days', area: 'business' },
    { icon: Zap, label: language === 'ro' ? 'Sistem Execuție Săptămânală' : 'Weekly Execution System', area: 'business' },
    { icon: Brain, label: language === 'ro' ? 'Warrior Routine Configurată' : 'Warrior Routine Configured', area: 'being' },
    { icon: Heart, label: language === 'ro' ? 'Vision AI + Meditație' : 'Vision AI + Meditation', area: 'balance' },
    { icon: Lightbulb, label: language === 'ro' ? 'Control Mental (Idea List)' : 'Mental Control (Idea List)', area: 'business' },
  ];

  const whatYouLose = language === 'ro' ? [
    'Momentum-ul și claritatea construite în 7 zile',
    'Accesul la Warrior Routine anti-burnout',
    'Sistemul Door de execuție săptămânală',
    'Progresul din Stacks de coaching',
    'Jurnalul și rapoartele de progres',
    'Risc de revenire la ciclul burnout-ului'
  ] : [
    'The momentum and clarity built in 7 days',
    'Access to your anti-burnout Warrior Routine',
    'The Door weekly execution system',
    'Progress from coaching Stacks',
    'Journal and progress reports',
    'Risk of falling back into the burnout cycle'
  ];

  const whatYouGet = language === 'ro' ? [
    'Acces complet NELIMITAT la platformă',
    'AI Accountability Coach + Mind Coach',
    'Comunitate VIP Pro Warriors',
    'Sesiune Q&A exclusivă lunară',
    'Napoleon Hill Implementation',
    'Breakthrough Tools & Applied Courses',
    '50% comision referral (prima lună)',
    'Garanție 90 zile satisfacție'
  ] : [
    'UNLIMITED full platform access',
    'AI Accountability Coach + Mind Coach',
    'VIP Pro Warriors community',
    'Monthly exclusive Q&A session',
    'Napoleon Hill Implementation',
    'Breakthrough Tools & Applied Courses',
    '50% one-time referral commission',
    '90-day satisfaction guarantee'
  ];

  return (
    <div className="space-y-8">
      {/* Achievement Summary - Updated with new recap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                🎉 {language === 'ro' ? 'Felicitări! Ai Spart Ciclul Burnout-ului!' : 'Congratulations! You Broke the Burnout Cycle!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ro' 
                  ? `Ai construit momentum real în ${completedDays} zile`
                  : `You built real momentum in ${completedDays} days`
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            {achievements.map((achievement, idx) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background/50 border border-green-500/20"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-xs text-center font-medium">{achievement.label}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Urgency Timer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center animate-pulse">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {language === 'ro' ? '⏰ Ofertă Exclusivă Challenge' : '⏰ Exclusive Challenge Offer'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ro' 
                    ? 'Blochează prețul Early Bird ACUM!'
                    : 'Lock in Early Bird price NOW!'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="bg-foreground text-background px-3 py-2 rounded-lg font-mono text-2xl font-bold">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="bg-foreground text-background px-3 py-2 rounded-lg font-mono text-2xl font-bold">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="bg-foreground text-background px-3 py-2 rounded-lg font-mono text-2xl font-bold">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Loss Aversion Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* What You Lose */}
        <Card className="p-6 border-2 border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-foreground">
              {language === 'ro' ? 'Ce Pierzi Fără Upgrade:' : 'What You Lose Without Upgrade:'}
            </h3>
          </div>
          <ul className="space-y-3">
            {whatYouLose.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* What You Get */}
        <Card className="p-6 border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold text-foreground">
              {language === 'ro' ? 'Ce Primești cu Pro:' : 'What You Get with Pro:'}
            </h3>
          </div>
          <ul className="space-y-3">
            {whatYouGet.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      {/* Main CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/10 via-background to-accent/10 text-center">
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            {language === 'ro' ? '🔥 OFERTĂ EXCLUSIVĂ CHALLENGE' : '🔥 EXCLUSIVE CHALLENGE OFFER'}
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'ro' ? 'Blochează Prețul Early Bird' : 'Lock in Early Bird Price'}
          </h2>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-5xl font-bold text-primary">{proPlan.price}</span>
            <div className="text-left">
              <span className="text-2xl text-muted-foreground line-through">{proPlan.originalPrice}</span>
              <div className="text-sm text-green-500 font-medium">
                {language === 'ro' ? '50% reducere Early Bird' : '50% Early Bird discount'}
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => handleUpgrade('pro')}
            disabled={loadingPlan !== null}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-12 py-6 text-xl font-bold shadow-xl"
          >
            <Crown className="w-6 h-6 mr-2" />
            {loadingPlan === 'pro' 
              ? (language === 'ro' ? 'Se procesează...' : 'Processing...')
              : (language === 'ro' ? 'UPGRADE LA PRO ACUM' : 'UPGRADE TO PRO NOW')
            }
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            {language === 'ro' 
              ? '✅ Garanție 90 zile | ✅ Anulezi oricând | ✅ Suport prioritar'
              : '✅ 90-day guarantee | ✅ Cancel anytime | ✅ Priority support'
            }
          </p>
        </Card>
      </motion.div>

      {/* Final Referral Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Gift className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {language === 'ro' 
                    ? '🎁 Distribuie Momentum-ul' 
                    : '🎁 Share the Momentum'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'ro'
                    ? 'Ai spart ciclul burnout-ului! Trimite o invitație exclusivă prietenilor care au nevoie de același momentum.'
                    : 'You broke the burnout cycle! Send an exclusive invite to friends who need the same momentum.'}
                </p>
              </div>

              <div className="bg-background/50 rounded-lg p-3 border border-amber-500/20">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  {language === 'ro' ? 'Mesajul care va fi trimis:' : 'Message that will be sent:'}
                </p>
                <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-32 overflow-y-auto">
                  {referralMessage}
                </pre>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleShareInvite}
                  disabled={shareLoading || !referralLink}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {language === 'ro' ? 'Trimite Invitația' : 'Send Invite'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyInvite}
                  disabled={!referralLink}
                  className="border-amber-500/30"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      {language === 'ro' ? 'Copiat!' : 'Copied!'}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {language === 'ro' ? 'Copiază' : 'Copy'}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {language === 'ro' 
                    ? 'Invitațiile din Ziua 1 rămân active - acum poți trimite și mesajul final!'
                    : 'Day 1 invites remain active - now you can send the final message too!'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
