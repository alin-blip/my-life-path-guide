

# Redesign: Postari stil Facebook/Skool - Un singur card cu comentarii inline

## Problema actuala

- `LessonWelcomePost` este un card separat (doar instructiuni, fara comentarii)
- Postari utilizatori (`LessonPostCard`) sunt carduri separate
- Comentariile se deschid intr-un Sheet/Dialog lateral - nu sunt vizibile direct
- Experienta este fragmentata: card instructiuni + card postare + dialog comentarii = 3 elemente separate

## Solutia: Card unificat stil Facebook

Fiecare postare (inclusiv welcome post) va fi un **singur card** care contine:
1. Continut postare (header + text + media)
2. Butoane Like / Comment
3. Lista de comentarii direct sub postare (vizibile, nu in dialog)
4. Input de comentariu la baza cardului

Similar cu Facebook unde vezi postarea, like-urile, comentariile existente si campul de "Write a comment..." - totul intr-un singur bloc vizual.

## Componente afectate

### 1. Componenta noua: `LessonPostCardInline.tsx`

Inlocuieste `LessonPostCard` + `PostCommentsDialog` cu un singur card care include:

```
+------------------------------------------+
| [Avatar] Andrei Popescu       2h ago     |
|                                          |
| Continutul postarii...                   |
| [imagine daca exista]                    |
|                                          |
| [Heart 3]  [Comment 2]                  |
|------------------------------------------|
| [Avatar] Elena: "Super insight!"    1h  |
|    [Reply] [Delete]                      |
| [Avatar] Marius: "La fel si eu!" 30m    |
|    [Reply] [Delete]                      |
|------------------------------------------|
| [Avatar] Scrie un comentariu...   [Send] |
+------------------------------------------+
```

- Comentariile se incarca automat (hook `useWallPostComments`)
- Input de comentariu permanent vizibil la baza cardului
- Butonul "Comment" face scroll/focus pe input
- Replies nested sub comentarii (ca acum)

### 2. Refactorizare `LessonWelcomePost.tsx` --> `LessonWelcomePostCard.tsx`

Welcome post-ul devine un card complet de tip Facebook:

```
+------------------------------------------+
| [Pin icon] Instructiuni lectie           |
| [Admin Avatar] Admin          fixat      |
|                                          |
| Titlu: Ziua 1: Viziune + Declaratie!     |
| * Completeaza Harta Realitatii           |
| * Raspunde la 5 intrebari de viziune     |
| * Scrie Declaratia Anti-Burnout          |
|                                          |
| Posteaza declaratia ta mai jos!          |
|                                          |
| [Heart 5]  [Comment 3]                  |
|------------------------------------------|
| [Avatar] Andrei: "Am terminat..."   2h  |
| [Avatar] Elena: "Super exercitiu!" 1h   |
|------------------------------------------|
| [Avatar] Scrie un comentariu...   [Send] |
+------------------------------------------+
```

Welcome post-ul va avea un `post_id` asociat in baza de date (o postare reala de tip "pinned") pentru a putea avea comentarii. Se va crea o postare seed pentru fiecare zi.

### 3. Migrare SQL: Welcome posts in baza de date

Pentru ca welcome post-ul sa aiba comentarii, trebuie sa existe ca o inregistrare reala in `wall_posts`:

- INSERT cate o postare pinned per zi de Challenge (7 zile) cu continutul instructiunilor
- INSERT cate o postare pinned per zi de Personal Power (25 zile)
- `user_id` = admin user ID
- `is_pinned` = true
- `source_context` = `challenge-day-X` / `personal-power-day-X`
- Continutul = textul de instructiuni (task-uri + CTA)

Apoi se insereaza **comentarii seed** de la cele 6 persoane fictive la aceste welcome posts, creand impresia ca oamenii au interactionat deja.

### 4. Simplificare `LessonCommunityPost.tsx`

Componenta container se simplifica:
- Elimina `LessonWelcomePost` ca element separat
- Welcome post vine din baza de date ca prima postare (pinned, sortata prima)
- Toate postarea (inclusiv welcome) se randeaza cu `LessonPostCardInline`
- Write trigger ramane ca un card "Scrie ceva..." deasupra feed-ului
- Dialog de scriere ramane neschimbat

### 5. Actualizare `LessonPostCard.tsx`

Se inlocuieste cu noul `LessonPostCardInline` care afiseaza comentariile inline in loc de a deschide un Sheet.

## Fisiere

### Fisiere noi
- `src/components/programs/LessonPostCardInline.tsx` - card unificat post + comentarii inline

### Fisiere modificate
- `src/components/programs/LessonCommunityPost.tsx` - foloseste noul card, elimina welcome post separat, sorteaza pinned first
- `src/components/programs/LessonWelcomePost.tsx` - eliminat (continutul migrat in baza de date)

### Migrare SQL
- INSERT welcome posts (32 postari: 7 Challenge + 25 Personal Power) in `wall_posts` cu `is_pinned = true`
- INSERT ~60 comentarii seed la welcome posts de la cele 6 persoane fictive

## Rezultat final

- Fiecare lectie are un welcome post fixat cu instructiuni + comentarii vizibile direct
- Postari utilizatori cu comentarii inline (stil Facebook)
- Zero dialoguri/sheet-uri pentru comentarii in paginile de lectie
- Experienta fluida: scroll down = vezi totul
- Dovada sociala: comentarii seed vizibile imediat, nu ascunse in dialog

