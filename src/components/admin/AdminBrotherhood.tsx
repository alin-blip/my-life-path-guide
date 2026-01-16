import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Flag,
  Trash2,
  Eye,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  tribe_id: string | null;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface Tribe {
  id: string;
  name: string;
  member_count: number;
  created_at: string;
  is_public: boolean;
}

export const AdminBrotherhood: React.FC = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalTribes: 0,
    totalMembers: 0,
    activeToday: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [postsResult, tribesResult, membersResult] = await Promise.all([
      supabase
        .from('wall_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('tribes')
        .select('*')
        .order('member_count', { ascending: false }),
      supabase
        .from('tribe_members')
        .select('user_id', { count: 'exact' })
    ]);

    setPosts(postsResult.data || []);
    setTribes(tribesResult.data || []);

    // Calculate stats
    const totalMembers = new Set(membersResult.data?.map(m => m.user_id) || []).size;
    const today = new Date().toISOString().split('T')[0];
    const activeToday = (postsResult.data || []).filter(
      p => p.created_at.startsWith(today)
    ).length;

    setStats({
      totalPosts: postsResult.data?.length || 0,
      totalTribes: tribesResult.data?.length || 0,
      totalMembers,
      activeToday
    });

    setLoading(false);
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('wall_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      toast({ title: 'Error deleting post', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Post deleted' });
      fetchData();
    }
  };

  const deleteTribe = async (tribeId: string) => {
    const { error } = await supabase
      .from('tribes')
      .delete()
      .eq('id', tribeId);

    if (error) {
      toast({ title: 'Error deleting tribe', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Tribe deleted' });
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Brotherhood Management</h2>
          <p className="text-sm text-muted-foreground">
            Moderate community content and manage tribes
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTribes}</p>
                <p className="text-xs text-muted-foreground">Tribes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
                <p className="text-xs text-muted-foreground">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeToday}</p>
                <p className="text-xs text-muted-foreground">Posts Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="tribes" className="gap-2">
            <Users className="h-4 w-4" />
            Tribes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Recent Posts</span>
                <Badge variant="secondary">{posts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {posts.map(post => (
                      <div 
                        key={post.id}
                        className="p-3 rounded-lg border border-border/30 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500"
                              onClick={() => deletePost(post.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>❤️ {post.likes_count}</span>
                          <span>💬 {post.comments_count}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tribes" className="mt-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>All Tribes</span>
                <Badge variant="secondary">{tribes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {tribes.map(tribe => (
                      <div 
                        key={tribe.id}
                        className="p-3 rounded-lg border border-border/30 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm">{tribe.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tribe.member_count} members • {tribe.is_public ? 'Public' : 'Private'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-red-500"
                            onClick={() => deleteTribe(tribe.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
