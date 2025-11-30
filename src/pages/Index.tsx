import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Helmet } from "react-helmet-async";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SegmentQuiz } from "@/components/landing/SegmentQuiz";
import { InteractiveROI } from "@/components/landing/InteractiveROI";
import { UniqueMechanismSection } from "@/components/landing/UniqueMechanismSection";
import { HowItWorksTimeline } from "@/components/landing/HowItWorksTimeline";
import { CurriculumSection } from "@/components/landing/CurriculumSection";
import { ProofSection } from "@/components/landing/ProofSection";
import { ForWhomSection } from "@/components/landing/ForWhomSection";
import { FounderSection } from "@/components/landing/FounderSection";
import { ValueStackPricing } from "@/components/landing/ValueStackPricing";
import { UrgencySection } from "@/components/landing/UrgencySection";
import { ObjectionHandling } from "@/components/landing/ObjectionHandling";
import { FinalCTA } from "@/components/landing/FinalCTA";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-blue-50/20">
      <Helmet>
        <title>RoWarrior — Antreprenori €500k-€10M+: +15-30% Profit în 90 Zile</title>
        <meta name="description" content="Sistem de War Planning pentru antreprenori români de 6-8 cifre. Reduci 80% din task-uri și crești profitul cu 15-30% în 90 de zile. Trial gratuit 3 zile." />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSelector />
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section - Emotional + Direct */}
        <div className="text-center mb-16" id="top">
          <div className="inline-flex items-center justify-center mb-6">
            <img
              src="/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png"
              alt="RoWarrior logo"
              loading="lazy"
              className="h-16 md:h-20 w-auto drop-shadow"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Lucrezi 60h/săptămână...<br />
            Dar business-ul nu crește?
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto">
            Sistemul de <span className="text-primary font-bold">War Planning</span> care transformă antreprenori 
            blocați în task-uri în CEO-uri strategici care cresc profitul cu 15-30% în 90 de zile
          </p>

          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            <span className="text-accent font-bold">1 obiectiv domino săptămânal</span> + 
            <span className="text-accent font-bold"> 1-3 task-uri high-ROI zilnice</span> + 
            <span className="text-accent font-bold"> Coaching AI tip Hormozi</span> = 
            Clarity, Execuție, Rezultate
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-12 py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Începe Trial de 3 Zile — Vezi Primele Rezultate în 48h
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="border-primary text-primary hover:bg-primary hover:text-white px-12 py-6 text-xl font-semibold shadow transition-all"
            >
              Vezi Pricing & ROI
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-accent font-bold text-lg">✓</span>
              <span className="font-medium">150+ antreprenori români</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent font-bold text-lg">✓</span>
              <span className="font-medium">Medie +22% profit în Q1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent font-bold text-lg">✓</span>
              <span className="font-medium">Trial 3 zile gratuit</span>
            </div>
          </div>
        </div>

        {/* Segment Quiz */}
        <SegmentQuiz />

        {/* Problem Section */}
        <ProblemSection />

        {/* Interactive ROI Calculator */}
        <InteractiveROI />

        {/* Unique Mechanism */}
        <UniqueMechanismSection />

        {/* Curriculum Section - Replace Timeline */}
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
            <span className="text-sm text-muted-foreground">
              Ai deja cont?
            </span>
            <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link to="/auth">Autentificare</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;