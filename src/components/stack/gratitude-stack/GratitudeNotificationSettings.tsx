import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Clock, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GratitudeNotificationSettings {
  enabled: boolean;
  time: string;
  daysOfWeek: number[];
}

const DEFAULT_SETTINGS: GratitudeNotificationSettings = {
  enabled: false,
  time: '07:00',
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // All days
};

const STORAGE_KEY = 'gratitude-notification-settings';

export const GratitudeNotificationSettingsComponent: React.FC = () => {
  const [settings, setSettings] = useState<GratitudeNotificationSettings>(DEFAULT_SETTINGS);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading notification settings:', e);
      }
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notificări indisponibile',
        description: 'Browserul tău nu suportă notificări.',
        variant: 'destructive'
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      toast({
        title: 'Notificări activate',
        description: 'Vei primi remindere pentru Gratitude Stack!',
      });
      return true;
    } else {
      toast({
        title: 'Permisiune refuzată',
        description: 'Trebuie să permiți notificările din setările browserului.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }

    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    saveSettings(newSettings);

    if (enabled) {
      scheduleNotification(newSettings);
      toast({
        title: '🙏 Remindere activat',
        description: `Vei primi un reminder zilnic la ${newSettings.time} pentru Gratitude Stack.`,
      });
    } else {
      cancelScheduledNotifications();
      toast({
        title: 'Remindere dezactivat',
        description: 'Nu vei mai primi notificări pentru Gratitude Stack.',
      });
    }
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...settings, time };
    setSettings(newSettings);
    saveSettings(newSettings);

    if (settings.enabled) {
      scheduleNotification(newSettings);
    }
  };

  const saveSettings = (newSettings: GratitudeNotificationSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  const scheduleNotification = (notificationSettings: GratitudeNotificationSettings) => {
    // Store the schedule info for the service worker or background check
    localStorage.setItem('gratitude-next-notification', JSON.stringify({
      time: notificationSettings.time,
      lastShown: null
    }));

    // Set up a check interval (runs when app is open)
    const checkAndNotify = () => {
      const now = new Date();
      const [hours, minutes] = notificationSettings.time.split(':').map(Number);
      
      const lastShown = localStorage.getItem('gratitude-last-notification-date');
      const today = now.toISOString().split('T')[0];
      
      if (
        lastShown !== today &&
        now.getHours() === hours &&
        now.getMinutes() === minutes
      ) {
        showGratitudeNotification();
        localStorage.setItem('gratitude-last-notification-date', today);
      }
    };

    // Check every minute when app is open
    const intervalId = setInterval(checkAndNotify, 60000);
    
    // Store interval ID for cleanup
    (window as any).gratitudeNotificationInterval = intervalId;
  };

  const cancelScheduledNotifications = () => {
    if ((window as any).gratitudeNotificationInterval) {
      clearInterval((window as any).gratitudeNotificationInterval);
    }
    localStorage.removeItem('gratitude-next-notification');
  };

  const showGratitudeNotification = () => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('🙏 Timp pentru Recunoștință', {
        body: 'Începe ziua cu recunoștință! Completează Gratitude Stack-ul tău acum.',
        icon: '/favicon.ico',
        tag: 'gratitude-reminder',
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/stack?type=gratitude';
        notification.close();
      };
    }
  };

  const testNotification = () => {
    if (notificationPermission === 'granted') {
      showGratitudeNotification();
      toast({
        title: 'Notificare de test trimisă',
        description: 'Verifică notificările browserului.',
      });
    } else {
      toast({
        title: 'Permisiune necesară',
        description: 'Activează mai întâi notificările.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30">
      <CardHeader>
        <CardTitle className="text-emerald-300 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Reminder Gratitude Stack
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Bell className="h-5 w-5 text-emerald-400" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <Label htmlFor="notification-toggle" className="text-gray-200">
                Reminder zilnic
              </Label>
              <p className="text-xs text-gray-400">
                Primește un reminder pentru Gratitude Stack
              </p>
            </div>
          </div>
          <Switch
            id="notification-toggle"
            checked={settings.enabled}
            onCheckedChange={handleToggleEnabled}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {settings.enabled && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-emerald-400" />
              <div className="flex-1">
                <Label className="text-gray-200 mb-2 block">Ora reminder-ului</Label>
                <Select value={settings.time} onValueChange={handleTimeChange}>
                  <SelectTrigger className="bg-background/50 border-emerald-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">06:00 - Dimineață devreme</SelectItem>
                    <SelectItem value="07:00">07:00 - Dimineață</SelectItem>
                    <SelectItem value="08:00">08:00 - Start de zi</SelectItem>
                    <SelectItem value="09:00">09:00 - După micul dejun</SelectItem>
                    <SelectItem value="20:00">20:00 - Seara</SelectItem>
                    <SelectItem value="21:00">21:00 - Înainte de culcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={testNotification}
              className="w-full border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20"
            >
              <Heart className="h-4 w-4 mr-2" />
              Testează notificarea
            </Button>
          </div>
        )}

        {notificationPermission === 'denied' && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
            ⚠️ Notificările sunt blocate. Permite-le din setările browserului.
          </div>
        )}

        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-200/80">
          💡 <strong>Sfat:</strong> Cel mai bun moment pentru recunoștință este dimineața, 
          când mintea ta este proaspătă și deschisă.
        </div>
      </CardContent>
    </Card>
  );
};
