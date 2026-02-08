import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { UserAccountDropdown } from '@/components/UserAccountDropdown';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { SkoolNavBar, SkoolTab } from './SkoolNavBar';
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
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
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
      {/* Minimal Header */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left: Back to Warrior OS */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Warrior OS</span>
              <span className="sm:hidden">WOS</span>
            </Button>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8 rounded-lg"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <LanguageSelector />
              {user ? (
                <UserAccountDropdown />
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link to="/auth">{language === 'en' ? 'Log in' : 'Autentificare'}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

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
