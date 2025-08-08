
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Target, Shield, Flame, TrendingUp, CheckCircle2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Helmet } from "react-helmet-async";
import { plans } from "@/data/pricing";

const Index = () => {
  const navigate = useNavigate();
  
  const { language } = useLanguage();


  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/90 via-pink-900/80 to-purple-900/90">
      <Helmet>
        <title>RoWarrior — Calea războinicilor de a avea totul</title>
        <meta name="description" content="RoWarrior: calea războinicilor de a avea totul în viață — claritate, execuție, profit și echilibru, în același timp." />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>
      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-feminine-primary to-feminine-purple rounded-full p-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {language === 'en' ? 'RoWarrior – Command Center for Entrepreneurs' : 'RoWarrior – Centrul de Comandă pentru Antreprenori'}
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'RoWarrior is the warriors’ way to have it all at once — clarity, execution, profit and balance.' 
              : 'RoWarrior este calea războinicilor de a avea totul, în același timp — claritate, execuție, profit și echilibru.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-feminine-primary to-feminine-purple hover:from-feminine-accent hover:to-feminine-purple text-white px-8 py-4 text-lg font-semibold"
            >
              {language === 'en' ? 'Get Started' : 'Începe acum'}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/pricing')}
              className="border-feminine-secondary text-white hover:bg-feminine-primary/20 px-8 py-4 text-lg"
            >
              {language === 'en' ? 'See Plans' : 'Vezi abonamentele'}
            </Button>
          </div>
        </div>

        {/* RoWarrior Pillars */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-gradient-to-br from-feminine-primary/40 to-feminine-rose/40 p-6 rounded-xl border border-feminine-primary/30">
            <Target className="w-10 h-10 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Daily Discipline' : 'Disciplină Zilnică'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Clear daily plan: know what moves the needle today.' 
                : 'Plan zilnic clar: știi exact ce mișcă acul azi.'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-feminine-purple/40 to-purple-700/40 p-6 rounded-xl border border-feminine-purple/30">
            <Shield className="w-10 h-10 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Relentless Execution' : 'Execuție Fără Rispă'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Protect your focus. Execute 1–3 high-ROI actions daily.' 
                : 'Protejează-ți focusul. Execută 1–3 acțiuni cu ROI maxim pe zi.'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-600/40 to-feminine-primary/40 p-6 rounded-xl border border-pink-500/30">
            <Flame className="w-10 h-10 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Emotional Control' : 'Control Emoțional'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Use quick stacks (Anger, Clarity) to reset and move forward.' 
                : 'Folosește stack-uri rapide (Furie, Claritate) ca să revii pe traiectorie.'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/40 to-orange-600/40 p-6 rounded-xl border border-yellow-500/30">
            <TrendingUp className="w-10 h-10 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Profit & Balance' : 'Profit & Echilibru'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Grow profit without sacrificing health, family or values.' 
                : 'Crești profitul fără să-ți sacrifici sănătatea, familia sau valorile.'}
            </p>
          </div>
        </div>

        {/* War Tools */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-feminine-primary/20 to-feminine-purple/20 p-6 rounded-xl border border-feminine-primary/30">
            <Sparkles className="w-10 h-10 text-feminine-primary mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'War Plan Map' : 'Harta de Războinic (War Plan)'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'One page plan: objectives, constraints, and the next bold moves.' 
                : 'Plan pe o pagină: obiective, blocaje și următoarele mișcări curajoase.'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-feminine-primary/20 to-feminine-purple/20 p-6 rounded-xl border border-feminine-primary/30">
            <Target className="w-10 h-10 text-feminine-primary mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'Weekly Missions & KPIs' : 'Misiuni Săptămânale & KPI'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Pick 1 domino goal and 3–5 KPIs; review weekly, adjust fast.' 
                : 'Alege 1 obiectiv domino și 3–5 KPI; revizuiește săptămânal, ajustează rapid.'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-feminine-primary/20 to-feminine-purple/20 p-6 rounded-xl border border-feminine-primary/30">
            <Flame className="w-10 h-10 text-feminine-primary mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'Rapid Stacks' : 'Stack-uri Rapide'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Reset in minutes with Anger & Clarity stacks to keep momentum.' 
                : 'Revii în câteva minute cu stack-urile Furie & Claritate – menții momentum-ul.'}
            </p>
          </div>
        </div>

        {/* Pricing Preview */}
        <section className="mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">{language === 'en' ? 'Choose your pace — RoWarrior Plans' : 'Alege-ți ritmul — Abonamente RoWarrior'}</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              {language === 'en' ? 'Start with a 3-day trial (card required), then pick Basic or Pro for relentless execution.' : 'Începe cu proba de 3 zile (card necesar), apoi alege Basic sau Pro pentru execuție la sânge.'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`${plan.featured ? 'ring-2 ring-primary/60' : ''} relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
                {plan.featured && (
                  <Badge variant="secondary" className="absolute right-4 top-4">
                    {language === 'en' ? 'Popular' : 'Popular'}
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlight && (
                    <p className="text-sm text-muted-foreground mt-1">{plan.highlight}</p>
                  )}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  {plan.result && (
                    <p className="mt-2 text-sm text-muted-foreground">{plan.result}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-left">
                    {plan.benefits.slice(0, 5).map((b) => (
                      <li key={b} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => navigate('/pricing')}>
                    {plan.id === 'trial'
                      ? (language === 'en' ? 'Start trial' : 'Începe proba')
                      : (language === 'en' ? 'View details' : 'Vezi detaliile')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/pricing" className="underline text-sm text-muted-foreground">
              {language === 'en' ? 'See full comparison' : 'Vezi comparația completă'}
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {language === 'en' ? 'Become a RoWarrior' : 'Devino RoWarrior'}
          </h2>
          <p className="text-gray-300 mb-8">
            {language === 'en' 
              ? 'Build your empire with clarity, execution and balance — without excuses.' 
              : 'Construiește-ți imperiul cu claritate, execuție și echilibru — fără scuze.'}
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-feminine-primary to-feminine-purple hover:from-feminine-accent hover:to-feminine-purple text-white px-12 py-4 text-xl font-semibold"
          >
            {language === 'en' ? 'Join Now' : 'Intră acum'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
