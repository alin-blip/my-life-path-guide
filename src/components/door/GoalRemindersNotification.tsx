import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, ChevronRight, Dumbbell, Brain, Heart, Briefcase } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { goalRemindersService, ReminderWithGoal } from '@/services/goalRemindersService';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ICONS = {
  body: Dumbbell,
  being: Brain,
  balance: Heart,
  business: Briefcase
};

const CATEGORY_COLORS = {
  body: 'text-emerald-500 bg-emerald-500/10',
  being: 'text-purple-500 bg-purple-500/10',
  balance: 'text-rose-500 bg-rose-500/10',
  business: 'text-blue-500 bg-blue-500/10'
};

export const GoalRemindersNotification: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<ReminderWithGoal[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDueReminders();
    
    // Check for new reminders every 5 minutes
    const interval = setInterval(loadDueReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDueReminders = async () => {
    try {
      const dueReminders = await goalRemindersService.getDueReminders();
      setReminders(dueReminders);
    } catch (error) {
      console.error('Error loading due reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (reminder: ReminderWithGoal) => {
    setDismissedIds(prev => new Set([...prev, reminder.id]));
    await goalRemindersService.markReminderShown(reminder.id, reminder.frequency);
  };

  const handleViewGoal = (reminder: ReminderWithGoal) => {
    handleDismiss(reminder);
    navigate('/door?tab=quarterly');
  };

  const visibleReminders = reminders.filter(r => !dismissedIds.has(r.id));

  if (loading || visibleReminders.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleReminders.slice(0, 3).map((reminder) => {
        const category = reminder.mission?.category || 'body';
        const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Bell;
        const colors = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'text-primary bg-primary/10';
        const progress = reminder.mission?.goal_data?.progress || 0;

        return (
          <Card 
            key={reminder.id}
            className="animate-in slide-in-from-right-5 shadow-lg border-2"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", colors.split(' ')[1])}>
                  <Icon className={cn("w-5 h-5", colors.split(' ')[0])} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      <Bell className="w-3 h-3 mr-1" />
                      {language === 'en' ? 'Goal Reminder' : 'Reminder Obiectiv'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 -mr-2"
                      onClick={() => handleDismiss(reminder)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="font-medium text-sm truncate">
                    {reminder.mission?.title || 'Goal'}
                  </p>
                  
                  {reminder.mission?.measurable_result && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {reminder.mission.measurable_result}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", colors.split(' ')[1].replace('/10', ''))}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{progress}%</span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleViewGoal(reminder)}
                    >
                      {language === 'en' ? 'View' : 'Vezi'}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {visibleReminders.length > 3 && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigate('/door?tab=quarterly')}
        >
          +{visibleReminders.length - 3} {language === 'en' ? 'more reminders' : 'alte remindere'}
        </Button>
      )}
    </div>
  );
};
