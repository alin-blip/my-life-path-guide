import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, CheckCircle2, X, Rocket, ArrowRight, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PremiumGateProps {
  onClose: () => void;
}

const ELITE_BENEFITS = [
  'Acces la toate cele 47+ lecții video premium',
  'Platformă completă WarriorOS Pro',
  'Champion Routine - Morning routine AI-guided',
  'The Door - Sistemul de planificare săptămânală',
  '4 Coachi AI pentru Corp, Mindset, Relații, Business',
  'Stack-uri de transformare emoțională',
  'Coaching de grup LIVE săptămânal cu Alin Radu',
  'Comunitate VIP cu membri Elite',
];

export const PremiumGate: React.FC<PremiumGateProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleUpgradeToElite = () => {
    onClose();
    navigate('/pricing');
  };

  const handleBuySeparately = () => {
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
              <DialogTitle>Conținut Elite</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="pt-2">
            Warrior Launch Accelerator este disponibil în planul Elite sau ca achiziție separată.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Elite Option */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Plan Elite</h3>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                Recomandat
              </Badge>
            </div>
            
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-amber-500">€497</span>
              <span className="text-muted-foreground">/ lună</span>
            </div>

            <ul className="space-y-2 mb-4">
              {ELITE_BENEFITS.slice(0, 4).map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 text-sm">
                <Users className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground font-medium">+ Coaching LIVE cu Alin Radu</span>
              </li>
            </ul>

            <Button 
              onClick={handleUpgradeToElite}
              className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Crown className="h-4 w-4" />
              Upgrade la Elite
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Separate Purchase Option */}
          <div className="p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Achiziție Separată</h3>
            </div>
            
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold">€970</span>
              <span className="text-muted-foreground">o singură dată</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Warrior Launch Accelerator - 47+ lecții video, acces pe viață + toate update-urile viitoare.
            </p>

            <Button 
              onClick={handleBuySeparately}
              variant="outline"
              className="w-full gap-2"
            >
              <Rocket className="h-4 w-4" />
              Vezi Detalii Accelerator
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Continuă cu lecția gratuită
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
