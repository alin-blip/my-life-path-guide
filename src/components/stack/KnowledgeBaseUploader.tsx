import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeBaseUploaderProps {
  onUploadComplete: () => void;
  projectId?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'parsing' | 'success' | 'error';
  error?: string;
}

export const KnowledgeBaseUploader: React.FC<KnowledgeBaseUploaderProps> = ({
  onUploadComplete,
  projectId
}) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const ALLOWED_TYPES = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/csv'
  ];

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tip de fișier neacceptat. Acceptăm: TXT, PDF, DOC, DOCX, MD, CSV';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Fișierul este prea mare. Dimensiunea maximă: 10MB';
    }
    return null;
  };

  const extractTextContent = async (file: File): Promise<string> => {
    if (file.type === 'text/plain' || file.type === 'text/markdown' || file.type === 'text/csv') {
      return await file.text();
    }
    
    // For PDFs and other types, return placeholder - will be parsed by edge function
    return `[${file.type}] ${file.name}`;
  };

  const parsePdfFile = async (filePath: string, fileId: string): Promise<void> => {
    try {
      const { data, error } = await supabase.functions.invoke('parse-pdf', {
        body: { filePath, fileId }
      });

      if (error) {
        console.error('PDF parsing error:', error);
        throw error;
      }

      console.log('PDF parsed successfully:', data);
      
      if (data?.textLength) {
        toast({
          title: "PDF procesat",
          description: `Text extras: ${data.textLength.toLocaleString()} caractere`,
        });
      }
    } catch (error) {
      console.error('Failed to parse PDF:', error);
      // Don't throw - file is still uploaded, just not parsed
      toast({
        title: "Atenție",
        description: "PDF-ul a fost încărcat dar textul nu a putut fi extras automat.",
        variant: "destructive"
      });
    }
  };

  const uploadFile = async (file: File, setStatus: (status: UploadProgress['status']) => void) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('knowledge-base')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Extract content preview
    const contentPreview = await extractTextContent(file);

    // Save metadata to database
    const { data: insertData, error: dbError } = await supabase
      .from('knowledge_base_files')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        content_preview: contentPreview.substring(0, 1000),
        project_id: projectId || null
      })
      .select('id')
      .single();

    if (dbError) throw dbError;

    // If it's a PDF, trigger parsing
    if (file.type === 'application/pdf' && insertData?.id) {
      setStatus('parsing');
      await parsePdfFile(filePath, insertData.id);
    }

    return { filePath, fileName };
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate all files first
    const validationErrors = fileArray.map(file => ({
      file,
      error: validateFile(file)
    }));

    const invalidFiles = validationErrors.filter(v => v.error);
    if (invalidFiles.length > 0) {
      toast({
        title: "Fișiere invalide",
        description: invalidFiles[0].error!,
        variant: "destructive"
      });
      return;
    }

    // Initialize upload progress for all files
    const newUploads: UploadProgress[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files one by one
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      const setFileStatus = (status: UploadProgress['status']) => {
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { ...upload, status }
            : upload
        ));
      };
      
      try {
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { ...upload, progress: 50 }
            : upload
        ));

        await uploadFile(file, setFileStatus);

        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { ...upload, progress: 100, status: 'success' }
            : upload
        ));

        toast({
          title: "Fișier încărcat",
          description: `${file.name} a fost adăugat la knowledge base.`,
        });

      } catch (error) {
        console.error('Upload error:', error);
        
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { 
                ...upload, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Eroare necunoscută'
              }
            : upload
        ));

        toast({
          title: "Eroare upload",
          description: `Nu am putut încărca ${file.name}`,
          variant: "destructive"
        });
      }
    }

    // Clean up completed uploads after a delay
    setTimeout(() => {
      setUploads(prev => prev.filter(upload => upload.status === 'uploading' || upload.status === 'parsing'));
      onUploadComplete();
    }, 3000);

  }, [onUploadComplete, toast, projectId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // Reset input value to allow same file to be selected again
    e.target.value = '';
  }, [handleFiles]);

  return (
    <div className="space-y-4">
      <Card
        className={`cursor-pointer transition-colors duration-200 ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/25'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-sm flex items-center justify-center">
            <Upload className="w-4 h-4 mr-2" />
            Încarcă fișiere Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Drag & drop fișiere aici sau click pentru a selecta
            </p>
            <p className="text-xs text-muted-foreground">
              Acceptăm: TXT, PDF, DOC, DOCX, MD, CSV (max 10MB)
            </p>
            <p className="text-xs text-primary/70">
              📄 PDF-urile sunt parsate automat pentru extragere text
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".txt,.pdf,.doc,.docx,.md,.csv"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="text-xs"
            >
              Selectează fișiere
            </Button>
          </div>
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upload în progres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploads.map((upload, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="truncate">{upload.file.name}</span>
                      {upload.status === 'success' && (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      )}
                      {upload.status === 'error' && (
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      )}
                      {upload.status === 'parsing' && (
                        <div className="flex items-center gap-1 text-primary">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-[10px]">Extragere text...</span>
                        </div>
                      )}
                    </div>
                    
                    {upload.status === 'uploading' && (
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {upload.status === 'error' && upload.error && (
                      <p className="text-red-500 text-xs mt-1">{upload.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
