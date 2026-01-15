import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Crown, 
  ArrowRight, 
  Play,
  MessageSquare,
  Star,
  ThumbsUp,
  Reply,
  Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  likes?: number;
  replies?: Comment[];
}

interface WarriorTrainerPreviewProps {
  onOpenSalesLetter: () => void;
  onBack: () => void;
}

export const WarriorTrainerPreview: React.FC<WarriorTrainerPreviewProps> = ({ 
  onOpenSalesLetter,
  onBack 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('warriors_way_comments')
        .select('*')
        .eq('module_id', 'trainer-intro')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Organize into threads
      const topLevel = (data || []).filter(c => !c.parent_id);
      const replies = (data || []).filter(c => c.parent_id);
      
      const organized = topLevel.map(comment => ({
        ...comment,
        likes: Math.floor(Math.random() * 50) + 10,
        replies: replies.filter(r => r.parent_id === comment.id).map(r => ({
          ...r,
          likes: Math.floor(Math.random() * 20) + 5
        }))
      }));

      setComments(organized);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMM yyyy', { locale: ro });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-950/10 to-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← Înapoi la curs
          </Button>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Crown className="h-3 w-3 mr-1" />
            PROGRAM AVANSAT
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            WARRIOR TRAINER
          </h1>
          <p className="text-lg text-muted-foreground">
            Devino antrenorul propriei tale vieți și transformă viețile altora
          </p>
        </div>

        {/* Video Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-black/50 aspect-video flex items-center justify-center group cursor-pointer hover:border-amber-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl shadow-amber-500/30">
              <Play className="h-10 w-10 text-white ml-2" />
            </div>
            <p className="text-amber-400 font-medium text-lg">Video de prezentare în curând</p>
          </div>
        </div>

        {/* BIG CTA Button */}
        <div className="mb-12">
          <Button 
            size="lg" 
            onClick={onOpenSalesLetter}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white text-xl md:text-2xl font-bold px-8 py-8 md:py-10 rounded-2xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Flame className="h-7 w-7 mr-3" />
            VREAU SĂ DEVIN WARRIOR TRAINER - 5.000 EUR
            <ArrowRight className="h-7 w-7 ml-3" />
          </Button>
          <p className="text-center text-muted-foreground text-sm mt-3">
            ✨ Investiție unică • Acces pe viață • Garanție 30 zile
          </p>
        </div>

        {/* Comments Section - Social Proof */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold">Ce spun Trainerii Noștri</h2>
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
              {comments.length} mesaje
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Se încarcă comentariile...
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className="p-5 bg-card/50 border-amber-500/20 hover:border-amber-500/30 transition-colors">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 border-2 border-amber-500/30">
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">
                          {getInitials(comment.author_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{comment.author_name}</span>
                          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                            <Crown className="h-3 w-3 mr-1" />
                            Trainer Certificat
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-amber-400 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            {comment.likes}
                          </button>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-amber-500/20 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <Avatar className="h-8 w-8 border border-amber-500/20">
                                  <AvatarFallback className="bg-gradient-to-br from-amber-500/80 to-orange-600/80 text-white text-xs">
                                    {getInitials(reply.author_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{reply.author_name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground/90">{reply.content}</p>
                                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-400 mt-1">
                                    <ThumbsUp className="h-3 w-3" />
                                    {reply.likes}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="sticky bottom-4 z-10">
          <Button 
            size="lg" 
            onClick={onOpenSalesLetter}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white text-lg md:text-xl font-bold px-8 py-6 md:py-8 rounded-xl shadow-2xl shadow-amber-500/30"
          >
            <Crown className="h-6 w-6 mr-2" />
            AFLĂ MAI MULTE DESPRE WARRIOR TRAINER - 5.000 EUR
            <ArrowRight className="h-6 w-6 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
