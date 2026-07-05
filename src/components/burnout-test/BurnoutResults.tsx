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
    if (!email.trim()) return;
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      const utmMeta = getUtmMetadata();

      // Persist scores for the ebook funnel
      try {
        localStorage.setItem('burnout_scores', JSON.stringify({
          totalScore: normalizedTotal,
          rawScore: totalScore,
          categoryScores,
          level: burnoutLevel.level,
          completedAt: new Date().toISOString(),
        }));
      } catch {/* ignore */}

      // Lead capture
      const { error: leadErr } = await supabase.from('email_leads').insert({
        email: cleanEmail,
        name: cleanName || null,
        lead_magnet: 'burnout_test',
        source: `burnout_results_${language}`,
        subscribed: true,
        metadata: { ...utmMeta, language, totalScore: normalizedTotal, rawScore: totalScore, level: burnoutLevel.level, categoryScores },
      });
      if (leadErr && !leadErr.message.includes('duplicate')) {
        console.warn('Lead insert error:', leadErr);
      }

      // Send results email (fire-and-forget)
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'burnout-results',
          recipientEmail: cleanEmail,
          idempotencyKey: `burnout-results-${cleanEmail}`,
          templateData: {
            name: cleanName || undefined,
            language,
            totalScore: normalizedTotal,
            bodyScore: Math.round((categoryScores as any).body ?? (categoryScores as any).Body ?? 0),
            beingScore: Math.round((categoryScores as any).being ?? (categoryScores as any).Being ?? 0),
            balanceScore: Math.round((categoryScores as any).balance ?? (categoryScores as any).Balance ?? 0),
            businessScore: Math.round((categoryScores as any).business ?? (categoryScores as any).Business ?? 0),
          },
        },
      }).catch(err => console.warn('Results email send failed:', err));

      // Persist for /ebook prefill (no account created here — that happens at challenge purchase)
      try {
        localStorage.setItem('ebook_lead_email', cleanEmail);
        if (cleanName) localStorage.setItem('ebook_lead_name', cleanName);
        // Keep sessionStorage too for backward compatibility
        sessionStorage.setItem('ebook_lead_email', cleanEmail);
        if (cleanName) sessionStorage.setItem('ebook_lead_name', cleanName);
      } catch {/* ignore */}

      setSubmitted(true);
      // Redirect to 7-day challenge landing
      setTimeout(() => {
        navigate(language === 'en' ? '/challenge-en?source=burnout-test' : '/challenge-7-zile?source=burnout-test');
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

      {/* Email Capture + Challenge CTA */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-400/30 rounded-3xl p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Visual */}
          <div className="flex justify-center order-1 md:order-1">
            <div className="w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-400/30 flex flex-col items-center justify-center p-8 text-center">
              <div className="text-7xl mb-3">🔥</div>
              <div className="text-white font-black text-3xl mb-1">7 ZILE</div>
              <div className="text-emerald-300 font-bold text-sm uppercase tracking-widest">Challenge</div>
              <div className="text-white/70 text-xs mt-4">
                {language === 'en' ? '15 min/day · Free' : '15 min/zi · Gratuit'}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="order-2 md:order-2">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {language === 'en'
                ? '🚀 Get your Recovery Plan + Start the Free Challenge'
                : '🚀 Primește Planul de Recuperare + Intră în Challenge-ul Gratuit'}
            </h3>
            <p className="text-white/70 mb-5 text-sm">
              {language === 'en'
                ? 'Detailed report by email + free 7-day Challenge to rebuild your focus, energy and clarity — 15 minutes a day.'
                : 'Raport detaliat pe email + Challenge-ul GRATUIT de 7 zile pentru a-ți reconstrui focusul, energia și claritatea — 15 minute pe zi.'}
            </p>


            <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === 'en' ? 'Your first name (optional)' : 'Prenumele tău (opțional)'}
            disabled={loading || submitted}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/70 focus:outline-none focus:border-amber-400/60 transition-colors"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={language === 'en' ? 'Your email address' : 'Adresa ta de email'}
            required
            disabled={loading || submitted}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/70 focus:outline-none focus:border-amber-400/60 transition-colors"
          />
          <Button
            type="submit"
            disabled={loading || submitted}
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-base rounded-xl shadow-[0_15px_50px_rgba(16,185,129,0.35)]"
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
                {language === 'en' ? 'Send my report + Start the 7-Day Challenge' : 'Trimite raportul + Intră în Challenge 7 Zile'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

              <p className="text-white/70 text-xs text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                {language === 'en' ? 'No spam. Unsubscribe anytime.' : 'Fără spam. Te dezabonezi oricând.'}
              </p>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
