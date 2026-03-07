import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { EbookNav } from '@/components/ebook/EbookNav';
import { EbookHero } from '@/components/ebook/EbookHero';
import { EbookContent } from '@/components/ebook/EbookContent';
import { EbookTestimonials } from '@/components/ebook/EbookTestimonials';
import { useLocation } from 'react-router-dom';

const EbookLanding = () => {
  const location = useLocation();
  const language = location.pathname.includes('-en') ? 'en' : 'ro';

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => { document.documentElement.classList.remove('dark'); };
  }, []);

  const seo = language === 'ro'
    ? {
        title: 'De la Burnout la Peak Performance — Ebook GRATUIT | CEO Mind OS',
        desc: 'Descarcă GRATUIT cartea care îți arată cum să instalezi primul tău Sistem de Operare personal și să treci de la burnout la peak performance în 90 de zile.',
      }
    : {
        title: 'From Burnout to Peak Performance — FREE Ebook | CEO Mind OS',
        desc: 'Download FREE the book that shows you how to install your first Personal Operating System and go from burnout to peak performance in 90 days.',
      };

  const ctaText = language === 'ro'
    ? { title: 'Descarcă GRATUIT cartea acum.', sub: 'Primul pas spre instalarea noului tău sistem de operare.', cta: 'Instalează-ți noul OS' }
    : { title: 'Download the FREE book now.', sub: 'The first step towards installing your new operating system.', cta: 'Install your new OS' };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.desc} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.desc} />
        <meta property="og:type" content="book" />
      </Helmet>

      <EbookNav language={language} />
      <EbookHero language={language} />
      <EbookContent language={language} />
      <EbookTestimonials language={language} />

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{ctaText.title}</h2>
        <p className="text-white/50 mb-8">{ctaText.sub}</p>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm tracking-wider rounded-lg transition-colors"
        >
          {ctaText.cta}
        </a>
      </section>
    </div>
  );
};

export default EbookLanding;
