

# Comentarii inline in Community Feed (stil Facebook)

## Problema
In tab-ul Community, cand dai click pe comentarii, se deschide un panou lateral (Sheet). Trebuie sa fie ca pe Facebook: comentariile apar direct sub postare, in acelasi card.

## Solutia
Transformam `SkoolPostCard` sa afiseze comentariile inline (direct sub postare), eliminand `PostCommentsDialog` (Sheet-ul lateral).

## Ce se modifica

### 1. `src/components/programs/SkoolPostCard.tsx`
- Eliminam importul si utilizarea `PostCommentsDialog` (Sheet lateral)
- Adaugam hook-ul `useWallPostComments` direct in card
- Cand utilizatorul apasa pe butonul Comment, se expandeaza sectiunea de comentarii sub postare (in acelasi card)
- Adaugam lista de comentarii (`PostCommentCard`) inline
- Adaugam input permanent de "Scrie un comentariu..." la baza cardului (cu emoji picker, media upload, video recorder)
- Pastram toate functiile admin (pin/unpin, move category)
- Afisam continutul complet al postarii (nu doar preview truncat) - optional toggle "see more"

### 2. Structura vizuala finala (per card)
```text
+------------------------------------------+
| [Source Badge: Challenge - Day 1]        |
| [Avatar] Andrei Popescu    2h  [Pinned]  |
|                                          |
| Titlul postarii                          |
| Continutul complet al postarii...        |
| [imagine daca exista]                    |
|                                          |
| [Heart 3]  [Comment 5]                  |
|------------------------------------------|
| [Avatar] Elena: "Super!" · 1h           |
|    [Reply] [Delete]                      |
|   [Avatar] Marius: "Multumesc" · 30m    |
| [Avatar] Ana: "La fel!" · 20m           |
|------------------------------------------|
| [Avatar] Scrie un comentariu... [Send]   |
|   [Emoji] [Media] [Video]               |
+------------------------------------------+
```

### Detalii tehnice
- `useWallPostComments(post.id)` se apeleaza mereu (nu conditionat de `open` ca in dialog)
- Comentariile se incarca automat la montarea cardului
- Realtime subscription ramane activ per postare
- Butonul "Comment" face scroll/focus pe input-ul de comentariu
- `PostCommentCard` se refoloseste identic (deja suporta replies nested)
- Se pastreaza `EmojiPicker`, `MediaUploadButton`, `VideoRecorder` in input

### Fisiere afectate
- **Modificat**: `src/components/programs/SkoolPostCard.tsx` - comentarii inline in loc de Sheet
- **Nemodificat**: `PostCommentCard.tsx`, `useWallPostComments.ts` - se refolosesc exact ca acum
- **Potential deprecat**: `PostCommentsDialog.tsx` - nu mai e nevoie de el (poate ramane pentru alte utilizari, dar nu se mai foloseste in Community)

