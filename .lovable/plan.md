

# Comprehensive Skool Audit, Fixes, and New Features

## Audit Findings: What Works vs. What's Missing

### What's Currently Working
- Community tab with posts, likes, comments, categories
- Classroom tab with program cards (Challenge + Accelerator)
- Groups, Calendar, Members, Leaderboards tabs
- GlobalTopBar with Community/Courses nav, Messages icon, Notifications bell, Profile dropdown
- Direct Messages system with realtime (1-on-1 only)
- UserAccountDropdown with Profile, Settings, Subscription, Support, Theme, Language, Logout
- WarriorsWay course with sidebar lessons, video player, progress tracking

### Issues Found

**1. Brotherhood still in SideMenu (lines 212-224)** - needs removal, links redirect to /programs?tab=community

**2. /brotherhood route still active in App.tsx (line 375-379)** - needs redirect to /programs?tab=community

**3. Lesson popup issue in WarriorsWay** - `WarriorVideoPlayer.tsx` renders inside a `<Dialog>` (line 104: `<Dialog open={true} onOpenChange={onClose}>`). This is the popup behavior the user doesn't want. It should render inline in the page, not in a modal.

**4. Messages: Can only message 1 user at a time** - No group/multi-select DM support. User wants to select multiple recipients.

**5. Community notifications system** - The `push_notifications` table exists but there's no in-app notification bell integration. The bell in GlobalTopBar just redirects to community. No notification is created when a post is made.

**6. Admin "Add Course" button missing** - ClassroomTab shows program cards but has no admin button to add new courses.

**7. No email sending on post** - User wants option to notify all members via email when posting.

---

## Implementation Plan

### Step 1: Remove Brotherhood from SideMenu + Redirect Route

**File: `src/components/SideMenu.tsx`**
- Remove the entire Brotherhood menu item (lines 212-225) including all sub-items (Feed, Chat, Tribes, Members, Leaderboard, Achievements)
- Keep Leaderboard and Achievements as standalone items if needed, or fold into Programs

**File: `src/App.tsx`**
- Change `/brotherhood` route to redirect to `/programs?tab=community`
- Keep the Brotherhood component import for backward compatibility but add a `<Navigate>` redirect

**File: `src/data/challengeKnowledge.ts`**
- Update paths referencing `/brotherhood?tab=tribes` to `/programs?tab=groups`

### Step 2: Fix Lesson Display - Remove Dialog, Render Inline

**File: `src/components/warriors-way/WarriorVideoPlayer.tsx`**
- Remove the `<Dialog>` / `<DialogContent>` wrapper entirely
- Render the video player, lesson content, action prompts, and comments as a regular page section (inline within the main content area)
- Keep the same layout: video at top, content below, navigation at bottom
- The close button ("X") becomes a "Back to overview" button

**Current behavior:** Clicking a lesson opens a full-screen dialog/popup overlay
**New behavior:** Clicking a lesson renders the video + content directly in the right-side main area (Skool classroom style), with the sidebar staying visible

### Step 3: Multi-User Messaging

**File: `src/components/messages/NewMessageDialog.tsx`**
- Add multi-select support: users can check multiple members before starting a conversation
- Show selected members as chips/tags above the search
- When sending to multiple users, create separate direct_messages for each recipient (individual conversations, not a group chat)

**File: `src/hooks/useDirectMessages.ts`**
- Add `sendBulkMessage(receiverIds: string[], content: string)` function that sends the same message to multiple recipients
- Each message creates a separate conversation thread

### Step 4: In-App Notifications System

**File: `src/components/global/GlobalTopBar.tsx`**
- Connect the Bell icon to fetch unread `push_notifications` count for the current user
- On click, show a dropdown/popover with recent notifications
- Mark notifications as read when viewed

**New file: `src/hooks/useNotifications.ts`**
- Fetch unread notification count from `push_notifications` table
- Subscribe to realtime inserts for new notifications
- Mark as read functionality

**New file: `src/components/global/NotificationsDropdown.tsx`**
- Dropdown showing recent notifications (title, message, timestamp)
- "Mark all as read" button
- Each notification links to relevant content

### Step 5: Auto-Notify on Community Post

**File: `src/hooks/useBrotherhood.ts`** (createPost function)
- After successfully creating a post, insert push_notifications for all community members
- Add option parameter `notifyAll: boolean` to control this

**File: `src/components/programs/SkoolWritePost.tsx`**
- Add a checkbox/toggle: "Notify all members" (default: on)
- Add a checkbox: "Send email notification" (for admin only)
- Pass these options to the createPost function

**Database: New edge function `notify-community-post`**
- When "send email" is toggled, call this edge function
- The function sends an email to all community members about the new post
- Uses the existing email infrastructure

### Step 6: Admin "Add Course" Button

**File: `src/components/programs/ClassroomTab.tsx`**
- Check if current user is admin (query `user_roles` table)
- If admin, show an "Add Course" button/card at the top or as a floating action
- Clicking opens a dialog to create a new course (title, description, thumbnail, category, price, URL)
- Saves to `adminCourses` in localStorage (matching existing `useAdminCourses` pattern) or to a new database table

---

## Technical Details

### Files to Create (3)
| File | Description |
|------|-------------|
| `src/hooks/useNotifications.ts` | Hook for fetching/managing push_notifications |
| `src/components/global/NotificationsDropdown.tsx` | Bell dropdown with notification list |
| `supabase/functions/notify-community-post/index.ts` | Edge function to send email notifications on post |

### Files to Modify (9)
| File | Change |
|------|--------|
| `src/components/SideMenu.tsx` | Remove Brotherhood section |
| `src/App.tsx` | Redirect /brotherhood to /programs?tab=community |
| `src/components/warriors-way/WarriorVideoPlayer.tsx` | Remove Dialog wrapper, render inline |
| `src/components/messages/NewMessageDialog.tsx` | Add multi-select for recipients |
| `src/hooks/useDirectMessages.ts` | Add sendBulkMessage function |
| `src/components/global/GlobalTopBar.tsx` | Connect notifications, show dropdown |
| `src/hooks/useBrotherhood.ts` | Add notification creation on post |
| `src/components/programs/SkoolWritePost.tsx` | Add notify/email toggles |
| `src/components/programs/ClassroomTab.tsx` | Add admin "Add Course" button |
| `src/data/challengeKnowledge.ts` | Update brotherhood paths |

### Database Changes
- No new tables needed (using existing `push_notifications`)
- Possibly add a `notifications` realtime publication if not already enabled

