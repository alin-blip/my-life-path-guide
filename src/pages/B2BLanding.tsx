import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { B2BHero } from "@/components/b2b/B2BHero";
import { B2BValueStack } from "@/components/b2b/B2BValueStack";
import { B2BHowItWorks } from "@/components/b2b/B2BHowItWorks";
import { B2BToolsShowcase } from "@/components/b2b/B2BToolsShowcase";
import { B2BRevenueCalculator } from "@/components/b2b/B2BRevenueCalculator";
import { B2BFAQ } from "@/components/b2b/B2BFAQ";
import { B2BCta } from "@/components/b2b/B2BCta";
import { NewFooter } from "@/components/landing/NewFooter";

const B2BLanding = () => {
  const { language } = useLanguage();

  // Force dark theme on B2B page
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    root.classList.remove('light');
    root.classList.add('dark');
    
    return () => {
      root.classList.remove('dark');
      if (previousTheme === 'light') {
        root.classList.add('light');
      }
    };
  }, []);

  return (
    <div className="dark min-h-screen bg-background relative overflow-y-auto">
      <Helmet>
        <title>{language === 'ro' ? 'Partner Coach — Scalează-ți Practica de Coaching' : 'Partner Coach — Scale Your Coaching Practice'}</title>
        <meta name="description" content={language === 'ro' 
          ? 'Câștigă 50% comision recurent oferind clienților tăi un sistem complet de transformare alimentat de AI.'
          : 'Earn 50% recurring commission by giving your clients a complete AI-powered transformation system.'} />
      </Helmet>

      {/* Language Selector */}
      <div className="fixed top-4 right-6 z-[60]">
        <LanguageSelector />
      </div>

      <B2BHero />
      <B2BValueStack />
      <B2BHowItWorks />
      <B2BToolsShowcase />
      <B2BRevenueCalculator />
      <B2BFAQ />
      <B2BCta />
      <NewFooter />
    </div>
  );
};

export default B2BLanding;
