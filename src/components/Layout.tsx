import React, { useState } from 'react';
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
import { PlatformAssistantWidget } from './assistant/PlatformAssistantWidget';
import { QuickAddButton } from './gtd/QuickAddButton';
import { GoalRemindersNotification } from './door/GoalRemindersNotification';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/';
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const { isLoading, shareReferralLink } = useAffiliateLink();
  const { theme, toggleTheme } = useTheme();

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

  // Format date to match the image (March 29th 2025)
  const formatDate = () => {
    const date = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Add ordinal suffix
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    if (day === 2 || day === 22) suffix = 'nd';
    if (day === 3 || day === 23) suffix = 'rd';
    return `${month} ${day}${suffix} ${year}`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen mesh-gradient">
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
        flex-1 transition-all duration-300 ease-in-out
        ${isMobile ? 'ml-0' : isMenuCollapsed ? 'ml-[70px]' : 'ml-[260px]'}
      `}>
        <div className={`${isMobile ? 'p-4 pt-16' : 'p-8'}`}>
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
              <div className="glass-card px-3 py-1.5 rounded-lg">
                <span className="text-xs font-medium text-muted-foreground">{formatDate()}</span>
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
      
      {/* Platform Assistant Widget */}
      <PlatformAssistantWidget />
      
      {/* Quick Add Button */}
      <QuickAddButton />
    </div>
  );
};
