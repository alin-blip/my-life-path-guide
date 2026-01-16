import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, CheckCircle2, Sparkles, X, Rocket, ArrowRight } from 'lucide-react';

interface PremiumGateProps {
  onClose: () => void;
}

const PREMIUM_BENEFITS = [
  'Acces la toate cele 47+ lecții video premium',
  'Platforma completă WarriorOS',
  'Rutina Campionului - Morning routine AI-guided',
  'The Door - Sistemul de planificare săptămânală',
  '4 Coachi AI pentru Corp, Mindset, Relații, Business',
  'Stack-uri de transformare emoțională',
  'Acces pe viață + update-uri gratuite',
];

export const PremiumGate: React.FC<PremiumGateProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/warrior-launch-accelerator');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Lock className="h-5 w-5 text-amber-500" />
              </div>
              <DialogTitle>Conținut Premium</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="pt-2">
            Acest modul face parte din Warrior Launch Accelerator.
            Obține acces complet pentru doar 970 EUR!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Warrior Launch Accelerator</h3>
              <span className="text-sm font-bold text-amber-500">970 EUR</span>
            </div>

            <ul className="space-y-2">
              {PREMIUM_BENEFITS.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleUpgrade}
            className="w-full gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
            size="lg"
          >
            <Rocket className="h-4 w-4" />
            Obține Acces Complet
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Continuă cu lecția gratuită
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
