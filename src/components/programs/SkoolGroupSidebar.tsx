import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Wifi, BookOpen, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export const SkoolGroupSidebar: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [memberCount, setMemberCount] = useState(0);
  const [recentMembers, setRecentMembers] = useState<
    { display_name: string; avatar_emoji: string | null }[]
  >([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase
        .from('leaderboard_profiles')
        .select('*', { count: 'exact', head: true });
      setMemberCount(count || 0);

      const { data: members } = await supabase
        .from('leaderboard_profiles')
        .select('display_name, avatar_emoji')
        .order('created_at', { ascending: false })
        .limit(8);
      setRecentMembers(members || []);
    };
    fetchStats();
  }, []);

  const navigateToTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const quickLinks = [
    {
      label: language === 'ro' ? 'Clasament' : 'Leaderboards',
      icon: Trophy,
      onClick: () => navigateToTab('leaderboards'),
    },
    {
      label: language === 'ro' ? 'Sala de clasă' : 'Classroom',
      icon: BookOpen,
      onClick: () => navigateToTab('classroom'),
    },
  ];

  return (
    <div className="space-y-4 sticky top-4">
      {/* Group Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Cover gradient */}
        <div className="h-24 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />

        <div className="p-4 -mt-6">
          {/* Group avatar */}
          <Avatar className="w-12 h-12 border-2 border-card">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
              W
            </AvatarFallback>
          </Avatar>

          <h3 className="font-bold text-base text-foreground mt-2">
            Warrior OS Community
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {language === 'ro'
              ? 'Comunitatea antreprenorilor care vor totul — Corp, Spirit, Relații, Business.'
              : 'The community for entrepreneurs who want it all — Body, Being, Balance, Business.'}
          </p>

          {/* Quick Links */}
          <div className="mt-3 space-y-1">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.onClick}
                className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-lg hover:bg-muted/50"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-border px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{memberCount}</span>
            <span>{language === 'ro' ? 'Membri' : 'Members'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wifi className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">
              {Math.max(1, Math.floor(memberCount * 0.02))}
            </span>
            <span>Online</span>
          </div>
        </div>

        {/* Recent Members */}
        {recentMembers.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <div className="flex -space-x-2">
              {recentMembers.slice(0, 8).map((member, i) => (
                <Avatar key={i} className="w-7 h-7 border-2 border-card">
                  <AvatarFallback className="bg-muted text-[10px]">
                    {member.avatar_emoji || member.display_name?.charAt(0) || '⚔️'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 8 && (
                <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                  +{memberCount - 8}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
