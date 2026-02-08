import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Send, Bell, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface SkoolWritePostProps {
  onPost: (content: string, options?: { notifyAll?: boolean; sendEmail?: boolean }) => Promise<any>;
}

export const SkoolWritePost: React.FC<SkoolWritePostProps> = ({ onPost }) => {
  const { language } = useLanguage();
  const { isAdmin } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [notifyAll, setNotifyAll] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    await onPost(content.trim(), { notifyAll, sendEmail });
    setContent('');
    setNotifyAll(true);
    setSendEmail(false);
    setOpen(false);
    setPosting(false);
  };

  return (
    <>
      {/* Trigger Card */}
      <div
        onClick={() => setOpen(true)}
        className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
      >
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className="bg-primary/10">⚔️</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-muted/50 rounded-lg px-4 py-2.5 text-sm text-muted-foreground">
          {language === 'ro' ? 'Scrie ceva...' : 'Write something...'}
        </div>
      </div>

      {/* Post Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'ro' ? 'Creează o postare' : 'Create a post'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ro'
                ? 'Împărtășește gândurile tale cu comunitatea'
                : 'Share your thoughts with the community'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={
                language === 'ro'
                  ? 'Ce ai pe suflet, războinicule?'
                  : "What's on your mind, warrior?"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px] resize-none"
              autoFocus
            />

            {/* Notification options */}
            <div className="space-y-3 rounded-lg border border-border/60 p-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  checked={notifyAll}
                  onCheckedChange={(checked) => setNotifyAll(checked === true)}
                />
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {language === 'ro' ? 'Notifică toți membrii' : 'Notify all members'}
                </span>
              </label>

              {isAdmin && (
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <Checkbox
                    checked={sendEmail}
                    onCheckedChange={(checked) => setSendEmail(checked === true)}
                  />
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {language === 'ro' ? 'Trimite și pe email' : 'Also send email'}
                  </span>
                </label>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handlePost}
                disabled={!content.trim() || posting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {language === 'ro' ? 'Postează' : 'Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
