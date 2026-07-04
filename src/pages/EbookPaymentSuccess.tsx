import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { EbookNav } from '@/components/ebook/EbookNav';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, BookOpen, Headphones, Target, Users, Download } from 'lucide-react';
import { DOWNLOADS } from '@/lib/downloadLinks';

const EbookPaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const language = location.pathname.includes('payment-success') ? 'en' : 'ro';

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => { document.documentElement.classList.remove('dark'); };
  }, []);

  // Auto-redirect to upsell after 8s
  useEffect(() => {
    const upsellPath = language === 'en' ? '/ebook-upsell-en' : '/ebook-upsell';
    const timer = setTimeout(() => navigate(upsellPath), 8000);
    return () => clearTimeout(timer);
  }, [language, navigate]);

  const t = language === 'ro'
    ? {
        seoTitle: 'Plata Confirmată — CEO Mind OS',
        h1: 'Plata a fost confirmată!',
        sub: 'Ai acum acces complet la Pachetul Accelerator',
        cta: 'Deschide Challenge-ul 90 de Zile',
        cards: [
          { icon: BookOpen, title: 'Cartea PDF', desc: 'Descarcă din email sau din contul tău' },
          { icon: Headphones, title: 'Audiobook', desc: 'Ascultă cartea cu vocea autorului' },
          { icon: Target, title: 'Challenge 90 de Zile', desc: 'Ghid de implementare pas cu pas' },
          { icon: Users, title: 'Comunitate + Template-uri', desc: 'Acces 30 zile + worksheet-uri' },
        ],
      }
    : {
        seoTitle: 'Payment Confirmed — CEO Mind OS',
        h1: 'Payment confirmed!',
        sub: 'You now have full access to the Accelerator Package',
        cta: 'Open the 90-Day Challenge',
        cards: [
          { icon: BookOpen, title: 'Book PDF', desc: 'Download from email or your account' },
          { icon: Headphones, title: 'Audiobook', desc: 'Listen to the book in the author\'s voice' },
          { icon: Target, title: '90-Day Challenge', desc: 'Step-by-step implementation guide' },
          { icon: Users, title: 'Community + Templates', desc: '30-day access + worksheets' },
        ],
      };

  return (
    <div className="min-h-screen bg-[#10172d] text-white">
      <Helmet>
        <title>{t.seoTitle}</title>
      </Helmet>

      <EbookNav language={language} />

      <section className="py-20 px-6 text-center max-w-3xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-amber-400" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t.h1}</h1>
        <p className="text-amber-400/80 italic mb-12">{t.sub}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {t.cards.map((card, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center">
              <card.icon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">{card.title}</h3>
              <p className="text-white/70 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href={DOWNLOADS[language].ebookPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm tracking-wider rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            {language === 'ro' ? 'Descarcă Cartea (PDF)' : 'Download Book (PDF)'}
          </a>
          <a
            href={DOWNLOADS[language].audiobookMp3}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm tracking-wider rounded-lg transition-colors border border-white/20"
          >
            <Headphones className="w-5 h-5" />
            {language === 'ro' ? 'Descarcă Audiobook (MP3)' : 'Download Audiobook (MP3)'}
          </a>
        </div>

        <button
          onClick={() => navigate(language === 'en' ? '/ebook-upsell-en' : '/ebook-upsell')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm tracking-wider rounded-lg transition-colors"
        >
          {language === 'ro' ? 'Continuă spre Challenge ▶' : 'Continue to Challenge ▶'}
        </button>
        <p className="text-white/70 text-xs mt-3">
          {language === 'ro' ? 'Te redirecționăm automat în 8 secunde…' : 'Redirecting automatically in 8 seconds…'}
        </p>
      </section>
    </div>
  );
};

export default EbookPaymentSuccess;
