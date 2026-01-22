import React, { useState, useEffect, useCallback } from 'react';
import { SideMenu } from './SideMenu';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share, Menu, X, Sun, Moon } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from './ui/button';
import { useAffiliateLink } from '@/hooks/useAffiliateLink';
import { ReferralTracker } from './ReferralTracker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTourContext } from '@/context/TourContext';

import { GoalRemindersNotification } from './door/GoalRemindersNotification';
import { AccountabilityCoachWidget } from './accountability/AccountabilityCoachWidget';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/' || location.pathname === '/auth';
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const { isLoading, shareReferralLink } = useAffiliateLink();
  const { theme, toggleTheme } = useTheme();
  const { registerMobileMenuControl } = useTourContext();

  // Register mobile menu controls for tour
  const openMobileMenuHandler = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const closeMobileMenuHandler = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (isMobile) {
      registerMobileMenuControl(openMobileMenuHandler, closeMobileMenuHandler);
    }
  }, [isMobile, registerMobileMenuControl, openMobileMenuHandler, closeMobileMenuHandler]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const toggleMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsMenuCollapsed(!isMenuCollapsed);
    }
  };

  // Format date - short numeric for mobile, full for desktop
  const formatDate = (short = false) => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const shortYear = year.toString().slice(-2);

    if (short) {
      return `${day}/${month}/${shortYear}`;
    }

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];

    // Add ordinal suffix
    let suffix = 'th';
    if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = 'st';
    if (dayNum === 2 || dayNum === 22) suffix = 'nd';
    if (dayNum === 3 || dayNum === 23) suffix = 'rd';
    return `${monthName} ${dayNum}${suffix} ${year}`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen mesh-gradient overflow-x-hidden max-w-[100vw]">
      <ReferralTracker />
      
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed top-0 left-0 h-screen z-40 w-[280px] transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : `fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-20 ${isMenuCollapsed ? 'w-[70px]' : 'w-[260px]'}`
        } glass-sidebar
      `}>
        <SideMenu 
          isCollapsed={!isMobile && isMenuCollapsed} 
          onItemClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined} 
        />
      </div>
      
      {/* Menu Toggle Button */}
      <button 
        onClick={toggleMenu} 
        className={`
          fixed z-30 p-2.5 rounded-xl shadow-lg transition-all duration-300
          bg-gradient-primary text-primary-foreground hover:shadow-xl hover:scale-105
          ${isMobile 
            ? 'top-4 left-4' 
            : `top-6 transition-all duration-300 ${isMenuCollapsed ? 'left-[86px]' : 'left-[276px]'}`
          }
        `}
      >
        {isMobile 
          ? (isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />) 
          : (isMenuCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)
        }
      </button>
      
      {/* Main Content */}
      <div className={`
        flex-1 transition-all duration-300 ease-in-out w-full overflow-x-hidden
        ${isMobile ? 'ml-0' : isMenuCollapsed ? 'ml-[70px]' : 'ml-[260px]'}
      `}>
        <div className={`${isMobile ? 'px-3 py-4 pt-16' : 'p-8'} overflow-x-hidden`}>
          {/* Header - Desktop */}
          {!isMobile && (
            <div className="flex justify-between items-center mb-8">
              <div className="glass-card px-4 py-2 rounded-xl">
                <span className="text-sm font-medium text-muted-foreground">{formatDate()}</span>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="glass" 
                  size="icon" 
                  onClick={toggleTheme}
                  className="rounded-xl"
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <LanguageSelector />
              </div>
            </div>
          )}
          
          {/* Mobile Header - Simplified */}
          {isMobile && (
            <div className="flex justify-between items-center mb-4">
              <div className="glass-card px-2 py-1 rounded-lg">
                <span className="text-xs font-medium text-muted-foreground">{formatDate(true)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="glass" 
                  size="icon" 
                  onClick={toggleTheme}
                  className="h-8 w-8 rounded-lg"
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                {!user ? (
                  <Button asChild variant="default" size="sm">
                    <Link to="/auth">{language === 'en' ? 'Log in' : 'Autentificare'}</Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    {language === 'en' ? 'Log out' : 'Delogare'}
                  </Button>
                )}
                <LanguageSelector />
              </div>
            </div>
          )}
          
          <main className="animate-fade-in">{children}</main>
        </div>
      </div>
      
      {/* Goal Reminders Notification */}
      <GoalRemindersNotification />
      
      {/* Accountability Coach Widget - Always visible */}
      <AccountabilityCoachWidget />
      
    </div>
  );
};
