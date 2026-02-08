import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { ConversationList } from '@/components/messages/ConversationList';
import { ConversationThread } from '@/components/messages/ConversationThread';
import { NewMessageDialog } from '@/components/messages/NewMessageDialog';
import { supabase } from '@/integrations/supabase/client';

const Messages: React.FC = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    sendBulkMessage,
  } = useDirectMessages();

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedPartnerName, setSelectedPartnerName] = useState('');
  const [selectedPartnerEmoji, setSelectedPartnerEmoji] = useState('📚');
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectConversation = useCallback((partnerId: string) => {
    setSelectedPartnerId(partnerId);
    const conv = conversations.find((c) => c.partner_id === partnerId);
    if (conv) {
      setSelectedPartnerName(conv.partner_name);
      setSelectedPartnerEmoji(conv.partner_emoji);
    }
    fetchMessages(partnerId);
  }, [conversations, fetchMessages]);

  const handleSelectNewMember = useCallback(async (memberId: string) => {
    setSelectedPartnerId(memberId);
    // Fetch partner name
    const { data } = await supabase
      .from('leaderboard_profiles')
      .select('display_name, avatar_emoji')
      .eq('user_id', memberId)
      .single();
    setSelectedPartnerName(data?.display_name || 'User');
    setSelectedPartnerEmoji(data?.avatar_emoji || '📚');
    fetchMessages(memberId);
  }, [fetchMessages]);

  const handleSelectMultiple = useCallback(async (memberIds: string[]) => {
    // Select the first member for viewing, the actual bulk send happens when typing
    if (memberIds.length > 0) {
      handleSelectNewMember(memberIds[0]);
    }
    // Store all selected IDs for bulk messaging
    setBulkRecipients(memberIds);
  }, []);

  const [bulkRecipients, setBulkRecipients] = useState<string[]>([]);

  const handleSend = useCallback(async (content: string) => {
    if (!selectedPartnerId) return;
    if (bulkRecipients.length > 1) {
      await sendBulkMessage(bulkRecipients, content);
      setBulkRecipients([]);
    } else {
      await sendMessage(selectedPartnerId, content);
    }
  }, [selectedPartnerId, sendMessage, sendBulkMessage, bulkRecipients]);

  const showList = !isMobile || !selectedPartnerId;
  const showThread = !isMobile || !!selectedPartnerId;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && selectedPartnerId && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedPartnerId(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">
            {language === 'ro' ? 'Mesaje' : 'Messages'}
          </h1>
        </div>
        <Button size="sm" variant="outline" onClick={() => setNewMessageOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {!isMobile && (language === 'ro' ? 'Mesaj nou' : 'New Message')}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation list */}
        {showList && (
          <div className={`${isMobile ? 'w-full' : 'w-80 border-r border-border/60'} overflow-y-auto`}>
            <ConversationList
              conversations={conversations}
              selectedPartnerId={selectedPartnerId}
              onSelect={handleSelectConversation}
            />
          </div>
        )}

        {/* Thread */}
        {showThread && (
          <div className="flex-1">
            {selectedPartnerId ? (
              <ConversationThread
                partnerName={selectedPartnerName}
                partnerEmoji={selectedPartnerEmoji}
                messages={messages}
                onSend={handleSend}
                loading={loading}
              />
            ) : !isMobile ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {language === 'ro'
                  ? 'Selectează o conversație sau începe una nouă'
                  : 'Select a conversation or start a new one'}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <NewMessageDialog
        open={newMessageOpen}
        onOpenChange={setNewMessageOpen}
        onSelectMember={handleSelectNewMember}
        onSelectMultiple={handleSelectMultiple}
      />
    </div>
  );
};

export default Messages;
