-- Create table for comment reactions (likes, emojis)
CREATE TABLE public.warriors_comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.warriors_way_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like', -- like, love, fire, muscle, clap
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Create index for faster lookups
CREATE INDEX idx_comment_reactions_comment_id ON public.warriors_comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user_id ON public.warriors_comment_reactions(user_id);

-- Enable RLS
ALTER TABLE public.warriors_comment_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can view reactions
CREATE POLICY "Anyone can view reactions"
  ON public.warriors_comment_reactions FOR SELECT
  USING (true);

-- Authenticated users can add reactions
CREATE POLICY "Authenticated users can add reactions"
  ON public.warriors_comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions"
  ON public.warriors_comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Add parent_id column to warriors_way_comments for replies
ALTER TABLE public.warriors_way_comments 
ADD COLUMN parent_id UUID REFERENCES public.warriors_way_comments(id) ON DELETE CASCADE;

-- Create index for replies
CREATE INDEX idx_comments_parent_id ON public.warriors_way_comments(parent_id);

-- Add video_url column for video comments
ALTER TABLE public.warriors_way_comments
ADD COLUMN video_url TEXT;