import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Brain, 
  Loader2, 
  Target, 
  Eye, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  Shield
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CoachOnboardingProps {
  onCreateProfile: (displayName: string, bio?: string) => Promise<any>;
}

const content = {
  ro: {
    // Hero Section
    heroTitle: 'Fă-ți Clienții să EXECUTE',
    heroSubtitle: 'în 90 de Zile sau Mai Puțin',
    heroPain: 'FĂRĂ să Fii Tu Nanny-ul Lor',
    heroDescription: 'Sistemul care transformă "am de gând să..." în rezultate măsurabile pentru clienții tăi.',
    
    // Value Stack
    valueStackTitle: 'Ce Primești Tu (Nu Ce Facem Noi)',
    
    value1Title: '50% Recurent — PENTRU TOTDEAUNA',
    value1Desc: 'Câștigi jumătate din fiecare plată. Nu o dată. Nu un an. PENTRU TOTDEAUNA. Fiecare client = venit pasiv.',
    
    value2Title: 'Vezi CINE Nu Face Treaba',
    value2Desc: 'Dashboard în timp real cu streak-uri, obiective și activitate. Știi exact când să intervii — înainte să renunțe.',
    
    value3Title: 'AI Coach 24/7 Pentru Clienți',
    value3Desc: 'Când clientul se blochează la 2 noaptea, AI-ul îl ghidează prin Stacks. Tu dormi liniștit.',
    
    value4Title: 'Comunitate Privată (Tribe)',
    value4Desc: 'Brotherhood-ul TĂU. Clienții se responsabilizează reciproc. Tu moderezi, ei execută.',
    
    // Differentiator Section
    diffTitle: 'De Ce Clienții ALTOR Coachi Eșuează',
    diffSubtitle: 'Și de ce ai TĂI vor avea rezultate',
    
    failTitle: 'PROBLEMA: Coaching Tradițional',
    fail1: 'Primesc informație, nu sistem de execuție',
    fail2: 'Coaching 1x/săptămână, apoi 6 zile singuri',
    fail3: 'Zero responsabilizare zilnică',
    fail4: 'Nu văd unde se blochează până e prea târziu',
    
    winTitle: 'SOLUȚIA: Cu Platforma Noastră',
    win1: 'Stacks AI care îi ghidează ZILNIC',
    win2: 'Obiective: Anual → 90 zile → Lunar → Săptămânal',
    win3: 'Alerte când clientul "dispare" 3+ zile',
    win4: 'Dashboard cu tot ce ai nevoie să intervii',
    
    // Tools Section
    toolsTitle: 'Instrumente de Execuție pentru Clienții Tăi',
    toolsSubtitle: 'Fiecare client primește acces la:',
    
    tool1: 'Hormozi Business Stack — Scalare & Oferă Irezistibilă',
    tool2: 'Master Plan (Napoleon Hill) — 13 Principii de Succes',
    tool3: 'Obiective Anuale / 90 Zile / Lunare / Săptămânale',
    tool4: 'Introspection & Daily Stacks pentru claritate',
    tool5: 'Hit List & Door System pentru acțiune',
    tool6: 'Brotherhood pentru responsabilizare între colegi',
    
    toolsQuote: '"Când clientul tău se blochează la 2 noaptea, AI-ul îl ține pe drumul cel bun. Tu dormi."',
    
    // Form Section
    formTitle: 'Începe să Transformi Clienți în Executanți',
    formSubtitle: 'Creează profilul tău de coach în 30 de secunde',
    
    displayNameLabel: 'Numele Tău de Coach *',
    displayNamePlaceholder: 'Numele sau brandul tău',
    displayNameHint: 'Așa te vor vedea clienții tăi.',
    
    bioLabel: 'Bio (opțional)',
    bioPlaceholder: 'Spune-le clienților potențiali despre tine și rezultatele pe care le obții...',
    
    submitButton: 'Creează Profilul de Coach',
    submitting: 'Se creează profilul...',
    
    // Benefits under CTA
    benefit1: 'Primești link unic de referral în 30 secunde',
    benefit2: 'Clienții tăi primesc acces instant la toate instrumentele',
    benefit3: 'Câștigi 50% din fiecare plată — automat, pentru totdeauna',
  },
  en: {
    // Hero Section
    heroTitle: 'Make Your Clients EXECUTE',
    heroSubtitle: 'in 90 Days or Less',
    heroPain: 'WITHOUT Being Their Babysitter',
    heroDescription: 'The system that transforms "I\'m going to..." into measurable results for your clients.',
    
    // Value Stack
    valueStackTitle: 'What YOU Get (Not What We Do)',
    
    value1Title: '50% Recurring — FOREVER',
    value1Desc: 'You earn half of every payment. Not once. Not for a year. FOREVER. Each client = passive income.',
    
    value2Title: 'See WHO\'s Not Doing The Work',
    value2Desc: 'Real-time dashboard with streaks, objectives, and activity. Know exactly when to intervene — before they quit.',
    
    value3Title: '24/7 AI Coach For Clients',
    value3Desc: 'When your client is stuck at 2 AM, the AI guides them through Stacks. You sleep peacefully.',
    
    value4Title: 'Private Community (Tribe)',
    value4Desc: 'YOUR Brotherhood. Clients hold each other accountable. You moderate, they execute.',
    
    // Differentiator Section
    diffTitle: 'Why OTHER Coaches\' Clients Fail',
    diffSubtitle: 'And why YOURS will get results',
    
    failTitle: 'PROBLEM: Traditional Coaching',
    fail1: 'They get information, not execution systems',
    fail2: 'Coaching 1x/week, then 6 days alone',
    fail3: 'Zero daily accountability',
    fail4: 'Don\'t see where they\'re stuck until too late',
    
    winTitle: 'SOLUTION: With Our Platform',
    win1: 'AI Stacks that guide them DAILY',
    win2: 'Objectives: Annual → 90 Days → Monthly → Weekly',
    win3: 'Alerts when client "disappears" for 3+ days',
    win4: 'Dashboard with everything you need to intervene',
    
    // Tools Section
    toolsTitle: 'Execution Tools for Your Clients',
    toolsSubtitle: 'Every client gets access to:',
    
    tool1: 'Hormozi Business Stack — Scaling & Irresistible Offer',
    tool2: 'Master Plan (Napoleon Hill) — 13 Success Principles',
    tool3: 'Annual / 90-Day / Monthly / Weekly Objectives',
    tool4: 'Introspection & Daily Stacks for clarity',
    tool5: 'Hit List & Door System for action',
    tool6: 'Brotherhood for peer accountability',
    
    toolsQuote: '"When your client is stuck at 2 AM, the AI keeps them on track. You sleep."',
    
    // Form Section
    formTitle: 'Start Transforming Clients Into Executors',
    formSubtitle: 'Create your coach profile in 30 seconds',
    
    displayNameLabel: 'Your Coach Name *',
    displayNamePlaceholder: 'Your name or brand',
    displayNameHint: 'This is how clients will see you.',
    
    bioLabel: 'Bio (optional)',
    bioPlaceholder: 'Tell potential clients about you and the results you deliver...',
    
    submitButton: 'Create Coach Profile',
    submitting: 'Creating profile...',
    
    // Benefits under CTA
    benefit1: 'Get your unique referral link in 30 seconds',
    benefit2: 'Your clients get instant access to all tools',
    benefit3: 'Earn 50% of every payment — automatically, forever',
  }
};

