import React, { useState } from 'react';
import { SideMenu } from './SideMenu';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from './ui/button';
import { useAffiliateLink } from '@/hooks/useAffiliateLink';
import { ReferralTracker } from './ReferralTracker';
interface LayoutProps {
  children: React.ReactNode;
}
export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/';
  const {
    language
  } = useLanguage();
  const {
    isLoading,
    shareReferralLink
  } = useAffiliateLink();
  if (isAuthPage) {
    return <>{children}</>;
  }
  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
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
  return <div className="flex min-h-screen bg-[#0a0e1a]">
      <ReferralTracker />
      <div className={`fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-20 ${isMenuCollapsed ? 'w-[70px]' : 'w-[240px]'} bg-[#11152b]`}>
        <SideMenu isCollapsed={isMenuCollapsed} />
      </div>
      
      <button onClick={toggleMenu} className="fixed top-6 left-[240px] z-30 bg-blue-500 hover:bg-blue-600 p-1.5 rounded-full shadow-md transition-all duration-300 transform" style={{
      left: isMenuCollapsed ? '70px' : '240px'
    }}>
        {isMenuCollapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
      </button>
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isMenuCollapsed ? 'ml-[70px]' : 'ml-[240px]'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1"></div>
            
            {/* Share Button - Centered */}
            <div className="flex-1 flex justify-center">
              <Button variant="outline" size="sm" onClick={shareReferralLink} disabled={isLoading} className="group relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:border-purple-500/50 hover:from-blue-600/30 hover:to-purple-600/30">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                
                <div className="relative flex items-center gap-2 z-10">
                  <Share className="w-4 h-4 text-blue-300" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 group-hover:from-blue-200 group-hover:to-purple-200 transition-all whitespace-normal text-xs">
                    {language === 'en' ? 'Invite a friend and earn 50% of their subscription while they use the platform' : 'Invita un prieten si castiga 50% din abonamentul lor cat timp foloseste platforma'}
                  </span>
                </div>
              </Button>
            </div>
            
            <div className="flex-1 flex items-center justify-end space-x-4">
              <div className="text-sm text-gray-400">
                {formatDate()}
              </div>
              <LanguageSelector />
            </div>
          </div>
          <main className="animate-fade-in">{children}</main>
        </div>
      </div>
    </div>;
};