import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
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
  Flame,
  Headphones,
  LayoutGrid,
  Timer,
  Calendar,
  BarChart3,
  History,
  GraduationCap,
  Swords
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SideMenuProps {
  isCollapsed: boolean;
  onItemClick?: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  notification?: number;
  badge?: string;
  subItems?: MenuItem[];
  hidden?: boolean;
  isSeparator?: boolean;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isCollapsed, onItemClick }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { language } = useLanguage();
  const { completedDaysCount } = useChallengeProgress();
  
  const completedDays = completedDaysCount;

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

  const menuItems: MenuItem[] = [
    // 1. DASHBOARD
    { 
      title: language === 'ro' ? '🏠 Dashboard' : '🏠 Dashboard', 
      icon: Home, 
      path: '/dashboard',
      subItems: [
        { title: language === 'ro' ? 'Overview' : 'Overview', icon: LayoutGrid, path: '/dashboard' },
        { title: language === 'ro' ? 'Setări Dashboard' : 'Dashboard Settings', icon: Settings, path: '/dashboard/settings' },
      ]
    },

    // 2. CHALLENGE 7 ZILE
    { 
      title: language === 'ro' ? '🚀 Challenge 7 Zile' : '🚀 7-Day Challenge', 
      icon: Flame, 
      path: '/challenge',
      badge: completedDays > 0 ? `${completedDays}/7` : undefined
    },

    // 3. VIZIUNE & OBIECTIVE - The Door
    {
      title: language === 'ro' ? '🎯 The Door / Viziune' : '🎯 The Door / Vision',
      icon: Target,
      path: '/door',
      subItems: [
        { title: language === 'ro' ? 'Command Center' : 'Command Center', icon: Target, path: '/door' },
        { title: language === 'ro' ? 'Obiective Anuale' : 'Annual Goals', icon: Sparkles, path: '/door?tab=annual' },
        { title: language === 'ro' ? 'Planuri 90 Zile' : '90-Day Plans', icon: Calendar, path: '/door?tab=quarterly' },
        { title: language === 'ro' ? 'Obiective Lunare' : 'Monthly Goals', icon: Flag, path: '/door?tab=monthly' },
        { title: language === 'ro' ? 'Obiective Săptămânale' : 'Weekly Goals', icon: Flag, path: '/door?tab=weekly' },
      ]
    },

    // 4. RUTINA RĂZBOINICULUI (Warrior Routine)
    {
      title: language === 'ro' ? '⚔️ Rutina Războinicului' : '⚔️ Warrior Routine',
      icon: Swords,
      path: '/daily-flow',
      subItems: [
        { title: language === 'ro' ? 'Start Rutină' : 'Start Routine', icon: Swords, path: '/daily-flow' },
        { title: language === 'ro' ? 'Focus Room' : 'Focus Room', icon: Timer, path: '/focus' },
        { title: language === 'ro' ? 'Istoric & Statistici' : 'History & Stats', icon: BarChart3, path: '/champion-routine-history' },
      ]
    },

    // ════════════════ CORE 4 SEPARATOR ════════════════
    // Visual separator handled in render

    // 5. BODY (Corp)
    {
      title: language === 'ro' ? '💪 Body (Corp)' : '💪 Body',
      icon: Activity,
      path: '/workout',
      subItems: [
        { title: language === 'ro' ? 'Antrenament' : 'Workout', icon: Dumbbell, path: '/workout' },
        { title: language === 'ro' ? 'Nutriție' : 'Nutrition', icon: Apple, path: '/nutrition' },
        { title: language === 'ro' ? 'Istoric Antrenamente' : 'Workout History', icon: History, path: '/workout-history' },
        { title: language === 'ro' ? 'Performance Coach' : 'Performance Coach', icon: Bot, path: '/performance-coach' },
      ]
    },

    // 6. BEING (Spiritualitate) - renamed from Mindset
    {
      title: language === 'ro' ? '🧘 Being (Spiritualitate)' : '🧘 Being (Spirituality)',
      icon: Brain,
      path: '/stack',
      subItems: [
        { title: language === 'ro' ? 'Stacks Zilnice' : 'Daily Stacks', icon: Sparkles, path: '/stack' },
        { title: language === 'ro' ? 'Meditație Empowerment' : 'Empowerment Meditation', icon: Headphones, path: '/empowerment-meditation' },
        { title: language === 'ro' ? 'Jurnal' : 'Journal', icon: Pencil, path: '/journal' },
        { title: language === 'ro' ? 'Emotional Tracker' : 'Emotional Tracker', icon: Heart, path: '/emotional-tracker' },
        { title: language === 'ro' ? 'Therapist Coach' : 'Therapist Coach', icon: Bot, path: '/therapist-coach' },
      ]
    },

    // 7. BALANCE (Relații)
    {
      title: language === 'ro' ? '❤️ Balance (Relații)' : '❤️ Balance (Relationships)',
      icon: Heart,
      path: '/relationships',
      subItems: [
        { title: language === 'ro' ? 'Persoane Importante' : 'Important People', icon: Users, path: '/relationships' },
        { title: language === 'ro' ? 'Relationship Coach' : 'Relationship Coach', icon: Bot, path: '/relationship-coach' },
      ]
    },

    // 8. BUSINESS
    {
      title: language === 'ro' ? '💼 Business' : '💼 Business',
      icon: Briefcase,
      path: '/business',
      subItems: [
        { title: language === 'ro' ? 'Business Dashboard' : 'Business Dashboard', icon: Briefcase, path: '/business' },
        { title: language === 'ro' ? 'Master Plan' : 'Master Plan', icon: Crown, path: '/master-plan' },
        { title: language === 'ro' ? 'Analiza Hormozi' : 'Hormozi Analysis', icon: BarChart3, path: '/business/hormozi-analysis' },
        { title: language === 'ro' ? 'Time Tracker' : 'Time Tracker', icon: Clock, path: '/time-tracker' },
        { title: language === 'ro' ? 'Note' : 'Notes', icon: FileText, path: '/notes' },
        { title: language === 'ro' ? 'Accountability Coach' : 'Accountability Coach', icon: Bot, path: '/accountability-coach' },
      ]
    },

    // 9. LEARN THE W. WAY - Course Section
    {
      title: "📚 Learn the W. Way",
      icon: GraduationCap,
      path: '/warriors-way',
      badge: 'NEW'
    },

    // 10. COMUNITATE
    {
      title: language === 'ro' ? '🏅 Comunitate' : '🏅 Community',
      icon: Trophy,
      path: '/leaderboard',
      subItems: [
        { title: language === 'ro' ? 'Clasament' : 'Leaderboard', icon: Trophy, path: '/leaderboard' },
        { title: language === 'ro' ? 'Achievements' : 'Achievements', icon: Sparkles, path: '/achievements' },
      ]
    },

    // 11. TOOLS (Advanced Features)
    {
      title: language === 'ro' ? '🛠️ Tools' : '🛠️ Tools',
      icon: Settings,
      path: '/tools',
      subItems: [
        { title: language === 'ro' ? 'Lifebook (Viziune Viață)' : 'Lifebook (Life Vision)', icon: BookOpen, path: '/lifebook' },
      ]
    },

    // Admin (hidden for normal users)
    { title: 'Admin', icon: Shield, path: '/admin', hidden: false },
  ];

  const isPathActive = (path: string) => {
    const basePath = path.split('?')[0];
    return currentPath === basePath || currentPath.startsWith(basePath + '/');
  };

  // Index where Core 4 starts (Body section)
  const core4StartIndex = 4;

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.hidden) return null;

    return (
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
              {!isCollapsed && item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5">
                  {item.badge}
                </Badge>
              )}
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
              <>
                <span className="text-sm font-medium">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
            {!isCollapsed && item.notification && (
              <div className="ml-auto bg-primary text-primary-foreground text-xs py-0.5 px-2 rounded-full">
                {item.notification > 99 ? '99+' : item.notification}
              </div>
            )}
          </Link>
        )}
      </li>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Logo Header */}
      <div className="p-5 border-b border-border/30">
        <Link to="/" className="flex items-center justify-center md:justify-start gap-3">
          <img
            src="/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png"
            alt="WarriorOS logo"
            loading="lazy"
            className={`${isCollapsed ? 'h-7 w-auto' : 'h-10 w-auto'} drop-shadow`}
          />
          {!isCollapsed && (
            <h1 className="font-display font-bold text-xl gradient-text">WarriorOS</h1>
          )}
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav>
          <ul className="space-y-1">
            {/* Render items before Core 4 */}
            {menuItems.slice(0, core4StartIndex).filter(item => !item.hidden).map((item, index) => 
              renderMenuItem(item, index)
            )}

            {/* Core 4 Separator */}
            {!isCollapsed && (
              <li className="py-3">
                <div className="flex items-center gap-2 px-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  <span className="text-xs font-semibold text-primary/70 tracking-wider">CORE 4</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                </div>
              </li>
            )}
            {isCollapsed && (
              <li className="py-2">
                <div className="h-px bg-primary/30 mx-2" />
              </li>
            )}

            {/* Render Core 4 items (Body, Being, Balance, Business) */}
            {menuItems.slice(core4StartIndex, core4StartIndex + 4).filter(item => !item.hidden).map((item, index) => 
              renderMenuItem(item, index + core4StartIndex)
            )}

            {/* Separator after Core 4 */}
            {!isCollapsed && (
              <li className="py-2">
                <div className="h-px bg-border/30 mx-3" />
              </li>
            )}
            {isCollapsed && (
              <li className="py-2">
                <div className="h-px bg-border/30 mx-2" />
              </li>
            )}

            {/* Render remaining items (Community, Admin) */}
            {menuItems.slice(core4StartIndex + 4).filter(item => !item.hidden).map((item, index) => 
              renderMenuItem(item, index + core4StartIndex + 4)
            )}
          </ul>
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-border/30 space-y-1">
        <Link to="/settings" onClick={onItemClick} className={`sidebar-item ${currentPath === '/settings' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm font-medium">{language === 'ro' ? 'Setări' : 'Settings'}</span>}
        </Link>
        <Link to="/support" onClick={onItemClick} className={`sidebar-item ${currentPath === '/support' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <HelpCircle className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm font-medium">{language === 'ro' ? 'Suport' : 'Support'}</span>}
        </Link>
      </div>
    </div>
  );
};
