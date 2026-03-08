import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Bell, Mail, Tag, BarChart3, X, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { EmojiPicker } from './EmojiPicker';
import { MediaUploadButton, MediaPreview } from './MediaUploadButton';
import { VideoRecorder } from './VideoRecorder';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'general', label: 'General', labelRo: 'General', icon: '💬' },
  { id: 'courses', label: 'Courses', labelRo: 'Cursuri', icon: '📖' },
  { id: 'challenge', label: 'Challenge', labelRo: 'Challenge', icon: '📚' },
  { id: 'wins', label: 'Wins', labelRo: 'Victorii', icon: '🏆' },
  { id: 'support', label: 'Support', labelRo: 'Ajutor', icon: '🆘' },
  { id: 'breakthrough', label: 'Breakthrough', labelRo: 'Breakthrough', icon: '💡' },
];

interface SkoolWritePostProps {
  onPost: (content: string, options?: { notifyAll?: boolean; sendEmail?: boolean; mediaUrls?: string[]; category?: string }) => Promise<any>;
  showCategoryPicker?: boolean;
}

export const SkoolWritePost: React.FC<SkoolWritePostProps> = ({ onPost, showCategoryPicker = false }) => {
  const { language } = useLanguage();
  const { isAdmin } = useAdminAuth();
  const isRo = language === 'ro';
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [notifyAll, setNotifyAll] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showCategories, setShowCategories] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
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
    
    // If poll is active, append poll data to content as structured text
    let finalContent = content.trim();
    if (showPollCreator && pollOptions.filter(o => o.trim()).length >= 2) {
      const validOptions = pollOptions.filter(o => o.trim());
      finalContent += `\n\n📊 **${isRo ? 'Sondaj' : 'Poll'}:**\n${validOptions.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
    }
    
    await onPost(finalContent, { 
      notifyAll, 
      sendEmail, 
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      category: selectedCategory,
    });
    setContent('');
    setNotifyAll(true);
    setSendEmail(false);
    setMediaUrls([]);
    setSelectedCategory('general');
    setShowCategories(false);
    setShowPollCreator(false);
    setPollOptions(['', '']);
    setExpanded(false);
    setPosting(false);
  };

  const handleFocus = () => {
    setExpanded(true);
  };

  const handleCancel = () => {
    if (!content.trim() && mediaUrls.length === 0 && !showPollCreator) {
      setExpanded(false);
      setShowCategories(false);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions(prev => [...prev, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    setPollOptions(prev => prev.map((o, i) => i === index ? value : o));
  };

  const currentCat = CATEGORIES.find(c => c.id === selectedCategory);

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
                {isRo ? 'Ce ai pe suflet, războinicule?' : "What's on your mind, warrior?"}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Category badge */}
                {showCategoryPicker && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCategories(!showCategories)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                        "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      )}
                    >
                      <Tag className="h-3 w-3" />
                      {currentCat?.icon} {isRo ? currentCat?.labelRo : currentCat?.label}
                    </button>
                    {showCategories && (
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.filter(c => c.id !== selectedCategory).map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.id); setShowCategories(false); }}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                          >
                            {cat.icon} {isRo ? cat.labelRo : cat.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  placeholder={
                    isRo
                      ? 'Ce ai pe suflet, războinicule?'
                      : "What's on your mind, warrior?"
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[80px] resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                  onBlur={handleCancel}
                />

                {/* Poll Creator */}
                {showPollCreator && (
                  <div className="border border-border/60 rounded-lg p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5" />
                        {isRo ? 'Creează sondaj' : 'Create poll'}
                      </span>
                      <button onClick={() => { setShowPollCreator(false); setPollOptions(['', '']); }} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {pollOptions.map((option, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updatePollOption(i, e.target.value)}
                          placeholder={`${isRo ? 'Opțiunea' : 'Option'} ${i + 1}`}
                          className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                        {pollOptions.length > 2 && (
                          <button onClick={() => removePollOption(i)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 6 && (
                      <button
                        onClick={addPollOption}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                      >
                        <Plus className="h-3 w-3" />
                        {isRo ? 'Adaugă opțiune' : 'Add option'}
                      </button>
                    )}
                  </div>
                )}

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
                    <button
                      onClick={() => setShowPollCreator(!showPollCreator)}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        showPollCreator ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      title={isRo ? 'Sondaj' : 'Poll'}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    onClick={handlePost}
                    disabled={(!content.trim() && mediaUrls.length === 0) || posting}
                    size="sm"
                    className="gap-2 rounded-full px-5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isRo ? 'Postează' : 'Post'}
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
                    {isRo ? 'Notifică' : 'Notify'}
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
