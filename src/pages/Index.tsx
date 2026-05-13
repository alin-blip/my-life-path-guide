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
  const { t, language } = useLanguage();

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

  const siteUrl = "https://ceomindos.com";
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CEO Mind OS",
    url: siteUrl,
    inLanguage: language === 'ro' ? 'ro-RO' : 'en-US',
    publisher: { "@type": "Organization", name: "CEO Mind OS", url: siteUrl }
  };

  const faqs = language === 'ro' ? [
    { q: 'Ce este CEO Mind OS exact?', a: 'CEO Mind OS este primul sistem de operare pentru fondatori, cu 4 piloni (Warrior Routine, The Door, The Stack, AI Coaches) care lucrează împreună pentru a-ți face upgrade la nivel de identitate.' },
    { q: 'Este un curs online sau o aplicație?', a: 'Niciuna în mod tradițional. CEO Mind OS este o platformă interactivă care combină rutine zilnice, planificare săptămânală, protocoale emoționale și coaching AI într-un singur loc.' },
    { q: 'Cât timp durează să văd rezultate?', a: 'Majoritatea utilizatorilor raportează claritate și energie crescută în primele 48 de ore. Rezultate semnificative în 2-3 săptămâni de utilizare constantă.' },
    { q: 'Pot anula oricând?', a: 'Da. Poți anula abonamentul oricând, fără penalități. Oferim garanție completă de 90 de zile cu rambursare 100%.' },
    { q: 'Ce include Challenge-ul gratuit de 7 zile?', a: 'Acces la Warrior Routine, primele protocoale Stack și ghidare pas cu pas pentru fiecare zi.' },
    { q: 'Funcționează pentru orice tip de business?', a: 'Da. E conceput pentru fondatori, freelanceri și coach-i care vor să scaleze fără să sacrifice sănătatea sau relațiile, indiferent de industrie.' },
  ] : [
    { q: 'What is CEO Mind OS exactly?', a: "CEO Mind OS is the first operating system for founders with 4 pillars (Warrior Routine, The Door, The Stack, AI Coaches) working together to upgrade you at identity level." },
    { q: 'Is it an online course or an app?', a: "Neither in the traditional sense. It's an interactive platform combining daily routines, weekly planning, emotional protocols and AI coaching in one place." },
    { q: 'How long until I see results?', a: 'Most users report clarity and increased energy in the first 48 hours. Significant results in 2-3 weeks of consistent use.' },
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime, no penalties. We offer a full 90-day 100% refund guarantee.' },
    { q: 'What does the free 7-day Challenge include?', a: 'Access to Warrior Routine, first Stack protocols and step-by-step daily guidance.' },
    { q: 'Does it work for any type of business?', a: 'Yes. Built for founders, freelancers and coaches who want to scale without sacrificing health or relationships, in any industry.' },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a }
    }))
  };

  return (
    <div className="light min-h-screen bg-background relative overflow-y-auto">
      <Helmet>
        <title>{t('indexMetaTitle')}</title>
        <meta name="description" content={t('indexMetaDescription')} />
        <link rel="canonical" href={`${siteUrl}/`} />
        <meta property="og:title" content={t('indexMetaTitle')} />
        <meta property="og:description" content={t('indexMetaDescription')} />
        <meta property="og:url" content={`${siteUrl}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
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
