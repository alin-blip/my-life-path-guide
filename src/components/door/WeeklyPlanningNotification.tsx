import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Target } from 'lucide-react';
import { format, getISOWeek, getYear } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

interface WeeklyPlanningNotificationProps {
  onStartPlanning?: () => void;
}

export const WeeklyPlanningNotification: React.FC<WeeklyPlanningNotificationProps> = ({
  onStartPlanning,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    checkAndShowNotification();
  }, []);

  const checkAndShowNotification = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Only show on Monday (1)
    if (dayOfWeek !== 1) return;

    // Get current week key
    const currentWeekKey = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
    
    // Check if notification was already shown this week
    const lastShownWeek = localStorage.getItem('weekly-planning-notification-shown');
    
    if (lastShownWeek === currentWeekKey) {
      // Already shown this week
      return;
    }

    // Check if it's morning (before 12:00 PM)
    const hours = today.getHours();
    if (hours < 6 || hours > 12) {
      // Not morning time, don't show
      return;
    }

    // Show notification
    setIsOpen(true);
    
    // Mark as shown for this week
    localStorage.setItem('weekly-planning-notification-shown', currentWeekKey);
  };

  const handleStartPlanning = () => {
    setIsOpen(false);
    if (onStartPlanning) {
      onStartPlanning();
    } else {
      // Navigate to Domino Door
      navigate('/door');
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {language === 'en' ? '🎯 New Week - Domino Door!' : '🎯 Săptămână Nouă - Domino Door!'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'EEEE, d MMMM yyyy')}
              </p>
            </div>
          </div>
          <DialogDescription className="text-base pt-2">
            {language === 'en' 
              ? 'Ready to set up your massive objectives for this week and knock them down one by one?'
              : 'Vrei să setezi obiectivele masive pentru săptămâna aceasta și să le dobori unul câte unul?'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 my-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="font-medium">
              {language === 'en' ? 'Domino Door will help you:' : 'Domino Door te va ajuta să:'}
            </span>
          </div>
          <ul className="text-sm space-y-1 pl-6 list-disc text-muted-foreground">
            <li>{language === 'en' ? 'Review last week\'s achievements' : 'Revezi ce s-a atins săptămâna trecută'}</li>
            <li>{language === 'en' ? 'Learn from challenges and blockers' : 'Înveți din blocaje și provocări'}</li>
            <li>{language === 'en' ? 'Set your focus for the new week' : 'Setezi focus-ul pentru săptămâna nouă'}</li>
            <li>{language === 'en' ? 'Define the 4 measurable keys' : 'Definești cele 4 chei măsurabile'}</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleDismiss}>
            {language === 'en' ? 'Later' : 'Mai târziu'}
          </Button>
          <Button 
            onClick={handleStartPlanning}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Target className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Let\'s plan!' : 'Hai să planificăm!'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
