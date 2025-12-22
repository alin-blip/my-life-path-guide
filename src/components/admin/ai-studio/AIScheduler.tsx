import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Facebook, Instagram, Trash2, Edit2, Copy, ExternalLink, Plus, Loader2, Check, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ScheduledPost {
  id: string;
  content: string;
  content_type: string;
  image_id: string | null;
  scheduled_for: string;
  platforms: string[];
  status: string;
  published_at: string | null;
  created_at: string;
}

interface CreatePostForm {
  content: string;
  scheduled_for: string;
  scheduled_time: string;
  platforms: string[];
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
};

export const AIScheduler: React.FC = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<CreatePostForm>({
    content: '',
    scheduled_for: format(new Date(), 'yyyy-MM-dd'),
    scheduled_time: '09:00',
    platforms: ['facebook', 'instagram'],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setPosts((data as ScheduledPost[]) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: 'Eroare', description: 'Nu am putut încărca postările', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    if (!form.content.trim()) {
      toast({ title: 'Eroare', description: 'Te rog adaugă conținutul postării', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const scheduledDateTime = new Date(`${form.scheduled_for}T${form.scheduled_time}`);

      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          content: form.content,
          content_type: 'social_post',
          scheduled_for: scheduledDateTime.toISOString(),
          platforms: form.platforms,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({ title: 'Succes!', description: 'Postarea a fost programată' });
      setIsDialogOpen(false);
      setForm({
        content: '',
        scheduled_for: format(new Date(), 'yyyy-MM-dd'),
        scheduled_time: '09:00',
        platforms: ['facebook', 'instagram'],
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: 'Eroare', description: 'Nu am putut programa postarea', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Șters!', description: 'Postarea a fost ștearsă' });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: 'Eroare', description: 'Nu am putut șterge postarea', variant: 'destructive' });
    }
  };

  const copyContent = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({ title: 'Copiat!', description: 'Conținutul a fost copiat' });
  };

  const markAsPublished = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
      toast({ title: 'Publicat!', description: 'Postarea a fost marcată ca publicată' });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({ title: 'Eroare', description: 'Nu am putut actualiza postarea', variant: 'destructive' });
    }
  };

  const togglePlatform = (platform: string) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const publishedPosts = posts.filter(p => p.status === 'published');
  const todayPosts = scheduledPosts.filter(p => isToday(new Date(p.scheduled_for)));

  const getStatusBadge = (post: ScheduledPost) => {
    if (post.status === 'published') {
      return <Badge variant="default" className="bg-green-500">Publicat</Badge>;
    }
    if (isPast(new Date(post.scheduled_for))) {
      return <Badge variant="destructive">Întârziat</Badge>;
    }
    if (isToday(new Date(post.scheduled_for))) {
      return <Badge variant="secondary">Azi</Badge>;
    }
    return <Badge variant="outline">Programat</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledPosts.length}</p>
                <p className="text-xs text-muted-foreground">Programate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayPosts.length}</p>
                <p className="text-xs text-muted-foreground">Pentru azi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedPosts.length}</p>
                <p className="text-xs text-muted-foreground">Publicate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Programează Postare Nouă
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Programează o postare</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Conținut</Label>
              <Textarea
                placeholder="Scrie conținutul postării..."
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.scheduled_for}
                  onChange={(e) => setForm(prev => ({ ...prev, scheduled_for: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Ora</Label>
                <Input
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) => setForm(prev => ({ ...prev, scheduled_time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Platforme</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.platforms.includes('facebook')}
                    onCheckedChange={() => togglePlatform('facebook')}
                  />
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Facebook</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.platforms.includes('instagram')}
                    onCheckedChange={() => togglePlatform('instagram')}
                  />
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span className="text-sm">Instagram</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anulează</Button>
            <Button onClick={createPost} disabled={isCreating}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              Programează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Posts Tabs */}
      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="scheduled">Programate ({scheduledPosts.length})</TabsTrigger>
          <TabsTrigger value="published">Publicate ({publishedPosts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled">
          {scheduledPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto opacity-50 mb-4" />
                <p>Nu ai postări programate</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.map(post => (
                <Card key={post.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(post)}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(post.scheduled_for), 'dd MMM yyyy, HH:mm', { locale: ro })}
                          </span>
                          <div className="flex gap-1">
                            {post.platforms.map(p => (
                              <span key={p} className="text-muted-foreground">{platformIcons[p]}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm line-clamp-3">{post.content}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => copyContent(post.content)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => markAsPublished(post.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published">
          {publishedPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Check className="w-12 h-12 mx-auto opacity-50 mb-4" />
                <p>Nu ai postări publicate încă</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {publishedPosts.map(post => (
                <Card key={post.id} className="opacity-75">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(post)}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Publicat {post.published_at && format(new Date(post.published_at), 'dd MMM yyyy', { locale: ro })}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{post.content}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
