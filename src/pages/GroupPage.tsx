import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Tribe } from '@/hooks/useBrotherhood';
import { GroupHeader } from '@/components/groups/GroupHeader';
import { GroupFeed } from '@/components/groups/GroupFeed';
import { GroupChat } from '@/components/groups/GroupChat';
import { GroupMembers } from '@/components/groups/GroupMembers';
import { CoachTribeLessons } from '@/components/coach/CoachTribeLessons';
import { CoachTribeCalendar } from '@/components/coach/CoachTribeCalendar';
import { CoachTribeGamification } from '@/components/coach/CoachTribeGamification';
import { useToast } from '@/hooks/use-toast';
import { Users, Globe, Lock, Calendar } from 'lucide-react';

const GroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [members, setMembers] = useState<Array<{ user_id: string; profiles?: { display_name?: string } | null }>>([]);

  const fetchTribe = async () => {
    if (!groupId) return;

    const { data, error } = await supabase
      .from('tribes')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error || !data) {
      navigate('/programs?tab=groups');
      return;
    }
    setTribe(data);
    setIsOwner(data.created_by === user?.id);

    if (user) {
      const { data: membership } = await supabase
        .from('tribe_members')
        .select('id')
        .eq('tribe_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsMember(!!membership);
    }

    // Fetch members for gamification
    const { data: memberData } = await supabase
      .from('tribe_members')
      .select('user_id, role')
      .eq('tribe_id', groupId);
    if (memberData) {
      // Fetch display names
      const userIds = memberData.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setMembers(memberData.map(m => ({
        user_id: m.user_id,
        profiles: profileMap.get(m.user_id) ? { display_name: profileMap.get(m.user_id)?.display_name } : null,
      })));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTribe();
  }, [groupId, user]);

  const handleJoin = async () => {
    if (!user || !groupId) return;
    const { error } = await supabase.from('tribe_members').insert({
      tribe_id: groupId,
      user_id: user.id,
      role: 'member',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setIsMember(true);
      fetchTribe();
      toast({ title: language === 'ro' ? 'Te-ai alăturat!' : 'Joined!', description: language === 'ro' ? 'Bun venit în grup.' : 'Welcome to the group.' });
    }
  };

  const handleLeave = async () => {
    if (!user || !groupId) return;
    const { error } = await supabase
      .from('tribe_members')
      .delete()
      .eq('tribe_id', groupId)
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setIsMember(false);
      fetchTribe();
    }
  };

  if (loading || !tribe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GroupHeader
        tribe={tribe}
        isMember={isMember}
        isOwner={isOwner}
        onJoin={handleJoin}
        onLeave={handleLeave}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="container max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'feed' && (
          <div className="flex gap-6">
            {/* Main Feed */}
            <div className="flex-1 min-w-0">
              <GroupFeed tribeId={tribe.id} isMember={isMember} />
            </div>
            {/* Sidebar */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-4 space-y-4">
                {/* About card */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-bold text-sm text-foreground mb-2">
                    {language === 'ro' ? 'Despre' : 'About'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tribe.description || (language === 'ro' ? 'Nicio descriere.' : 'No description.')}
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {tribe.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      <span>{tribe.is_public ? 'Public' : (language === 'ro' ? 'Privat' : 'Private')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      <span>{tribe.member_count} {language === 'ro' ? 'membri' : 'members'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {language === 'ro' ? 'Creat pe' : 'Created'}{' '}
                        {new Date(tribe.created_at).toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <GroupChat tribeId={tribe.id} isMember={isMember} />
        )}

        {activeTab === 'classroom' && (
          <CoachTribeLessons tribeId={tribe.id} coachId={tribe.created_by} />
        )}

        {activeTab === 'calendar' && user && (
          <CoachTribeCalendar tribeId={tribe.id} userId={user.id} isOwner={isOwner} />
        )}

        {activeTab === 'leaderboard' && user && (
          <CoachTribeGamification tribeId={tribe.id} userId={user.id} isOwner={isOwner} members={members} />
        )}

        {activeTab === 'members' && (
          <GroupMembers tribeId={tribe.id} />
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">{tribe.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tribe.description || (language === 'ro' ? 'Nicio descriere disponibilă.' : 'No description available.')}
              </p>
              <div className="text-xs text-muted-foreground">
                {language === 'ro' ? 'Creat pe' : 'Created on'}{' '}
                {new Date(tribe.created_at).toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPage;
