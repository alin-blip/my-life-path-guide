import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";
import { plans, getLocalizedPlan } from "@/data/pricing";

export const ValueStackPricing = () => {
  const navigate = useNavigate();
  const { elementRef, isVisible } = useScrollAnimation();
  const { language } = useLanguage();

  const texts = {
    title: language === 'en' 
      ? "Choose Your Path to Freedom" 
      : "Alege Drumul Tău spre Libertate",
    subtitle: language === 'en'
      ? "Start with a 7-day free trial. Cancel anytime."
      : "Începe cu 7 zile trial gratuit. Anulează oricând.",
    mostPopular: language === 'en' ? "Most Popular" : "Cel Mai Popular",
    perMonth: language === 'en' ? "/ month" : "/ lună",
    trialBadge: language === 'en' ? "7-Day Free Trial" : "7 Zile Trial Gratuit",
    seeAllPlans: language === 'en' 
      ? "View full plan comparison" 
      : "Vezi comparația completă",
  };

  const basicPlan = getLocalizedPlan(plans.find(p => p.id === 'basic')!, language as 'en' | 'ro');
  const proPlan = getLocalizedPlan(plans.find(p => p.id === 'pro')!, language as 'en' | 'ro');

  return (
    <section 
      ref={elementRef}
      id="pricing" 
      className={`py-20 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {texts.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {texts.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          {/* Basic Plan */}
          <Card className="relative border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center pb-4">
              <Badge variant="secondary" className="mx-auto mb-3 font-semibold">
                {basicPlan.highlight}
              </Badge>
              <h3 className="text-2xl font-bold text-foreground">{basicPlan.name}</h3>
              <div className="flex items-baseline justify-center gap-2 mt-3">
                <span className="text-4xl font-bold text-foreground">{basicPlan.price}</span>
                <span className="text-muted-foreground">{texts.perMonth}</span>
              </div>
              {basicPlan.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">{basicPlan.originalPrice}</span>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {basicPlan.benefits.slice(0, 5).map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                className="w-full py-5 font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate('/pricing')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {basicPlan.cta}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan - Featured */}
          <Card className="relative border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-xl shadow-primary/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-primary to-accent text-white font-bold border-0 px-4 py-1">
                <Crown className="h-3 w-3 mr-1" />
                {texts.mostPopular}
              </Badge>
            </div>
            <CardHeader className="text-center pb-4 pt-8">
              <Badge className="mx-auto mb-3 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 font-semibold">
                {texts.trialBadge}
              </Badge>
              <h3 className="text-2xl font-bold text-foreground">{proPlan.name}</h3>
              <div className="flex items-baseline justify-center gap-2 mt-3">
                <span className="text-4xl font-bold text-foreground">{proPlan.price}</span>
                <span className="text-muted-foreground">{texts.perMonth}</span>
              </div>
              {proPlan.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">{proPlan.originalPrice}</span>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {proPlan.benefits.slice(0, 6).map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full py-5 font-semibold bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white"
                onClick={() => navigate('/pricing')}
              >
                <Zap className="h-4 w-4 mr-2" />
                {proPlan.cta}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pricing')}
            className="text-muted-foreground hover:text-primary font-medium"
          >
            {texts.seeAllPlans} →
          </Button>
        </div>
      </div>
    </section>
  );
};
