
# Fix: Postarea din Challenge Intake sa apara in feed-ul comunitatii

## Problema

Intake-ul a fost completat si salvat corect in `challenge_intake`. Postarea automata a fost de asemenea creata, DAR in tabelul gresit: `tribe_posts`. Feed-ul comunitatii principale (`CommunityFeedTab` -> `GroupFeed`) citeste din tabelul `wall_posts`, nu din `tribe_posts`.

## Solutia

O singura modificare in `ChallengeIntakeModal.tsx`: la linia 107, schimbam INSERT-ul din `tribe_posts` in `wall_posts`.

## Modificare

| Fisier | Ce se schimba |
|---|---|
| `src/components/challenge/ChallengeIntakeModal.tsx` | Linia 107: `tribe_posts` -> `wall_posts`, si adaugam campul `tribe_id` care exista pe `wall_posts` |

### Cod curent (linia 107-111):
```typescript
await supabase.from('tribe_posts').insert({
  tribe_id: MAIN_TRIBE_ID,
  user_id: user.id,
  content: postContent,
});
```

### Cod nou:
```typescript
await supabase.from('wall_posts').insert({
  tribe_id: MAIN_TRIBE_ID,
  user_id: user.id,
  content: postContent,
});
```

### Cleanup

Stergem si postarea orfana existenta din `tribe_posts` (cea creata la testul tau) printr-o migrare SQL rapida.

Aceasta e singura schimbare necesara - o linie de cod.
