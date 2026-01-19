import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import { DomainCategory, DOMAINS } from './DomainSelector';

interface ContinuePlanningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  completedDomain: DomainCategory;
  remainingDomains: DomainCategory[];
  onContinue: (domain: DomainCategory) => void;
  onFinish: () => void;
}

export const ContinuePlanningDialog: React.FC<ContinuePlanningDialogProps> = ({
  isOpen,
  onClose,
  completedDomain,
  remainingDomains,
  onContinue,
  onFinish,
}) => {
  const { language } = useLanguage();

  const completedDomainConfig = DOMAINS.find(d => d.id === completedDomain);
  const remainingDomainsConfig = DOMAINS.filter(d => remainingDomains.includes(d.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {language === 'en' ? 'Domain Completed!' : 'Domeniu Finalizat!'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en'
              ? `You've completed planning for ${completedDomainConfig?.labelEn}. Would you like to plan another domain?`
              : `Ai finalizat planificarea pentru ${completedDomainConfig?.labelRo}. Vrei să planifici alt domeniu?`}
          </DialogDescription>
        </DialogHeader>

        {remainingDomains.length > 0 ? (
          <div className="space-y-3 py-4">
            <p className="text-sm font-medium">
              {language === 'en' ? 'Continue with:' : 'Continuă cu:'}
            </p>
            
            <div className="space-y-2">
              {remainingDomainsConfig.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => onContinue(domain.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${domain.bgColor} hover:scale-[1.02]`}
                >
                  <div className={domain.color}>
                    {domain.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">
                      {language === 'en' ? domain.labelEn : domain.labelRo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? domain.descriptionEn : domain.descriptionRo}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'All domains have been planned!'
                : 'Toate domeniile au fost planificate!'}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onFinish}>
            <X className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Finish for now' : 'Termină pentru acum'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
