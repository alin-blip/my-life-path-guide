import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Users } from 'lucide-react';

interface MemberInfo {
  user_id: string;
  role: string;
  joined_at: string;
  display_name: string;
  avatar_emoji: string | null;
}

interface GroupMembersProps {
  tribeId: string;
}

export const GroupMembers: React.FC<GroupMembersProps> = ({ tribeId }) => {
  const { language } = useLanguage();
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data: memberData } = await supabase
        .from('tribe_members')
        .select('user_id, role, joined_at')
        .eq('tribe_id', tribeId)
        .order('role', { ascending: true })
        .order('joined_at', { ascending: true });

      if (memberData && memberData.length > 0) {
        const userIds = memberData.map((m) => m.user_id);
        const { data: profiles } = await supabase
          .from('leaderboard_profiles')
          .select('user_id, display_name, avatar_emoji')
          .in('user_id', userIds);

        setMembers(
          memberData.map((m) => {
            const profile = profiles?.find((p) => p.user_id === m.user_id);
            return {
              ...m,
              display_name: profile?.display_name || 'Warrior',
              avatar_emoji: profile?.avatar_emoji || null,
            };
          })
        );
      }
      setLoading(false);
    };

    fetchMembers();
  }, [tribeId]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <Badge variant="default" className="text-[10px] gap-1">
            <Crown className="h-3 w-3" />
            Owner
          </Badge>
        );
      case 'admin':
        return (
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge variant="outline" className="text-[10px]">
            Mod
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>
          {members.length} {language === 'ro' ? 'membri' : 'members'}
        </span>
      </div>

      <div className="grid gap-2">
        {members.map((member) => (
          <div
            key={member.user_id}
            className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
          >
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-base">
                {member.avatar_emoji || member.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground truncate">
                  {member.display_name}
                </span>
                {getRoleBadge(member.role)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
