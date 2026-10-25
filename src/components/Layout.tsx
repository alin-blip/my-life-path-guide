import React, { useState, useEffect, useCallback } from 'react';
import { SideMenu } from './SideMenu';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReferralTracker } from './ReferralTracker';
import { ReferralClientOnboarding } from './coach/ReferralClientOnboarding';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { useTourContext } from '@/context/TourContext';
import { GlobalTopBar } from './global/GlobalTopBar';
import { MobileGlobalNav } from './global/MobileGlobalNav';
import { SectionErrorBoundary } from './SectionErrorBoundary';

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

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : prev || '';
    return () => { document.body.style.overflow = prev; };
  }, [isMobile, isMobileMenuOpen]);

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
    <div className={`flex min-h-[100dvh] mesh-gradient overflow-x-hidden max-w-[100vw] ${isMobile ? '' : 'overflow-y-auto'}`}>
      <SectionErrorBoundary name="Referral tracking" fallbackHeight="0px">
        <ReferralTracker />
      </SectionErrorBoundary>
      <SectionErrorBoundary name="Referral onboarding" fallbackHeight="0px">
        <ReferralClientOnboarding />
      </SectionErrorBoundary>

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${isMobile
          ? `fixed top-0 left-0 h-[100dvh] z-50 w-[280px] overflow-y-auto overscroll-contain transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
          : `fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-20 ${isMenuCollapsed ? 'w-[70px]' : 'w-[260px]'}`
        } glass-sidebar
      `}
        style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' } : undefined}
      >
        <SectionErrorBoundary name="Navigation menu" fallbackHeight="0px">
          <SideMenu
            isCollapsed={!isMobile && isMenuCollapsed}
            onItemClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}
          />
        </SectionErrorBoundary>
      </div>

      {/* Menu Toggle Button - desktop only */}
      <button
        onClick={toggleMenu}
        className={`
          hidden md:flex fixed z-30 p-2.5 rounded-xl shadow-lg transition-all duration-300
          bg-gradient-primary text-primary-foreground hover:shadow-xl hover:scale-105
          top-6 ${isMenuCollapsed ? 'left-[86px]' : 'left-[276px]'}
        `}
      >
        {isMenuCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Main Content */}
      <div className={`
        flex-1 min-w-0 transition-all duration-300 ease-in-out w-full overflow-x-hidden
        ${isMobile ? 'ml-0' : `overflow-y-auto ${isMenuCollapsed ? 'ml-[70px]' : 'ml-[260px]'}`}
      `}>
        <SectionErrorBoundary name="Top navigation" fallbackHeight="0px">
          <GlobalTopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
        </SectionErrorBoundary>

        <div
          className={`${isMobile ? 'px-4 py-4 safe-x' : 'p-8'} overflow-x-hidden min-h-full`}
          style={isMobile ? { paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' } : undefined}
        >
          <main className="animate-fade-in">{children}</main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <SectionErrorBoundary name="Mobile navigation" fallbackHeight="0px">
          <MobileGlobalNav onMenuClick={() => setIsMobileMenuOpen(true)} />
        </SectionErrorBoundary>
      )}

      {/* Goal Reminders Notification - lazy loaded */}
      <Suspense fallback={null}>
        <SectionErrorBoundary name="Goal reminders" fallbackHeight="0px">
          <GoalRemindersNotification />
        </SectionErrorBoundary>
      </Suspense>

      {/* Accountability Coach Widget - Hidden on Challenge routes, lazy loaded */}
      {!isChallengeRoute && (
        <Suspense fallback={null}>
          <SectionErrorBoundary name="Accountability Coach" fallbackHeight="0px">
            <AccountabilityCoachWidget />
          </SectionErrorBoundary>
        </Suspense>
      )}

    </div>
  );
};
