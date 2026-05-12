import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { burnoutCategoryLabels, getBurnoutLevel, burnoutRecommendations, BurnoutCategory } from '@/data/burnoutTestQuestions';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUtmMetadata } from '@/hooks/useUtmCapture';

interface BurnoutResultsProps {
  categoryScores: Record<BurnoutCategory, number>;
  totalScore: number;
  language: 'en' | 'ro';
}

export const BurnoutResults: React.FC<BurnoutResultsProps> = ({
  categoryScores,
  totalScore,
  language,
}) => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 12 questions: 3 per category, max 5 points each → 15 per cat, 60 total
  const MAX_PER_CATEGORY = 15;
  const MAX_TOTAL = 60;
  const normalizedTotal = Math.round((totalScore / MAX_TOTAL) * 100);
  const burnoutLevel = getBurnoutLevel(normalizedTotal);

  const radarData = (Object.keys(burnoutCategoryLabels) as BurnoutCategory[]).map((cat) => ({
    category: language === 'en' ? burnoutCategoryLabels[cat].en : burnoutCategoryLabels[cat].ro,
    score: categoryScores[cat] || 0,
    fullMark: MAX_PER_CATEGORY,
  }));

  const weakest = (Object.entries(categoryScores) as [BurnoutCategory, number][])
    .sort((a, b) => a[1] - b[1])[0];
  const weakestCat = weakest?.[0] as BurnoutCategory;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      const utmMeta = getUtmMetadata();

      // Persist scores for the ebook funnel
      try {
        localStorage.setItem('burnout_scores', JSON.stringify({
          totalScore,
          categoryScores,
          level: burnoutLevel.level,
          completedAt: new Date().toISOString(),
        }));
      } catch {/* ignore */}

      // Lead capture
      const { error: leadErr } = await supabase.from('email_leads').insert({
        email: cleanEmail,
        name: cleanName,
        lead_magnet: 'burnout_test',
        source: `burnout_results_${language}`,
        subscribed: true,
        metadata: { ...utmMeta, totalScore, level: burnoutLevel.level },
      });
      if (leadErr && !leadErr.message.includes('duplicate')) {
        console.warn('Lead insert error:', leadErr);
      }

      // Auto-create account (random password — user resets later)
      const tempPassword = crypto.randomUUID().replace(/-/g, '') + 'A1!';
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { error: signUpErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: { display_name: cleanName, source: 'burnout_test' },
        },
      });
      if (signUpErr && !signUpErr.message.toLowerCase().includes('already')) {
        console.warn('Signup warning:', signUpErr.message);
      }

      sessionStorage.setItem('ebook_lead_name', cleanName);
      sessionStorage.setItem('ebook_lead_email', cleanEmail);

      setSubmitted(true);
      // Redirect to paid ebook page
      setTimeout(() => {
        navigate(language === 'en' ? '/ebook-en' : '/ebook');
      }, 800);
    } catch (err) {
      console.error('Burnout result submit error:', err);
      toast.error(language === 'en' ? 'Something went wrong. Try again.' : 'Eroare. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Score Header */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
        <div className="text-6xl mb-4">{burnoutLevel.emoji}</div>
        <div className="text-5xl font-black text-white mb-2">{normalizedTotal}/100</div>
        <div className="text-2xl font-bold mb-3" style={{ color: burnoutLevel.color }}>
          {language === 'en' ? burnoutLevel.level : burnoutLevel.levelRo}
        </div>
        <p className="text-white/70 text-lg">
          {language === 'en' ? burnoutLevel.description : burnoutLevel.descriptionRo}
        </p>
      </div>

      {/* Radar */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white text-center mb-4">
          {language === 'en' ? 'Your Burnout Map' : 'Harta Ta de Burnout'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.15)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }} />
            <Radar name="Score" dataKey="score" stroke={burnoutLevel.color} fill={burnoutLevel.color} fillOpacity={0.3} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(burnoutCategoryLabels) as BurnoutCategory[]).map((cat) => {
          const label = burnoutCategoryLabels[cat];
          const score = categoryScores[cat] || 0;
          const percentage = Math.round((score / MAX_PER_CATEGORY) * 100);
          return (
            <div key={cat} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{label.emoji}</span>
                <span className="text-white font-semibold text-sm">{language === 'en' ? label.en : label.ro}</span>
              </div>
              <div className="text-2xl font-bold text-white">{percentage}%</div>
              <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: label.color }} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {weakestCat && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span>
            {language === 'en'
              ? `Focus Area: ${burnoutCategoryLabels[weakestCat].en}`
              : `Aria de Focus: ${burnoutCategoryLabels[weakestCat].ro}`}
          </h3>
          <div className="space-y-3">
            {burnoutRecommendations[weakestCat][language === 'en' ? 'en' : 'ro'].map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-white/80">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Capture + Signup */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            {language === 'en'
              ? '🚀 Get your full Recovery Plan + free ebook'
              : '🚀 Primește Planul de Recuperare complet + ebook'}
          </h3>
          <p className="text-white/70">
            {language === 'en'
              ? 'We\'ll send your detailed report and the next step to fix your burnout.'
              : 'Îți trimitem raportul detaliat și următorul pas pentru a-ți repara burnout-ul.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === 'en' ? 'Your first name' : 'Prenumele tău'}
            required
            disabled={loading || submitted}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/60 transition-colors"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={language === 'en' ? 'Your email address' : 'Adresa ta de email'}
            required
            disabled={loading || submitted}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/60 transition-colors"
          />
          <Button
            type="submit"
            disabled={loading || submitted}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-base rounded-xl shadow-[0_15px_50px_rgba(251,146,60,0.3)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : submitted ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Redirecting…' : 'Redirecționare…'}
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Send my report + Get the ebook' : 'Trimite raportul + Vreau ebook-ul'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <p className="text-white/40 text-xs text-center flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            {language === 'en' ? 'No spam. Unsubscribe anytime.' : 'Fără spam. Te dezabonezi oricând.'}
          </p>
        </form>
      </div>
    </motion.div>
  );
};
