import React from 'react';
import { Link } from 'react-router-dom';

interface EbookNavProps {
  language: 'ro' | 'en';
}

export const EbookNav: React.FC<EbookNavProps> = ({ language }) => {
  const tagline = language === 'ro'
    ? 'PRIMUL SISTEM DE OPERARE PENTRU FONDATORI'
    : 'THE FIRST OPERATING SYSTEM FOR FOUNDERS';
  const testHref = language === 'ro' ? '/burnout-test' : '/burnout-test-en';
  const testLabel = language === 'ro' ? 'Fă testul gratuit' : 'Take the free test';

  return (
    <nav className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-[#10172d]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <img src="/images/ebook/logo_main.png" alt="CEO Mind OS" className="h-8 w-8" />
        <span className="text-white font-bold text-lg tracking-tight">
          CEO <span className="text-amber-400">Mind</span> OS
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden lg:block text-xs tracking-[0.2em] text-white/70 uppercase">
          {tagline}
        </span>
        <Link
          to={testHref}
          className="text-xs md:text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap"
        >
          {testLabel} →
        </Link>
      </div>
    </nav>
  );
};
