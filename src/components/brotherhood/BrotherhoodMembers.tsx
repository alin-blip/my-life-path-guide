import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Shield, Crown, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Member {
  user_id: string;
  display_name: string;
  avatar_emoji: string | null;
  is_visible: boolean;
  total_xp?: number;
  tribes_count?: number;
}

export const BrotherhoodMembers: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    
    // Get all visible leaderboard profiles
    const { data: profiles, error } = await supabase
      .from('leaderboard_profiles')
      .select('*')
      .eq('is_visible', true)
      .order('display_name');

    if (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
      return;
    }

    // Get tribe counts for each user
    const userIds = profiles?.map(p => p.user_id) || [];
    
    if (userIds.length > 0) {
      const { data: tribeCounts } = await supabase
        .from('tribe_members')
        .select('user_id')
        .in('user_id', userIds);

      const tribeCountMap: Record<string, number> = {};
      tribeCounts?.forEach(tc => {
        tribeCountMap[tc.user_id] = (tribeCountMap[tc.user_id] || 0) + 1;
      });

      const membersWithCounts = profiles?.map(p => ({
        ...p,
        tribes_count: tribeCountMap[p.user_id] || 0
      })) || [];

      setMembers(membersWithCounts);
    } else {
      setMembers([]);
    }
    
    setLoading(false);
  };

  const filteredMembers = members.filter(m =>
    m.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <Star className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Star className="h-4 w-4 text-amber-700" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">
          {language === 'ro' ? 'Membrii Brotherhood' : 'Brotherhood Members'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {members.length} {language === 'ro' ? 'războinici în comunitate' : 'warriors in the community'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={language === 'ro' ? 'Caută membri...' : 'Search members...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Members List */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {language === 'ro' ? 'Toți Membrii' : 'All Members'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{language === 'ro' ? 'Niciun membru găsit' : 'No members found'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMembers.map((member, index) => (
                  <div 
                    key={member.user_id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/20">
                            {member.avatar_emoji || '⚔️'}
                          </AvatarFallback>
                        </Avatar>
                        {getRankIcon(index) && (
                          <div className="absolute -top-1 -right-1">
                            {getRankIcon(index)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.tribes_count || 0} {language === 'ro' ? 'tribes' : 'tribes'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {member.user_id === user?.id && (
                        <Badge variant="outline" className="text-xs">
                          {language === 'ro' ? 'Tu' : 'You'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
