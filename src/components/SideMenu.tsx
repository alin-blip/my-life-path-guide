import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Home, 
  User, 
  BookOpen, 
  Layers, 
  Box, 
  Flag, 
  FileText, 
  Settings, 
  HelpCircle,
  Shield,
  ChevronDown,
  ChevronRight,
  Heart,
  Activity,
  Angry,
  Briefcase,
  Clock,
  Map,
  Headphones,
  BookOpen as BookOpenIcon,
  Pencil,
  Target,
  Crown,
  CreditCard,
  Mic,
  Upload,
  Sparkles
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['community', 'introspecție']);
  const { t } = useLanguage();

  useEffect(() => {
    if (currentPath === '/stack' || currentPath.startsWith('/stack?')) {
      const transformationWorkshopKey = t('transformationWorkshop').toLowerCase();
      setExpandedMenus(prev => 
        prev.includes(transformationWorkshopKey) 
          ? prev 
          : [...prev, transformationWorkshopKey]
      );
    }
  }, [currentPath, t]);

  const toggleExpand = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  const menuItems: MenuItem[] = [
    { title: t('dashboard'), icon: Home, path: '/dashboard' },
    { title: t('lifeVision') || t('haveItAllBlueprint'), icon: BookOpen, path: '/lifebook' },
    { title: 'Vision 2026', icon: Sparkles, path: '/vision-2026/dashboard' },
    { title: t('ninetyDayChallenge') || t('haveItAllChallenge'), icon: Target, path: '/challenge' },
    // CORP
    {
      title: '💪 Corp',
      icon: Activity,
      path: '/workout',
      subItems: [
        { title: 'Workout', icon: Activity, path: '/workout' },
        { title: t('nutrition') || 'Nutriție', icon: Activity, path: '/nutrition' },
      ]
    },
    // SPIRITUALITATE
    {
      title: '🧘 Spiritualitate',
      icon: Heart,
      path: '/stack',
      subItems: [
        { title: t('aiStacks') || 'Stack-uri AI', icon: Layers, path: '/stack' },
        { title: 'Journaling', icon: Pencil, path: '/journal' },
      ]
    },
    // RELAȚII
    {
      title: '💕 Relații',
      icon: Heart,
      path: '/relationships',
      subItems: [
        { title: t('importantPeople') || 'Persoane Importante', icon: Heart, path: '/relationships' },
      ]
    },
    // BUSINESS
    {
      title: '💼 Business',
      icon: Briefcase,
      path: '/door',
      subItems: [
        { title: t('tasks') || 'Task-uri', icon: Flag, path: '/door' },
        { title: t('successPrinciples') || 'Principii Succes', icon: Crown, path: '/stack?type=master-plan-quick' },
        { title: 'Focus Room', icon: Clock, path: '/focus' },
      ]
    },
    {
      title: t('successCoach') || t('masterPlan'),
      icon: Crown,
      path: '/master-plan',
      subItems: [
        { title: t('myProjects'), icon: Target, path: '/master-plan' },
        { title: t('activeJourney'), icon: BookOpen, path: '/master-plan?tab=journey' },
        { title: t('knowledgeBase'), icon: Upload, path: '/master-plan?tab=knowledge' },
      ]
    },
    { 
      title: t('commandCenter'), 
      icon: Flag, 
      path: '/door',
      subItems: [
        { title: t('weeklyTasks') || 'Săptămâna', icon: Clock, path: '/door' },
        { title: t('quarterlyGoals') || 'Obiective 90 Zile', icon: Target, path: '/door?tab=quarterly' },
        { title: t('monthlyMission') || 'Misiune Lunară', icon: Flag, path: '/door?tab=monthly' },
        { title: t('annualVision') || 'Viziune Anuală', icon: Crown, path: '/door?tab=annual' },
      ]
    },
    { title: t('businessTracker') || t('business'), icon: Briefcase, path: '/business' },
    { title: t('notes'), icon: FileText, path: '/notes' },
    { title: t('learningHub') || t('library'), icon: BookOpenIcon, path: '/library' },
    { title: t('subscriptions'), icon: CreditCard, path: '/pricing' },
    { title: t('admin'), icon: Shield, path: '/admin' },
  ];

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
              <li key={item.path}>
                {item.subItems ? (
                  <div>
                    <button
                      className={`sidebar-item w-full flex items-center ${
                        currentPath === item.path || 
                        (item.subItems && item.subItems.some(subItem => currentPath === subItem.path)) 
                          ? 'active' : ''
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      onClick={() => {
                        if (!isCollapsed) {
                          toggleExpand(item.title.toLowerCase());
                        }
                      }}
                    >
                      <Link to={item.path} className="flex items-center w-full" onClick={onItemClick}>
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
                                currentPath === subItem.path ? 'active' : ''
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
                    className={`sidebar-item ${currentPath === item.path ? 'active' : ''} ${
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
