import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  CheckCircle2, 
  Rocket, 
  Brain, 
  Heart, 
  Dumbbell, 
  Briefcase,
  Target,
  Zap,
  Shield,
  Clock,
  Users,
  Trophy,
  BookOpen,
  Sparkles,
  ArrowRight,
  Star,
  Lock,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';

const WarriorLaunchAccelerator = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const modules = [
    { name: 'Călătoria unui Războinic', lessons: 7, description: 'Introducere în Calea Războinicului' },
    { name: 'Calea Războinicului', lessons: 5, description: 'Principiile fundamentale ale transformării' },
    { name: 'Codul Războinicului', lessons: 5, description: 'Fapte reale, sentimente autentice, claritate' },
    { name: 'The Warrior Game', lessons: 5, description: 'Cadrul pentru jocul imposibil' },
    { name: 'Stack-ul', lessons: 6, description: 'Procesul de transformare emoțională' },
    { name: 'Core 4', lessons: 6, description: 'Stăpânirea în Corp, Ființă, Echilibru, Afacere' },
    { name: 'The Warriors Door', lessons: 7, description: 'Sistemul de productivitate zilnică' },
    { name: 'The Warriors Way', lessons: 6, description: 'Construiește viața în jurul Căii' },
  ];

  const platformFeatures = [
    { icon: Zap, name: 'Rutina Campionului', description: 'Morning routine ghidată de AI' },
    { icon: Target, name: 'The Door', description: 'Planificare săptămânală inteligentă' },
    { icon: Brain, name: '4 Coachi AI', description: 'Corp, Mindset, Relații, Business' },
    { icon: Sparkles, name: 'Stack-uri de Transformare', description: 'Procesare emoțională ghidată' },
    { icon: BookOpen, name: 'Journal & Tracking', description: 'Monitorizare zilnică a progresului' },
    { icon: Shield, name: 'Core 4 System', description: 'Balanța în 4 arii de viață' },
    { icon: Users, name: 'Reality Maps', description: 'Hărțile realității tale' },
    { icon: Trophy, name: 'Gamification', description: 'Scoruri, achievements, leaderboard' },
  ];

  const core4Areas = [
    { icon: Dumbbell, name: 'CORP', color: 'text-green-500', description: 'Energie, sănătate, fitness' },
    { icon: Brain, name: 'FIINȚĂ', color: 'text-purple-500', description: 'Mindset, spiritualitate, pace' },
    { icon: Heart, name: 'ECHILIBRU', color: 'text-pink-500', description: 'Relații, familie, conexiune' },
    { icon: Briefcase, name: 'AFACERE', color: 'text-amber-500', description: 'Business, carieră, finanțe' },
  ];

  const handleBuyNow = async () => {
    // Pre-open window before async operations
    const preOpened = preOpenWindow();
    
    if (!user) {
      if (preOpened) preOpened.close();
      toast.info('Trebuie să fii autentificat pentru a cumpăra');
      navigate('/auth', { state: { returnTo: '/warrior-launch-accelerator' } });
      return;
    }

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'warrior-accelerator' },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (response.error) {
        if (preOpened) preOpened.close();
        throw new Error(response.error.message);
      }

      if (response.data?.url) {
        console.log('Stripe checkout URL:', response.data.url);
        redirectExternal(response.data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
        console.error('No URL in response:', response.data);
        throw new Error('Nu s-a putut crea sesiunea de checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Eroare la procesarea plății. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Warrior Certified Coach - Sistemul Complet de Transformare în 90 de Zile</title>
        <meta name="description" content="Warrior Certified Coach: 47+ lecții video premium + platforma completă CEO Mind OS. Transformă-ți viața în Corp, Ființă, Echilibru și Afacere." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-amber-500/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              Acces Complet la CEO Mind OS
            </Badge>
            
             <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
              Warrior Certified Coach
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Sistemul Complet de Transformare în 90 de Zile
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Succes fără sacrificiu. Crește-ți afacerea FĂRĂ să pierzi sănătatea, 
              relațiile sau liniștea sufletească.
            </p>
          </div>

          {/* Video Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
              <div className="aspect-video relative">
                {videoPlaying ? (
                  <iframe
                    src="https://www.youtube.com/embed/sfuey_WNODs?rel=0&modestbranding=1&autoplay=1"
                    title="Warrior Launch Accelerator"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div 
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => setVideoPlaying(true)}
                  >
                    <img 
                      src="https://img.youtube.com/vi/sfuey_WNODs/maxresdefault.jpg"
                      alt="Warrior Launch Accelerator Video"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary-foreground ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleBuyNow}
              disabled={isLoading}
              className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              ) : (
                <Rocket className="w-6 h-6 mr-3" />
              )}
              Obține Acces Acum - 1.999 EUR
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              <Shield className="w-4 h-4 inline mr-1" />
              Garanție 90 de zile satisfacție garantată
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Problema pe care o rezolvăm
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                <strong className="text-foreground">Scenariul 1:</strong> Îți sacrifici sănătatea, relațiile și liniștea 
                pentru a-ți crește afacerea. Rezultat? Burnout, divorț, depresie.
              </p>
              
              <p>
                <strong className="text-foreground">Scenariul 2:</strong> Îți sacrifici afacerea pentru viața personală. 
                Rezultat? Frustrare, stagnare, regret.
              </p>
              
              <div className="pt-6 border-t border-border">
                <p className="text-xl text-foreground font-semibold">
                  Nu trebuie să alegi. Poți avea TOTUL.
                </p>
                <p className="mt-2">
                  Warrior Certified Coach îți oferă sistemul complet pentru a excela 
                  simultan în toate cele 4 arii de viață.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core 4 Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Cele 4 Arii de Viață - Core 4
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {core4Areas.map((area) => (
              <Card key={area.name} className="text-center p-6 hover:shadow-lg transition-shadow">
                <area.icon className={`w-12 h-12 mx-auto mb-4 ${area.color}`} />
                <h3 className="font-bold text-lg mb-2">{area.name}</h3>
                <p className="text-sm text-muted-foreground">{area.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Course Modules Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              47+ Lecții Video Premium
            </h2>
            <p className="text-xl text-muted-foreground">
              8 Module Complete de Învățare
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {modules.map((module, idx) => (
              <Card key={module.name} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{module.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                    <Badge variant="secondary">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {module.lessons} lecții
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Platforma Completă CEO Mind OS
            </h2>
            <p className="text-xl text-muted-foreground">
              Tot ce ai nevoie pentru transformare
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {platformFeatures.map((feature) => (
              <Card key={feature.name} className="p-6 text-center hover:shadow-lg transition-shadow">
                <feature.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">{feature.name}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Checklist */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Ce Primești
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              'Acces complet la toate cele 47+ lecții video',
              'Platforma CEO Mind OS cu toate funcționalitățile',
              'Rutina Campionului - Morning routine AI-guided',
              'The Door - Sistemul de planificare săptămânală',
              '4 Coachi AI pentru Corp, Mindset, Relații și Business',
              'Stack-uri de transformare emoțională',
              'Journal & Tracking pentru progres zilnic',
              'Reality Maps - Vizualizare și planificare obiective',
              'Gamification: scoruri, achievements, leaderboard',
              'Acces pe viață la toate update-urile viitoare',
              'Garanție 90 de zile - banii înapoi dacă nu ești mulțumit',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="overflow-hidden border-2 border-primary shadow-2xl">
              <div className="bg-gradient-to-r from-primary to-amber-500 p-6 text-center">
                <h3 className="text-2xl font-bold text-primary-foreground">
                   Warrior Certified Coach
                </h3>
                <p className="text-primary-foreground/80">
                  Acces Complet pe Viață
                </p>
              </div>
              
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold">1.999</span>
                  <span className="text-2xl text-muted-foreground ml-2">EUR</span>
                </div>
                
                <p className="text-muted-foreground mb-8">
                  Plată unică • Fără abonament • Acces pe viață
                </p>
                
                <Button 
                  size="lg" 
                  className="w-full text-lg py-6 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
                  onClick={handleBuyNow}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Rocket className="w-5 h-5 mr-2" />
                  )}
                  Obține Acces Acum
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Garanție 90 de zile satisfacție garantată</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-background to-amber-500/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ești Gata să Devii un Războinic?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Succes fără sacrificiu. Crește în toate cele 4 arii de viață simultan.
          </p>
          <Button 
            size="lg" 
            className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg"
            onClick={handleBuyNow}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            ) : (
              <Rocket className="w-6 h-6 mr-3" />
            )}
            Începe Transformarea - 1.999 EUR
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Termeni și Condiții
            </Link>
            <span className="text-border">|</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Politica de Confidențialitate
            </Link>
            <span className="text-border">|</span>
            <Link to="/support" className="hover:text-primary transition-colors">
              Suport
            </Link>
          </div>
          <p>© {new Date().getFullYear()} CEO Mind OS. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  );
};

export default WarriorLaunchAccelerator;
