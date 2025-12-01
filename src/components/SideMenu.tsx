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
  Mic
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

  // Auto-expand "Atelierul de Transformare" when on /stack route
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
    { title: 'Dashboard', icon: Home, path: '/dashboard' },
    { title: 'Learn', icon: BookOpen, path: '/learn' },
    { 
      title: t('transformationWorkshop'), 
      icon: Layers, 
      path: '/stack',
      subItems: [
        { title: 'Alchimia Furiei', icon: Angry, path: '/stack?type=anger' },
        { title: 'Dialogul cu Divinitatea', icon: Heart, path: '/stack?type=divine-prayer' },
        { title: 'Oracolul Înțelepciunii', icon: Headphones, path: '/stack?type=ai-live' },
        { title: 'Imperiul de Business', icon: Briefcase, path: '/stack?type=hormozi-coaching' },
        { title: 'Școala Zeilor', icon: Crown, path: '/stack?type=gods-school' },
        { title: 'Jurnalul Sacru', icon: Pencil, path: '/journal' },
        { title: 'Analiza Vocală', icon: Mic, path: '/voice-analysis' },
      ]
    },
    { title: t('commandCenter'), icon: Flag, path: '/door' },
    { title: 'Business', icon: Briefcase, path: '/business' },
    { title: 'Misiuni de Împlinire', icon: Target, path: '/game' },
    { title: 'Note', icon: FileText, path: '/notes' },
    { title: 'Biblioteca', icon: BookOpenIcon, path: '/library' },
    { title: 'Abonamente', icon: CreditCard, path: '/pricing' },
    { title: 'Admin', icon: Shield, path: '/admin' },
  ];

  return (
    <div className="h-full bg-card border-r border-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center justify-center md:justify-start gap-3">
          <img
            src="/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png"
            alt="RoWarrior logo"
            loading="lazy"
            className={`${isCollapsed ? 'h-7 w-auto' : 'h-9 w-auto'} drop-shadow`}
          />
          {!isCollapsed && (
            <h1 className="font-display font-bold text-lg text-foreground">RoWarrior</h1>
          )}
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-2">
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
                          <>
                            <span className="text-sm ml-3">{item.title}</span>
                          </>
                        )}
                      </Link>
                      {!isCollapsed && (
                        <div className="ml-auto">
                          {expandedMenus.includes(item.title.toLowerCase()) 
                            ? <ChevronDown className="w-4 h-4" /> 
                            : <ChevronRight className="w-4 h-4" />}
                        </div>
                      )}
                    </button>
                    
                    {!isCollapsed && expandedMenus.includes(item.title.toLowerCase()) && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              onClick={onItemClick}
                              className={`sidebar-item ${
                                currentPath === subItem.path ? 'active' : ''
                              }`}
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
                    className={`sidebar-item ${currentPath === item.path ? 'active' : ''} ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                  >
                    <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                    {!isCollapsed && (
                      <span className="text-sm">{item.title}</span>
                    )}
                    {!isCollapsed && item.notification && (
                      <div className="ml-auto bg-feminine-primary text-white text-xs py-0.5 px-1.5 rounded-full">
                        {item.notification > 99 ? '99+' : item.notification}
                      </div>
                    )}
                    {isCollapsed && item.notification && (
                      <div className="absolute top-0 right-0 bg-feminine-primary w-2 h-2 rounded-full"></div>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="p-2 border-t border-border">
        <Link to="/settings" onClick={onItemClick} className={`sidebar-item ${currentPath === '/settings' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </Link>
        <Link to="/support" onClick={onItemClick} className={`sidebar-item mt-1 ${currentPath === '/support' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <HelpCircle className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm">Support</span>}
        </Link>
      </div>
    </div>
  );
};
