import React, { useState, useEffect, useCallback } from 'react';
import { SideMenu } from './SideMenu';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { ReferralTracker } from './ReferralTracker';
import { ReferralClientOnboarding } from './coach/ReferralClientOnboarding';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { useTourContext } from '@/context/TourContext';
import { GlobalTopBar } from './global/GlobalTopBar';
import { MobileGlobalNav } from './global/MobileGlobalNav';

import { useActivityTracker } from '@/hooks/useActivityTracker';
import { lazy, Suspense } from 'react';

const GoalRemindersNotification = lazy(() => import('./door/GoalRemindersNotification').then(m => ({ default: m.GoalRemindersNotification })));
const AccountabilityCoachWidget = lazy(() => import('./accountability/AccountabilityCoachWidget').then(m => ({ default: m.AccountabilityCoachWidget })));

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/auth';
  const isChallengeRoute = location.pathname.startsWith('/challenge');
  const { user } = useAuth();
  const { registerMobileMenuControl } = useTourContext();
  
  // Activity tracker - tracks page views and sessions automatically
  useActivityTracker();

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

  return (
    <div className="flex min-h-screen mesh-gradient overflow-x-hidden overflow-y-auto max-w-[100vw]">
      <ReferralTracker />
      <ReferralClientOnboarding />
      
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
        flex-1 transition-all duration-300 ease-in-out w-full overflow-x-hidden overflow-y-auto
        ${isMobile ? 'ml-0' : isMenuCollapsed ? 'ml-[70px]' : 'ml-[260px]'}
      `}>
        {/* Global Top Bar */}
        <GlobalTopBar />
        
        <div className={`${isMobile ? 'px-4 py-4 pt-16 safe-x safe-bottom' : 'p-8'} overflow-x-hidden min-h-full`}>
          <main className="animate-fade-in">{children}</main>
        </div>
      </div>
      
      {/* Goal Reminders Notification - lazy loaded */}
      <Suspense fallback={null}>
        <GoalRemindersNotification />
      </Suspense>
      
      {/* Accountability Coach Widget - Hidden on Challenge routes, lazy loaded */}
      {!isChallengeRoute && (
        <Suspense fallback={null}>
          <AccountabilityCoachWidget />
        </Suspense>
      )}
      
    </div>
  );
};
