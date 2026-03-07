import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import heroLanding from '@/assets/ebook/hero_landing.webp';

interface EbookHeroProps {
  language: 'ro' | 'en';
}

export const EbookHero: React.FC<EbookHeroProps> = ({ language }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const t = language === 'ro'
    ? {
        badge: 'CEO MIND OS — PRIMUL SISTEM DE OPERARE PENTRU FONDATORI',
        h1a: 'Afacerea ta are un ',
        h1b: 'sistem de operare.',
        h1c: 'Tu nu.',
        desc: 'Descarcă GRATUIT cartea care îți arată cum să instalezi primul tău Sistem de Operare personal — și să treci de la burnout la peak performance în 90 de zile.',
        namePh: 'Prenumele tău',
        emailPh: 'Adresa ta de email',
        cta: 'INSTALEAZĂ-ȚI NOUL OS',
        spam: 'Fără spam. Fără bullshit. Doar sistemul care funcționează.',
        thankYou: '/ebook-multumesc',
      }
    : {
        badge: 'CEO MIND OS — THE FIRST OPERATING SYSTEM FOR FOUNDERS',
        h1a: 'Your business has an ',
        h1b: 'operating system.',
        h1c: 'You don\'t.',
        desc: 'Download FREE the book that shows you how to install your first Personal Operating System — and go from burnout to peak performance in 90 days.',
        namePh: 'Your first name',
        emailPh: 'Your email address',
        cta: 'INSTALL YOUR NEW OS',
        spam: 'No spam. No BS. Just the system that works.',
        thankYou: '/ebook-thank-you',
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('email_leads').insert({
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        lead_magnet: 'ebook_burnout',
        source: `ebook_landing_${language}`,
        subscribed: true,
      });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      navigate(t.thankYou);
    } catch (err) {
      console.error('Lead capture error:', err);
      toast.error(language === 'ro' ? 'Eroare. Încearcă din nou.' : 'Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div>
          <p className="text-xs tracking-[0.2em] text-amber-400/80 uppercase mb-6">{t.badge}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t.h1a}
            <em className="italic text-amber-400">{t.h1b}</em>
            <br />{t.h1c}
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-lg">{t.desc}</p>

          <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePh}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPh}
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t.cta}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <p className="text-white/30 text-xs mt-3">{t.spam}</p>
        </div>

        {/* Right - Book image */}
        <div className="flex justify-center lg:justify-end">
          <img
            src={heroLanding}
            alt="CEO Mind OS — De la Burnout la Peak Performance și Echilibru"
            className="w-full max-w-lg rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};
