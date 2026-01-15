import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  Target, 
  Zap, 
  CheckCircle2, 
  Star,
  ArrowRight,
  Play,
  Shield,
  Flame,
  Crown,
  Heart
} from 'lucide-react';

interface WarriorTrainerSalesPageProps {
  onEnroll?: () => void;
}

export const WarriorTrainerSalesPage: React.FC<WarriorTrainerSalesPageProps> = ({ onEnroll }) => {
  const benefits = [
    { icon: Crown, title: 'Devino Lider Certificat', description: 'Obține certificarea oficială Warrior Trainer și ghidează alți războinici pe calea transformării' },
    { icon: Users, title: 'Comunitate Exclusivă', description: 'Acces la comunitatea de elite a trainerilor - suport, resurse și networking la cel mai înalt nivel' },
    { icon: Target, title: 'Sistem Complet de Coaching', description: 'Metodologie dovedită pentru a transforma vieți - pas cu pas, de la teorie la practică' },
    { icon: Zap, title: 'Venituri Suplimentare', description: 'Construiește-ți propria afacere de coaching sau integrează metodele în cariera actuală' },
  ];

  const testimonials = [
    { name: 'Andrei M.', role: 'Warrior Trainer Certificat', quote: 'Am ajutat peste 100 de oameni să se transforme. Cea mai împlinitoare decizie din viața mea!', avatar: '🏆' },
    { name: 'Elena D.', role: 'Coach & Antreprenor', quote: 'Veniturile mele s-au triplat, dar mai important - fac ceva ce contează cu adevărat.', avatar: '⭐' },
    { name: 'Mihai S.', role: 'Lider de Comunitate', quote: 'Am construit o comunitate de 200+ războinici. Impactul este extraordinar!', avatar: '🔥' },
  ];

  const included = [
    'Acces complet la toate modulele Warrior Trainer',
    'Certificare oficială la finalizare',
    'Materiale de coaching și template-uri',
    'Sesiuni live săptămânale cu traineri seniori',
    'Acces la comunitatea privată de traineri',
    'Suport prioritar și mentorat',
    'Licență de a folosi metodologia Warrior',
    'Actualizări gratuite pe viață',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-950/10 to-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent_70%)]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm px-4 py-2">
            <Flame className="h-4 w-4 mr-2 inline" />
            PROGRAM AVANSAT
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            WARRIOR TRAINER
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Devino antrenorul propriei tale vieți și ghidează alții pe drumul transformării. 
            <span className="text-amber-400 font-semibold"> Următorul nivel te așteaptă.</span>
          </p>

          {/* Video Placeholder */}
          <div className="relative max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-black/50 aspect-video flex items-center justify-center group cursor-pointer hover:border-amber-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
              <p className="text-amber-400 font-medium">Vezi video-ul de prezentare</p>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={onEnroll}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-12 py-6 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
          >
            <Crown className="h-5 w-5 mr-2" />
            Înscrie-te Acum
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            De ce să devii <span className="text-amber-400">Warrior Trainer</span>?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Nu este doar o certificare. Este o transformare completă a modului în care trăiești și influențezi lumea din jurul tău.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 bg-card/50 border-amber-500/20 hover:border-amber-500/40 transition-colors">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-600/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-amber-500/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Ce spun <span className="text-amber-400">Trainerii Noștri</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-card/50 border-amber-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-amber-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Ce primești în <span className="text-amber-400">Warrior Trainer</span>
          </h2>

          <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30">
            <div className="grid md:grid-cols-2 gap-4">
              {included.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-amber-500/20 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-amber-400" />
                <span className="text-amber-400 font-medium">Garanție 30 de zile - Satisfacție 100%</span>
              </div>
              <Button 
                size="lg" 
                onClick={onEnroll}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-12 py-6 rounded-xl"
              >
                <Heart className="h-5 w-5 mr-2" />
                Începe Transformarea
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Trophy className="h-16 w-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ești gata să faci <span className="text-amber-400">următorul pas</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Alătură-te elitei de Warrior Traineri și începe să transformi vieți - inclusiv a ta.
          </p>
          <Button 
            size="lg" 
            onClick={onEnroll}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xl px-16 py-8 rounded-xl shadow-2xl shadow-amber-500/30"
          >
            <Flame className="h-6 w-6 mr-2" />
            DEVINO WARRIOR TRAINER
          </Button>
        </div>
      </section>
    </div>
  );
};
