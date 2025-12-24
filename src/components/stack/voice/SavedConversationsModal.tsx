import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { History, Loader2, Trash2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SavedMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SavedConversation {
  id: string;
  session_id: string;
  created_at: string;
  answers: {
    messages: SavedMessage[];
    savedAt: string;
  };
}

interface SavedConversationsModalProps {
  onLoadConversation?: (messages: SavedMessage[]) => void;
}

export const SavedConversationsModal: React.FC<SavedConversationsModalProps> = ({
  onLoadConversation
}) => {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('stack_sessions')
        .select('id, session_id, created_at, answers')
        .eq('user_id', user.id)
        .eq('stack_type', 'voice-conversation')
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      // Cast to unknown first then to our type
      setConversations((data || []) as unknown as SavedConversation[]);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca conversațiile.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  const handleLoad = (conv: SavedConversation) => {
    if (onLoadConversation && conv.answers?.messages) {
      onLoadConversation(conv.answers.messages);
      setOpen(false);
      toast({
        title: '✅ Conversație încărcată',
        description: 'Poți continua de unde ai rămas.'
      });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('stack_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== id));
      toast({
        title: '🗑️ Șters',
        description: 'Conversația a fost ștearsă.'
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut șterge conversația.',
        variant: 'destructive'
      });
    }
  };

  const getPreview = (messages: SavedMessage[]) => {
    if (!messages || messages.length === 0) return 'Conversație goală';
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      return firstUserMsg.content.substring(0, 80) + (firstUserMsg.content.length > 80 ? '...' : '');
    }
    return messages[0].content.substring(0, 80) + '...';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <History className="w-3 h-3" />
          Istoric
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Conversații Salvate
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nu ai conversații salvate încă.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(selectedId === conv.id ? null : conv.id)}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                    'hover:bg-muted/50',
                    selectedId === conv.id && 'bg-muted border-primary'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(conv.created_at), "d MMM yyyy, HH:mm", { locale: ro })}
                      </p>
                      <p className="text-sm truncate">
                        {getPreview(conv.answers?.messages || [])}
                      </p>
                      {conv.answers?.messages && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {conv.answers.messages.length} mesaje
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(conv.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {selectedId === conv.id && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <ScrollArea className="max-h-[150px]">
                        {conv.answers?.messages?.slice(0, 4).map((msg, i) => (
                          <div key={i} className={cn(
                            'text-xs p-2 rounded mb-1',
                            msg.role === 'user' ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'
                          )}>
                            <span className="font-medium">
                              {msg.role === 'user' ? 'Tu: ' : 'AI: '}
                            </span>
                            {msg.content.substring(0, 100)}...
                          </div>
                        ))}
                      </ScrollArea>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleLoad(conv)}
                      >
                        Încarcă Conversația
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
