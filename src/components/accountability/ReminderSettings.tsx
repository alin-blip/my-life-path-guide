import React from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bell, Volume2, VolumeX, BellRing, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TaskReminderSettings } from '@/hooks/useTaskReminders';
import { cn } from '@/lib/utils';

interface ReminderSettingsProps {
  settings: TaskReminderSettings;
  onUpdateSettings: (updates: Partial<TaskReminderSettings>) => void;
  onEnableBrowserNotifications: () => void;
}

const intervals = [
  { value: '15', label: '15m' },
  { value: '30', label: '30m' },
  { value: '60', label: '1h' },
  { value: '120', label: '2h' },
  { value: '0', label: 'Off' },
];

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  settings,
  onUpdateSettings,
  onEnableBrowserNotifications,
}) => {
  const { language } = useLanguage();
  const permissionStatus = 'Notification' in window ? Notification.permission : 'default';
  const hasBrowserPermission = permissionStatus === 'granted';
  const isDenied = permissionStatus === 'denied';

  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border/50 space-y-3">
      {/* Interval selection */}
      <div className="flex items-center gap-2 flex-wrap">
        <Bell className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground">
          {language === 'ro' ? 'Remind la:' : 'Remind every:'}
        </span>
        <ToggleGroup 
          type="single" 
          value={settings.intervalMinutes.toString()}
          onValueChange={(value) => {
            if (value) {
              onUpdateSettings({ intervalMinutes: parseInt(value) });
            }
          }}
          className="gap-1"
        >
          {intervals.map(int => (
            <ToggleGroupItem 
              key={int.value} 
              value={int.value}
              size="sm"
              className={cn(
                "text-xs px-2 h-7",
                settings.intervalMinutes.toString() === int.value && "bg-primary text-primary-foreground"
              )}
            >
              {int.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Sound and notifications */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={cn(
              "h-7 px-2 text-xs gap-1",
              settings.soundEnabled ? "text-primary" : "text-muted-foreground"
            )}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            {language === 'ro' ? 'Sunet' : 'Sound'}
          </Button>

          {/* Browser notifications - show only if not granted AND not denied */}
          {!hasBrowserPermission && !isDenied && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEnableBrowserNotifications}
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
            >
              <BellRing className="w-3.5 h-3.5" />
              {language === 'ro' ? 'Activează notificări' : 'Enable notifications'}
            </Button>
          )}

          {hasBrowserPermission && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <BellRing className="w-3 h-3" />
              {language === 'ro' ? 'Notificări active' : 'Notifications on'}
            </span>
          )}
        </div>
      </div>

      {/* Notifications blocked warning */}
      {isDenied && (
        <div className="text-xs text-amber-600 bg-amber-500/10 p-2 rounded flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            {language === 'ro' 
              ? 'Notificările sunt blocate de browser. Apasă pe iconița 🔒 din bara de adresă și permite notificările.' 
              : 'Notifications are blocked. Click the 🔒 icon in address bar and allow notifications.'}
          </span>
        </div>
      )}
    </div>
  );
};
