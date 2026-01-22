-- Create storage bucket for feature images
INSERT INTO storage.buckets (id, name, public)
VALUES ('feature-images', 'feature-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for feature-images bucket
CREATE POLICY "Feature images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'feature-images');

CREATE POLICY "Only admins can upload feature images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'feature-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can update feature images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'feature-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can delete feature images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'feature-images' 
  AND public.has_role(auth.uid(), 'admin')
);