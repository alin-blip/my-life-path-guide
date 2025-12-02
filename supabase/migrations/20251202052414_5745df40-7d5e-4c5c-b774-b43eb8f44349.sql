-- Create storage bucket for Napoleon Hill backups
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'napoleon-hill-backups',
  'napoleon-hill-backups',
  false,
  5242880, -- 5MB limit
  ARRAY['application/json']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for Napoleon Hill backups
CREATE POLICY "Users can upload their own Napoleon Hill backups"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'napoleon-hill-backups' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own Napoleon Hill backups"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'napoleon-hill-backups' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own Napoleon Hill backups"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'napoleon-hill-backups' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own Napoleon Hill backups"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'napoleon-hill-backups' AND
  auth.uid()::text = (storage.foldername(name))[1]
);