import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Pin, Pencil, Save } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Render message text with clickable URLs
const renderMessageWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      // Reset lastIndex since we reuse the regex
      urlRegex.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 transition-colors"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

export const CommunityWelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchWelcome = async () => {
      const { data } = await supabase
        .from('community_settings')
        .select('*')
        .eq('setting_key', 'welcome_message')
        .single();

      if (data) {
        setWelcomeMessage(data.setting_value || '');
        setUpdatedAt(data.updated_at);
      }
    };

    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    };

    fetchWelcome();
    checkAdmin();
  }, [user]);

  const handleSave = async () => {
    if (!editValue.trim()) return;
    setSaving(true);

    const { error } = await supabase
      .from('community_settings')
      .update({
        setting_value: editValue.trim(),
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('setting_key', 'welcome_message');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setWelcomeMessage(editValue.trim());
      setUpdatedAt(new Date().toISOString());
      setEditOpen(false);
      toast({
        title: language === 'ro' ? 'Salvat!' : 'Saved!',
        description: language === 'ro' ? 'Mesajul a fost actualizat.' : 'Welcome message updated.',
      });
    }
    setSaving(false);
  };

  if (!welcomeMessage) return null;

  const timeAgo = updatedAt
    ? formatDistanceToNow(new Date(updatedAt), {
        addSuffix: true,
        locale: language === 'ro' ? ro : undefined,
      })
    : '';

  return (
    <>
      <div className="bg-card border border-primary/20 rounded-xl p-4 relative">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Pin className="h-3.5 w-3.5" />
            <span>{language === 'ro' ? 'Mesaj de bun venit' : 'Welcome Message'}</span>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground"
              onClick={() => {
                setEditValue(welcomeMessage);
                setEditOpen(true);
              }}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          )}
        </div>

        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {renderMessageWithLinks(welcomeMessage)}
        </div>

        {timeAgo && (
          <p className="text-xs text-muted-foreground mt-3">
            — Admin · {language === 'ro' ? 'Actualizat' : 'Updated'} {timeAgo}
          </p>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'ro' ? 'Editează mesajul de bun venit' : 'Edit Welcome Message'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ro'
                ? 'Acest mesaj apare în partea de sus a feed-ului pentru toți membrii.'
                : 'This message appears at the top of the feed for all members.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[120px] resize-none"
              placeholder={
                language === 'ro' ? 'Scrie mesajul de bun venit...' : 'Write the welcome message...'
              }
            />
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={!editValue.trim() || saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving
                  ? language === 'ro'
                    ? 'Se salvează...'
                    : 'Saving...'
                  : language === 'ro'
                    ? 'Salvează'
                    : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
