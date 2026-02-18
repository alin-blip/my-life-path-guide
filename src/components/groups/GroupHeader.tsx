import React from 'react';
import { Tribe } from '@/hooks/useBrotherhood';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Globe, Lock, ArrowLeft, MessageSquare, Newspaper, Info, BookOpen, CalendarDays, Trophy, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface GroupHeaderProps {
  tribe: Tribe;
  isMember: boolean;
  isOwner: boolean;
  onJoin: () => void;
  onLeave: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  tribe,
  isMember,
  isOwner,
  onJoin,
  onLeave,
  activeTab,
  onTabChange,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const tabs = [
    { id: 'feed', label: 'Feed', icon: Newspaper },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'classroom', label: language === 'ro' ? 'Cursuri' : 'Classroom', icon: BookOpen },
    { id: 'calendar', label: language === 'ro' ? 'Calendar' : 'Calendar', icon: CalendarDays },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'members', label: language === 'ro' ? 'Membri' : 'Members', icon: Users },
    { id: 'about', label: 'About', icon: Info },
    ...((isOwner) ? [{ id: 'settings', label: language === 'ro' ? 'Setări' : 'Settings', icon: Settings }] : []),
  ];

  return (
    <div className="bg-card border-b border-border">
      {/* Cover - larger */}
      <div className="h-48 sm:h-56 bg-gradient-to-br from-primary/25 via-primary/10 to-accent/15 relative">
        {tribe.cover_image_url && (
          <img src={tribe.cover_image_url} alt="" className="w-full h-full object-cover" />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm gap-1.5"
          onClick={() => navigate('/programs?tab=groups')}
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'ro' ? 'Înapoi' : 'Back'}
        </Button>
      </div>

      {/* Info band overlapping cover */}
      <div className="container max-w-5xl mx-auto px-4 -mt-6 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <Avatar className="w-20 h-20 border-4 border-card shrink-0 -mt-4">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-3xl">
              {tribe.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 pb-2">
            <h1 className="text-xl font-bold text-foreground truncate">{tribe.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                {tribe.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {tribe.is_public
                  ? 'Public'
                  : language === 'ro' ? 'Privat' : 'Private'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {tribe.member_count} {language === 'ro' ? 'membri' : 'members'}
              </span>
            </div>
          </div>

          <div className="shrink-0 pb-2">
            {isOwner ? (
              <Button variant="outline" size="sm" disabled>
                {language === 'ro' ? 'Proprietar' : 'Owner'}
              </Button>
            ) : isMember ? (
              <Button variant="outline" size="sm" onClick={onLeave}>
                {language === 'ro' ? 'Părăsește' : 'Leave Group'}
              </Button>
            ) : (
              <Button size="sm" onClick={onJoin}>
                {language === 'ro' ? 'Alătură-te' : 'Join Group'}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs in header */}
        <div className="flex items-center gap-1 mt-2 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-[3px] transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
