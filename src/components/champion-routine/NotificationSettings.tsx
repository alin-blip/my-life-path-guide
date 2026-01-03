import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('07:00');
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load saved settings from localStorage
    const saved = localStorage.getItem(`champion-routine-notifications-${userId}`);
    if (saved) {
      const settings = JSON.parse(saved);
      setNotificationsEnabled(settings.enabled);
      setReminderTime(settings.time);
    }
  }, [userId]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser-ul tău nu suportă notificări');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      toast.success('Notificări activate!');
      return true;
    } else {
      toast.error('Permisiune pentru notificări refuzată');
      return false;
    }
  };

  const handleToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setNotificationsEnabled(enabled);
    saveSettings(enabled, reminderTime);

    if (enabled) {
      scheduleNotification(reminderTime);
      toast.success(`Reminder setat pentru ${reminderTime}`);
    } else {
      toast.info('Notificările au fost dezactivate');
    }
  };

  const handleTimeChange = (time: string) => {
    setReminderTime(time);
    saveSettings(notificationsEnabled, time);
    
    if (notificationsEnabled) {
      scheduleNotification(time);
      toast.success(`Reminder actualizat la ${time}`);
    }
  };

  const saveSettings = (enabled: boolean, time: string) => {
    localStorage.setItem(`champion-routine-notifications-${userId}`, JSON.stringify({
      enabled,
      time
    }));
  };

  const scheduleNotification = (time: string) => {
    // Calculate milliseconds until next reminder
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    const msUntilReminder = reminderDate.getTime() - now.getTime();

    // Clear any existing timeout
    const existingTimeout = localStorage.getItem(`champion-routine-timeout-${userId}`);
    if (existingTimeout) {
      clearTimeout(Number(existingTimeout));
    }

    // Schedule notification
    const timeoutId = setTimeout(() => {
      showNotification();
      // Reschedule for next day
      scheduleNotification(time);
    }, msUntilReminder);

    localStorage.setItem(`champion-routine-timeout-${userId}`, String(timeoutId));
  };

  const showNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🌅 Rutina de Campion', {
        body: 'Bună dimineața! Ai început Rutina de Campion?',
        icon: '/favicon.ico',
        tag: 'champion-routine-reminder',
        requireInteraction: true
      });
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🌅 Test Notificare', {
        body: 'Notificările funcționează corect!',
        icon: '/favicon.ico'
      });
      toast.success('Notificare de test trimisă');
    } else {
      toast.error('Mai întâi activează notificările');
    }
  };

  const timeOptions = [];
  for (let h = 5; h <= 10; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${minute}`);
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notificationsEnabled ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium">Reminder Dimineața</p>
            <p className="text-sm text-muted-foreground">
              Primește o notificare să începi rutina
            </p>
          </div>
        </div>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {notificationsEnabled && (
        <div className="flex items-center gap-4 pl-8">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Ora:</span>
          </div>
          <Select value={reminderTime} onValueChange={handleTimeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(time => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={testNotification}>
            Test
          </Button>
        </div>
      )}

      {permission === 'denied' && (
        <p className="text-sm text-destructive pl-8">
          Notificările sunt blocate. Modifică setările browser-ului pentru a le activa.
        </p>
      )}
    </Card>
  );
}
