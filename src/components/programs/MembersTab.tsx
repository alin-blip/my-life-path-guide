import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Crown, Medal, Users, Filter, ChevronDown, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MemberProfile {
  user_id: string;
  display_name: string;
  avatar_emoji: string | null;
  total_xp: number;
  current_level: number;
  current_streak: number;
  is_visible: boolean;
  created_at: string | null;
  tribes_count: number;
  posts_count: number;
}

type SortOption = 'xp' | 'name' | 'newest' | 'streak' | 'posts';
type FilterOption = 'all' | 'active' | 'top' | 'new';

export const MembersTab: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRo = language === 'ro';

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('xp');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from('leaderboard_profiles')
      .select('*')
      .eq('is_visible', true);

    if (error || !profiles) {
      console.error('Error fetching members:', error);
      setLoading(false);
      return;
    }

    const userIds = profiles.map(p => p.user_id);

    const { data: tribeCounts } = await supabase
      .from('tribe_members')
      .select('user_id')
      .in('user_id', userIds);

    const tribeCountMap: Record<string, number> = {};
    tribeCounts?.forEach(tc => {
      tribeCountMap[tc.user_id] = (tribeCountMap[tc.user_id] || 0) + 1;
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: postCounts } = await supabase
      .from('wall_posts')
      .select('user_id')
      .in('user_id', userIds)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const postCountMap: Record<string, number> = {};
    postCounts?.forEach(pc => {
      postCountMap[pc.user_id] = (postCountMap[pc.user_id] || 0) + 1;
    });

    setMembers(
      profiles.map(p => ({
        ...p,
        tribes_count: tribeCountMap[p.user_id] || 0,
        posts_count: postCountMap[p.user_id] || 0,
      }))
    );
    setLoading(false);
  };

  const filteredAndSorted = useMemo(() => {
    let result = members.filter(m =>
      m.display_name.toLowerCase().includes(search.toLowerCase())
    );

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    switch (filterBy) {
      case 'active':
        result = result.filter(m => m.posts_count > 0 || m.current_streak > 0);
        break;
      case 'top':
        result = result.filter(m => m.total_xp >= 100);
        break;
      case 'new':
        result = result.filter(m => m.created_at && new Date(m.created_at) >= monthAgo);
        break;
    }

    switch (sortBy) {
      case 'xp':
        result.sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0));
        break;
      case 'name':
        result.sort((a, b) => a.display_name.localeCompare(b.display_name));
        break;
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'streak':
        result.sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0));
        break;
      case 'posts':
        result.sort((a, b) => b.posts_count - a.posts_count);
        break;
    }

    return result;
  }, [members, search, sortBy, filterBy]);

  const getLevelTitle = (level: number): string => {
    if (level >= 10) return isRo ? 'Legendă' : 'Legend';
    if (level >= 7) return isRo ? 'Maestru' : 'Master';
    if (level >= 5) return isRo ? 'Războinic' : 'Warrior';
    if (level >= 3) return isRo ? 'Luptător' : 'Fighter';
    return isRo ? 'Recrut' : 'Recruit';
  };

  const getLevelColor = (level: number): string => {
    if (level >= 10) return 'text-yellow-500';
    if (level >= 7) return 'text-purple-500';
    if (level >= 5) return 'text-blue-500';
    if (level >= 3) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const handleDM = (memberId: string) => {
    navigate(`/messages?partner=${memberId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isRo ? 'Director Membri' : 'Member Directory'}
          </h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {members.length} {isRo ? 'războinici în comunitate' : 'warriors in the community'}
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isRo ? 'Caută membri...' : 'Search members...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            {isRo ? 'Filtre' : 'Filters'}
            <ChevronDown className={cn("h-3 w-3 transition-transform", showFilters && "rotate-180")} />
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-card border border-border rounded-xl">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isRo ? 'Filtrează' : 'Filter'}
              </span>
              <div className="flex gap-1.5">
                {([
                  { id: 'all', label: isRo ? 'Toți' : 'All' },
                  { id: 'active', label: isRo ? 'Activi' : 'Active' },
                  { id: 'top', label: 'Top' },
                  { id: 'new', label: isRo ? 'Noi' : 'New' },
                ] as const).map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterBy(f.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                      filterBy === f.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isRo ? 'Sortează' : 'Sort'}
              </span>
              <div className="flex gap-1.5">
                {([
                  { id: 'xp', label: 'XP' },
                  { id: 'name', label: isRo ? 'Nume' : 'Name' },
                  { id: 'newest', label: isRo ? 'Recenți' : 'Newest' },
                  { id: 'streak', label: 'Streak' },
                  { id: 'posts', label: isRo ? 'Postări' : 'Posts' },
                ] as const).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                      sortBy === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filteredAndSorted.length} {isRo ? 'rezultate' : 'results'}
      </p>

      {/* Members Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            {isRo ? 'Niciun membru găsit.' : 'No members found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAndSorted.map((member) => {
            const isCurrentUser = member.user_id === user?.id;
            const globalRank = members
              .slice()
              .sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0))
              .findIndex(m => m.user_id === member.user_id) + 1;

            return (
              <div
                key={member.user_id}
                className={cn(
                  "bg-card border border-border rounded-xl p-4 flex items-center gap-4 transition-colors hover:border-primary/30",
                  isCurrentUser && "border-primary/40 bg-primary/5"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-xl">
                      {member.avatar_emoji || '⚔️'}
                    </AvatarFallback>
                  </Avatar>
                  {globalRank <= 3 && (
                    <div className="absolute -top-1 -right-1">
                      {globalRank === 1 ? (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Medal className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {member.display_name}
                    </h4>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                        {isRo ? 'Tu' : 'You'}
                      </Badge>
                    )}
                  </div>
                  <p className={cn("text-xs font-medium", getLevelColor(member.current_level))}>
                    Lv.{member.current_level} — {getLevelTitle(member.current_level)}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{member.total_xp || 0} XP</span>
                    {member.current_streak > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {member.current_streak}
                      </span>
                    )}
                    <span>{member.posts_count} {isRo ? 'postări' : 'posts'}</span>
                  </div>
                </div>

                {!isCurrentUser && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    onClick={() => handleDM(member.user_id)}
                    title={isRo ? 'Trimite mesaj' : 'Send message'}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
