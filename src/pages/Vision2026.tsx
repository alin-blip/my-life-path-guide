import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { 
  Sparkles, 
  Target, 
  Heart, 
  Brain, 
  Briefcase, 
  Dumbbell,
  ArrowRight,
  CheckCircle2, 
  Loader2,
  Clock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LifeCategory = 'body' | 'being' | 'balance' | 'business';

const CATEGORIES = [
  { 
    id: 'body' as LifeCategory,
    icon: Dumbbell, 
    labelEn: 'Body',
    labelRo: 'Corp',
    descEn: 'Health, energy & fitness',
    descRo: 'Sănătate, energie și fitness',
    gradient: 'from-green-500 to-emerald-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    hoverBorder: 'hover:border-green-500/60'
  },
  { 
    id: 'being' as LifeCategory,
    icon: Brain, 
    labelEn: 'Spirituality',
    labelRo: 'Spiritualitate',
    descEn: 'Clarity, peace & purpose',
    descRo: 'Claritate, pace și scop',
    gradient: 'from-purple-500 to-violet-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/60'
  },
  { 
    id: 'balance' as LifeCategory,
    icon: Heart, 
    labelEn: 'Relationships',
    labelRo: 'Relații',
    descEn: 'Love, family & connection',
    descRo: 'Dragoste, familie și conexiune',
    gradient: 'from-pink-500 to-rose-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    hoverBorder: 'hover:border-pink-500/60'
  },
  { 
    id: 'business' as LifeCategory,
    icon: Briefcase, 
    labelEn: 'Business',
    labelRo: 'Business',
    descEn: 'Career, finances & impact',
    descRo: 'Carieră, finanțe și impact',
    gradient: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/60'
  },
];

const Vision2026 = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<LifeCategory | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const benefits = [
    { icon: Target, textEn: 'Clear annual objectives', textRo: 'Obiective anuale clare' },
    { icon: Brain, textEn: 'AI Wizard guides you step by step', textRo: 'Wizard AI te ghidează pas cu pas' },
    { icon: Clock, textEn: 'Complete plan in 10 minutes', textRo: 'Plan complet în 10 minute' },
    { icon: CheckCircle2, textEn: 'Export your plan as PDF', textRo: 'Exportă planul ca PDF' }
  ];

  const features = [
    language === 'en' ? 'Define "impossible" goals for 2026' : 'Definește obiective "imposibile" pentru 2026',
    language === 'en' ? 'Breakdown into 90-day milestones' : 'Breakdown în milestones de 90 zile',
    language === 'en' ? 'Clarity on your WHY' : 'Claritate asupra DE CE-ului tău',
    language === 'en' ? 'Impact on all life areas' : 'Impact asupra tuturor ariilor vieții',
    language === 'en' ? 'Week 1 action plan' : 'Plan de acțiune săptămâna 1'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error(language === 'en' ? 'Please fill in email and password' : 'Te rog completează email-ul și parola');
      return;
    }

    if (password.length < 6) {
      toast.error(language === 'en' ? 'Password must be at least 6 characters' : 'Parola trebuie să aibă minim 6 caractere');
      return;
    }

    if (!selectedCategory) {
      toast.error(language === 'en' ? 'Please select a focus area' : 'Te rog selectează o arie de focus');
      return;
    }

    setIsLoading(true);

    try {
      const emailLower = email.toLowerCase().trim();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 3);

      // 1. Create account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: emailLower,
        password: password,
        options: {
          data: {
            full_name: name.trim() || undefined,
            source: 'vision_2026_lead_magnet'
          }
        }
      });

      if (signUpError) {
        // If user exists, try to sign in
        if (signUpError.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: emailLower,
            password: password
          });
          
          if (signInError) {
            toast.error(language === 'en' 
              ? 'Account exists. Check your password or reset it.' 
              : 'Contul există. Verifică parola sau resetează-o.');
            setIsLoading(false);
            return;
          }
        } else {
          throw signUpError;
        }
      }

      const userId = signUpData?.user?.id;

      // 2. Save to email_leads
      await supabase.from('email_leads').upsert({
        email: emailLower,
        name: name.trim() || null,
        lead_magnet: 'vision_2026_all_areas',
        source: 'vision-2026-landing',
        metadata: { 
          selected_category: selectedCategory,
          language 
        },
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || null,
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || null,
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || null,
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      });

      // 3. Update subscribers with 3-day trial
      if (userId) {
        await supabase.from('subscribers').upsert({
          user_id: userId,
          email: emailLower,
          subscription_tier: 'trial',
          subscription_status: 'trialing',
          early_bird_expires_at: trialEnd.toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      }

      toast.success(language === 'en' ? 'Account created! Redirecting...' : 'Cont creat! Te redirecționăm...');

      // 4. Redirect to Annual Goals with selected category
      navigate(`/game-objectives?tab=annual&source=vision-lead-magnet&category=${selectedCategory}`, {
        state: { 
          fromVisionLeadMagnet: true,
          userName: name.trim() || undefined,
          selectedCategory
        }
      });

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || (language === 'en' ? 'An error occurred. Please try again.' : 'A apărut o eroare. Te rog încearcă din nou.'));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <>
      <Helmet>
        <title>{language === 'en' ? 'Plan Your 2026 Vision | LifeOS' : 'Planifică-ți Viziunea 2026 | LifeOS'}</title>
        <meta 
          name="description" 
          content={language === 'en' 
            ? 'Create clear goals and an action plan for 2026 in just 10 minutes with our AI wizard. Free 3-day trial.'
            : 'Creează obiective clare și un plan de acțiune pentru 2026 în doar 10 minute cu ajutorul wizard-ului AI. Trial gratuit 3 zile.'
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900">
        {/* Language Selector */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageSelector />
        </div>

        {/* Hero Section */}
        <div className="container max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left: Content */}
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {language === 'en' ? 'Free 3 Days' : 'Gratuit 3 Zile'}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {language === 'en' 
                    ? <>Plan Your <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">2026 Vision</span></>
                    : <>Planifică-ți <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Viziunea 2026</span></>
                  }
                </h1>
                
                <p className="text-xl text-gray-300">
                  {language === 'en'
                    ? 'Choose a life area, set your "impossible" goals, and create an action plan in 10 minutes with our AI wizard.'
                    : 'Alege o arie a vieții, setează-ți obiectivele "imposibile" și creează un plan de acțiune în 10 minute cu wizard-ul AI.'}
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <Icon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span className="text-sm text-gray-200">
                        {language === 'en' ? benefit.textEn : benefit.textRo}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <div className="flex -space-x-2">
                  {['🎯', '🔥', '💪', '🧠'].map((emoji, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-lg border-2 border-gray-900"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <span>
                  <Users className="w-4 h-4 inline mr-1" />
                  {language === 'en' ? '2,500+ people planned their 2026' : '2,500+ persoane și-au planificat 2026'}
                </span>
              </div>
            </div>

            {/* Right: Form */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-amber-500/20 mb-4">
                    <Target className="w-8 h-8 text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {language === 'en' ? 'Create Your 2026 Plan FREE' : 'Creează-ți Planul 2026 GRATUIT'}
                  </h2>
                  <p className="text-gray-400">
                    {language === 'en' ? 'Full access for 3 days to all features' : 'Acces complet 3 zile la toate funcțiile'}
                  </p>
                </div>

                {/* Category Selector */}
                <div className="mb-6">
                  <Label className="text-gray-200 mb-3 block">
                    {language === 'en' ? 'Choose your focus area *' : 'Alege aria ta de focus *'}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left",
                            cat.bgColor,
                            isSelected 
                              ? `${cat.borderColor} ring-2 ring-offset-2 ring-offset-gray-800 ring-${cat.id === 'body' ? 'green' : cat.id === 'being' ? 'purple' : cat.id === 'balance' ? 'pink' : 'blue'}-500/50`
                              : `border-gray-700 ${cat.hoverBorder}`
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2", cat.gradient)}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="font-semibold text-white text-sm">
                            {language === 'en' ? cat.labelEn : cat.labelRo}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {language === 'en' ? cat.descEn : cat.descRo}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-200">
                      {language === 'en' ? 'Name (optional)' : 'Nume (opțional)'}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'en' ? 'Your name' : 'Numele tău'}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-200">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-200">
                      {language === 'en' ? 'Password *' : 'Parolă *'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={language === 'en' ? 'Min 6 characters' : 'Minim 6 caractere'}
                      required
                      minLength={6}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full h-12 text-lg font-semibold transition-all",
                      selectedCategoryData 
                        ? `bg-gradient-to-r ${selectedCategoryData.gradient} hover:opacity-90`
                        : "bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400"
                    )}
                    disabled={isLoading || !selectedCategory}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {language === 'en' ? 'Creating account...' : 'Se creează contul...'}
                      </>
                    ) : (
                      <>
                        {language === 'en' 
                          ? `Start with ${selectedCategoryData?.labelEn || 'Selected Area'}`
                          : `Începe cu ${selectedCategoryData?.labelRo || 'Aria Selectată'}`
                        }
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    {language === 'en' 
                      ? 'By signing up, you agree to our '
                      : 'Prin înregistrare, ești de acord cu '}
                    <a href="/terms" className="text-amber-400 hover:underline">
                      {language === 'en' ? 'Terms' : 'Termenii'}
                    </a>
                    {' '}{language === 'en' ? 'and' : 'și'}{' '}
                    <a href="/privacy" className="text-amber-400 hover:underline">
                      {language === 'en' ? 'Privacy Policy' : 'Politica de Confidențialitate'}
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What's Inside Section */}
        <div className="bg-gray-800/30 py-16">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                {language === 'en' ? 'What You\'ll Get in 3 Free Days' : 'Ce vei primi în cele 3 zile gratuite'}
              </h2>
              <p className="text-gray-400">
                {language === 'en' ? 'Full access to all premium features' : 'Acces complet la toate funcțiile premium'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-200">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">
                  {language === 'en' 
                    ? 'After 3 days: continue for just 25 RON/month or cancel free'
                    : 'După 3 zile: continuă cu doar 25 RON/lună sau anulează gratuit'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Vision2026;
