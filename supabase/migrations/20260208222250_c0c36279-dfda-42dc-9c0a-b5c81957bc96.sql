
-- 1. Create community-media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('community-media', 'community-media', true);

-- 2. Storage policies for community-media bucket
CREATE POLICY "Anyone can view community media" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-media');

CREATE POLICY "Authenticated users can upload community media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'community-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own community media" ON storage.objects
  FOR DELETE USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Add media_urls column to wall_post_comments
ALTER TABLE public.wall_post_comments ADD COLUMN media_urls text[] DEFAULT NULL;

-- 4. Insert community settings rows (on conflict do nothing to avoid duplicates)
INSERT INTO public.community_settings (setting_key, setting_value)
VALUES
  ('welcome_email_enabled', 'false'),
  ('welcome_email_subject', 'Welcome to Warrior OS Community!'),
  ('welcome_email_body', 'Welcome aboard, warrior! We are glad to have you.'),
  ('community_rules', '1. Be respectful\n2. Share your wins\n3. Ask for help when needed'),
  ('community_description', 'The community for entrepreneurs who want it all.'),
  ('allow_member_posts', 'true'),
  ('require_post_approval', 'false')
ON CONFLICT (setting_key) DO NOTHING;
