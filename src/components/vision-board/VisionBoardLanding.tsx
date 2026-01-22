import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Brain, 
  Image as ImageIcon, 
  Headphones,
  Check,
  X,
  Zap,
  Target,
  Heart,
  Briefcase,
  Users,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VisionBoardLandingProps {
  language: 'en' | 'ro';
  isAuthenticated: boolean;
  onStartAuthenticated: () => void;
  onSignupAndStart: (email: string, password: string, name: string) => Promise<void>;
  isLoading?: boolean;
}

// Example vision board images (AI generated samples)
const exampleVisions = [
  {
    category: 'body',
    title: { en: 'Body', ro: 'Corp' },
    description: { en: 'Peak physical performance', ro: 'Performanță fizică maximă' },
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
    icon: Target,
    color: 'from-red-500 to-orange-500'
  },
  {
    category: 'being',
    title: { en: 'Being', ro: 'Spiritualitate' },
    description: { en: 'Inner peace & clarity', ro: 'Pace interioară și claritate' },
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop',
    icon: Brain,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    category: 'balance',
    title: { en: 'Balance', ro: 'Relații' },
    description: { en: 'Deep connections', ro: 'Conexiuni profunde' },
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop',
    icon: Heart,
    color: 'from-pink-500 to-rose-500'
  },
  {
    category: 'business',
    title: { en: 'Business', ro: 'Business' },
    description: { en: 'Financial freedom', ro: 'Libertate financiară' },
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
    icon: Briefcase,
    color: 'from-emerald-500 to-teal-500'
  }
];

const comparisonItems = {
  without: [
    { en: 'Wake up confused, no direction', ro: 'Te trezești confuz, fără direcție' },
    { en: "Don't know what to focus on", ro: 'Nu știi pe ce să te concentrezi' },
    { en: 'Generic YouTube meditations', ro: 'Meditații generice de pe YouTube' },
    { en: 'Spend 3h searching for images', ro: 'Pierzi 3h căutând imagini pe Pinterest' },
    { en: 'Forget your goals by February', ro: 'Îți uiți obiectivele în februarie' }
  ],
  with: [
    { en: 'Wake up with crystal clarity', ro: 'Te trezești cu claritate totală' },
    { en: 'Your vision is the first thing you see', ro: 'Viziunea ta e prima chestie pe care o vezi' },
    { en: 'Meditation about YOUR specific goals', ro: 'Meditație despre obiectivele TALE specifice' },
    { en: '5 minutes and your board is complete', ro: '5 minute și ai board-ul complet' },
    { en: 'See them DAILY when you open the app', ro: 'Le vezi ZILNIC când deschizi app-ul' }
  ]
};

