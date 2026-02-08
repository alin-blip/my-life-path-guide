import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Video, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface MediaUploadButtonProps {
  onMediaUploaded: (url: string) => void;
  disabled?: boolean;
}

export const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({ onMediaUploaded, disabled }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: language === 'ro' ? 'Fișier prea mare' : 'File too large',
        description: language === 'ro' ? 'Dimensiunea maximă este 50MB.' : 'Maximum file size is 50MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast({
        title: language === 'ro' ? 'Tip de fișier neacceptat' : 'Unsupported file type',
        description: language === 'ro' ? 'Acceptăm doar imagini și videoclipuri.' : 'Only images and videos are accepted.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4');
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('community-media')
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('community-media')
        .getPublicUrl(fileName);

      onMediaUploaded(urlData.publicUrl);

      toast({
        title: language === 'ro' ? 'Încărcat!' : 'Uploaded!',
        description: language === 'ro' ? 'Fișierul a fost încărcat cu succes.' : 'File uploaded successfully.',
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({
        title: language === 'ro' ? 'Eroare la încărcare' : 'Upload error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
      >
        {uploading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        ) : (
          <Image className="h-4 w-4" />
        )}
      </Button>
    </>
  );
};

interface MediaPreviewProps {
  urls: string[];
  onRemove?: (index: number) => void;
  removable?: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ urls, onRemove, removable = false }) => {
  if (!urls || urls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((url, i) => {
        const isVideo = url.match(/\.(mp4|webm|mov|avi)(\?|$)/i);
        return (
          <div key={i} className="relative group">
            {isVideo ? (
              <video
                src={url}
                className="h-20 w-28 rounded-lg object-cover border border-border"
                controls={false}
                muted
              />
            ) : (
              <img
                src={url}
                alt=""
                className="h-20 w-20 rounded-lg object-cover border border-border"
              />
            )}
            {removable && onRemove && (
              <button
                onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface InlineMediaDisplayProps {
  urls: string[] | null;
}

export const InlineMediaDisplay: React.FC<InlineMediaDisplayProps> = ({ urls }) => {
  if (!urls || urls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((url, i) => {
        const isVideo = url.match(/\.(mp4|webm|mov|avi)(\?|$)/i);
        return isVideo ? (
          <video
            key={i}
            src={url}
            className="max-h-60 rounded-lg border border-border"
            controls
          />
        ) : (
          <img
            key={i}
            src={url}
            alt=""
            className="max-h-60 rounded-lg border border-border object-cover"
            loading="lazy"
          />
        );
      })}
    </div>
  );
};
