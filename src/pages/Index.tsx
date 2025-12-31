import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { PitSection } from "@/components/landing/PitSection";
import { SegmentQuiz } from "@/components/landing/SegmentQuiz";
import { InteractiveROI } from "@/components/landing/InteractiveROI";
import { UniqueMechanismSection } from "@/components/landing/UniqueMechanismSection";
import { Core4Section } from "@/components/landing/Core4Section";
import { CurriculumSection } from "@/components/landing/CurriculumSection";
import { ProofSection } from "@/components/landing/ProofSection";
import { ForWhomSection } from "@/components/landing/ForWhomSection";
import { FounderSection } from "@/components/landing/FounderSection";
import { ValueStackPricing } from "@/components/landing/ValueStackPricing";
import { UrgencySection } from "@/components/landing/UrgencySection";
import { ObjectionHandling } from "@/components/landing/ObjectionHandling";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const { t, language } = useLanguage();

  // Forțează tema light permanent pe pagina index
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Forțează tema light
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Restaurează tema originală la unmount
    return () => {
      root.classList.remove('light');
      if (previousTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="light min-h-screen bg-white">
      <Helmet>
        <title>LifeOS — Success Without Sacrifice: AI-Powered Life Operating System for Entrepreneurs</title>
        <meta name="description" content="LifeOS is the AI-powered Life Operating System that helps entrepreneurs grow their business WITHOUT losing their health, relationships, or peace of mind. 65,000+ achievers in 40+ countries." />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      {/* Language Selector */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <LanguageSelector />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section - Emotional + Direct */}
        <div className="text-center mb-12 md:mb-16 py-8 md:py-12 -mx-4 px-4 bg-gradient-to-b from-blue-50/40 via-white to-white rounded-3xl" id="top">
          <div className="inline-flex items-center justify-center mb-4 md:mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <img
              src="/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png"
              alt="LifeOS logo"
              loading="lazy"
              className="h-12 md:h-20 w-auto drop-shadow"
            />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 md:mb-6 leading-tight animate-fade-in px-2" style={{ animationDelay: '0.2s' }}>
            <span dangerouslySetInnerHTML={{ __html: t('landingHeroTitle').replace('<span>', '<span class="text-primary">').replace('</span>', '</span>') }} />
            <br />
            {t('landingHeroTitlePart2')}
          </h1>
          
          <p className="text-base sm:text-lg md:text-2xl text-slate-700 mb-3 md:mb-4 max-w-4xl mx-auto leading-relaxed animate-fade-in px-2" style={{ animationDelay: '0.3s' }}>
            <span dangerouslySetInnerHTML={{ 
              __html: t('landingHeroDesc')
                .replace(/<span>/g, '<span class="text-primary font-bold">')
                .replace(/<\/span>/g, '</span>')
            }} />
          </p>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 md:mb-8 max-w-3xl mx-auto animate-fade-in px-2" style={{ animationDelay: '0.4s' }}>
            <span dangerouslySetInnerHTML={{ 
              __html: t('landingHeroTrusted')
                .replace(/<span>/g, '<span class="text-primary font-semibold">')
                .replace(/<\/span>/g, '</span>')
            }} />
          </p>
          
          <div className="flex flex-col gap-3 sm:gap-4 justify-center mb-6 md:mb-8 animate-fade-in px-2" style={{ animationDelay: '0.5s' }}>
            <Button 
              size="lg" 
              onClick={() => navigate('/vision-2026')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 sm:px-8 md:px-12 py-4 md:py-6 text-base sm:text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto sm:mx-auto animate-pulse-subtle"
            >
              🎯 {language === 'ro' ? 'Planifică-ți 2026 GRATUIT' : 'Plan Your 2026 FREE'}
            </Button>

            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-6 sm:px-8 md:px-12 py-4 md:py-6 text-base sm:text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto sm:mx-auto"
            >
              {t('landingStartTrial')}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="border-primary text-primary hover:bg-primary hover:text-white px-6 sm:px-8 md:px-12 py-4 md:py-6 text-base sm:text-lg md:text-xl font-semibold shadow transition-all w-full sm:w-auto sm:mx-auto"
            >
              {t('landingSeePricing')}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8 text-slate-600 animate-fade-in text-sm sm:text-base" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-base md:text-lg">✓</span>
              <span className="font-medium">{t('landingTransformIn4Areas')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-base md:text-lg">✓</span>
              <span className="font-medium">{t('landingCompleteLifeSystem')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-base md:text-lg">✓</span>
              <span className="font-medium">{t('landing3DayFreeTrial')}</span>
            </div>
          </div>

          {/* Hero Video */}
          <div className="mt-8 md:mt-12 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div 
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-300/50 border-4 border-white/80 hover:shadow-3xl transition-shadow duration-500 cursor-pointer group"
              onClick={() => setVideoPlaying(true)}
            >
              {/* Video Thumbnail with Play Overlay */}
              {!videoPlaying && (
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-center justify-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 group-hover:shadow-primary/60 transition-all duration-300">
                    <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1" />
                  </div>
                </div>
              )}
              
              <div className="aspect-video">
                {videoPlaying ? (
                  <iframe
                    src="https://www.youtube.com/embed/sfuey_WNODs?rel=0&modestbranding=1&autoplay=1"
                    title="LifeOS - Success Without Sacrifice"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <img 
                    src="https://img.youtube.com/vi/sfuey_WNODs/maxresdefault.jpg"
                    alt="LifeOS Video Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4 text-center">
              {t('landingVideoCaption')}
            </p>
          </div>
        </div>

        {/* Segment Quiz */}
        <SegmentQuiz />

        {/* Pit Section - "Ești În Groapă?" */}
        <PitSection />

        {/* Core 4 Areas */}
        <Core4Section />

        {/* Unique Mechanism - 5 Protocoale */}
        <UniqueMechanismSection />

        {/* Interactive ROI Calculator */}
        <InteractiveROI />

        {/* Curriculum Section - 3 Faze */}
        <CurriculumSection />

        {/* Proof & Testimonials */}
        <ProofSection />

        {/* For Whom Section */}
        <ForWhomSection />

        {/* Founder Story */}
        <FounderSection />

        {/* Urgency Section */}
        <UrgencySection />

        {/* Value Stack Pricing */}
        <ValueStackPricing />

        {/* Objection Handling */}
        <ObjectionHandling />

        {/* Final CTA */}
        <FinalCTA />

        {/* Login Link */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {t('landingAlreadyHaveAccount')}
            </span>
            <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link to="/auth">{t('landingAuthenticate')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;