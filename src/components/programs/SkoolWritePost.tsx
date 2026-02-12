import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Bell, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { EmojiPicker } from './EmojiPicker';
import { MediaUploadButton, MediaPreview } from './MediaUploadButton';
import { VideoRecorder } from './VideoRecorder';

interface SkoolWritePostProps {
  onPost: (content: string, options?: { notifyAll?: boolean; sendEmail?: boolean; mediaUrls?: string[] }) => Promise<any>;
}

export const SkoolWritePost: React.FC<SkoolWritePostProps> = ({ onPost }) => {
  const { language } = useLanguage();
  const { isAdmin } = useAdminAuth();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [notifyAll, setNotifyAll] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  const handleMediaUploaded = (url: string) => {
    setMediaUrls((prev) => [...prev, url]);
  };

  const removeMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && mediaUrls.length === 0) return;
    setPosting(true);
    await onPost(content.trim(), { notifyAll, sendEmail, mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined });
    setContent('');
    setNotifyAll(true);
    setSendEmail(false);
    setMediaUrls([]);
    setExpanded(false);
    setPosting(false);
  };

  const handleFocus = () => {
    setExpanded(true);
  };

  const handleCancel = () => {
    if (!content.trim() && mediaUrls.length === 0) {
      setExpanded(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="bg-primary/10">⚔️</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {!expanded ? (
              <div
                onClick={handleFocus}
                className="bg-muted/50 rounded-full px-4 py-2.5 text-sm text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors"
              >
                {language === 'ro' ? 'Ce ai pe suflet, războinicule?' : "What's on your mind, warrior?"}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  ref={textareaRef}
                  placeholder={
                    language === 'ro'
                      ? 'Ce ai pe suflet, războinicule?'
                      : "What's on your mind, warrior?"
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[80px] resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                  onBlur={handleCancel}
                />

                {/* Media preview */}
                {mediaUrls.length > 0 && (
                  <MediaPreview urls={mediaUrls} onRemove={removeMedia} removable />
                )}

                {/* Media buttons row */}
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <div className="flex items-center gap-1">
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    <MediaUploadButton onMediaUploaded={handleMediaUploaded} />
                    <VideoRecorder onVideoRecorded={handleMediaUploaded} />
                  </div>

                  <Button
                    onClick={handlePost}
                    disabled={(!content.trim() && mediaUrls.length === 0) || posting}
                    size="sm"
                    className="gap-2 rounded-full px-5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {language === 'ro' ? 'Postează' : 'Post'}
                  </Button>
                </div>

                {/* Notification options - compact */}
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                    <Checkbox
                      checked={notifyAll}
                      onCheckedChange={(checked) => setNotifyAll(checked === true)}
                      className="h-3.5 w-3.5"
                    />
                    <Bell className="h-3 w-3" />
                    {language === 'ro' ? 'Notifică' : 'Notify'}
                  </label>

                  {isAdmin && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                      <Checkbox
                        checked={sendEmail}
                        onCheckedChange={(checked) => setSendEmail(checked === true)}
                        className="h-3.5 w-3.5"
                      />
                      <Mail className="h-3 w-3" />
                      Email
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