export const CoachOnboarding: React.FC<CoachOnboardingProps> = ({ onCreateProfile }) => {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsLoading(true);
    await onCreateProfile(displayName.trim(), bio.trim() || undefined);
    setIsLoading(false);
  };

  const valueCards = [
    {
      icon: DollarSign,
      title: t.value1Title,
      description: t.value1Desc,
      gradient: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-500',
    },
    {
      icon: Eye,
      title: t.value2Title,
      description: t.value2Desc,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500',
    },
    {
      icon: Brain,
      title: t.value3Title,
      description: t.value3Desc,
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-500',
    },
    {
      icon: Users,
      title: t.value4Title,
      description: t.value4Desc,
      gradient: 'from-orange-500/20 to-amber-500/20',
      iconColor: 'text-orange-500',
    },
  ];

  const failPoints = [t.fail1, t.fail2, t.fail3, t.fail4];
  const winPoints = [t.win1, t.win2, t.win3, t.win4];
  const tools = [t.tool1, t.tool2, t.tool3, t.tool4, t.tool5, t.tool6];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Target className="h-4 w-4" />
          <span>Partner Coach Program</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 leading-tight">
          🎯 {t.heroTitle}
          <br />
          <span className="text-primary">{t.heroSubtitle}</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-bold text-muted-foreground mb-4">
          {t.heroPain}
        </p>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.heroDescription}
        </p>
      </div>

      {/* Value Stack */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
          💰 {t.valueStackTitle}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {valueCards.map((card, index) => (
            <Card 
              key={index} 
              className={`border-border/50 bg-gradient-to-br ${card.gradient} backdrop-blur-sm hover:scale-[1.02] transition-transform`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`rounded-full bg-background/80 p-3 ${card.iconColor}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Differentiator Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            🏆 {t.diffTitle}
          </h2>
          <p className="text-muted-foreground">{t.diffSubtitle}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Problem Side */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t.failTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {failPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{point}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Solution Side */}
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Shield className="h-5 w-5" />
                {t.winTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {winPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-foreground">{point}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tools Section */}
      <Card className="mb-16 border-primary/30 bg-primary/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            {t.toolsTitle}
          </CardTitle>
          <CardDescription className="text-base">{t.toolsSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {tools.map((tool, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
              >
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{tool}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-muted-foreground italic">
              {t.toolsQuote}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card className="max-w-xl mx-auto border-primary/50 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.formTitle}</CardTitle>
          <CardDescription>{t.formSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t.displayNameLabel}</Label>
              <Input
                id="displayName"
                placeholder={t.displayNamePlaceholder}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={100}
                className="text-lg h-12"
              />
              <p className="text-xs text-muted-foreground">
                {t.displayNameHint}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t.bioLabel}</Label>
              <Textarea
                id="bio"
                placeholder={t.bioPlaceholder}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/500
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold" 
              size="lg"
              disabled={!displayName.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <Target className="mr-2 h-5 w-5" />
                  {t.submitButton}
                </>
              )}
            </Button>
            
            {/* Benefits under CTA */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>{t.benefit1}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                <span>{t.benefit2}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>{t.benefit3}</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
