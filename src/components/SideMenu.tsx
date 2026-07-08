import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';
import { useToast } from '@/hooks/use-toast';
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
  Swords,
  Gamepad2,
  Zap,
  Map,
  Palette,
  User,
  CreditCard,
  LogOut,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { useTierAccess } from '@/hooks/useTierAccess';
import { getRequiredTier, type Tier } from '@/config/routeTiers';
import { UpgradeModal } from '@/components/access/UpgradeModal';

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
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { language } = useLanguage();
  const { completedDaysCount } = useChallengeProgress();
  const { user, subscribed, signOut } = useAuth();
  const { toast } = useToast();
  
  const completedDays = completedDaysCount;
  const [mindShiftDrafts, setMindShiftDrafts] = useState<number>(0);
  const { canAccess } = useTierAccess();
  const [upgradeState, setUpgradeState] = useState<{ open: boolean; tier: Tier; feature?: string }>({
    open: false,
    tier: 'basic',
  });

  const requiredTierFor = (path: string): Tier => getRequiredTier(path);
  const isLocked = (path: string): boolean => {
    const req = requiredTierFor(path);
    return req !== 'free' && !canAccess(req);
  };
  const tierBadge = (path: string): { label: string; tier: Tier } | null => {
    const req = requiredTierFor(path);
    if (req === 'free' || canAccess(req)) return null;
    return { label: req.toUpperCase(), tier: req };
  };

  useEffect(() => {
    let mounted = true;
    import('@/services/mindShiftService').then(({ mindShiftService }) => {
      mindShiftService.countDrafts().then((n) => { if (mounted) setMindShiftDrafts(n); }).catch(() => {});
    });
    return () => { mounted = false; };
  }, [currentPath]);


  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Could not sign out.' : 'Nu s-a putut efectua delogarea.',
        variant: 'destructive',
      });
    }
  };

  const handleManageSubscription = async () => {
    if (!subscribed) {
      navigate('/pricing');
      onItemClick?.();
      return;
    }

    const preOpened = preOpenWindow();

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        redirectExternal(data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
        toast({
          title: language === 'en' ? 'Error' : 'Eroare',
          description: language === 'en'
            ? 'The subscription portal is not available right now.'
            : 'Portalul de abonament nu este disponibil momentan.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      if (preOpened) preOpened.close();
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en'
          ? 'Could not open the subscription portal.'
          : 'Nu s-a putut deschide portalul de abonament.',
        variant: 'destructive',
      });
    }
  };

  // Auto-expand menu (and any nested sub-menu) containing current path
  useEffect(() => {
    const toOpen: string[] = [];
    menuItems.forEach((item) => {
      const subMatch =
        item.subItems?.some((sub) => currentPath.startsWith(sub.path.split('?')[0])) ||
        item.subItems?.some((sub) => sub.subItems?.some((s) => currentPath.startsWith(s.path.split('?')[0])));
      if (subMatch) toOpen.push(item.title.toLowerCase());
      item.subItems?.forEach((sub) => {
        if (sub.subItems?.some((leaf) => currentPath.startsWith(leaf.path.split('?')[0]))) {
          toOpen.push(`${item.title}::${sub.title}`.toLowerCase());
        }
      });
    });
    if (toOpen.length) {
      setExpandedMenus((prev) => Array.from(new Set([...prev, ...toOpen])));
    }
  }, [currentPath]);

  const toggleExpand = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  const menuItems: MenuItem[] = [
    // 1. PROGRAMS - All courses and challenges in one place
    { 
      title: language === 'ro' ? 'Programe' : 'Programs', 
      icon: BookOpen, 
      path: '/programs',
      badge: completedDays > 0 ? `${completedDays}/7` : undefined
    },


    // SEPARATOR
    { isSeparator: true, title: '', icon: Home, path: '' },

    // 3. DASHBOARD
    { 
      title: 'Dashboard', 
      icon: Home, 
      path: '/dashboard'
    },

    // 4. THE DOOR
    { 
      title: 'The Door', 
      icon: Target, 
      path: '/door'
    },

    // 5. GAME - VISION
    {
      title: 'Game - Vision',
      icon: Gamepad2,
      path: '/game-vision',
      subItems: [
        { title: language === 'ro' ? 'Harta Realității' : 'Reality Map', icon: Map, path: '/fact-maps?category=foundation' },
        { title: 'Annual Goals - Impossible Game', icon: Sparkles, path: '/game-objectives?tab=annual' },
        { title: language === 'ro' ? 'Planuri 90 Zile' : '90-Day Plans', icon: Calendar, path: '/game-objectives?tab=quarterly' },
        { title: language === 'ro' ? 'Obiective Lunare' : 'Monthly Goals', icon: Flag, path: '/game-objectives?tab=monthly' },
      ]
    },

    // 6. RUTINA RĂZBOINICULUI (Warrior Routine)
    {
      title: language === 'ro' ? 'Rutina Războinicului' : 'Warrior Routine',
      icon: Swords,
      path: '/daily-flow',
      subItems: [
        { title: language === 'ro' ? 'Start Rutină' : 'Start Routine', icon: Swords, path: '/daily-flow' },
        { title: language === 'ro' ? 'Mind Shifting' : 'Mind Shifting', icon: Brain, path: '/mind-shifting', badge: mindShiftDrafts > 0 ? String(mindShiftDrafts) : 'NEW' },
        { title: language === 'ro' ? 'Focus Room' : 'Focus Room', icon: Timer, path: '/focus' },
        { title: language === 'ro' ? 'Istoric & Statistici' : 'History & Stats', icon: BarChart3, path: '/champion-routine-history' },
      ]
    },

    // 7. STACKS (simplified - Mind Coach replaces most)
    {
      title: 'Stacks',
      icon: Sparkles,
      path: '/stack',
      subItems: [
        { title: 'Mind Coach', icon: Brain, path: '/mind-coach', badge: 'NEW' },
        { title: language === 'ro' ? 'Kill It Today' : 'Kill It Today', icon: Flame, path: '/stack?type=kill-it-today', badge: 'NEW' },
        { title: language === 'ro' ? 'Reconstrucție Mentală' : 'Mental Reconstruction', icon: Brain, path: '/minte/stack' },
        { title: 'Anger Coach', icon: Flame, path: '/stack?type=anger' },
        { title: language === 'ro' ? 'Frustration Coach' : 'Frustration Coach', icon: Zap, path: '/stack?type=frustration', badge: 'NEW' },
        { title: language === 'ro' ? 'Fear Coach' : 'Fear Coach', icon: Shield, path: '/stack?type=fear', badge: 'NEW' },
        { title: 'Business Coach', icon: Target, path: '/stack?type=hormozi-coaching' },
        { title: 'Success Principles', icon: BookOpen, path: '/programs?tab=classroom' },
      ]
    },
    // 7b. CORE CEO — hub central de configurare
    {
      title: 'Core CEO',
      icon: Briefcase,
      path: '/core-ceo',
      badge: 'NEW',
    },

    // 7c. ARIILE MELE — grup navigare rapidă pe categorii de viață
    {
      title: language === 'ro' ? 'Ariile mele' : 'My Life Areas',
      icon: LayoutGrid,
      path: '/core-ceo',
      subItems: [
        { title: language === 'ro' ? 'Corp' : 'Body', icon: Dumbbell, path: '/workout' },
        { title: language === 'ro' ? 'Minte' : 'Mind', icon: Brain, path: '/minte' },
        { title: language === 'ro' ? 'Relații' : 'Relationships', icon: Heart, path: '/marriage' },
        { title: language === 'ro' ? 'Spiritualitate' : 'Spirituality', icon: Sparkles, path: '/empowerment-meditation' },
        { title: 'Business', icon: Briefcase, path: '/business' },
      ],
    },

    // 7d. PROGRES & ISTORIC — hub central de tracking
    {
      title: language === 'ro' ? 'Progres & Istoric' : 'Progress & History',
      icon: BarChart3,
      path: '/progres',
      badge: 'NEW',
    },




    // 10. LEADERBOARD & ACHIEVEMENTS (standalone)
    {
      title: language === 'ro' ? 'Clasament' : 'Leaderboard',
      icon: Trophy,
      path: '/leaderboard',
    },
    {
      title: 'Achievements',
      icon: Sparkles,
      path: '/achievements',
    },

    // COACH DASHBOARD - Visible to all logged-in users
    {
      title: language === 'ro' ? 'Coach Dashboard' : 'Coach Dashboard',
      icon: UserCheck,
      path: '/coach',
      badge: 'COACH'
    },

    // 11. TOOLS (All platform tools) - Direct link, no dropdown
    {
      title: 'Tools',
      icon: Settings,
      path: '/tools'
    },

    // Admin (hidden from side menu)
    { title: 'Admin', icon: Shield, path: '/admin', hidden: true },
  ];

  const isPathActive = (path: string) => {
    const basePath = path.split('?')[0];
    return currentPath === basePath || currentPath.startsWith(basePath + '/');
  };

  // Index where Stacks section is
  const stacksIndex = 4;

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
                {item.subItems.map((subItem) => {
                  // Nested dropdown (sub-item has its own subItems)
                  if (subItem.subItems && subItem.subItems.length > 0) {
                    const nestedKey = `${item.title}::${subItem.title}`.toLowerCase();
                    const nestedOpen = expandedMenus.includes(nestedKey);
                    const nestedActive =
                      isPathActive(subItem.path) ||
                      subItem.subItems.some((s) => isPathActive(s.path));
                    return (
                      <li key={subItem.path}>
                        <button
                          className={`sidebar-item text-sm w-full flex items-center ${nestedActive ? 'active' : ''}`}
                          onClick={() => toggleExpand(nestedKey)}
                        >
                          <subItem.icon className="w-3.5 h-3.5" />
                          <span className="ml-2">{subItem.title}</span>
                          <div className="ml-auto opacity-60">
                            {nestedOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                        {nestedOpen && (
                          <ul className="ml-5 mt-1 space-y-0.5 border-l border-border/30 pl-3">
                            {subItem.subItems.map((leaf) => {
                              const leafBadge = tierBadge(leaf.path);
                              if (leafBadge) {
                                return (
                                  <li key={leaf.path}>
                                    <button
                                      type="button"
                                      onClick={() => setUpgradeState({ open: true, tier: leafBadge.tier, feature: leaf.title })}
                                      className={`sidebar-item text-xs w-full opacity-70`}
                                    >
                                      <leaf.icon className="w-3 h-3" />
                                      <span>{leaf.title}</span>
                                      <span className="ml-auto flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        <Badge variant="outline" className="text-[10px] px-1 py-0">{leafBadge.label}</Badge>
                                      </span>
                                    </button>
                                  </li>
                                );
                              }
                              return (
                                <li key={leaf.path}>
                                  <Link
                                    to={leaf.path}
                                    onClick={onItemClick}
                                    className={`sidebar-item text-xs ${isPathActive(leaf.path) ? 'active' : ''}`}
                                  >
                                    <leaf.icon className="w-3 h-3" />
                                    <span>{leaf.title}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  }
                  const subBadge = tierBadge(subItem.path);
                  if (subBadge) {
                    return (
                      <li key={subItem.path}>
                        <button
                          type="button"
                          onClick={() => setUpgradeState({ open: true, tier: subBadge.tier, feature: subItem.title })}
                          className="sidebar-item text-sm w-full opacity-70"
                        >
                          <subItem.icon className="w-3.5 h-3.5" />
                          <span>{subItem.title}</span>
                          <span className="ml-auto flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <Badge variant="outline" className="text-[10px] px-1 py-0">{subBadge.label}</Badge>
                          </span>
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        onClick={onItemClick}
                        className={`sidebar-item text-sm ${isPathActive(subItem.path) ? 'active' : ''}`}
                      >
                        <subItem.icon className="w-3.5 h-3.5" />
                        <span>{subItem.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (() => {
          const topBadge = tierBadge(item.path);
          if (topBadge) {
            return (
              <button
                type="button"
                onClick={() => setUpgradeState({ open: true, tier: topBadge.tier, feature: item.title })}
                className={`sidebar-item w-full opacity-70 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <Badge variant="outline" className="text-[10px] px-1 py-0">{topBadge.label}</Badge>
                    </span>
                  </>
                )}
              </button>
            );
          }
          return (
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
          );
        })()}
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
            alt="CEO Mind OS logo"
            loading="lazy"
            className={`${isCollapsed ? 'h-7 w-auto' : 'h-10 w-auto'} drop-shadow`}
          />
          {!isCollapsed && (
            <span className="font-display font-bold text-xl gradient-text">CEO Mind OS</span>
          )}
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav>
          <ul className="space-y-1">
            {/* Render all menu items with separator support */}
            {menuItems.filter(item => !item.hidden).map((item, index) => 
              item.isSeparator ? (
                <li key={`separator-${index}`} className="py-2">
                  <div className="border-t border-border/50" />
                </li>
              ) : (
                renderMenuItem(item, index)
              )
            )}
          </ul>
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-border/30 space-y-1">
        {user && (
          <button 
            onClick={handleSignOut} 
            className={`sidebar-item w-full text-destructive hover:text-destructive ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
            {!isCollapsed && <span className="text-sm font-medium">{language === 'ro' ? 'Log out' : 'Log out'}</span>}
          </button>
        )}
      </div>

      <UpgradeModal
        open={upgradeState.open}
        onOpenChange={(o) => setUpgradeState((s) => ({ ...s, open: o }))}
        requiredTier={upgradeState.tier}
        featureName={upgradeState.feature}
      />
    </div>
  );
};
