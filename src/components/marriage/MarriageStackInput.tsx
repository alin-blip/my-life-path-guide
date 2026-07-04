import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Paperclip, X, Mic, MicOff, Loader2, FileText, Image as ImageIcon, FileAudio } from 'lucide-react';
import { toast } from 'sonner';
import { marriageService, MarriageAttachment } from '@/services/marriageService';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  onAttachmentsChange: (atts: MarriageAttachment[], transcripts: string) => void;
  attachments: MarriageAttachment[];
}

const MAX_FILES = 10;
const MAX_SIZE = 20 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

const optimizeImageForAttachment = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas indisponibil');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const keepPng = file.type === 'image/png' && file.size <= 1.5 * 1024 * 1024;
        resolve(canvas.toDataURL(keepPng ? 'image/png' : 'image/jpeg', 0.86));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = async () => {
      URL.revokeObjectURL(objectUrl);
      try {
        resolve(await readFileAsDataUrl(file));
      } catch (error) {
        reject(error);
      }
    };

    img.src = objectUrl;
  });

export const MarriageStackInput: React.FC<Props> = ({ onAttachmentsChange, attachments }) => {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteText, setPasteText] = useState('');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const buildTranscripts = (atts: MarriageAttachment[]) => {
    return atts.filter(a => a.type !== 'image').map(a => `[${a.type}${a.name ? ' — ' + a.name : ''}]\n${a.content || ''}`).join('\n\n---\n\n');
  };

  const updateAtts = (next: MarriageAttachment[]) => {
    onAttachmentsChange(next, buildTranscripts(next));
  };

  const addAtt = (att: MarriageAttachment) => {
    setAttsFunctional((prev) => {
      if (prev.length >= MAX_FILES) {
        toast.error(t('marriage.stackInput.maxAttachments').replace('{n}', String(MAX_FILES)));
        return prev;
      }
      return [...prev, att];
    });
  };

  // helper: update via functional setter on parent
  const setAttsFunctional = (updater: (prev: MarriageAttachment[]) => MarriageAttachment[]) => {
    const next = updater(attachments);
    if (next !== attachments) updateAtts(next);
  };

  const removeAtt = (idx: number) => {
    updateAtts(attachments.filter((_, i) => i !== idx));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    console.log('[MarriageStackInput] handleFiles:', files.length, 'files');

    const fileArr = Array.from(files);

    let working: MarriageAttachment[] = [...attachments];
    let addedCount = 0;
    let skippedCount = 0;
    const pushAtt = (att: MarriageAttachment) => {
      if (working.length >= MAX_FILES) {
        toast.error(t('marriage.stackInput.maxAttachments').replace('{n}', String(MAX_FILES)));
        skippedCount += 1;
        return false;
      }
      working = [...working, att];
      addedCount += 1;
      console.log('[MarriageStackInput] pushAtt:', att.type, att.name, '→ total:', working.length);
      updateAtts(working);
      return true;
    };

    for (const file of fileArr) {
      if (file.size > MAX_SIZE) {
        skippedCount += 1;
        toast.error(`${file.name}: ` + t('marriage.stackInput.exceeds20MB'));
        continue;
      }
      try {
        if (file.type.startsWith('image/')) {
          const url = await optimizeImageForAttachment(file);
          pushAtt({ type: 'image', url, name: file.name, size: file.size });
        } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          // Fallback: store filename only — recommend paste for PDF
          const text = await file.text().catch(() => '');
          const cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
          pushAtt({ type: 'pdf', content: cleaned.slice(0, 5000) || `[PDF: ${file.name} — folosește copy-paste pentru text]`, name: file.name, size: file.size });
        } else if (file.type.startsWith('audio/')) {
          setTranscribing(true);
          try {
            const text = await marriageService.transcribeAudio(file);
            pushAtt({ type: 'audio', content: text, name: file.name, size: file.size });
            toast.success(t('marriage.stackInput.audioTranscribed'));
          } finally {
            setTranscribing(false);
          }
        } else {
          const text = await file.text();
          pushAtt({ type: 'text', content: text, name: file.name, size: file.size });
        }
      } catch (e: any) {
        skippedCount += 1;
        console.error('[MarriageStackInput] upload error:', file.name, e);
        toast.error(t('marriage.stackInput.uploadError') + ` ${file.name}: ${e.message || e}`);
      }
    }

    if (addedCount > 0) {
      toast.success(`${addedCount} ` + t('marriage.stackInput.filesAdded'));
    } else if (skippedCount > 0) {
      toast.error(t('marriage.stackInput.noFileAdded'));
    }
  };



  const transcribeAndAdd = async (file: File) => {
    setTranscribing(true);
    try {
      const text = await marriageService.transcribeAudio(file);
      addAtt({ type: 'audio', content: text, name: file.name, size: file.size });
      toast.success(t('marriage.stackInput.audioTranscribed'));
    } catch (e: any) {
      toast.error(t('marriage.stackInput.transcribeFailed') + e.message);
    } finally {
      setTranscribing(false);
    }
  };

  const addPasteText = () => {
    if (!pasteText.trim()) return;
    addAtt({ type: 'text', content: pasteText.trim(), name: t('marriage.stackInput.pastedText') });
    setPasteText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' });
        const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `recording.${ext}`, { type: blob.type });
        await transcribeAndAdd(file);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e: any) {
      toast.error(t('marriage.stackInput.micUnavailable') + e.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <Card className="p-4 space-y-4 border-border bg-card">
      <div>
        <label className="text-sm font-medium block mb-2">{t('marriage.stackInput.attachments')} ({attachments.length}/{MAX_FILES})</label>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,audio/*,application/pdf,text/*"
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); if (fileRef.current) fileRef.current.value = ''; }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Paperclip className="h-4 w-4 mr-1" /> {t('marriage.stackInput.addFiles')}
          </Button>
          {!recording ? (
            <Button type="button" variant="outline" size="sm" onClick={startRecording} disabled={transcribing}>
              {transcribing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Mic className="h-4 w-4 mr-1" />}
              {t('marriage.stackInput.recordMemo')}
            </Button>
          ) : (
            <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
              <MicOff className="h-4 w-4 mr-1" /> {t('marriage.stackInput.stop')}
            </Button>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative border border-border rounded p-2 bg-background">
                <button type="button" onClick={() => removeAtt(i)} className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow hover:bg-muted z-10" aria-label={t('marriage.stackInput.remove')}>
                  <X className="h-3 w-3" />
                </button>
                {att.type === 'image' && att.url ? (
                  <img src={att.url} alt={`Marriage stack attachment preview${att.name ? `: ${att.name.replace(/\.[^.]+$/, '')}` : ''}`} className="w-full h-24 object-cover rounded" />
                ) : (
                  <div className="flex items-start gap-2 text-xs">
                    {att.type === 'audio' && <FileAudio className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />}
                    {att.type === 'pdf' && <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />}
                    {att.type === 'text' && <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />}
                    {att.type === 'image' && <ImageIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{att.name}</div>
                      <div className="text-muted-foreground line-clamp-2">{att.content?.slice(0, 80)}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">{t('marriage.stackInput.pasteLabel')}</label>
        <Textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={t('marriage.stackInput.pastePlaceholder')}
          className="min-h-[100px]"
        />
        {pasteText.trim() && (
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addPasteText}>
            {t('marriage.stackInput.addAttachment')}
          </Button>
        )}
      </div>
    </Card>
  );
};
