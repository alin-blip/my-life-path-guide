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
  Heart,
  Rocket,
  TrendingUp,
  BookOpen,
  Video,
  Calendar,
  Award,
  Lock,
  Sparkles,
  MessageCircle
} from 'lucide-react';

interface WarriorTrainerSalesLetterProps {
  onBack: () => void;
  onEnroll?: () => void;
}

export const WarriorTrainerSalesLetter: React.FC<WarriorTrainerSalesLetterProps> = ({ 
  onBack,
  onEnroll 
}) => {
  const benefits = [
    { icon: Crown, title: 'Devino Lider Certificat', description: 'Obține certificarea oficială Warrior Trainer și ghidează alți războinici pe calea transformării' },
    { icon: Users, title: 'Comunitate Exclusivă', description: 'Acces la comunitatea de elite a trainerilor - suport, resurse și networking la cel mai înalt nivel' },
    { icon: Target, title: 'Sistem Complet de Coaching', description: 'Metodologie dovedită pentru a transforma vieți - pas cu pas, de la teorie la practică' },
    { icon: TrendingUp, title: 'ROI Garantat', description: 'Investiția de 5.000 EUR se recuperează de obicei în primele 3-6 luni de activitate ca trainer' },
    { icon: Rocket, title: 'Lansare Rapidă', description: 'Sistem pas-cu-pas pentru a-ți lansa practica de coaching în maximum 90 de zile' },
    { icon: Zap, title: 'Transformare Accelerată', description: 'Tu însuți vei experimenta o transformare profundă pe măsură ce înveți să ghidezi pe alții' },
  ];

  const testimonials = [
    { 
      name: 'Alexandru V.', 
      role: 'Antreprenor & Trainer', 
      quote: 'Am investit 5.000 EUR și în primele 6 luni am generat peste 25.000 EUR din coaching. Cea mai profitabilă investiție din viața mea de antreprenor!', 
      avatar: '🏆',
      result: '+25.000 EUR în 6 luni'
    },
    { 
      name: 'Maria D.', 
      role: 'Coach Transformațional', 
      quote: 'Nu e vorba doar despre bani. Am 47 de clienți activi și fiecare transformare mă umple de sens. Familia mea vede diferența în fiecare zi.', 
      avatar: '⭐',
      result: '47 clienți activi'
    },
    { 
      name: 'Bogdan S.', 
      role: 'Lider de Comunitate', 
      quote: 'Am ezitat 3 luni să fac investiția. Acum regret fiecare zi în care am așteptat. Am construit o comunitate de 200+ războinici!', 
      avatar: '🔥',
      result: '200+ membri în comunitate'
    },
    { 
      name: 'Elena P.', 
      role: 'Trainer Corporativ', 
      quote: 'Am integrat metodologia Warrior în programele corporate. Acum lucrez cu 3 companii mari și am contracte de peste 50.000 EUR/an.', 
      avatar: '💎',
      result: '50.000 EUR/an contracte'
    },
    { 
      name: 'Cristian M.', 
      role: 'Life Coach', 
      quote: 'Înainte de Warrior Trainer aveam 5 clienți pe lună. Acum am 25+ și listă de așteptare. Metodologia funcționează!', 
      avatar: '🚀',
      result: '5x creștere clienți'
    },
    { 
      name: 'Andreea T.', 
      role: 'Antreprenor', 
      quote: 'Am renunțat la job-ul de corporatist și acum câștig mai mult făcând ceea ce iubesc. Libertatea pe care o am este de neprețuit.', 
      avatar: '✨',
      result: 'Libertate financiară'
    },
  ];

  const included = [
    { icon: Video, text: 'Acces complet la 12 module avansate de training' },
    { icon: Award, text: 'Certificare oficială Warrior Trainer la finalizare' },
    { icon: BookOpen, text: 'Materiale complete de coaching + 50+ template-uri' },
    { icon: Calendar, text: 'Sesiuni live săptămânale cu traineri seniori' },
    { icon: Users, text: 'Acces pe viață la comunitatea privată de traineri' },
    { icon: MessageCircle, text: 'Suport prioritar și mentorat personalizat' },
    { icon: Lock, text: 'Licență oficială pentru a folosi metodologia Warrior' },
    { icon: Sparkles, text: 'Toate actualizările viitoare gratuit, pe viață' },
  ];

  const handleEnroll = () => {
    // Redirect to checkout or contact
    window.open('mailto:contact@warriorsway.ro?subject=Înscriere Warrior Trainer - 5.000 EUR', '_blank');
    onEnroll?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-950/10 to-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← Înapoi
          </Button>
          <div className="hidden md:block text-center">
            <span className="text-amber-400 font-bold">WARRIOR TRAINER</span>
            <span className="text-muted-foreground"> • Investiție: </span>
            <span className="text-white font-bold">5.000 EUR</span>
          </div>
          <Button 
            onClick={handleEnroll}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            Înscrie-te
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent_70%)]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm px-4 py-2">
            <Flame className="h-4 w-4 mr-2 inline" />
            PROGRAM AVANSAT DE CERTIFICARE
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent leading-tight">
            DEVINO WARRIOR TRAINER
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transformă-ți viața și ajută-i pe alții să facă același lucru. 
            <span className="text-amber-400 font-semibold"> Construiește-ți cariera de vis ca antrenor certificat.</span>
          </p>

          {/* Price Box */}
          <Card className="max-w-md mx-auto p-8 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-2 border-amber-500/40 mb-12">
            <p className="text-muted-foreground mb-2">Investiție unică</p>
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">
              5.000 <span className="text-3xl">EUR</span>
            </div>
            <p className="text-amber-400 text-sm mb-6">Acces pe viață • Toate actualizările incluse</p>
            <Button 
              size="lg" 
              onClick={handleEnroll}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg py-6 rounded-xl shadow-lg shadow-amber-500/25"
            >
              <Crown className="h-5 w-5 mr-2" />
              ÎNSCRIE-TE ACUM
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              <Shield className="h-3 w-3 inline mr-1" />
              Garanție 30 de zile - Banii înapoi 100%
            </p>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            De ce să devii <span className="text-amber-400">Warrior Trainer</span>?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Nu este doar o certificare. Este o transformare completă a modului în care trăiești, câștigi și influențezi lumea.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 bg-card/50 border-amber-500/20 hover:border-amber-500/40 transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-600/20 flex items-center justify-center mb-4">
                  <benefit.icon className="h-7 w-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 px-4 bg-gradient-to-r from-amber-500/10 to-orange-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            Ești gata să faci <span className="text-amber-400">saltul</span>?
          </h3>
          <Button 
            size="lg" 
            onClick={handleEnroll}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xl px-12 py-8 rounded-xl shadow-2xl shadow-amber-500/30"
          >
            <Flame className="h-6 w-6 mr-2" />
            DA, VREAU SĂ DEVIN TRAINER - 5.000 EUR
            <ArrowRight className="h-6 w-6 ml-2" />
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Rezultate <span className="text-amber-400">Reale</span> de la Traineri Reali
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Acești oameni au făcut aceeași investiție pe care o iei tu în considerare acum.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-card/50 border-amber-500/20 hover:border-amber-500/40 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-3xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-amber-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {testimonial.result}
                </Badge>
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
      <section className="py-20 px-4 bg-amber-500/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Ce primești pentru <span className="text-amber-400">5.000 EUR</span>
          </h2>

          <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30">
            <div className="space-y-4">
              {included.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-600/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-lg">{item.text}</span>
                  <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-amber-500/20 text-center">
              <p className="text-2xl font-bold mb-2">Valoare totală: <span className="text-muted-foreground line-through">15.000+ EUR</span></p>
              <p className="text-4xl font-bold text-amber-400 mb-6">Investiția ta: 5.000 EUR</p>
              <Button 
                size="lg" 
                onClick={handleEnroll}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xl px-12 py-8 rounded-xl shadow-2xl shadow-amber-500/30"
              >
                <Heart className="h-6 w-6 mr-2" />
                ÎNCEPE ACUM
                <ArrowRight className="h-6 w-6 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-20 w-20 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Garanție <span className="text-amber-400">100%</span> - 30 de Zile
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Dacă în primele 30 de zile simți că programul nu este pentru tine, 
            îți returnăm integral investiția. Fără întrebări, fără birocrație.
          </p>
          <p className="text-amber-400 font-medium">
            Risc ZERO pentru tine. Tot riscul este la noi.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-amber-500/10 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <Trophy className="h-20 w-20 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Decizia ta de <span className="text-amber-400">astăzi</span>
            <br />definește viitorul tău
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Poți continua să faci ce ai făcut mereu și să obții ce ai obținut mereu.
            <br />
            <span className="text-amber-400 font-semibold">Sau poți alege să devii mai mult.</span>
          </p>
          
          <Card className="max-w-lg mx-auto p-8 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-2 border-amber-500/40 mb-8">
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">
              5.000 <span className="text-3xl">EUR</span>
            </div>
            <p className="text-amber-400 mb-6">Investiție unică în viitorul tău</p>
            <Button 
              size="lg" 
              onClick={handleEnroll}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xl py-8 rounded-xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105"
            >
              <Flame className="h-7 w-7 mr-2" />
              DEVINO WARRIOR TRAINER ACUM
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              <Shield className="h-3 w-3 inline mr-1" />
              Garanție 30 de zile • Plată securizată • Suport prioritar
            </p>
          </Card>

          <p className="text-muted-foreground">
            Ai întrebări? Scrie-ne la <a href="mailto:contact@warriorsway.ro" className="text-amber-400 hover:underline">contact@warriorsway.ro</a>
          </p>
        </div>
      </section>
    </div>
  );
};
