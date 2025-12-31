import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, CheckCircle, Target, Zap, TrendingUp, Shield } from 'lucide-react';

const Core4LeadMagnet = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('email_leads')
        .insert({
          email: email.toLowerCase().trim(),
          name: name.trim() || null,
          lead_magnet: 'core4_framework',
          source: window.location.href,
          metadata: {
            utm_source: new URLSearchParams(window.location.search).get('utm_source'),
            utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
            utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          }
        });

      if (error) {
        if (error.code === '23505') {
          // Duplicate email - still redirect to thank you
          navigate('/core4-thank-you');
          return;
        }
        throw error;
      }

      navigate('/core4-thank-you');
    } catch (error: any) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: Target, title: "Clear Daily Focus", description: "Know exactly what to prioritize every single day" },
    { icon: Zap, title: "10x Productivity", description: "Accomplish more in 4 hours than most do in 8" },
    { icon: TrendingUp, title: "Consistent Progress", description: "Build unstoppable momentum toward your goals" },
    { icon: Shield, title: "Stress-Free Systems", description: "Replace overwhelm with calm, confident action" },
  ];

  return (
    <>
      <Helmet>
        <title>CORE 4 Framework - Free PDF Download | LifeOS</title>
        <meta name="description" content="Download the free CORE 4 Framework PDF and learn how to master your day with 4 simple daily actions." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Download className="w-4 h-4" />
                Free PDF Download
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                Master Your Day with the{' '}
                <span className="text-primary">CORE 4 Framework</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Discover the simple 4-step daily system used by high performers to eliminate overwhelm, 
                crush their goals, and build an extraordinary life — one focused day at a time.
              </p>

              {/* Benefits Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/60 to-primary border-2 border-background flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground">Join 2,500+ high performers</p>
                  <p className="text-sm text-muted-foreground">Already using the CORE 4 system</p>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:pl-8">
              <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/10">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Download className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Get Your Free PDF</h2>
                    <p className="text-muted-foreground mt-2">
                      Enter your email below and get instant access
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">First Name (optional)</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your first name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          Download Free PDF
                        </span>
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      By downloading, you agree to receive occasional emails from us. 
                      Unsubscribe anytime.
                    </p>
                  </form>

                  {/* What's Inside */}
                  <div className="mt-8 pt-8 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-4">What's Inside:</h3>
                    <ul className="space-y-3">
                      {[
                        "The complete CORE 4 Framework breakdown",
                        "Daily implementation checklist",
                        "Common mistakes to avoid",
                        "Real-world examples and case studies",
                        "Quick-start action plan"
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Core4LeadMagnet;
