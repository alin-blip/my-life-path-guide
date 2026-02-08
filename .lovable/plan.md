

# Welcome Message Upgrade + Pinned Posts (up to 3) + Admin Pin/Unpin

## What changes

### 1. Updated Welcome Message Content
Update the `welcome_message` in the database to the new, warmer Romanian text with:
- A welcoming introduction with emoji
- A call-to-action link to the Challenge (Day 1): `/challenge-7-zile`  
- A prompt inviting users to introduce themselves (who they are, where they're from, why they're here) with a link to the community
- Community rules (3 rules)

The `CommunityWelcomeBanner` component will be updated to render links inside the message as clickable (detect URLs and render them as `<a>` tags or use a simple markdown-like link parser).

### 2. Support for 3 Pinned Posts (not just 1)
Currently pinned posts show a "Pinned" badge but:
- There's no way for admins to pin/unpin posts from the UI
- The `useBrotherhood.fetchPosts` doesn't sort pinned posts first (only `GroupFeed` does)

Changes:
- **`useBrotherhood.ts`**: Add `.order('is_pinned', { ascending: false })` before the `created_at` ordering so pinned posts always appear at the top
- **`SkoolPostCard.tsx`**: Add an admin-only "Pin/Unpin" button (via a dropdown menu on the post card) that toggles `is_pinned` on the `wall_posts` table
- The pin action will check if there are already 3 pinned posts and show an error if trying to pin a 4th

### 3. Admin Pin/Unpin Feature on Post Cards
Add a 3-dot menu (or pin icon button) visible only to admins on each `SkoolPostCard`:
- **Pin post** (if not pinned, and fewer than 3 posts are already pinned)
- **Unpin post** (if pinned)
- Uses direct Supabase update: `UPDATE wall_posts SET is_pinned = true/false WHERE id = ?`

---

## Technical Details

### Database Migration
Update the `welcome_message` value in `community_settings`:

```sql
UPDATE community_settings 
SET setting_value = 'Bine ai venit in comunitatea Warrior OS! 🎯

Suntem bucurosi ca esti aici! Aceasta este locul unde antreprenorii care vor TOTUL — sanatate, claritate, relatii si libertate financiara — se sprijina reciproc sa creasca.

👉 Incepe provocarea de 7 zile: https://warriorsos.com/challenge-7-zile
Porneste direct din Ziua 1 si descopera cum sa ai totul fara sa sacrifici nimic.

🙋 Prezinta-te comunitatii! Spune-ne cine esti, de unde esti si ce te-a adus aici:
https://warriorsos.com/programs?tab=community

📋 Regulile noastre:
1) Fii respectuos
2) Impartaseste victoriile
3) Cere ajutor cand ai nevoie

Hai sa crestem impreuna! 💪',
updated_at = now()
WHERE setting_key = 'welcome_message';
```

### Files Modified

| File | Change |
|------|--------|
| `src/components/programs/CommunityWelcomeBanner.tsx` | Parse URLs in welcome message and render them as clickable links (styled as primary color underlined text) |
| `src/components/programs/SkoolPostCard.tsx` | Add admin-only dropdown menu with Pin/Unpin action; check 3-pin limit before pinning |
| `src/hooks/useBrotherhood.ts` | Add `.order('is_pinned', { ascending: false })` to `fetchPosts` query so pinned posts appear first |

### CommunityWelcomeBanner URL Rendering
The component currently renders the message as plain text via `whitespace-pre-line`. It will be updated to:
- Split the message text and detect URLs (using a regex like `https?://[^\s]+`)
- Render detected URLs as clickable `<a>` tags with `target="_blank"` and styled with `text-primary underline`
- Keep the rest as plain text, preserving line breaks

### SkoolPostCard Pin/Unpin
- Import `MoreVertical` (or `EllipsisVertical`) icon from lucide
- Add a dropdown menu (using Radix `DropdownMenu`) with a "Pin" or "Unpin" option
- Only show this menu if user is admin (use `useAdminAuth` hook)
- On pin: check current pinned count via a quick query (`SELECT count(*) FROM wall_posts WHERE is_pinned = true`), if >= 3 show toast error
- On pin/unpin: update the post's `is_pinned` field and refresh the feed

### useBrotherhood fetchPosts ordering
Add pinned-first sorting:
```typescript
let query = supabase
  .from('wall_posts')
  .select('*')
  .order('is_pinned', { ascending: false })
  .order('created_at', { ascending: false })
  .limit(50);
```

