import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Users, BookOpen, Calendar, UserCircle, Trophy, Users2, Settings } from 'lucide-react';

export type SkoolTab = 'community' | 'classroom' | 'groups' | 'calendar' | 'members' | 'leaderboards' | 'settings';

interface SkoolNavBarProps {
  activeTab: SkoolTab;
  onTabChange: (tab: SkoolTab) => void;
}

const baseTabs: { id: SkoolTab; labelEn: string; labelRo: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: 'classroom', labelEn: 'Classroom', labelRo: 'Cursuri', icon: BookOpen },
  { id: 'groups', labelEn: 'Groups', labelRo: 'Grupuri', icon: Users2 },
  { id: 'calendar', labelEn: 'Calendar', labelRo: 'Calendar', icon: Calendar },
  { id: 'members', labelEn: 'Members', labelRo: 'Membri', icon: UserCircle },
  { id: 'leaderboards', labelEn: 'Leaderboards', labelRo: 'Clasament', icon: Trophy },
  { id: 'settings', labelEn: 'Settings', labelRo: 'Setări', icon: Settings, adminOnly: true },
];

export const SkoolNavBar: React.FC<SkoolNavBarProps> = ({ activeTab, onTabChange }) => {
  const { language } = useLanguage();
  const { isAdmin } = useAdminAuth();
  const isRo = language === 'ro';

  const tabs = baseTabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container max-w-6xl mx-auto px-4">
        <nav className="flex overflow-x-auto scrollbar-hide -mb-px" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all relative',
                  'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/80'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{isRo ? tab.labelRo : tab.labelEn}</span>

                {/* Active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
