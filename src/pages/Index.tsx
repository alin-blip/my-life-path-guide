import { Helmet } from "react-helmet-async";
import { useEffect, lazy, Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

// Above the fold - eager loaded
import { StickyHeader } from "@/components/landing/StickyHeader";
import { NewHeroSection } from "@/components/landing/NewHeroSection";

// Below the fold - lazy loaded
const LogoCloud = lazy(() => import("@/components/landing/LogoCloud").then(m => ({ default: m.LogoCloud })));
const ProblemSectionNew = lazy(() => import("@/components/landing/ProblemSectionNew").then(m => ({ default: m.ProblemSectionNew })));
const MethodologySection = lazy(() => import("@/components/landing/MethodologySection").then(m => ({ default: m.MethodologySection })));
const FounderSectionNew = lazy(() => import("@/components/landing/FounderSectionNew").then(m => ({ default: m.FounderSectionNew })));
const TargetAudienceSection = lazy(() => import("@/components/landing/TargetAudienceSection").then(m => ({ default: m.TargetAudienceSection })));
const ComparisonSection = lazy(() => import("@/components/landing/ComparisonSection").then(m => ({ default: m.ComparisonSection })));
const TestimonialCarousel = lazy(() => import("@/components/landing/TestimonialCarousel").then(m => ({ default: m.TestimonialCarousel })));
const InlineCTA = lazy(() => import("@/components/landing/InlineCTA").then(m => ({ default: m.InlineCTA })));
const GuaranteeSection = lazy(() => import("@/components/landing/GuaranteeSection").then(m => ({ default: m.GuaranteeSection })));
const PricingComparison = lazy(() => import("@/components/landing/PricingComparison").then(m => ({ default: m.PricingComparison })));
const FeatureShowcase = lazy(() => import("@/components/landing/FeatureShowcase").then(m => ({ default: m.FeatureShowcase })));
const FAQSection = lazy(() => import("@/components/landing/FAQSection").then(m => ({ default: m.FAQSection })));
const NewFooter = lazy(() => import("@/components/landing/NewFooter").then(m => ({ default: m.NewFooter })));

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
    <div className="light min-h-screen bg-background relative overflow-y-auto">
      <Helmet>
        <title>{t('indexMetaTitle')}</title>
        <meta name="description" content={t('indexMetaDescription')} />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      {/* Language Selector */}
      <div className="fixed top-4 right-20 md:top-6 md:right-24 z-[60]">
        <LanguageSelector />
      </div>

      <StickyHeader />
      <NewHeroSection />

      <Suspense fallback={<div className="min-h-[200px]" />}>
        <LogoCloud />
        <ProblemSectionNew />
        <InlineCTA headlineRo="Ai recunoscut problema? Instalează soluția." headlineEn="Recognized the problem? Install the solution." />
        <FeatureShowcase />
        <MethodologySection />
        <FounderSectionNew />
        <TargetAudienceSection />
        <ComparisonSection />
        <InlineCTA headlineRo="Alege partea cu rezultate." headlineEn="Choose the side with results." />
        <GuaranteeSection />
        <TestimonialCarousel />
        <PricingComparison />
        <FAQSection />
        <NewFooter />
      </Suspense>
    </div>
  );
};

export default Index;
