import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { language } = useLanguage();
  const locale = language === 'ro' ? ro : enUS;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">
            {language === 'ro' ? 'Notificări' : 'Notifications'}
          </h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" onClick={markAllAsRead}>
              <CheckCheck className="h-3.5 w-3.5" />
              {language === 'ro' ? 'Marchează toate' : 'Mark all read'}
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[360px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {language === 'ro' ? 'Nicio notificare' : 'No notifications'}
            </div>
          ) : (
            notifications.map(notif => (
              <button
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border/30 hover:bg-accent/40 transition-colors",
                  !notif.is_read && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-2">
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at || ''), { addSuffix: true, locale })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
