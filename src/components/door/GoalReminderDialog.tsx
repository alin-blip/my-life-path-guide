import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Clock, Calendar, CalendarDays } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { goalRemindersService, ReminderFrequency } from '@/services/goalRemindersService';
import { cn } from '@/lib/utils';

interface GoalReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalTitle: string;
}

const FREQUENCY_OPTIONS = [
  { 
    value: 'daily' as ReminderFrequency, 
    label: { en: 'Daily', ro: 'Zilnic' },
    description: { en: 'Get reminded every day', ro: 'Primești reminder în fiecare zi' },
    icon: Clock
  },
  { 
    value: 'weekly' as ReminderFrequency, 
    label: { en: 'Weekly', ro: 'Săptămânal' },
    description: { en: 'Get reminded once a week', ro: 'Primești reminder o dată pe săptămână' },
    icon: Calendar
  },
  { 
    value: 'monthly' as ReminderFrequency, 
    label: { en: 'Monthly', ro: 'Lunar' },
    description: { en: 'Get reminded once a month', ro: 'Primești reminder o dată pe lună' },
    icon: CalendarDays
  }
];

export const GoalReminderDialog: React.FC<GoalReminderDialogProps> = ({
  open,
  onOpenChange,
  goalId,
  goalTitle
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [frequency, setFrequency] = useState<ReminderFrequency>('weekly');

  useEffect(() => {
    if (open && goalId) {
      loadReminder();
    }
  }, [open, goalId]);

  const loadReminder = async () => {
    setLoading(true);
    try {
      const reminder = await goalRemindersService.getReminder(goalId);
      if (reminder) {
        setHasReminder(true);
        setIsActive(reminder.is_active);
        setFrequency(reminder.frequency as ReminderFrequency);
      } else {
        setHasReminder(false);
        setIsActive(true);
        setFrequency('weekly');
      }
    } catch (error) {
      console.error('Error loading reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await goalRemindersService.setReminder(goalId, frequency);
      if (success) {
        toast({
          title: language === 'en' ? 'Reminder set' : 'Reminder setat',
          description: language === 'en' 
            ? `You'll be reminded ${frequency === 'daily' ? 'daily' : frequency === 'weekly' ? 'weekly' : 'monthly'}`
            : `Vei primi reminder ${frequency === 'daily' ? 'zilnic' : frequency === 'weekly' ? 'săptămânal' : 'lunar'}`
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      const success = await goalRemindersService.removeReminder(goalId);
      if (success) {
        toast({
          title: language === 'en' ? 'Reminder removed' : 'Reminder șters'
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (active: boolean) => {
    setIsActive(active);
    if (hasReminder) {
      await goalRemindersService.toggleReminder(goalId, active);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            {language === 'en' ? 'Goal Reminder' : 'Reminder Obiectiv'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            {language === 'en' ? 'Loading...' : 'Se încarcă...'}
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium text-sm">{goalTitle}</p>
            </div>

            {hasReminder && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <Bell className="w-4 h-4 text-primary" />
                  ) : (
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Label>
                    {language === 'en' ? 'Reminder active' : 'Reminder activ'}
                  </Label>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggle}
                />
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {language === 'en' ? 'Frequency' : 'Frecvență'}
              </Label>
              <RadioGroup
                value={frequency}
                onValueChange={(val) => setFrequency(val as ReminderFrequency)}
                className="space-y-2"
              >
                {FREQUENCY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        frequency === option.value 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={option.value} />
                      <Icon className={cn(
                        "w-5 h-5",
                        frequency === option.value ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {option.label[language === 'en' ? 'en' : 'ro']}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {option.description[language === 'en' ? 'en' : 'ro']}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-2">
              {hasReminder && (
                <Button 
                  variant="outline" 
                  className="flex-1 text-destructive hover:bg-destructive/10"
                  onClick={handleRemove}
                  disabled={saving}
                >
                  {language === 'en' ? 'Remove' : 'Șterge'}
                </Button>
              )}
              <Button 
                className="flex-1" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving 
                  ? (language === 'en' ? 'Saving...' : 'Se salvează...')
                  : (language === 'en' ? 'Save Reminder' : 'Salvează Reminder')
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
