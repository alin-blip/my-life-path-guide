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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Newspaper, Users, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

    // Check membership
    if (user) {
      const { data: membership } = await supabase
        .from('tribe_members')
        .select('id')
        .eq('tribe_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsMember(!!membership);
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
      />

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="feed">
          <TabsList className="mb-6">
            <TabsTrigger value="feed" className="gap-1.5">
              <Newspaper className="h-4 w-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5">
              <Users className="h-4 w-4" />
              {language === 'ro' ? 'Membri' : 'Members'}
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-1.5">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <GroupFeed tribeId={tribe.id} isMember={isMember} />
          </TabsContent>

          <TabsContent value="chat">
            <GroupChat tribeId={tribe.id} isMember={isMember} />
          </TabsContent>

          <TabsContent value="members">
            <GroupMembers tribeId={tribe.id} />
          </TabsContent>

          <TabsContent value="about">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">{tribe.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tribe.description || (language === 'ro' ? 'Nicio descriere disponibilă.' : 'No description available.')}
              </p>
              <div className="text-xs text-muted-foreground">
                {language === 'ro' ? 'Creat pe' : 'Created on'}{' '}
                {new Date(tribe.created_at).toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupPage;
