import React, { useEffect, useState } from 'react';
import { GroupFeed } from '@/components/groups/GroupFeed';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Shield, MessageSquare, TrendingUp, Flame, Award } from 'lucide-react';
import { CommunityWelcomeBanner } from '@/components/programs/CommunityWelcomeBanner';
import { SkoolCategoryFilter } from '@/components/programs/SkoolCategoryFilter';
import { useNavigate } from 'react-router-dom';

const MAIN_TRIBE_ID = '07825fb0-4d6c-4716-b2f3-27a1708cf680';

export const CommunityFeedTab: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRo = language === 'ro';

  const [memberCount, setMemberCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [tribeInfo, setTribeInfo] = useState<{ name: string; description: string | null } | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [topContributors, setTopContributors] = useState<Array<{ name: string; emoji: string; posts: number }>>([]);

  useEffect(() => {
    const fetchTribeInfo = async () => {
      const { data: tribe } = await supabase
        .from('tribes')
        .select('name, description, member_count')
        .eq('id', MAIN_TRIBE_ID)
        .single();

      if (tribe) {
        setTribeInfo({ name: tribe.name, description: tribe.description });
        setMemberCount(tribe.member_count || 0);
        // Simulate online count as ~10-25% of members
        setOnlineCount(Math.max(1, Math.floor((tribe.member_count || 0) * (0.1 + Math.random() * 0.15))));
      }

      if (user) {
        const { data: membership } = await supabase
          .from('tribe_members')
          .select('id')
          .eq('tribe_id', MAIN_TRIBE_ID)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsMember(!!membership);
      }
    };

    const fetchTopContributors = async () => {
      // Get top posters this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: recentPosts } = await supabase
        .from('wall_posts')
        .select('user_id')
        .eq('tribe_id', MAIN_TRIBE_ID)
        .gte('created_at', weekAgo.toISOString());

      if (recentPosts && recentPosts.length > 0) {
        const counts = new Map<string, number>();
        recentPosts.forEach(p => {
          counts.set(p.user_id, (counts.get(p.user_id) || 0) + 1);
        });
        
        const topUserIds = [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id, count]) => ({ id, count }));

        if (topUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('leaderboard_profiles')
            .select('user_id, display_name, avatar_emoji')
            .in('user_id', topUserIds.map(u => u.id));

          setTopContributors(
            topUserIds.map(u => {
              const profile = profiles?.find(p => p.user_id === u.id);
              return {
                name: profile?.display_name || 'Warrior',
                emoji: profile?.avatar_emoji || '⚔️',
                posts: u.count,
              };
            })
          );
        }
      }
    };

    fetchTribeInfo();
    fetchTopContributors();
  }, [user]);

  return (
    <div className="flex gap-6">
      {/* Main Feed */}
      <div className="flex-1 min-w-0 space-y-4">
        <CommunityWelcomeBanner />
        
        {/* Category Filter — Skool-style */}
        <SkoolCategoryFilter active={activeCategory} onChange={setActiveCategory} />
        
        <GroupFeed 
          tribeId={MAIN_TRIBE_ID} 
          isMember={isMember} 
          categoryFilter={activeCategory !== 'all' ? activeCategory : undefined}
        />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 space-y-4">
        {/* Community Info Card */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-foreground">{tribeInfo?.name || 'CEO Mind OS Community'}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tribeInfo?.description ||
              (isRo
                ? 'Comunitatea oficială CEO Mind OS. Conectează-te cu alți fondatori, împărtășește progresul și crește împreună.'
                : 'The official CEO Mind OS community. Connect with fellow founders, share progress and grow together.')}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{memberCount} {isRo ? 'membri' : 'members'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{onlineCount} online</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/groups/${MAIN_TRIBE_ID}`)}
            className="w-full text-sm text-primary hover:underline text-left flex items-center gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {isRo ? 'Deschide chat-ul grupului' : 'Open group chat'}
          </button>
        </div>

        {/* Top Contributors This Week */}
        {topContributors.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h4 className="font-semibold text-sm text-foreground">
                {isRo ? 'Top Contributori' : 'Top Contributors'}
              </h4>
            </div>
            <div className="space-y-2.5">
              {topContributors.map((contributor, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-lg">{contributor.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{contributor.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{contributor.posts} {isRo ? 'postări' : 'posts'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Rules */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">
              {isRo ? 'Reguli comunitate' : 'Community Rules'}
            </h4>
          </div>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
            <li>{isRo ? 'Fii respectuos și constructiv' : 'Be respectful and constructive'}</li>
            <li>{isRo ? 'Împărtășește progresul tău' : 'Share your progress'}</li>
            <li>{isRo ? 'Ajută-i pe ceilalți warriors' : 'Help fellow warriors'}</li>
            <li>{isRo ? 'Fără spam sau auto-promovare' : 'No spam or self-promotion'}</li>
            <li>{isRo ? 'Păstrează conținutul relevant' : 'Keep content relevant'}</li>
          </ol>
        </div>
      </aside>
    </div>
  );
};
