import React from 'react';


interface EbookNavProps {
  language: 'ro' | 'en';
}

export const EbookNav: React.FC<EbookNavProps> = ({ language }) => {
  const tagline = language === 'ro' 
    ? 'PRIMUL SISTEM DE OPERARE PENTRU FONDATORI' 
    : 'THE FIRST OPERATING SYSTEM FOR FOUNDERS';

  return (
    <nav className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <img src="/images/ebook/logo_main.png" alt="CEO Mind OS" className="h-8 w-8" />
        <span className="text-white font-bold text-lg tracking-tight">
          CEO <span className="text-amber-400">Mind</span> OS
        </span>
      </div>
      <span className="hidden md:block text-xs tracking-[0.2em] text-white/40 uppercase">
        {tagline}
      </span>
    </nav>
  );
};
