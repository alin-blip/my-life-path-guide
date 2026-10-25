import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, GraduationCap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAccountDropdown } from '@/components/UserAccountDropdown';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useTourContext } from '@/context/TourContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import { cn } from '@/lib/utils';

interface GlobalTopBarProps {
  onMenuClick?: () => void;
}

export const GlobalTopBar: React.FC<GlobalTopBarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadTotal } = useDirectMessages();
  useTourContext();

  const isActive = (path: string) => {
    if (path === '/programs?tab=community') {
      return location.pathname === '/programs' && 
        (!location.search.includes('tab=') || location.search.includes('tab=community'));
    }
    if (path === '/programs?tab=classroom') {
      return location.pathname === '/programs' && location.search.includes('tab=classroom');
    }
    return location.pathname === path;
  };

  const navTabs = [
    {
      label: language === 'ro' ? 'Comunitate' : 'Community',
      path: '/programs?tab=community',
      icon: Users,
    },
    {
      label: language === 'ro' ? 'Cursuri' : 'Courses',
      path: '/programs?tab=classroom',
      icon: GraduationCap,
    },
  ];

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md bg-background/90 border-b border-primary/15"
      style={{
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div className="relative flex items-center justify-between h-14 px-3 md:px-4 gap-2">
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center gap-1 shrink-0">
          {isMobile && onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={onMenuClick}
              className="h-11 w-11 text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/dashboard" className="flex items-center gap-2 group">
          <img
            src="/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png"
            alt="CEO Mind OS"
            className="h-7 w-auto"
          />
          {!isMobile && (
            <span className="font-display text-lg tracking-tight text-foreground">
              CEO Mind <em className="not-italic font-display italic text-primary">OS</em>
            </span>
          )}
          </Link>
        </div>

        {/* Center: Nav tabs */}
        <nav className="flex items-center gap-1">
          {navTabs.map((tab) => (
            <Button
              key={tab.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(tab.path.split('?')[0] + '?' + tab.path.split('?')[1])}
              className={cn(
                'gap-1.5 text-sm font-medium transition-colors',
                isActive(tab.path)
                  ? 'text-primary bg-primary/10 hover:text-primary hover:bg-primary/15'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {!isMobile && <span>{tab.label}</span>}
            </Button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Messages */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Messages"
            className="relative h-11 w-11 md:h-9 md:w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => navigate('/messages')}
          >
            <MessageCircle className="h-4.5 w-4.5" />
            {unreadTotal > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}
          </Button>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Profile */}
          {user ? (
            <UserAccountDropdown />
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/auth">{language === 'en' ? 'Log in' : 'Autentificare'}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
