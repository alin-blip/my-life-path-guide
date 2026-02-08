

# Postari Unificate: Challenge Lessons + Community Feed (Skool-Style)

## Rezumat

In Skool, cand postezi un comentariu intr-o lectie, acea postare apare automat si in feed-ul Community, cu un badge care arata din ce curs si lectie provine. Utilizatorii pot comenta fie din lectie, fie din Community. Implementam exact acest comportament.

## Ce se schimba

In loc sa folosim doua sisteme separate (warriors_way_comments pentru lectii si wall_posts pentru Community), unificam totul pe `wall_posts`. Fiecare postare din Challenge va fi un wall_post cu context (curs + zi) care apare automat in Community feed.

## Detalii Tehnice

### Pasul 1: Migrare DB - Adaugam coloane de context pe wall_posts

Adaugam 3 coloane noi pe `wall_posts` pentru a lega postarea de un curs/lectie:

```sql
ALTER TABLE public.wall_posts
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS source_context TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_label TEXT DEFAULT NULL;
```

- `category`: tipul postarii ('general', 'challenge', 'course', 'wins', etc.) - folosit si pentru filtrele din Community
- `source_context`: identificator tehnic (ex: 'challenge-day-1', 'challenge-day-3') - pentru filtrare in lectie
- `source_label`: label vizibil (ex: 'Challenge - Day 1: Vision + Declaration') - afisat in Community ca badge

### Pasul 2: Componenta noua - LessonCommunityPost.tsx

O componenta care se plaseaza in fiecare zi de Challenge (inlocuieste/completeaza ChallengeComments). Aceasta:

- Afiseaza un "Write something..." input (stilul Skool) cu context pre-setat
- Cand utilizatorul posteaza, creeaza un `wall_post` cu `source_context = 'challenge-day-X'` si `source_label = 'Challenge - Day X: Titlu'`
- Sub input, afiseaza postari filtrate pentru acea zi (`source_context = 'challenge-day-X'`), cu like-uri si comentarii
- Fiecare postare are buton de comentarii (folosind `wall_post_comments`)

Structura vizuala:
```text
┌──────────────────────────────────────────────────────┐
│  [Avatar] Write something...                         │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  📚 Challenge - Day 1: Vision + Declaration    │  │
│  │  [Avatar] Andrei · 2h ago                      │  │
│  │  Am terminat Reality Check-ul si am un scor... │  │
│  │  ❤️ 12  💬 5                                    │  │
│  │                                                │  │
│  │  └─ Reply: Elena - Super! Eu am avut 6.2...   │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  📚 Challenge - Day 1: Vision + Declaration    │  │
│  │  [Avatar] Marius · 5h ago                      │  │
│  │  Declaratia mea: "In 90 de zile voi..."       │  │
│  │  ❤️ 8  💬 3                                     │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Pasul 3: Actualizare SkoolPostCard - Afisare badge context

In Community feed, postarea care vine dintr-o lectie va avea un badge suplimentar:
```text
📚 Challenge - Day 1: Vision + Declaration
```
Deasupra titlului postarii, exact ca in Skool unde vezi din ce modul provine postarea.

### Pasul 4: Hook nou - useWallPostComments.ts

Un hook dedicat pentru comentariile la wall_posts (tabel `wall_post_comments`):
- `fetchComments(postId)` - preia comentariile pentru o postare
- `addComment(postId, content, parentId?)` - adauga comentariu/reply
- `deleteComment(commentId)` - sterge comentariu propriu
- Suport pentru reply-uri (nested)

### Pasul 5: Dialog/Sheet pentru comentarii la postari

Cand user-ul apasa pe butonul de comentarii (💬) dintr-un SkoolPostCard sau din LessonCommunityPost, se deschide un panel/dialog cu:
- Postarea originala sus
- Lista de comentarii cu reply-uri
- Input de comentariu jos

### Pasul 6: Integrare in Challenge Day pages

In `ChallengeDay.tsx` si `ChallengeDayEnglish.tsx`:
- Pastram `ChallengeLiveChat` (chat-ul instant, separat)
- Inlocuim `ChallengeComments` cu noul `LessonCommunityPost`
- Postarea facuta aici apare automat in Community feed (aceeasi tabela `wall_posts`)

### Pasul 7: Filtrare in CommunityTab

Actualizarea `SkoolCategoryFilter` pentru a folosi `category` din `wall_posts`:
- "All" - toate posturile
- "General" - doar cele fara source_context
- "Challenge" - doar cele cu category='challenge'
- "Wins" - cele cu category='wins'

Actualizarea `useBrotherhood.ts` pentru a accepta parametru de filtru pe `category`.

---

## Fisiere de creat (5)

| Fisier | Descriere |
|--------|-----------|
| `src/components/programs/LessonCommunityPost.tsx` | Componenta de postare + feed din lectie |
| `src/hooks/useWallPostComments.ts` | Hook pentru comentarii la wall_posts |
| `src/components/programs/PostCommentsDialog.tsx` | Dialog cu comentarii pentru o postare |
| `src/components/programs/PostCommentCard.tsx` | Card individual de comentariu cu reply |
| `src/components/programs/LessonPostCard.tsx` | Card postare in context de lectie (cu likes, comments) |

## Fisiere de modificat (5)

| Fisier | Modificare |
|--------|------------|
| `src/components/programs/SkoolPostCard.tsx` | Adaugare badge `source_label` + click pe comments deschide dialog |
| `src/hooks/useBrotherhood.ts` | Adaugare suport `category` filter + extindere `createPost` cu source context |
| `src/components/programs/SkoolCategoryFilter.tsx` | Filtrare reala pe `category` |
| `src/pages/ChallengeDay.tsx` | Inlocuire `ChallengeComments` cu `LessonCommunityPost` |
| `src/pages/ChallengeDayEnglish.tsx` | Inlocuire `ChallengeComments` cu `LessonCommunityPost` |

## Fluxul Complet

```text
Utilizator in Challenge Day 1:
  1. Vede "Write something..." card
  2. Scrie postarea ("Am terminat Reality Check...")
  3. Postarea se salveaza in wall_posts cu:
     - category: 'challenge'
     - source_context: 'challenge-day-1'
     - source_label: 'Challenge - Day 1: Vision + Declaration'
  4. Postarea apare instant in lectie (filtrat pe source_context)
  5. Postarea apare si in Community feed (cu badge-ul de context)

Utilizator in Community:
  1. Vede postarea cu badge "📚 Challenge - Day 1: Vision + Declaration"
  2. Poate da like, poate comenta
  3. Comentariul apare si in lectie (aceeasi postare, aceleasi comentarii)
```

## Compatibilitate

- `wall_posts` existente (fara `source_context`) raman ca postari "general" - nu se pierde nimic
- `ChallengeComments` (warriors_way_comments) ramane functional pentru backward compatibility, dar nu mai este folosit in paginile de Challenge
- `ChallengeLiveChat` ramane separat - este chat-ul instant, nu postari de comunitate
- Toate postarea au likes si comments prin sistemul existent (`wall_post_likes`, `wall_post_comments`)
- Realtime deja activat pe `wall_posts`

