import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const ValueStackPricing = () => {
  const navigate = useNavigate();
  const { elementRef, isVisible } = useScrollAnimation();
  const { language } = useLanguage();

  const texts = {
    title: language === 'en' 
      ? "What Are You Losing Without WarriorOS?" 
      : "Ce Pierzi în Viață Fără WarriorOS?",
    subtitle: language === 'en'
      ? "It's not just about money. You're losing health, relationships, clarity, and prosperity. The real cost? Impossible to calculate."
      : "Nu e doar despre bani. Pierzi sănătate, relații, claritate spirituală și prosperitate. Costul real? Imposibil de calculat.",
    mostPopular: language === 'en' ? "Most Popular" : "Cel mai popular",
    planName: "WarriorOS Pro",
    price: language === 'en' ? "€39" : "197 LEI",
    perMonth: language === 'en' ? "/ month" : "/ lună",
    transformationTitle: language === 'en' 
      ? "Transformation in All 4 Life Areas" 
      : "Transformare în Toate Cele 4 Arii",
    bodyEnergy: language === 'en' ? "💪 Body: Energy + Health" : "💪 Corp: Energie + Sănătate",
    spiritClarity: language === 'en' ? "🙏 Being: Clarity + Purpose" : "🙏 Spirit: Claritate + Scop",
    relationshipsConnection: language === 'en' ? "❤️ Balance: Connection + Peace" : "❤️ Relații: Conexiune + Pace",
    businessProfit: language === 'en' ? "💼 Business: +15-30% profit" : "💼 Business: +15-30% profit",
    priceless: language === 'en' ? "Priceless" : "Nepretuit",
    businessValue: language === 'en' ? "€5k-€30k/quarter" : "€25k-€150k/trimestru",
    investmentLabel: language === 'en' ? "WarriorOS Pro Investment" : "Investiție WarriorOS Pro",
    businessPayoff: language === 'en' 
      ? "Business results alone pay for themselves in the first week"
      : "Doar partea de Business se plătește singur în prima săptămână",
    features: language === 'en' ? [
      "4 AI Coaches (Body, Mindset, Relationships, Business)",
      "Reality Map + Impossible Game for all 4 life areas",
      "War Planning System for focused execution and weekly clarity",
      "Multi-dimensional AI Coaching for holistic transformation",
      "Stack Library (guided protocols for each area)",
      "Complete tracking across Body, Being, Balance & Business"
    ] : [
      "4 Coachi AI (Corp, Mindset, Relații, Business)",
      "Harta Realității + Jocul Imposibil pentru toate cele 4 arii de viață",
      "War Planning System pentru execuție focusată și claritate săptămânală",
      "AI Coaching multi-dimensional pentru transformare holistică",
      "Stack Library (protocoale ghidate pentru fiecare arie)",
      "Tracking complet în Corp, Spirit, Relații și Business"
    ],
    guaranteeTitle: language === 'en' 
      ? "90-Day Money-Back Guarantee + €100" 
      : "Garanție 90 de Zile sau Banii Înapoi + €100",
    trialInfo: language === 'en'
      ? "3-day FREE trial to test the system."
      : "Trial 3 zile GRATUIT ca să testezi sistemul.",
    guaranteeDesc: language === 'en'
      ? "If after 90 days you haven't seen at least 10% measurable improvement in profit or productivity, we'll refund everything + €100 for your time. Zero risk."
      : "Dacă după 90 de zile nu ai văzut cel puțin 10% îmbunătățire măsurabilă în profit sau productivitate, îți returnăm toți banii + €100 pentru timpul tău pierdut. Zero risc.",
    ctaButton: language === 'en' 
      ? "Start 3-Day Free Trial (Card Required)" 
      : "Începe Trial de 3 Zile (Card Necesar)",
    seeAllPlans: language === 'en' 
      ? "See all plans and full comparison" 
      : "Vezi toate planurile și comparația completă"
  };

  return (
    <section 
      ref={elementRef}
      id="pricing" 
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {texts.title}
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {texts.subtitle}
        </p>
      </div>

      {/* Value Stack for Pro */}
      <div className="max-w-2xl mx-auto mb-12">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-primary shadow-xl">
          <CardHeader className="text-center">
            <Badge className="mx-auto mb-2 bg-green-500 text-white font-bold">{texts.mostPopular}</Badge>
            <CardTitle className="text-4xl font-bold text-foreground">{texts.planName}</CardTitle>
            <div className="flex items-baseline justify-center gap-2 mt-4">
              <span className="text-5xl font-bold text-foreground">{texts.price}</span>
              <span className="text-muted-foreground">{texts.perMonth}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-800">{texts.transformationTitle}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">{texts.bodyEnergy}</span>
                  <span className="text-green-600 font-bold">{texts.priceless}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">{texts.spiritClarity}</span>
                  <span className="text-green-600 font-bold">{texts.priceless}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">{texts.relationshipsConnection}</span>
                  <span className="text-green-600 font-bold">{texts.priceless}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">{texts.businessProfit}</span>
                  <span className="text-green-600 font-bold">{texts.businessValue}</span>
                </div>
                <div className="border-t-2 border-green-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-bold text-lg">{texts.investmentLabel}</span>
                    <span className="text-green-800 font-bold text-lg">{texts.price}{texts.perMonth}</span>
                  </div>
                  <p className="text-green-600 text-sm mt-2 text-right font-semibold">
                    {texts.businessPayoff}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {texts.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-foreground mb-2">{texts.guaranteeTitle}</div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-semibold text-green-600">{texts.trialInfo}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {texts.guaranteeDesc}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white text-lg py-6 font-bold"
              onClick={() => navigate('/pricing')}
            >
              {texts.ctaButton}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/pricing')}
          className="border-primary text-primary hover:bg-primary hover:text-white font-semibold"
        >
          {texts.seeAllPlans}
        </Button>
      </div>
    </section>
  );
};