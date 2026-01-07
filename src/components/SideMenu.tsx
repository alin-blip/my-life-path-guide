import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Home, 
  BookOpen, 
  Target,
  Activity,
  Brain,
  Briefcase,
  Settings, 
  HelpCircle,
  Shield,
  ChevronDown,
  ChevronRight,
  Heart,
  Crown,
  Sparkles,
  Bot,
  Pencil,
  Dumbbell,
  Apple,
  Flag,
  Clock,
  FileText,
  Trophy,
  Users,
  Flame
} from 'lucide-react';

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

  // Auto-expand menu containing current path
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems?.some(sub => currentPath.startsWith(sub.path.split('?')[0]))) {
        setExpandedMenus(prev => 
          prev.includes(item.title.toLowerCase()) ? prev : [...prev, item.title.toLowerCase()]
        );
      }
    });
  }, [currentPath]);

  const toggleExpand = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  // 6 SECȚIUNI PRINCIPALE
  const menuItems: MenuItem[] = [
    // 1. DASHBOARD
    { 
      title: language === 'ro' ? '🏠 Dashboard' : '🏠 Dashboard', 
      icon: Home, 
      path: '/dashboard' 
    },

    // 2. OBIECTIVE
    {
      title: language === 'ro' ? '🎯 Obiective' : '🎯 Goals',
      icon: Target,
      path: '/lifebook',
      subItems: [
        { title: language === 'ro' ? 'Viziune de Viață' : 'Life Vision', icon: BookOpen, path: '/lifebook' },
        { title: 'Vision 2026', icon: Sparkles, path: '/vision-2026/dashboard' },
        { title: language === 'ro' ? 'Challenge 90 Zile' : '90-Day Challenge', icon: Flame, path: '/challenge' },
        { title: language === 'ro' ? 'Obiective Săptămânale' : 'Weekly Goals', icon: Flag, path: '/door' },
      ]
    },

    // 3. PERFORMANȚĂ (BODY)
    {
      title: language === 'ro' ? '💪 Body' : '💪 Body',
      icon: Activity,
      path: '/daily-flow',
      subItems: [
        { title: language === 'ro' ? 'Rutina Campionului' : 'Champion Routine', icon: Crown, path: '/daily-flow' },
        { title: language === 'ro' ? 'Antrenament' : 'Workout', icon: Dumbbell, path: '/workout' },
        { title: language === 'ro' ? 'Nutriție' : 'Nutrition', icon: Apple, path: '/nutrition' },
        { title: language === 'ro' ? 'Focus Room' : 'Focus Room', icon: Clock, path: '/focus' },
        { title: language === 'ro' ? 'Performance Coach' : 'Performance Coach', icon: Bot, path: '/performance-coach' },
        { title: language === 'ro' ? 'Therapist Coach' : 'Therapist Coach', icon: Brain, path: '/therapist-coach' },
      ]
    },

    // 4. RELAȚII (BALANCE)
    {
      title: language === 'ro' ? '❤️ Relații' : '❤️ Relationships',
      icon: Heart,
      path: '/relationships',
      subItems: [
        { title: language === 'ro' ? 'Persoane Importante' : 'Important People', icon: Users, path: '/relationships' },
        { title: language === 'ro' ? 'Relationship Coach' : 'Relationship Coach', icon: Heart, path: '/relationship-coach' },
      ]
    },

    // 5. MINDSET
    {
      title: language === 'ro' ? '🧠 Mindset' : '🧠 Mindset',
      icon: Brain,
      path: '/stack',
      subItems: [
        { title: language === 'ro' ? 'Stacks Zilnice' : 'Daily Stacks', icon: Sparkles, path: '/stack' },
        { title: language === 'ro' ? 'Emotional Tracker' : 'Emotional Tracker', icon: Heart, path: '/emotional-tracker' },
        { title: language === 'ro' ? 'Time Tracker' : 'Time Tracker', icon: Clock, path: '/time-tracker' },
        { title: language === 'ro' ? 'Jurnal' : 'Journal', icon: Pencil, path: '/journal' },
      ]
    },

    // 6. BUSINESS
    {
      title: language === 'ro' ? '💼 Business' : '💼 Business',
      icon: Briefcase,
      path: '/door',
      subItems: [
        { title: language === 'ro' ? 'Task-uri' : 'Tasks', icon: Flag, path: '/door' },
        { title: language === 'ro' ? 'Master Plan' : 'Master Plan', icon: Crown, path: '/master-plan' },
        { title: language === 'ro' ? 'Business Tracker' : 'Business Tracker', icon: Briefcase, path: '/business' },
        { title: language === 'ro' ? 'Napoleon Hill Coach' : 'Napoleon Hill Coach', icon: Crown, path: '/master-plan' },
        { title: language === 'ro' ? 'Note' : 'Notes', icon: FileText, path: '/notes' },
      ]
    },

    // 7. COMUNITATE & GAMIFICARE
    {
      title: language === 'ro' ? '🏆 Comunitate' : '🏆 Community',
      icon: Trophy,
      path: '/leaderboard',
      subItems: [
        { title: language === 'ro' ? 'Clasament' : 'Leaderboard', icon: Trophy, path: '/leaderboard' },
        { title: language === 'ro' ? 'Achievements' : 'Achievements', icon: Sparkles, path: '/achievements' },
        { title: language === 'ro' ? 'Parteneri' : 'Partners', icon: Users, path: '/partners' },
      ]
    },

    // Admin (hidden for normal users)
    { title: 'Admin', icon: Shield, path: '/admin', hidden: false },
  ];

  const isPathActive = (path: string) => {
    const basePath = path.split('?')[0];
    return currentPath === basePath || currentPath.startsWith(basePath + '/');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Logo Header */}
      <div className="p-5 border-b border-border/30">
        <Link to="/" className="flex items-center justify-center md:justify-start gap-3">
          <img
            src="/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png"
            alt="LifeOS logo"
            loading="lazy"
            className={`${isCollapsed ? 'h-7 w-auto' : 'h-10 w-auto'} drop-shadow`}
          />
          {!isCollapsed && (
            <h1 className="font-display font-bold text-xl gradient-text">LifeOS</h1>
          )}
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav>
          <ul className="space-y-1">
            {menuItems.filter(item => !item.hidden).map((item) => (
              <li key={item.path + item.title}>
                {item.subItems ? (
                  <div>
                    <button
                      className={`sidebar-item w-full flex items-center ${
                        isPathActive(item.path) || 
                        item.subItems.some(subItem => isPathActive(subItem.path))
                          ? 'active' : ''
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      onClick={() => {
                        if (!isCollapsed) {
                          toggleExpand(item.title.toLowerCase());
                        }
                      }}
                    >
                      <Link to={item.subItems[0]?.path || item.path} className="flex items-center" onClick={onItemClick}>
                        <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                        {!isCollapsed && (
                          <span className="text-sm font-medium ml-3">{item.title}</span>
                        )}
                      </Link>
                      {!isCollapsed && (
                        <div className="ml-auto opacity-60">
                          {expandedMenus.includes(item.title.toLowerCase()) 
                            ? <ChevronDown className="w-4 h-4" /> 
                            : <ChevronRight className="w-4 h-4" />}
                        </div>
                      )}
                    </button>
                    
                    {!isCollapsed && expandedMenus.includes(item.title.toLowerCase()) && (
                      <ul className="ml-6 mt-1 space-y-0.5 border-l border-border/30 pl-3">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              onClick={onItemClick}
                              className={`sidebar-item text-sm ${
                                isPathActive(subItem.path) ? 'active' : ''
                              }`}
                            >
                              <subItem.icon className="w-3.5 h-3.5" />
                              <span>{subItem.title}</span>
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
                    className={`sidebar-item ${isPathActive(item.path) ? 'active' : ''} ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                  >
                    <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                    {!isCollapsed && item.notification && (
                      <div className="ml-auto bg-primary text-primary-foreground text-xs py-0.5 px-2 rounded-full">
                        {item.notification > 99 ? '99+' : item.notification}
                      </div>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-border/30 space-y-1">
        <Link to="/settings" onClick={onItemClick} className={`sidebar-item ${currentPath === '/settings' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm font-medium">{t('settings')}</span>}
        </Link>
        <Link to="/support" onClick={onItemClick} className={`sidebar-item ${currentPath === '/support' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <HelpCircle className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm font-medium">{t('support')}</span>}
        </Link>
      </div>
    </div>
  );
};
