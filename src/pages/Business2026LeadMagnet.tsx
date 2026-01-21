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
import { 
  Briefcase, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Clock,
  FileDown,
  Brain,
  TrendingUp
} from 'lucide-react';
import { trackLead } from '@/lib/facebook-pixel';

const Business2026LeadMagnet: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const benefits = [
    { icon: Target, text: 'Obiective clare și măsurabile pentru afacerea ta' },
    { icon: Brain, text: 'Wizard AI care te ghidează pas cu pas' },
    { icon: Clock, text: 'Plan complet în doar 10 minute' },
    { icon: FileDown, text: 'Export PDF al planului tău' }
  ];

  const features = [
    'Definește obiectivele "imposibile" pentru 2026',
    'Breakdown în milestones pentru 90 de zile',
    'Claritate asupra DE CE-ului tău',
    'Identifică impactul asupra celorlalte arii ale vieții',
    'Acțiunea primei săptămâni'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Te rog completează email-ul și parola');
      return;
    }

    if (password.length < 6) {
      toast.error('Parola trebuie să aibă minim 6 caractere');
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
            source: 'business_2026_planner'
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
            toast.error('Contul există. Verifică parola sau resetează-o.');
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
        lead_magnet: 'business_2026_planner',
        source: 'landing_page',
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

      // 4. Track Facebook Pixel
      trackLead();

      toast.success('Cont creat! Te redirecționăm...');

      // 5. Redirect to Annual Goals with business source
      navigate('/game-objectives?tab=annual&source=business-lead-magnet', {
        state: { 
          fromBusinessLeadMagnet: true,
          userName: name.trim() || undefined 
        }
      });

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'A apărut o eroare. Te rog încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Planifică-ți Business-ul pentru 2026 | Warrior Planner</title>
        <meta 
          name="description" 
          content="Creează obiective clare și un plan de acțiune în 10 minute cu AI-ul nostru. Acces gratuit 3 zile la toate funcțiile." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
        {/* Hero Section */}
        <div className="container max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Content */}
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gratuit 3 Zile
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Planifică-ți <span className="text-blue-400">Business-ul</span> pentru 2026
                </h1>
                
                <p className="text-xl text-gray-300">
                  Creează obiective clare și un plan de acțiune în doar 10 minute cu ajutorul wizard-ului nostru AI.
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
                      <Icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-gray-200">{benefit.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <div className="flex -space-x-2">
                  {['🚀', '💼', '📈'].map((emoji, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg border-2 border-gray-900"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <span>500+ antreprenori și-au creat planul 2026</span>
              </div>
            </div>

            {/* Right: Form */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-blue-500/20 mb-4">
                    <Briefcase className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Creează-ți Planul 2026 GRATUIT
                  </h2>
                  <p className="text-gray-400">
                    Acces complet 3 zile la toate funcțiile
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-200">
                      Nume (opțional)
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Numele tău"
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
                      placeholder="email@exemplu.com"
                      required
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-200">
                      Parolă *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minim 6 caractere"
                      required
                      minLength={6}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-lg font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Se creează contul...
                      </>
                    ) : (
                      <>
                        Începe Acum
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Prin înregistrare, ești de acord cu{' '}
                    <a href="/terms" className="text-blue-400 hover:underline">Termenii</a>
                    {' '}și{' '}
                    <a href="/privacy" className="text-blue-400 hover:underline">Politica de Confidențialitate</a>
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
                Ce vei primi în cele 3 zile gratuite
              </h2>
              <p className="text-gray-400">
                Acces complet la toate funcțiile premium
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
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">
                  După 3 zile: continuă cu doar 25 RON/lună sau anulează gratuit
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Business2026LeadMagnet;
