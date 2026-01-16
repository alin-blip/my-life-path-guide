import { Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSectionNew } from "@/components/landing/ProblemSectionNew";
import { Core4SectionNew } from "@/components/landing/Core4SectionNew";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesShowcase } from "@/components/landing/FeaturesShowcase";
import { SocialProofNew } from "@/components/landing/SocialProofNew";
import { ValueStackPricing } from "@/components/landing/ValueStackPricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  // Force light theme on index page
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    root.classList.remove('dark');
    root.classList.add('light');
    
    return () => {
      root.classList.remove('light');
      if (previousTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="light min-h-screen bg-background">
      <Helmet>
        <title>{t('indexMetaTitle')}</title>
        <meta name="description" content={t('indexMetaDescription')} />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      {/* Language Selector */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <LanguageSelector />
      </div>

      <div className="container mx-auto px-4">
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Problem */}
        <ProblemSectionNew />

        {/* Section 3: Solution - 4 Pillars */}
        <Core4SectionNew />

        {/* Section 4: How It Works (3 Steps) */}
        <HowItWorks />

        {/* Section 5: Features Showcase */}
        <FeaturesShowcase />

        {/* Section 6: Social Proof */}
        <SocialProofNew />

        {/* Section 7: Pricing */}
        <div id="pricing">
          <ValueStackPricing />
        </div>

        {/* Final CTA */}
        <FinalCTA />

        {/* Footer */}
        <footer className="py-8 mt-8 border-t border-border">
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            <Link to="/pricing" className="hover:text-primary transition-colors">
              {t('footerPricing')}
            </Link>
            <span className="text-border">|</span>
            <Link to="/terms" className="hover:text-primary transition-colors">
              {t('footerTerms')}
            </Link>
            <span className="text-border">|</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              {t('footerPrivacy')}
            </Link>
            <span className="text-border">|</span>
            <Link to="/support" className="hover:text-primary transition-colors">
              {t('footerSupport')}
            </Link>
            <span className="text-border">|</span>
            <Link to="/auth" className="hover:text-primary transition-colors">
              {t('footerLogin')}
            </Link>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} WarriorOS. {t('footerAllRightsReserved')}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
