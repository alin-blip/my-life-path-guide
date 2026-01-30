import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

// New n8n-inspired components
import { StickyHeader } from "@/components/landing/StickyHeader";
import { NewHeroSection } from "@/components/landing/NewHeroSection";
import { LogoCloud } from "@/components/landing/LogoCloud";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { InteractiveTimeline } from "@/components/landing/InteractiveTimeline";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { PricingComparison } from "@/components/landing/PricingComparison";
import { FAQSection } from "@/components/landing/FAQSection";
import { NewFooter } from "@/components/landing/NewFooter";
import { SalesCoachWidget } from "@/components/landing/SalesCoachWidget";

const Index = () => {
  const { t } = useLanguage();
  const [pendingSalesMessage, setPendingSalesMessage] = useState<string | null>(null);
  const [isSalesCoachOpen, setIsSalesCoachOpen] = useState(false);

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

  const handleAskQuestion = (question: string) => {
    setPendingSalesMessage(question);
    setIsSalesCoachOpen(true);
  };

  const handleOpenChat = () => {
    setIsSalesCoachOpen(true);
  };

  const handleMessageProcessed = () => {
    setPendingSalesMessage(null);
  };

  return (
    <div className="light min-h-screen bg-background">
      <Helmet>
        <title>{t('indexMetaTitle')}</title>
        <meta name="description" content={t('indexMetaDescription')} />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      {/* Language Selector - above sticky header */}
      <div className="fixed top-4 right-20 md:top-6 md:right-24 z-[60]">
        <LanguageSelector />
      </div>

      {/* Sticky Header */}
      <StickyHeader />

      {/* Hero Section */}
      <NewHeroSection 
        onAskQuestion={handleAskQuestion}
        onOpenChat={handleOpenChat}
      />

      {/* Feature Showcase - Tot ce ai nevoie pentru transformare */}
      <FeatureShowcase />

      {/* Logo Cloud / Stats */}
      <LogoCloud />

      {/* How It Works Timeline */}
      <InteractiveTimeline />

      {/* Testimonials Carousel */}
      <TestimonialCarousel />

      {/* Pricing Comparison */}
      <PricingComparison />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <NewFooter />

      {/* Sales Coach Widget */}
      <SalesCoachWidget 
        pendingMessage={pendingSalesMessage}
        onMessageProcessed={handleMessageProcessed}
        isOpen={isSalesCoachOpen}
        onOpenChange={setIsSalesCoachOpen}
      />
    </div>
  );
};

export default Index;

