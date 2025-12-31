import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Home, 
  Calendar, 
  Target,
  Play,
  BarChart3,
  Sparkles,
  BookOpen,
  Layers,
  Settings, 
  HelpCircle,
  Shield,
  ChevronDown,
  ChevronRight,
  Clock,
  Briefcase,
  Pencil,
  Crown,
  CreditCard,
  Box
} from 'lucide-react';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

interface SideMenuProps {
  isCollapsed: boolean;
  onItemClick?: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  notification?: number;
  subItems?: MenuItem[];
  hidden?: boolean;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isCollapsed, onItemClick }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { t, language } = useLanguage();

  // Auto-expand parent menu when on child route
  useEffect(() => {
    if (currentPath.startsWith('/stack') || currentPath === '/journal') {
      setExpandedMenus(prev => prev.includes('coaching') ? prev : [...prev, 'coaching']);
    }
    if (currentPath.startsWith('/door')) {
      setExpandedMenus(prev => prev.includes('planificare') ? prev : [...prev, 'planificare']);
    }
  }, [currentPath]);

  const toggleExpand = (key: string) => {
    setExpandedMenus(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key) 
        : [...prev, key]
    );
  };

  // Simplified menu structure - 6 main categories
  const menuItems: MenuItem[] = [
    { 
      title: language === 'ro' ? 'Azi' : 'Today', 
      icon: Home, 
      path: '/azi' 
    },
    { 
      title: language === 'ro' ? 'Planificare' : 'Planning', 
      icon: Calendar, 
      path: '/door',
      subItems: [
        { title: language === 'ro' ? 'Săptămâna' : 'This Week', icon: Calendar, path: '/door' },
        { title: language === 'ro' ? '90 Zile' : '90 Days', icon: Target, path: '/door?tab=quarterly' },
        { title: language === 'ro' ? 'Lunar' : 'Monthly', icon: Target, path: '/door?tab=monthly' },
        { title: language === 'ro' ? 'Anual' : 'Annual', icon: Crown, path: '/door?tab=annual' },
      ]
    },
    { 
      title: language === 'ro' ? 'Focus' : 'Focus', 
      icon: Clock, 
      path: '/focus' 
    },
    { 
      title: language === 'ro' ? 'Progres' : 'Progress', 
      icon: BarChart3, 
      path: '/dashboard',
      subItems: [
        { title: language === 'ro' ? 'Dashboard' : 'Dashboard', icon: BarChart3, path: '/dashboard' },
        { title: 'Vision 2026', icon: Sparkles, path: '/vision-2026/dashboard' },
      ]
    },
    { 
      title: language === 'ro' ? 'Coaching' : 'Coaching', 
      icon: Layers, 
      path: '/stack',
      subItems: [
        { title: language === 'ro' ? 'Stack Zilnic' : 'Daily Stack', icon: Play, path: '/stack?type=daily-master' },
        { title: language === 'ro' ? 'Jurnal' : 'Journal', icon: Pencil, path: '/journal' },
        { title: language === 'ro' ? 'Toate Stack-urile' : 'All Stacks', icon: Layers, path: '/stack' },
        { title: language === 'ro' ? 'Biblioteca' : 'Library', icon: Box, path: '/stack-library' },
      ]
    },
    { 
      title: language === 'ro' ? 'Resurse' : 'Resources', 
      icon: BookOpen, 
      path: '/library',
      subItems: [
        { title: language === 'ro' ? 'Cursuri' : 'Courses', icon: BookOpen, path: '/library' },
        { title: 'Life Vision', icon: BookOpen, path: '/lifebook' },
        { title: language === 'ro' ? 'Provocarea 90 Zile' : '90 Day Challenge', icon: Target, path: '/challenge' },
        { title: language === 'ro' ? 'Success Coach' : 'Success Coach', icon: Crown, path: '/master-plan' },
      ]
    },
    { 
      title: language === 'ro' ? 'Business' : 'Business', 
      icon: Briefcase, 
      path: '/business' 
    },
    { 
      title: language === 'ro' ? 'Abonament' : 'Subscription', 
      icon: CreditCard, 
      path: '/pricing' 
    },
    { 
      title: 'Admin', 
      icon: Shield, 
      path: '/admin',
      hidden: true // Will be shown only for admins
    },
  ];

  const isPathActive = (path: string) => {
    if (path === '/azi' && currentPath === '/azi') return true;
    if (path === '/door' && currentPath.startsWith('/door')) return true;
    if (path === '/dashboard' && currentPath === '/dashboard') return true;
    return currentPath === path;
  };

  const isParentActive = (item: MenuItem) => {
    if (isPathActive(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some(sub => currentPath === sub.path || currentPath.startsWith(sub.path.split('?')[0]));
    }
    return false;
  };

  return (
    <div className="h-full bg-card border-r border-border flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center justify-center md:justify-start gap-3">
          <img
            src="/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png"
            alt="LifeOS logo"
            loading="lazy"
            className={`${isCollapsed ? 'h-7 w-auto' : 'h-9 w-auto'} drop-shadow`}
          />
          {!isCollapsed && (
            <h1 className="font-display font-bold text-lg text-foreground">LifeOS</h1>
          )}
        </Link>
      </div>

      {/* Onboarding Progress Widget */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <OnboardingProgress />
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav>
          <ul className="space-y-1">
            {menuItems.filter(item => !item.hidden).map((item) => {
              const menuKey = item.title.toLowerCase().replace(/\s+/g, '-');
              const isExpanded = expandedMenus.includes(menuKey);
              const isActive = isParentActive(item);

              return (
                <li key={item.path}>
                  {item.subItems ? (
                    <div>
                      <button
                        className={`sidebar-item w-full flex items-center ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                        onClick={() => !isCollapsed && toggleExpand(menuKey)}
                      >
                        <Link to={item.path} className="flex items-center flex-1" onClick={onItemClick}>
                          <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                          {!isCollapsed && <span className="text-sm ml-3">{item.title}</span>}
                        </Link>
                        {!isCollapsed && (
                          <div className="ml-auto">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        )}
                      </button>
                      
                      {!isCollapsed && isExpanded && (
                        <ul className="ml-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                onClick={onItemClick}
                                className={`sidebar-item ${currentPath === subItem.path ? 'active' : ''}`}
                              >
                                <subItem.icon className="w-4 h-4" />
                                <span className="text-sm">{subItem.title}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={onItemClick}
                      className={`sidebar-item ${isPathActive(item.path) ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Link to="/settings" onClick={onItemClick} className={`sidebar-item ${currentPath === '/settings' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm">{t('settings')}</span>}
        </Link>
        <Link to="/support" onClick={onItemClick} className={`sidebar-item mt-1 ${currentPath === '/support' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <HelpCircle className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm">{t('support')}</span>}
        </Link>
      </div>
    </div>
  );
};
