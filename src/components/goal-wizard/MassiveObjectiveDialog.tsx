import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Calendar, ArrowRight, ArrowLeft, Loader2, Crown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { GoalCategory, CATEGORY_INFO } from '@/types/goalWizard';
import { DayOfWeek } from '@/types/door';

interface KeyItem {
  id: number;
  text: string;
  day: DayOfWeek | null;
}

interface MassiveObjectiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dominoTitle: string;
  category: GoalCategory;
  onSave: (keys: KeyItem[]) => Promise<void>;
}

const DAYS: { value: DayOfWeek; labelEn: string; labelRo: string }[] = [
  { value: 'M', labelEn: 'Monday', labelRo: 'Luni' },
  { value: 'T', labelEn: 'Tuesday', labelRo: 'Marți' },
  { value: 'W', labelEn: 'Wednesday', labelRo: 'Miercuri' },
  { value: 'Th', labelEn: 'Thursday', labelRo: 'Joi' },
  { value: 'F', labelEn: 'Friday', labelRo: 'Vineri' },
  { value: 'Sa', labelEn: 'Saturday', labelRo: 'Sâmbătă' },
  { value: 'Su', labelEn: 'Sunday', labelRo: 'Duminică' },
];

export const MassiveObjectiveDialog: React.FC<MassiveObjectiveDialogProps> = ({
  isOpen,
  onClose,
  dominoTitle,
  category,
  onSave
}) => {
  const { language } = useLanguage();
  const categoryInfo = CATEGORY_INFO[category];
  
  const [step, setStep] = useState<1 | 2>(1);
  const [keys, setKeys] = useState<KeyItem[]>([
    { id: 1, text: '', day: null },
    { id: 2, text: '', day: null },
    { id: 3, text: '', day: null },
    { id: 4, text: '', day: null },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const updateKeyText = (id: number, text: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, text } : k));
  };

  const updateKeyDay = (id: number, day: DayOfWeek) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, day } : k));
  };

  const canProceedToStep2 = keys.every(k => k.text.trim().length > 0);
  const canSave = keys.every(k => k.text.trim().length > 0 && k.day !== null);

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onSave(keys);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setKeys([
      { id: 1, text: '', day: null },
      { id: 2, text: '', day: null },
      { id: 3, text: '', day: null },
      { id: 4, text: '', day: null },
    ]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-goddess-gold" />
            {step === 1 
              ? (language === 'en' ? 'Define the 4 Keys' : 'Definește cele 4 Chei')
              : (language === 'en' ? 'Schedule Keys on Days' : 'Programează Cheile pe Zile')
            }
          </DialogTitle>
        </DialogHeader>

        {/* Domino Title Display */}
        <div className={cn(
          "p-3 rounded-lg border",
          categoryInfo.bgColor
        )}>
          <p className="text-xs text-muted-foreground mb-1">
            {language === 'en' ? 'Massive Objective:' : 'Obiectiv Masiv:'}
          </p>
          <p className={cn("font-semibold", categoryInfo.color)}>
            {dominoTitle}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
            step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            1
          </div>
          <div className="w-8 h-0.5 bg-muted" />
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
            step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            2
          </div>
        </div>

        {/* Step 1: Define 4 Keys */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'What are the 4 keys that lead to this objective?' 
                : 'Care sunt cele 4 chei care duc la acest obiectiv?'}
            </p>

            {keys.map((key, index) => (
              <div key={key.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <Input
                  placeholder={language === 'en' 
                    ? `Key ${index + 1}...` 
                    : `Cheia ${index + 1}...`}
                  value={key.text}
                  onChange={(e) => updateKeyText(key.id, e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                {language === 'en' ? 'Cancel' : 'Anulează'}
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
              >
                {language === 'en' ? 'Continue' : 'Continuă'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Allocate Days */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'On which day do you want to work on each key?' 
                : 'În ce zi vrei să lucrezi la fiecare cheie?'}
            </p>

            {keys.map((key, index) => (
              <div key={key.id} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Key className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">{key.text}</p>
                    <Select
                      value={key.day || ''}
                      onValueChange={(val) => updateKeyDay(key.id, val as DayOfWeek)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={
                          language === 'en' ? 'Select day...' : 'Selectează ziua...'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            <span className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {language === 'en' ? d.labelEn : d.labelRo}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Back' : 'Înapoi'}
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSave}
                disabled={!canSave || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Save Massive Objective' : 'Salvează Obiectiv Masiv'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
