import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Check, 
  ArrowRight, 
  BookOpen, 
  Target, 
  Shield,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';

interface AcceleratorUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DISMISSED_KEY = 'accelerator_upsell_dismissed';
const DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const AcceleratorUpsellModal: React.FC<AcceleratorUpsellModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    onClose();
  };

  const handleBuyNow = async () => {
    // Pre-open window before async operations
    const preOpened = preOpenWindow();
    
    if (!user) {
      if (preOpened) preOpened.close();
      toast.info('Trebuie să fii autentificat');
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
        redirectExternal(response.data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
        throw new Error('Nu s-a putut crea sesiunea de checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Eroare la procesarea plății. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    '47+ lecții video premium',
    '8 module complete de învățare',
    'Framework de transformare în 90 de zile',
    'Acces pe viață la toate update-urile',
    'Garanție 90 de zile satisfacție',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-amber-500 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          
          <Badge className="mx-auto mb-2 bg-green-500/20 text-green-400 border-green-500/30">
            🎉 Ofertă Specială pentru Membri
          </Badge>
          
          <DialogTitle className="text-2xl font-bold">
            Warrior Launch Accelerator
          </DialogTitle>
          
          <DialogDescription className="text-base">
            Accelerează-ți transformarea cu 47+ lecții video premium și framework-ul complet de implementare în 90 de zile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-muted-foreground line-through">€970</span>
              <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                49% OFF
              </Badge>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">€497</span>
              <span className="text-muted-foreground text-sm">o singură plată</span>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleBuyNow}
            disabled={isLoading}
            className="w-full py-6 text-lg bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Se procesează...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                Adaugă Accelerator - €497
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Dismiss option */}
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="w-full text-muted-foreground"
          >
            Poate mai târziu
          </Button>

          {/* Trust */}
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Garanție 90 de zile - banii înapoi dacă nu ești mulțumit
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper to check if should show the upsell
export const shouldShowAcceleratorUpsell = (): boolean => {
  const dismissed = localStorage.getItem(DISMISSED_KEY);
  if (!dismissed) return true;
  
  const dismissedTime = parseInt(dismissed, 10);
  const now = Date.now();
  
  // Show again after 7 days
  return now - dismissedTime > DISMISSED_DURATION;
};
