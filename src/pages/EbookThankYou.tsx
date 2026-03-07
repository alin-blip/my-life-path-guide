import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { EbookNav } from '@/components/ebook/EbookNav';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, BookOpen, Activity, Users } from 'lucide-react';

const EbookThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const language = location.pathname.includes('thank-you') ? 'en' : 'ro';
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => { document.documentElement.classList.remove('dark'); };
  }, []);

  // Auto-redirect to upsell
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(language === 'ro' ? '/ebook-upsell' : '/ebook-upsell-en');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, language]);

  const t = language === 'ro'
    ? {
        title: 'Mulțumim! Cartea ta e gata.',
        seoTitle: 'Cartea ta e gata de descărcare | CEO Mind OS',
        desc: 'Cartea "De la Burnout la Peak Performance" este gata de descărcare.',
        download: 'Descarcă Cartea PDF',
        redirect: `Vei fi redirecționat în ${countdown} secunde...`,
        steps: [
          { icon: BookOpen, title: 'Citește Prefața', desc: 'Începe cu povestea din spatele sistemului' },
          { icon: Activity, title: 'Completează Testul de Burnout', desc: 'Află exact unde te afli acum' },
          { icon: Users, title: 'Urmărește pe Social', desc: 'Alătură-te comunității de fondatori' },
        ],
      }
    : {
        title: 'Thank you! Your book is ready.',
        seoTitle: 'Your book is ready to download | CEO Mind OS',
        desc: 'The book "From Burnout to Peak Performance" is ready for download.',
        download: 'Download Book PDF',
        redirect: `You'll be redirected in ${countdown} seconds...`,
        steps: [
          { icon: BookOpen, title: 'Read the Preface', desc: 'Start with the story behind the system' },
          { icon: Activity, title: 'Take the Burnout Test', desc: 'Find out exactly where you are now' },
          { icon: Users, title: 'Follow on Social', desc: 'Join the community of founders' },
        ],
      };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Helmet>
        <title>{t.seoTitle}</title>
        <meta name="description" content={t.desc} />
      </Helmet>

      <EbookNav language={language} />

      <section className="py-20 px-6 text-center max-w-3xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-8">
          <Download className="w-10 h-10 text-amber-400" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.title}</h1>

        <a
          href="/ebook-burnout-peak-performance.pdf"
          download
          className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm tracking-wider rounded-lg transition-colors mt-6 mb-4"
        >
          <Download className="w-5 h-5" />
          {t.download}
        </a>

        <p className="text-amber-400/60 text-sm mb-16">{t.redirect}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.steps.map((step, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center">
              <step.icon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">{step.title}</h3>
              <p className="text-white/50 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EbookThankYou;