export const VisionBoardLanding: React.FC<VisionBoardLandingProps> = ({
  language,
  isAuthenticated,
  onStartAuthenticated,
  onSignupAndStart,
  isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const t = {
    badge: language === 'en' ? 'AI VISION BOARD + PERSONALIZED MEDITATION' : 'AI VISION BOARD + MEDITAȚIE PERSONALIZATĂ',
    headline: language === 'en' 
      ? 'Every Morning When You Open The App, Your Vision Greets You.'
      : 'În Fiecare Dimineață Când Deschizi Aplicația, Viziunea Ta Te Întâmpină.',
    subheadline: language === 'en'
      ? 'Create an AI Vision Board across 4 life areas. Generate a meditation based on YOUR goals. Visualize daily. Zero effort.'
      : 'Creezi un Vision Board AI în 4 categorii ale vieții. Generezi o meditație personalizată pe obiectivele TALE. Le vezi zilnic, fără efort.',
    ctaMain: language === 'en' ? 'Create Your Vision FREE' : 'Creează-ți Viziunea GRATIS',
    ctaStart: language === 'en' ? 'Start Creating' : 'Începe Crearea',
    
    examplesTitle: language === 'en' ? 'What You\'ll Create' : 'Ce Vei Crea',
    examplesSubtitle: language === 'en'
      ? "Don't search Pinterest for 3 hours. Write what you want. AI generates. In 5 minutes you have a Vision Board that looks like you paid a designer €500."
      : 'Nu cauți imagini pe Pinterest 3 ore. Scrii ce vrei. AI-ul generează. În 5 minute ai un Vision Board care arată de parcă l-ai plătit 500€ unui designer.',
    aiGenerated: language === 'en' ? 'AI Generated' : 'Generat cu AI',
    
    benefitsTitle: language === 'en' ? 'Two Weapons for Your Mind' : 'Două Arme Pentru Mintea Ta',
    benefit1Title: language === 'en' ? 'AI Vision Board' : 'Vision Board cu AI',
    benefit1Desc: language === 'en'
      ? 'Your subconscious doesn\'t know the difference between real and imaginary. When you see your goals visually every day, your brain starts looking for opportunities to achieve them. Without a Vision Board = you leave everything to chance.'
      : 'Subconștientul tău nu știe diferența între real și imaginar. Când îți vezi obiectivele vizual în fiecare zi, creierul începe să caute oportunități să le îndeplinească. Fără Vision Board = lași totul la noroc.',
    benefit2Title: language === 'en' ? 'Personalized Meditation' : 'Meditație Personalizată',
    benefit2Desc: language === 'en'
      ? 'Stop listening to generic meditations about "inner calm". AI creates a script based on WHAT YOU WANT: "...you see yourself 15kg lighter, closing the 100k deal, holding your child\'s hand..." — about YOUR LIFE.'
      : 'Nu mai asculți meditații generice despre "calm interior". AI-ul creează un script bazat pe CE VREI TU: "...te vezi cu 15kg mai puțin, încheind afacerea de 100k, ținând mâna copilului tău..." — despre VIAȚA TA.',
    
    comparisonTitle: language === 'en' ? 'The Difference' : 'Diferența',
    without: language === 'en' ? 'WITHOUT Vision Board' : 'FĂRĂ Vision Board',
    with: language === 'en' ? 'WITH AI Vision Board' : 'CU AI Vision Board',
    
    socialProofCount: '2,800+',
    socialProofText: language === 'en' ? 'Vision Boards created' : 'Vision Board-uri create',
    
    formTitle: language === 'en' ? 'Create Your Vision in 5 Minutes' : 'Creează-ți Viziunea în 5 Minute',
    namePlaceholder: language === 'en' ? 'Your name (optional)' : 'Numele tău (opțional)',
    emailPlaceholder: language === 'en' ? 'Your email' : 'Email-ul tău',
    passwordPlaceholder: language === 'en' ? 'Create password' : 'Creează parolă',
    noCard: language === 'en' ? 'No card. No obligations. 3 days full access.' : 'Fără card. Fără obligații. 3 zile acces complet.',
    
    loading: language === 'en' ? 'Creating...' : 'Se creează...'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!email.includes('@')) {
      setFormError(language === 'en' ? 'Please enter a valid email' : 'Te rog introdu un email valid');
      return;
    }
    if (password.length < 6) {
      setFormError(language === 'en' ? 'Password must be at least 6 characters' : 'Parola trebuie să aibă minim 6 caractere');
      return;
    }
    
    try {
      await onSignupAndStart(email, password, name);
    } catch (error: any) {
      setFormError(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              {t.badge}
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              {t.headline}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t.subheadline}
            </p>
            
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={onStartAuthenticated}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6"
              >
                {t.ctaStart}
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6"
              >
                {t.ctaMain}
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">{t.examplesTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.examplesSubtitle}</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {exampleVisions.map((vision, index) => (
              <motion.div
                key={vision.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-square">
                    <img
                      src={vision.imageUrl}
                      alt={vision.title[language]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent",
                      "flex flex-col justify-end p-3"
                    )}>
                      <Badge className={cn("self-start mb-2 text-xs bg-gradient-to-r", vision.color, "text-white border-0")}>
                        <vision.icon className="w-3 h-3 mr-1" />
                        {vision.title[language]}
                      </Badge>
                      <p className="text-white text-xs md:text-sm font-medium">{vision.description[language]}</p>
                    </div>
                    
                    {/* AI Badge */}
                    <Badge className="absolute top-2 right-2 bg-black/60 text-white text-xs border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {t.aiGenerated}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">{t.benefitsTitle}</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vision Board Benefit */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{t.benefit1Title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{t.benefit1Desc}</p>
                
                <ul className="mt-4 space-y-2">
                  {[
                    language === 'en' ? 'Write your vision in 4 life areas' : 'Scrii viziunea ta în 4 arii ale vieții',
                    language === 'en' ? 'AI generates professional images' : 'AI-ul generează imagini profesionale',
                    language === 'en' ? 'See them daily in the app' : 'Le vezi zilnic când intri în aplicație'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
            
            {/* Meditation Benefit */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-accent/70">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{t.benefit2Title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{t.benefit2Desc}</p>
                
                <ul className="mt-4 space-y-2">
                  {[
                    language === 'en' ? 'AI creates script from YOUR goals' : 'AI-ul creează script din obiectivele TALE',
                    language === 'en' ? 'Not generic — about YOUR life' : 'Nu e generic — e despre VIAȚA TA',
                    language === 'en' ? 'Activates RAS for laser focus' : 'Activează RAS pentru focus laser'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">{t.comparisonTitle}</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border-destructive/30 bg-destructive/5">
                <div className="flex items-center gap-2 mb-4">
                  <X className="w-6 h-6 text-destructive" />
                  <h3 className="text-lg font-bold text-destructive">{t.without}</h3>
                </div>
                <ul className="space-y-3">
                  {comparisonItems.without.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <X className="w-4 h-4 text-destructive/60 mt-0.5 flex-shrink-0" />
                      {item[language]}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
            
            {/* With */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-bold text-primary">{t.with}</h3>
                </div>
                <ul className="space-y-3">
                  {comparisonItems.with.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {item[language]}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-12"
          >
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t.socialProofCount}
              </p>
              <p className="text-muted-foreground text-sm">{t.socialProofText}</p>
            </div>
            
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            <div className="flex gap-3">
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                AI Powered
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Users className="w-3 h-3" />
                3 {language === 'en' ? 'days FREE' : 'zile GRATIS'}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA / Signup Form */}
      <section id="signup-form" className="py-16 px-4 bg-gradient-to-br from-primary/10 via-muted/50 to-accent/10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 md:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t.formTitle}</h2>
              </div>
              
              {isAuthenticated ? (
                <Button
                  size="lg"
                  onClick={onStartAuthenticated}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg py-6"
                >
                  {t.ctaStart}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="sr-only">{t.namePlaceholder}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="sr-only">{t.emailPlaceholder}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="relative">
                    <Label htmlFor="password" className="sr-only">{t.passwordPlaceholder}</Label>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {formError && (
                    <p className="text-destructive text-sm text-center">{formError}</p>
                  )}
                  
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg py-6"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {t.loading}
                      </>
                    ) : (
                      <>
                        {t.ctaMain}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-center text-xs text-muted-foreground">
                    {t.noCard}
                  </p>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
