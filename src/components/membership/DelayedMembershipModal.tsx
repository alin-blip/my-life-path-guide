import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Crown, Zap, Rocket, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MEMBERSHIP_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '€49',
    originalPrice: '€97',
    period: '/lună',
    trial: '3 zile trial',
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500',
    benefits: [
      'Acces complet la platformă',
      'Harta Realității completă',
      'Sistem DOOR de obiective',
      'Tracking zilnic'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€97',
    originalPrice: '€197',
    period: '/lună',
    trial: '7 zile trial',
    icon: Crown,
    gradient: 'from-purple-500 to-pink-500',
    featured: true,
    benefits: [
      'Tot din Basic +',
      'Coaching LIVE săptămânal',
      'Comunitate VIP',
      'Acces prioritar la funcții noi'
    ]
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '€297',
    originalPrice: '€500',
    period: '/lună',
    trial: '7 zile trial',
    icon: Rocket,
    gradient: 'from-amber-500 to-orange-500',
    benefits: [
      'Tot din Pro +',
      'Warrior Accelerator (€497)',
      'Coaching 1-la-1 lunar',
      'Suport prioritar 24/7'
    ]
  }
];

interface DelayedMembershipModalProps {
  delayMs?: number;
  onClose?: () => void;
}

export function DelayedMembershipModal({ delayMs = 30000, onClose }: DelayedMembershipModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if modal was already shown today
    const today = new Date().toISOString().split('T')[0];
    const lastShown = localStorage.getItem('membership_modal_last_shown');
    
    if (lastShown === today) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem('membership_modal_last_shown', today);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleSelectPlan = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth', { 
          state: { 
            returnUrl: '/fact-maps',
            plan: planId 
          } 
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'delayed-modal' }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('A apărut o eroare. Încearcă din nou.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-primary/20">
            <div className="relative bg-gradient-to-br from-background via-background to-primary/5 p-6 sm:p-8">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <DialogHeader className="text-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 mb-3"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Ofertă Specială
                  </Badge>
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold">
                  Deblochează Potențialul Tău Complet
                </DialogTitle>
                <p className="text-muted-foreground mt-2">
                  Alege planul care ți se potrivește și începe transformarea
                </p>
              </DialogHeader>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MEMBERSHIP_PLANS.map((plan, idx) => {
                  const Icon = plan.icon;
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className={`relative p-5 h-full flex flex-col ${
                        plan.featured 
                          ? 'border-2 border-primary shadow-lg shadow-primary/20' 
                          : 'border-border'
                      }`}>
                        {plan.featured && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground">
                              Recomandat
                            </Badge>
                          </div>
                        )}

                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                        
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
                          <span className="text-sm text-muted-foreground">{plan.period}</span>
                        </div>
                        
                        <Badge variant="outline" className="w-fit mb-4 text-xs">
                          {plan.trial}
                        </Badge>

                        <ul className="space-y-2 mb-6 flex-1">
                          {plan.benefits.map((benefit, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => handleSelectPlan(plan.id)}
                          disabled={loadingPlan !== null}
                          className={`w-full ${
                            plan.featured 
                              ? 'bg-gradient-to-r from-primary to-primary/80' 
                              : ''
                          }`}
                          variant={plan.featured ? 'default' : 'outline'}
                        >
                          {loadingPlan === plan.id ? 'Se încarcă...' : 'Începe Trial'}
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Continue without subscription */}
              <div className="text-center mt-6">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Continuă explorarea gratuit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
