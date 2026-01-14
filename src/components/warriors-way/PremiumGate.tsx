import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, CheckCircle2, Sparkles, X } from 'lucide-react';

interface PremiumGateProps {
  onClose: () => void;
}

const PREMIUM_BENEFITS = [
  'Acces complet la toate cele 40+ module',
  'Tehnici avansate Stack & Core 4',
  'Sistemul The Door pentru productivitate',
  'War Stack și planificare strategică',
  'Cortul Generalului - evaluare săptămânală',
  'Actualizări și conținut nou',
];

export const PremiumGate: React.FC<PremiumGateProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
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
            Acest modul face parte din cursul premium Warrior's Way.
            Upgrade pentru acces complet!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Warrior's Way Premium</h3>
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
            className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            size="lg"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade la Premium
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Continuă cu modulele gratuite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
