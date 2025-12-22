-- Create ai_generated_images table for gallery
CREATE TABLE public.ai_generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  has_logo BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_generated_images ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can manage ai generated images"
ON public.ai_generated_images
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create scheduled_posts table
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'social_post',
  image_id UUID REFERENCES public.ai_generated_images(id),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'scheduled',
  published_at TIMESTAMP WITH TIME ZONE,
  meta_post_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can manage scheduled posts"
ON public.scheduled_posts
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for ai-generated-images
INSERT INTO storage.buckets (id, name, public) VALUES ('ai-generated-images', 'ai-generated-images', true);

-- Storage policy for ai-generated-images
CREATE POLICY "Admins can upload ai images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ai-generated-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ai images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ai-generated-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ai images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ai-generated-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "AI images are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ai-generated-images');