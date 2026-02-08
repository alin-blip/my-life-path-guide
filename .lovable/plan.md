
# Global Skool-Style Top Bar + Messaging + Auto-Enroll Users

## Overview

Three major changes to make the platform behave like Skool:

1. **Auto-enroll all 273 existing users** into the community (create `leaderboard_profiles` + add them to the main "Warrior Tribe")
2. **Create a Direct Messaging system** (private 1-on-1 messages between members)
3. **Redesign the global top navigation** to match Skool: replace the current date/language/theme bar with a persistent top bar showing Logo, nav tabs (Community | Courses), Messages icon, Notifications icon, and Profile dropdown (which absorbs Profile, Settings, Subscription, Support)

---

## What exists now

- **273 registered users** but 0 `leaderboard_profiles` and only 1 `tribe_member` entry
- Current `Layout.tsx` header shows: date, theme toggle, language selector, user avatar
- `SideMenu.tsx` footer has: Profile, Subscription, Settings, Support, Log out
- `UserAccountDropdown.tsx` has: Profile, Settings, Subscription, Log out
- `brotherhood_messages` table exists but is for group chat (has `tribe_id`), not private DMs
- No existing notifications bell or messages inbox component

---

## Step 1: Database Migration

### 1a. Auto-populate leaderboard_profiles for all existing users

A one-time migration that creates `leaderboard_profiles` for all `auth.users` who don't have one yet, and adds all users to the "Warrior Tribe" as members.

```sql
-- Create leaderboard_profiles for all users who don't have one
INSERT INTO public.leaderboard_profiles (user_id, display_name, is_visible)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
  true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.leaderboard_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Add all users as members of Warrior Tribe
INSERT INTO public.tribe_members (tribe_id, user_id, role)
SELECT 
  '07825fb0-4d6c-4716-b2f3-27a1708cf680',
  id,
  'member'
FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM public.tribe_members 
  WHERE tribe_id = '07825fb0-4d6c-4716-b2f3-27a1708cf680'
)
ON CONFLICT DO NOTHING;

-- Update member_count on the tribe
UPDATE public.tribes 
SET member_count = (
  SELECT COUNT(*) FROM public.tribe_members 
  WHERE tribe_id = '07825fb0-4d6c-4716-b2f3-27a1708cf680'
)
WHERE id = '07825fb0-4d6c-4716-b2f3-27a1708cf680';
```

### 1b. Auto-enroll trigger for new users

