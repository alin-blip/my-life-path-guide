
# Restaurare Sectiune Comunitate cu Stil Amber/Orange + Fix Postare Declaratie

## Problema

1. **Butonul "Distribuie declaratia" nu functioneaza** -- `handlePostDeclaration` foloseste `commentsRef.current` care este `null` (componenta `ChallengeComments` a fost inlocuita cu `LessonCommunityPost`, dar ref-ul nu a fost actualizat). Declaratiile nu ajung nicaieri.

2. **Sectiunea de comunitate din lectii arata neutra** -- utilizatorul vrea stilul anterior cu gradient amber/portocaliu care se evidentia vizual.

3. **Postarea declaratiei trebuie sa apara si pe wall-ul comunitatii** -- cand un user da click pe "Distribuie declaratia", postarea trebuie sa ajunga in `wall_posts` (cu `source_context: challenge-day-1`), nu in `warriors_way_comments`.

---

## Solutie

### 1. Fix `handlePostDeclaration` si `handlePostRealityScore` (ChallengeDay.tsx)

Inlocuim logica bazata pe `commentsRef` cu insert direct in `wall_posts`:

```typescript
const handlePostDeclaration = async (declaration: string) => {
  if (!user) return;
  const { error } = await supabase.from('wall_posts').insert({
    user_id: user.id,
    content: declaration,
    category: 'challenge',
    source_context: 'challenge-day-1',
    source_label: `Challenge - Day 1: ${language === 'en' ? 'Vision + Declaration' : 'Viziune + Declarație'}`,
  });
  if (!error) {
    toast({ title: '🎉', description: '...' });
  }
};
```

Acelasi fix pentru `handlePostRealityScore`.

Eliminam `commentsRef` (nu mai este folosit).

### 2. Stil amber/portocaliu pentru `LessonCommunityPost`

Modificam componenta `LessonCommunityPost` pentru a adauga stilul gradient amber:
- Header-ul sectiunii: gradient text amber/orange
- Wrapper-ul "Scrie ceva...": border amber/20, bg amber/5
- Chenarul general: border amber/30 cu bg gradient subtil

### 3. Acelasi fix in `ChallengeDayEnglish.tsx`

Aplicam aceleasi modificari si in versiunea engleza (daca are acelasi pattern cu commentsRef).

---

## Fisiere modificate

1. **`src/pages/ChallengeDay.tsx`**
   - Eliminare `commentsRef`
   - Rescrierea `handlePostDeclaration` si `handlePostRealityScore` sa insereze in `wall_posts`
   - Import `supabase` (daca nu e deja importat)

2. **`src/pages/ChallengeDayEnglish.tsx`**
   - Acelasi fix pentru `handlePostDeclaration`

3. **`src/components/programs/LessonCommunityPost.tsx`**
   - Adaugare stil amber/portocaliu pe header, write trigger si containerul principal
   - Chenarul sectiunii devine vizibil cu gradient `from-amber-500/5 to-orange-500/5` si `border-amber-500/30`
