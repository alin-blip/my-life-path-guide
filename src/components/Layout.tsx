import React, { useState } from 'react';
import { SideMenu } from './SideMenu';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share, Menu, X } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from './ui/button';
import { useAffiliateLink } from '@/hooks/useAffiliateLink';
import { ReferralTracker } from './ReferralTracker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
interface LayoutProps {
  children: React.ReactNode;
}
export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const isMobile = useIsMobile();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/';
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const { isLoading, shareReferralLink } = useAffiliateLink();
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
  return <div className="flex min-h-screen bg-[#0a0e1a]">
      <ReferralTracker />
      
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed top-0 left-0 h-screen z-40 w-[280px] transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : `fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-20 ${
              isMenuCollapsed ? 'w-[70px]' : 'w-[240px]'
            }`
        } bg-[#11152b]
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
          fixed z-30 bg-blue-500 hover:bg-blue-600 p-2 rounded-full shadow-md transition-all duration-300
          ${isMobile 
            ? 'top-4 left-4' 
            : `top-6 transition-all duration-300 ${isMenuCollapsed ? 'left-[86px]' : 'left-[256px]'}`
          }
        `}
      >
        {isMobile ? (
          isMobileMenuOpen ? 
            <X className="w-5 h-5 text-white" /> : 
            <Menu className="w-5 h-5 text-white" />
        ) : (
          isMenuCollapsed ? 
            <ChevronRight className="w-4 h-4 text-white" /> : 
            <ChevronLeft className="w-4 h-4 text-white" />
        )}
      </button>
      
      {/* Main Content */}
      <div className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isMobile ? 'ml-0' : (isMenuCollapsed ? 'ml-[70px]' : 'ml-[240px]')}
      `}>
        <div className={`${isMobile ? 'p-4 pt-16' : 'p-6'}`}>
          {/* Header - Hidden on mobile to save space */}
          {!isMobile && (
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center justify-end space-x-4 w-full">
                  <div className="text-sm text-gray-400">
                    {formatDate()}
                  </div>
                  {!user ? (
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/auth">{language === 'en' ? 'Log in' : 'Autentificare'}</Link>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link to="/profile">{language === 'en' ? 'My account' : 'Contul meu'}</Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSignOut}>
                        {language === 'en' ? 'Log out' : 'Delogare'}
                      </Button>
                    </div>
                  )}
                  <LanguageSelector />
                </div>
            </div>
          )}
          
          {/* Mobile Header - Simplified */}
          {isMobile && (
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs text-gray-400">
                {formatDate()}
              </div>
              <div className="flex items-center gap-2">
                {!user ? (
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/auth">{language === 'en' ? 'Log in' : 'Autentificare'}</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/profile">{language === 'en' ? 'My account' : 'Contul meu'}</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      {language === 'en' ? 'Log out' : 'Delogare'}
                    </Button>
                  </>
                )}
                <LanguageSelector />
              </div>
            </div>
          )}
          
          <main className="animate-fade-in">{children}</main>
        </div>
      </div>
    </div>;
};