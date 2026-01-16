import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Rocket, 
  Mail, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  Zap,
  Crown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { trackPurchase } from '@/lib/facebook-pixel';

const WarriorAcceleratorThankYou = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [purchaseRecorded, setPurchaseRecorded] = useState(false);
  
  const sessionId = searchParams.get('session_id');
  const checkoutSuccess = searchParams.get('checkout') === 'success';

  // Record purchase in database
  useEffect(() => {
    const recordPurchase = async () => {
      if (!user || !sessionId || !checkoutSuccess) {
        setIsProcessing(false);
        return;
      }

      try {
        // Check if already recorded
        const { data: existing } = await supabase
          .from('course_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('stripe_session_id', sessionId)
          .maybeSingle();

        if (existing) {
          setPurchaseRecorded(true);
          setIsProcessing(false);
          return;
        }

        // Record new purchase
        const { error } = await supabase
          .from('course_purchases')
          .insert({
            user_id: user.id,
            product_id: 'warrior-accelerator',
            stripe_session_id: sessionId,
            amount_paid: 97000,
            currency: 'eur'
          });

        if (!error) {
          setPurchaseRecorded(true);
          // Track Facebook Pixel Purchase event - €970 for Warrior Accelerator
          trackPurchase(970, 'EUR');
        }
      } catch (err) {
        console.error('Error recording purchase:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    recordPurchase();
  }, [user, sessionId, checkoutSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Helmet>
        <title>Mulțumim pentru Achiziție - Warrior Launch Accelerator</title>
        <meta name="description" content="Bine ai venit în Warrior Launch Accelerator! Ai acces complet la toate lecțiile și platforma WarriorOS." />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </div>
          </motion.div>

          {/* Main Message */}
          <Badge variant="secondary" className="mb-4 text-sm px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Achiziție Finalizată cu Succes
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
            Bine ai venit, Războinic!
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            Felicitări! Acum ai acces complet la <strong>Warrior Launch Accelerator</strong> și toate cele 47+ lecții video premium.
          </p>

          {/* Email Confirmation */}
          <Card className="mb-8 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5" />
                <p>
                  Un email de confirmare a fost trimis la <strong className="text-foreground">{user?.email}</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-8 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-amber-500" />
                Ce urmează pentru tine
              </h2>

              <div className="space-y-4 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Accesează Cursul Complet</h3>
                    <p className="text-sm text-muted-foreground">
                      Toate cele 8 module și 47+ lecții sunt acum deblocate pentru tine.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Explorează Platforma WarriorOS</h3>
                    <p className="text-sm text-muted-foreground">
                      Rutina Campionului, The Door, Coachi AI și toate instrumentele sunt la dispoziția ta.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Începe Transformarea</h3>
                    <p className="text-sm text-muted-foreground">
                      Primele 90 de zile sunt cruciale. Urmează sistemul și vezi rezultatele.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <Button 
            asChild
            size="lg" 
            className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg"
          >
            <Link to="/warriors-way">
              <Rocket className="w-6 h-6 mr-3" />
              Accesează Cursul Acum
              <ArrowRight className="w-5 h-5 ml-3" />
            </Link>
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Dacă ai întrebări, contactează-ne la <a href="mailto:support@warrioros.com" className="text-primary hover:underline">support@warrioros.com</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WarriorAcceleratorThankYou;
