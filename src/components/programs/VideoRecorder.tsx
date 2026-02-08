import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, Square, Upload, X, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface VideoRecorderProps {
  onVideoRecorded: (url: string) => void;
  disabled?: boolean;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onVideoRecorded, disabled }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = 0;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setRecording(false);
    setRecordedBlob(null);
    setPreviewUrl(null);
    setSeconds(0);
  }, [previewUrl]);

  useEffect(() => {
    if (!open) cleanup();
  }, [open]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        // Stop camera
        stream.getTracks().forEach(t => t.stop());

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
      };

      mediaRecorder.start(1000);
      setRecording(true);
      setSeconds(0);

      timerRef.current = window.setInterval(() => {
        setSeconds(s => {
          if (s >= 59) {
            mediaRecorderRef.current?.stop();
            clearInterval(timerRef.current);
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      toast({
        title: language === 'ro' ? 'Eroare cameră' : 'Camera error',
        description: language === 'ro' ? 'Nu s-a putut accesa camera.' : 'Could not access camera.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = 0;
    }
    setRecording(false);
  };

  const handleUpload = async () => {
    if (!recordedBlob || !user) return;
    setUploading(true);

    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from('community-media')
        .upload(fileName, recordedBlob, { contentType: 'video/webm' });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('community-media')
        .getPublicUrl(fileName);

      onVideoRecorded(urlData.publicUrl);
      setOpen(false);

      toast({
        title: language === 'ro' ? 'Video încărcat!' : 'Video uploaded!',
      });
    } catch (err: any) {
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Video className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'ro' ? 'Înregistrare video' : 'Record Video'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video preview */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted={recording}
                controls={!!previewUrl && !recording}
                playsInline
              />
              {recording && (
                <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                  REC {formatTime(seconds)}
                </div>
              )}
              {!recording && !previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Video className="h-12 w-12 opacity-30" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!recording && !recordedBlob && (
                <Button onClick={startRecording} className="gap-2">
                  <Video className="h-4 w-4" />
                  {language === 'ro' ? 'Începe' : 'Start'}
                </Button>
              )}
              {recording && (
                <Button onClick={stopRecording} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  {language === 'ro' ? 'Oprește' : 'Stop'}
                </Button>
              )}
              {recordedBlob && !recording && (
                <>
                  <Button variant="outline" onClick={() => { cleanup(); }} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    {language === 'ro' ? 'Refă' : 'Retake'}
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading} className="gap-2">
                    {uploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {language === 'ro' ? 'Încarcă' : 'Upload'}
                  </Button>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {language === 'ro' ? 'Maxim 60 secunde' : 'Maximum 60 seconds'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
