import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { SkoolNavBar, SkoolTab } from './SkoolNavBar';
import { GlobalTopBar } from '@/components/global/GlobalTopBar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface ProgramsLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  activeTab?: SkoolTab;
  showNavBar?: boolean;
  onTabChange?: (tab: SkoolTab) => void;
}

export const ProgramsLayout: React.FC<ProgramsLayoutProps> = ({
  children,
  sidebar,
  activeTab,
  showNavBar = true,
  onTabChange,
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentTab = activeTab || (searchParams.get('tab') as SkoolTab) || 'classroom';

  const handleTabChange = (tab: SkoolTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      navigate(`/programs?tab=${tab}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Global Top Bar */}
      <GlobalTopBar />

      {/* Skool Navigation Bar */}
      {showNavBar && (
        <SkoolNavBar activeTab={currentTab} onTabChange={handleTabChange} />
      )}

      {/* Content Area with optional sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {sidebar && !isMobile && (
          <aside className="w-72 lg:w-80 border-r border-border/60 bg-card/50 overflow-y-auto shrink-0">
            {sidebar}
          </aside>
        )}

        {/* Mobile Sidebar Sheet */}
        {sidebar && isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Lecții</SheetTitle>
              </SheetHeader>
              {sidebar}
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile: sidebar toggle */}
          {sidebar && isMobile && (
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/60 p-3 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'en' ? 'Lessons' : 'Lecții'}
              </span>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