Create a database trigger so that every new user who signs up automatically gets a `leaderboard_profile` and is added to the main tribe.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_community()
RETURNS trigger AS $$
BEGIN
  -- Create leaderboard profile
  INSERT INTO public.leaderboard_profiles (user_id, display_name, is_visible)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    true
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Add to main tribe
  INSERT INTO public.tribe_members (tribe_id, user_id, role)
  VALUES ('07825fb0-4d6c-4716-b2f3-27a1708cf680', NEW.id, 'member')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_community
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_community();
```

### 1c. Direct Messages table

Create a new `direct_messages` table for private 1-on-1 messaging (separate from `brotherhood_messages` which is for group chat).

```sql
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can mark messages as read
CREATE POLICY "Users can update own received messages"
  ON public.direct_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Enable realtime for instant messaging
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Conversations view helper index
CREATE INDEX idx_dm_participants ON public.direct_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_dm_receiver_unread ON public.direct_messages(receiver_id, is_read) WHERE is_read = false;
```

---

## Step 2: Global Top Bar Component

### New component: `GlobalTopBar.tsx`

Replaces the current date/theme/language bar in `Layout.tsx`. Visible on all authenticated pages (Dashboard, Door, Tools, etc.).

Visual structure (matching Skool):
```text
┌────────────────────────────────────────────────────────────────────┐
│  [Logo] WarriorOS   Community | Cursuri    [💬 12] [🔔 99+] [👤]  │
└────────────────────────────────────────────────────────────────────┘
```

- **Left**: WarriorOS logo (links to /dashboard)
- **Center**: Two nav tabs - "Community" (goes to /programs?tab=community) and "Courses" (goes to /programs?tab=classroom)
- **Right**: 
  - Messages icon with unread count badge (opens /messages or a slide-out panel)
  - Notifications bell with count badge (future - placeholder for now)
  - Profile avatar dropdown (absorbs: Profile, Settings, Subscription, Support, Log out)

### Changes to `Layout.tsx`

- Remove the current desktop/mobile header (date, theme, language, user dropdown)
- Add `GlobalTopBar` as a sticky header above the content
- Keep the SideMenu but remove Profile/Subscription/Settings/Support from its footer (they move to profile dropdown)
- The SideMenu footer will only have: Log out

### Changes to `ProgramsLayout.tsx`

- Replace the minimal header with the same `GlobalTopBar` (or inherit it)
- The SkoolNavBar tabs (Community | Classroom | Groups | Calendar | Members | Leaderboards) remain as sub-navigation below

### Enhanced `UserAccountDropdown.tsx`

Absorbs all items from SideMenu footer:
- Profile
- Settings
- Subscription / Upgrade
- Support
- Theme toggle (light/dark)
- Language selector
- Log out

---

## Step 3: Messages System

### New files

| File | Description |
|------|-------------|
| `src/components/global/GlobalTopBar.tsx` | The persistent Skool-style top bar |
| `src/components/messages/MessagesPage.tsx` | Full messages inbox page |
| `src/components/messages/ConversationList.tsx` | List of conversations with last message preview |
| `src/components/messages/ConversationThread.tsx` | Individual conversation thread |
| `src/components/messages/NewMessageDialog.tsx` | Dialog to start a new conversation (search members) |
| `src/hooks/useDirectMessages.ts` | Hook for fetching/sending DMs with realtime |
| `src/pages/Messages.tsx` | Messages page route |

### Messages flow

1. User clicks the chat icon (💬) in GlobalTopBar
2. Navigates to `/messages` showing list of conversations
3. Each conversation shows: avatar, name, last message preview, timestamp, unread badge
4. Click a conversation to open the thread
5. Real-time updates via Supabase realtime on `direct_messages`
6. "New Message" button lets user search members and start a conversation

---

## Step 4: Update Navigation

### SideMenu changes

Remove from footer section:
- Profile link
- Subscription/Upgrade button
- Settings link
- Support link

These all move into the profile dropdown in GlobalTopBar.

### Route additions

Add to `App.tsx`:
- `/messages` route pointing to `MessagesPage`

---

## Files to create (7)

| File | Description |
|------|-------------|
| `src/components/global/GlobalTopBar.tsx` | Persistent Skool-style header with nav + icons |
| `src/pages/Messages.tsx` | Messages page wrapper |
| `src/components/messages/ConversationList.tsx` | List of conversations |
| `src/components/messages/ConversationThread.tsx` | Chat thread for a conversation |
| `src/components/messages/NewMessageDialog.tsx` | Start new conversation dialog |
| `src/hooks/useDirectMessages.ts` | Hook for DM operations + realtime |
| `src/components/messages/MessageBubble.tsx` | Individual message bubble component |

## Files to modify (5)

| File | Change |
|------|--------|
| `src/components/Layout.tsx` | Replace header with GlobalTopBar, remove footer items from SideMenu usage |
| `src/components/SideMenu.tsx` | Remove Profile/Settings/Subscription/Support from footer |
| `src/components/UserAccountDropdown.tsx` | Expand to include Settings, Support, Theme toggle, Language |
| `src/components/programs/ProgramsLayout.tsx` | Use GlobalTopBar instead of minimal header |
| `src/App.tsx` | Add /messages route |

---

## Visual Result

### All authenticated pages (Dashboard, Door, Tools, etc.)

```text
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] WarriorOS    Comunitate | Cursuri    💬(3)  🔔(5)  [AL]│
├─────────────────────────────────────────────────────────────────┤
│ [Side] │                                                        │
│ [Menu] │  Dashboard / Door / Any page content                   │
│        │                                                        │
└────────┴────────────────────────────────────────────────────────┘
```

### Profile dropdown (click [AL]):
```text
┌──────────────────────────┐
│  user@email.com          │
│  Abonament: Pro          │
├──────────────────────────┤
│  👤 Profilul meu         │
│  ⚙️ Setări               │
│  💳 Gestionează Abonament│
│  ❓ Suport               │
├──────────────────────────┤
│  🌙 Dark Mode   [toggle] │
│  🌐 RO / EN     [toggle] │
├──────────────────────────┤
│  🚪 Log out              │
└──────────────────────────┘
```

### Messages Page (/messages)
```text
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] WarriorOS    Comunitate | Cursuri    💬(3)  🔔(5)  [AL]│
├─────────────────────────────────────────────────────────────────┤
│ [Side] │  Messages                          [+ New Message]    │
│ [Menu] │                                                        │
│        │  ┌─────────────────┬──────────────────────────────────┐│
│        │  │ Conversations   │  [Avatar] Maria P.               ││
│        │  │                 │                                   ││
│        │  │ [●] Maria P.   │  Hey, ai terminat Challenge?     ││
│        │  │ Hey, ai term... │  ────────────────────────────     ││
│        │  │                 │  Da! A fost super, tu?           ││
│        │  │ [ ] Andrei C.  │  ────────────────────────────     ││
│        │  │ Buna, vreau... │                                   ││
│        │  │                 │  [Type a message...] [Send]      ││
│        │  └─────────────────┴──────────────────────────────────┘│
└────────┴────────────────────────────────────────────────────────┘
```

---

## Compatibility

- `brotherhood_messages` stays for group/tribe chat (unchanged)
- `direct_messages` is the new table for private 1-on-1 messaging
- The trigger ensures all future users are auto-enrolled into the community
- The migration backfills all 273 existing users
- SideMenu keeps all operational tools (Programs, Dashboard, Door, Stacks, Brotherhood, Tools)
- Profile dropdown centralizes all account management
