import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Clock } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications: true,
    notification_day: 1, // Monday
    notification_time: '09:00'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('napoleon_hill_notifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setSettings({
          email_notifications: data.email_notifications,
          notification_day: data.notification_day,
          notification_time: data.notification_time
        });
      } else if (error && error.code === 'PGRST116') {
        // No settings yet, create default
        await supabase
          .from('napoleon_hill_notifications')
          .insert({
            user_id: user.id,
            email_notifications: true,
            notification_day: 1,
            notification_time: '09:00'
          });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('napoleon_hill_notifications')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (error) throw error;

      toast({
        title: "Setări salvate!",
        description: "Preferințele tale de notificări au fost actualizate"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut salva setările",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  const days = [
    { value: 1, label: 'Luni' },
    { value: 2, label: 'Marți' },
    { value: 3, label: 'Miercuri' },
    { value: 4, label: 'Joi' },
    { value: 5, label: 'Vineri' },
    { value: 6, label: 'Sâmbătă' },
    { value: 7, label: 'Duminică' }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Notificări Săptămânale</h3>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-notifications" className="text-base">
              Notificări Email
            </Label>
            <p className="text-sm text-muted-foreground">
              Primește reminder-e săptămânale pentru journey-ul tău
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={settings.email_notifications}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, email_notifications: checked })
            }
          />
        </div>

        {settings.email_notifications && (
          <>
            <div>
              <Label htmlFor="notification-day" className="text-base mb-2 block">
                Ziua Notificării
              </Label>
              <Select
                value={settings.notification_day.toString()}
                onValueChange={(value) => 
                  setSettings({ ...settings, notification_day: parseInt(value) })
                }
              >
                <SelectTrigger id="notification-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notification-time" className="text-base mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Ora Notificării
              </Label>
              <Select
                value={settings.notification_time}
                onValueChange={(value) => 
                  setSettings({ ...settings, notification_time: value })
                }
              >
                <SelectTrigger id="notification-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="07:00">07:00</SelectItem>
                  <SelectItem value="08:00">08:00</SelectItem>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="11:00">11:00</SelectItem>
                  <SelectItem value="12:00">12:00</SelectItem>
                  <SelectItem value="18:00">18:00</SelectItem>
                  <SelectItem value="19:00">19:00</SelectItem>
                  <SelectItem value="20:00">20:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button 
          onClick={saveSettings} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? 'Se salvează...' : 'Salvează Setările'}
        </Button>
      </div>
    </Card>
  );
};
