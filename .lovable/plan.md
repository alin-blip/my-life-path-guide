
# ✅ COMPLETAT: Redesign Postari stil Facebook/Skool

## Ce s-a implementat

### 1. `LessonPostCardInline.tsx` (NOU)
Card unificat cu post content + comentarii inline + input de comentariu la baza cardului. Înlocuiește `LessonPostCard` + `PostCommentsDialog` în paginile de lecții.

### 2. `LessonCommunityPost.tsx` (ACTUALIZAT)
- Folosește `LessonPostCardInline` pentru toate postările
- Sortare: `is_pinned DESC`, apoi `created_at DESC`
- Eliminat importul `LessonWelcomePost` (instrucțiunile vin din DB ca postări pinned)

### 3. Baza de date
- 32 postări pinned (7 Challenge + 25 Personal Power) cu instrucțiuni per zi
- ~25 comentarii seed la postările pinned (3 la Day 1, 2 la celelalte zile cheie)
- `comments_count` actualizat pe postările cu comentarii

### Rezultat
- Fiecare lecție: welcome post fixat cu instrucțiuni + comentarii vizibile direct
- Toate postările cu comentarii inline (stil Facebook)
- Zero dialoguri laterale pentru comentarii
- Dovadă socială vizibilă imediat
