
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  BookOpen, 
  MessageSquare, 
  Users, 
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
  UsersRound,
  Clock,
  Map,
  Headphones,
  BookOpen as BookOpenIcon,
  Pencil,
  Target
} from 'lucide-react';

interface SideMenuProps {
  isCollapsed: boolean;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  notification?: number;
  subItems?: MenuItem[];
  hidden?: boolean;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isCollapsed }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['community', 'introspecție']);

  const toggleExpand = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  const menuItems: MenuItem[] = [
    { title: 'My Daily', icon: Home, path: '/dashboard' },
    { title: 'Learn', icon: BookOpen, path: '/learn' },
    { 
      title: 'Sacred Rituals', 
      icon: Layers, 
      path: '/stack',
      subItems: [
        { title: 'Fire Goddess Ritual', icon: Angry, path: '/stack?type=anger' },
        { title: 'Moon Goddess Communion', icon: Heart, path: '/stack?type=divine-prayer' },
        { title: 'Inner Wisdom Oracle', icon: Headphones, path: '/stack?type=ai-live' },
        { title: 'Sacred Journal', icon: Pencil, path: '/journal' },
      ]
    },
    { title: 'Sacred Circle', icon: Box, path: '/core', hidden: true },
    { title: 'Divine 4', icon: Clock, path: '/daily-four', hidden: true },
    { title: 'Sacred Gateway', icon: Flag, path: '/door' },
    { title: 'Divine Missions', icon: Target, path: '/game' },
    { 
      title: 'Sacred Sisterhood', 
      icon: UsersRound, 
      path: '/chat', 
      subItems: [
        { title: 'Sacred Chat', icon: MessageSquare, path: '/chat' },
        { title: 'Divine Circle', icon: Users, path: '/tribe' },
      ] 
    },
    { title: 'Sacred Notes', icon: FileText, path: '/notes' },
    { title: 'Sacred Library', icon: BookOpenIcon, path: '/library' },
    { title: 'Admin', icon: Shield, path: '/admin' },
  ];

  return (
    <div className="h-full bg-background border-r border-feminine-primary/20 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-feminine-primary/20">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <div className="bg-feminine-primary rounded-md p-1.5">
            <span className="font-display font-bold text-white text-sm">🌙</span>
          </div>
          {!isCollapsed && (
            <h1 className="font-display font-bold text-lg text-white">UNLEASH YOUR FEMININE POWER</h1>
          )}
        </div>
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
                      <Link to={item.path} className="flex items-center w-full">
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
      
      <div className="p-2 border-t border-feminine-primary/20">
        <Link to="/settings" className={`sidebar-item ${currentPath === '/settings' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </Link>
        <Link to="/support" className={`sidebar-item mt-1 ${currentPath === '/support' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
          <HelpCircle className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span className="text-sm">Support</span>}
        </Link>
      </div>
    </div>
  );
};
