
# Community Settings Page + Enhanced Comments (Emoji, Video, Media)

## Overview

Two major enhancements for the Community tab:
1. A **Community Settings page** (admin-only) accessible via a new "Settings" tab after "Leaderboards" in the SkoolNavBar -- like Skool's group admin settings
2. **Rich commenting** with emoji reactions, video upload, and direct video recording in post comments and new posts

---

## Part 1: Community Settings Page (Admin Only)

### What it includes (inspired by Skool)

The Settings tab will have multiple sections accessible to community admins:

**a) Welcome Message** -- currently exists in `CommunityWelcomeBanner.tsx`, will be consolidated into the Settings page
- Edit the pinned welcome message shown at top of feed
- Toggle welcome message on/off

**b) Welcome Email** -- new setting stored in `community_settings` table
- Customize the email new members receive when they join
- Toggle welcome email on/off

**c) Community Info**
- Community name, description, cover image
- Category tags for post filtering (add/remove categories)

**d) Community Rules / Guidelines**
- Editable rules text displayed in the sidebar or an info section

**e) Post Moderation Settings**
- Toggle: require post approval before publishing
- Toggle: allow members to post (vs admin-only posting)

### Technical Changes

**Database migration:**
- Insert additional rows in `community_settings` for: `welcome_email_enabled`, `welcome_email_subject`, `welcome_email_body`, `community_rules`, `community_description`, `allow_member_posts`, `require_post_approval`

**New files:**
| File | Purpose |
|------|---------|
| `src/components/programs/CommunitySettingsTab.tsx` | Full settings page with sections for Welcome Message, Welcome Email, Rules, Posting controls |

**Modified files:**
| File | Change |
|------|--------|
| `src/components/programs/SkoolNavBar.tsx` | Add `'settings'` tab (with Settings/gear icon), only shown if user is admin |
| `src/pages/Programs.tsx` | Handle the new `settings` tab, render `CommunitySettingsTab` |
| `src/components/programs/SkoolGroupSidebar.tsx` | Add a "Settings" quick link for admins |

---

## Part 2: Rich Commenting (Emoji + Video + Media)

### What it includes

**a) Emoji support in comments and posts**
- An emoji picker button next to the text input in both `PostCommentsDialog` (comment input) and `SkoolWritePost` (post creation dialog)
- Uses a lightweight emoji picker component (built in-house, no external library needed -- a grid of common emojis)
- Clicking an emoji inserts it at cursor position in the textarea

**b) Video/Media upload in comments and posts**
- New buttons in the comment and post input areas: Image, Video, Camera (record)
- Upload flow: user selects file -> uploads to a new `community-media` storage bucket -> URL stored in comment/post
- Display uploaded images/videos inline in posts and comments

**c) Direct video recording**
- A "Record" button that opens the device camera via `navigator.mediaDevices.getUserMedia`
- Records a short video clip
- Uploads to storage bucket on completion
- Preview before sending

### Technical Changes

**Database migration:**
- Create `community-media` storage bucket (public) for uploaded images and videos
- Add `media_urls` column to `wall_post_comments` table (ARRAY of text, nullable) -- posts already have this column

**New files:**
| File | Purpose |
|------|---------|
| `src/components/programs/EmojiPicker.tsx` | Lightweight emoji picker grid component |
| `src/components/programs/MediaUploadButton.tsx` | Button + logic for image/video upload and camera recording |
| `src/components/programs/VideoRecorder.tsx` | Component for in-browser video recording via webcam |

**Modified files:**
| File | Change |
|------|--------|
| `src/components/programs/PostCommentsDialog.tsx` | Add emoji picker button, media upload, and video record button to comment input area. Display media in comments. |
| `src/components/programs/PostCommentCard.tsx` | Render `media_urls` (images/videos) if present in comment |
| `src/components/programs/SkoolWritePost.tsx` | Add emoji picker, media upload, and video recording to post creation dialog |
| `src/components/programs/SkoolPostCard.tsx` | Already renders media -- no major change needed |
| `src/hooks/useWallPostComments.ts` | Update `addComment` to accept optional `mediaUrls` parameter |
| `src/hooks/useBrotherhood.ts` | Ensure `createPost` properly handles media uploads |

---

## Implementation Order

1. **Database migration** -- add community settings rows + storage bucket + comments media_urls column
2. **Community Settings tab** -- SkoolNavBar + CommunitySettingsTab component
3. **Emoji Picker** -- reusable component, integrate into PostCommentsDialog and SkoolWritePost
4. **Media Upload** -- storage bucket integration, upload button, display in posts/comments
5. **Video Recorder** -- getUserMedia capture, upload, preview

---

## Technical Details

### Storage Bucket SQL
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('community-media', 'community-media', true);

CREATE POLICY "Anyone can view community media" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-media');

CREATE POLICY "Authenticated users can upload community media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'community-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own community media" ON storage.objects
  FOR DELETE USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Community Settings Rows
```sql
INSERT INTO community_settings (setting_key, setting_value)
VALUES
  ('welcome_email_enabled', 'false'),
  ('welcome_email_subject', 'Welcome to Warrior OS Community!'),
  ('welcome_email_body', 'Welcome aboard, warrior! We are glad to have you.'),
  ('community_rules', '1. Be respectful\n2. Share your wins\n3. Ask for help when needed'),
  ('community_description', 'The community for entrepreneurs who want it all.'),
  ('allow_member_posts', 'true'),
  ('require_post_approval', 'false');
```

### Comments media_urls Column
```sql
ALTER TABLE wall_post_comments ADD COLUMN media_urls text[] DEFAULT NULL;
```

### Emoji Picker Approach
A simple, lightweight grid of ~100 commonly used emojis organized by category (Smileys, Gestures, Objects, Symbols). No external library required -- just a popover with a grid of emoji characters. Clicking one inserts it into the textarea at cursor position.

### Video Recording Flow
1. User clicks "Record" button
2. Request camera/microphone permissions via `getUserMedia({ video: true, audio: true })`
3. Use `MediaRecorder` API to capture video
4. Show live preview in a small panel
5. On stop, create a Blob, upload to `community-media` bucket
6. Return the public URL for embedding in the comment/post

### Files Summary

**New files (5):**
- `src/components/programs/CommunitySettingsTab.tsx`
- `src/components/programs/EmojiPicker.tsx`
- `src/components/programs/MediaUploadButton.tsx`
- `src/components/programs/VideoRecorder.tsx`

**Modified files (8):**
- `src/components/programs/SkoolNavBar.tsx` -- add settings tab
- `src/pages/Programs.tsx` -- render settings tab
- `src/components/programs/SkoolGroupSidebar.tsx` -- admin settings link
- `src/components/programs/PostCommentsDialog.tsx` -- emoji + media in comments
- `src/components/programs/PostCommentCard.tsx` -- render media in comments
- `src/components/programs/SkoolWritePost.tsx` -- emoji + media in post creation
- `src/hooks/useWallPostComments.ts` -- add mediaUrls to addComment
- `src/hooks/useBrotherhood.ts` -- ensure media support in createPost
