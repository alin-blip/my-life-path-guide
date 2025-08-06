-- Create storage bucket for knowledge base files
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge-base', 'knowledge-base', false);

-- Create policies for knowledge base storage
CREATE POLICY "Users can upload their own knowledge base files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'knowledge-base' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own knowledge base files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'knowledge-base' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own knowledge base files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'knowledge-base' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own knowledge base files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'knowledge-base' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create knowledge base metadata table
CREATE TABLE public.knowledge_base_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_preview TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.knowledge_base_files ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge base metadata
CREATE POLICY "Users can view their own knowledge base metadata" 
ON public.knowledge_base_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge base metadata" 
ON public.knowledge_base_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge base metadata" 
ON public.knowledge_base_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge base metadata" 
ON public.knowledge_base_files 
FOR DELETE 
USING (auth.uid() = user_id);