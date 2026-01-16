import React, { useState, useEffect, useRef } from 'react';
import { useBrotherhood, Tribe, BrotherhoodMessage } from '@/hooks/useBrotherhood';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export const BrotherhoodChat: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { myTribes, messages, fetchMessages, sendMessage } = useBrotherhood();
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (myTribes.length > 0 && !selectedTribe) {
      setSelectedTribe(myTribes[0]);
    }
  }, [myTribes]);

  useEffect(() => {
    if (selectedTribe) {
      fetchMessages(selectedTribe.id);
    }
  }, [selectedTribe]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedTribe) return;
    
    setIsSending(true);
    await sendMessage(newMessage.trim(), selectedTribe.id);
    setNewMessage('');
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (msg: BrotherhoodMessage) => {
    const isOwn = msg.sender_id === user?.id;
    
    return (
      <div 
        key={msg.id}
        className={cn(
          'flex gap-2 mb-3',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {!isOwn && (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/20 text-sm">
              {msg.sender?.avatar_emoji || '⚔️'}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isOwn 
            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
            : 'bg-muted rounded-tl-sm'
        )}>
          {!isOwn && (
            <p className="text-xs font-medium mb-1 opacity-70">
              {msg.sender?.display_name || 'Warrior'}
            </p>
          )}
          <p className="text-sm">{msg.content}</p>
          <p className={cn(
            'text-[10px] mt-1',
            isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}>
            {formatDistanceToNow(new Date(msg.created_at), { 
              addSuffix: true,
              locale: language === 'ro' ? ro : undefined
            })}
          </p>
        </div>
      </div>
    );
  };

  if (myTribes.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">
            {language === 'ro' ? 'Nu ești în niciun tribe' : 'You\'re not in any tribes'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'ro' 
              ? 'Alătură-te unui tribe pentru a accesa chat-ul.' 
              : 'Join a tribe to access the chat.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-16rem)]">
      {/* Tribes Sidebar */}
      <Card className="glass-card md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Hash className="h-4 w-4" />
            {language === 'ro' ? 'Canale' : 'Channels'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-[calc(100%-2rem)]">
            {myTribes.map(tribe => (
              <button
                key={tribe.id}
                onClick={() => setSelectedTribe(tribe)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedTribe?.id === tribe.id 
                    ? 'bg-primary/20 text-primary' 
                    : 'hover:bg-muted'
                )}
              >
                <span className="font-medium"># {tribe.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {tribe.member_count} {language === 'ro' ? 'membri' : 'members'}
                </span>
              </button>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="glass-card md:col-span-3 flex flex-col">
        {selectedTribe ? (
          <>
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                {selectedTribe.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      {language === 'ro' 
                        ? 'Niciun mesaj încă. Începe conversația!' 
                        : 'No messages yet. Start the conversation!'}
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </ScrollArea>
            </CardContent>

            <div className="p-4 border-t border-border/30">
              <div className="flex gap-2">
                <Input
                  placeholder={language === 'ro' ? 'Scrie un mesaj...' : 'Type a message...'}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">
              {language === 'ro' ? 'Selectează un canal' : 'Select a channel'}
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
