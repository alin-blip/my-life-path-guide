

# #5 — Unificarea Feed-urilor: wall_posts + tribe_posts

## Problema actuala
Exista doua tabele separate cu functionalitate aproape identica:
- `wall_posts` (98 postari) — folosit de feed-ul principal si de grupuri
- `tribe_posts` (2 postari) — folosit doar de coach-ul din tribe

Aceasta duplicare creeaza fragmente de cod redundant, doua seturi de RLS policies, doua seturi de triggers pentru notificari, si inconsistente (ex: `wall_posts` are `media_urls` array, `tribe_posts` are `media_url` singular).

## Ce vom implementa

### 1. Migratie date
Mutam cele 2 postari din `tribe_posts` in `wall_posts`, pastrand `tribe_id`, `user_id`, `content`, timestamps si counters.

### 2. Refactorizare `useCoachTribeFeed.ts`
Schimbam toate query-urile de la `tribe_posts` la `wall_posts`:
- `tribe_post_likes` -> `wall_post_likes`
- `tribe_post_comments` -> `wall_post_comments`
- Adaptat interfata `TribePost` la structura `wall_posts`

### 3. Actualizare `CoachTribeFeed.tsx`
Adaptat componenta la noua structura de date (ex: `media_url` -> `media_urls`).

### 4. Cleanup (optional, dupa validare)
Tabelele `tribe_posts`, `tribe_post_likes`, `tribe_post_comments` pot fi pastrate temporar ca backup si sterse ulterior.

---

## Detalii tehnice

### Migratie SQL
```text
-- Muta postari din tribe_posts in wall_posts
INSERT INTO wall_posts (id, user_id, tribe_id, content, media_urls, is_pinned, likes_count, comments_count, created_at, updated_at)
SELECT id, user_id, tribe_id, content, 
  CASE WHEN media_url IS NOT NULL THEN ARRAY[media_url] ELSE NULL END,
  is_pinned, likes_count, comments_count, created_at, updated_at
FROM tribe_posts
ON CONFLICT (id) DO NOTHING;

-- Muta likes
INSERT INTO wall_post_likes (post_id, user_id, created_at)
SELECT post_id, user_id, created_at FROM tribe_post_likes
ON CONFLICT DO NOTHING;

-- Muta comentarii  
INSERT INTO wall_post_comments (post_id, user_id, content, created_at)
SELECT post_id, user_id, content, created_at FROM tribe_post_comments
ON CONFLICT DO NOTHING;
```

### Fisier: `src/hooks/useCoachTribeFeed.ts`
- Toate referintele `tribe_posts` -> `wall_posts`
- `tribe_post_likes` -> `wall_post_likes`
- `tribe_post_comments` -> `wall_post_comments`
- `media_url: string | null` -> `media_urls: string[] | null`
- Canalul realtime asculta pe `wall_posts` filtrat pe `tribe_id`

### Fisier: `src/components/coach/CoachTribeFeed.tsx`
- Adaptat afisarea media de la `media_url` singular la `media_urls` array
- Pastrata aceeasi experienta vizuala

### Fisiere modificate
1. Migratie SQL — transfer date + cleanup optional
2. `src/hooks/useCoachTribeFeed.ts` — redirectare queries la `wall_posts`
3. `src/components/coach/CoachTribeFeed.tsx` — adaptare structura date

### Risc
Minim — doar 2 postari in `tribe_posts`. Tabelele vechi raman ca backup pana la confirmarea ca totul functioneaza.

