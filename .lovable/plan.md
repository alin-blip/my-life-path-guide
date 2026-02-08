
# Redesign Community Tab in Stil Skool.com

## Rezumat

Transformam tab-ul "Community" din pagina Programs pentru a arata exact ca in screenshot-ul Skool: input simplu "Write something" sus, filtre pe categorii, postari in stil card cu avatar, titlu bold, preview text, thumbnail, likes/comments cu avatare, si un sidebar dreapta cu informatii despre grup.

## Ce se modifica

### 1. Redesign CommunityTab.tsx (complet)

Layout-ul devine cu 2 coloane pe desktop:
- **Stanga (principal):** Input "Write something" + filtre categorii + lista postari
- **Dreapta (sidebar):** Card info grup (imagine, nume, descriere, statistici, membri)

```text
Desktop:
┌───────────────────────────────┬────────────────────┐
│  [Avatar] Write something...  │  [Group Image]     │
│                               │  Warrior OS        │
│  [All] [General] [Resources]  │  Comunitatea...    │
│                               │  Links...          │
│  ┌──────────────────────────┐ │  252 Members  3 On │
│  │ Avatar Name ⭐           │ │  [Avatare]         │
│  │ 1d · General Discussion  │ │                    │
│  │ ● Titlu Post Bold...     │ │                    │
│  │ Preview text truncat...  │ │                    │
│  │ 👍 238  💬 147  [avat..]  │ │                    │
│  └──────────────────────────┘ │                    │
│                               │                    │
│  ┌──────────────────────────┐ │                    │
│  │ Avatar Name              │ │                    │
│  │ 4d · Resources           │ │                    │
│  │ ● Alt post...            │ │                    │
│  └──────────────────────────┘ │                    │
└───────────────────────────────┴────────────────────┘
```

Pe mobil, sidebar-ul info grup se ascunde complet - doar feed-ul este vizibil.

### 2. Stil Post Card (Skool-style)

Fiecare post va arata ca in Skool:
- **Header:** Avatar (cu level badge), Nume + emoji badges, timp relativ + categorie tag
- **Pinned label** dreapta sus (daca `is_pinned = true`)
- **Titlu:** Text bold (primele ~60 caractere din content pe prima linie)
- **Preview:** Urmatoarele 2 linii de text, truncate
- **Thumbnail:** Daca exista `media_urls`, prima imagine apare ca thumbnail mic in dreapta postului
- **Footer:** Like icon + count, Comment icon + count, avatar-uri mici ale ultimilor commentatori, "New comment Xm ago" link

### 3. Input "Write something" simplificat

In loc de textarea mare cu buton, un input card simplu:
- Avatar utilizator + input placeholder "Write something..."
- Click deschide un dialog/modal cu textarea completa pentru a scrie postarea
- Identic cu Skool UX

### 4. Filtre categorii (chip-uri)

Banda de chip-uri/pills orizontale:
- **All** (default, activ)
- **General Discussion** 💬
- **Wins & Victories** 🏆
- **Questions & Support** 🆘
- **More...**
- Filtreaza postarea pe baza unui camp viitor (deocamdata filtrare client-side pe content keywords, sau toate postarea apar sub "All")

### 5. Sidebar Info Grup (dreapta)

Card cu:
- Imagine cover/logo grupului
- Nume: "Warrior OS Community"
- Descriere scurta: "Comunitatea antreprenorilor..."
- Link-uri rapide: "Start Here", "Classroom", "Leaderboards"
- Statistici: X Members, Y Online, Z Admins
- Avatare mici ale membrilor recenti

---

## Fisiere de creat

| Fisier | Descriere |
|--------|-----------|
| `src/components/programs/SkoolPostCard.tsx` | Card individual post in stil Skool |
| `src/components/programs/SkoolCategoryFilter.tsx` | Banda de filtre categorii |
| `src/components/programs/SkoolGroupSidebar.tsx` | Sidebar info grup |
| `src/components/programs/SkoolWritePost.tsx` | Input simplificat "Write something" + dialog |

## Fisiere de modificat

| Fisier | Modificare |
|--------|------------|
| `src/components/programs/CommunityTab.tsx` | Restructurare completa cu noul layout Skool |

---

## Detalii Tehnice

### SkoolPostCard.tsx

Props:
```typescript
interface SkoolPostCardProps {
  post: WallPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}
```

Structura vizuala:
- Container card cu border subtil, hover shadow
- Row 1: Avatar (cu badge nivel), Nume + badges, "· Xd · Category" | "Pinned" label dreapta
- Row 2: Titlu bold (prima linie din content)
- Row 3: Preview text (restul contentului, truncat la 2 linii)
- Row 4 (optional): Thumbnail din media_urls[0], aliniat dreapta
- Row 5: Like/comment counts, avatar-uri mici commentatori, "New comment Xm ago"

### SkoolWritePost.tsx

- Card simplu cu avatar + input readonly "Write something..."
- Click deschide Dialog cu:
  - Textarea pentru continut complet
  - Buton de post
- Dupa post, dialog se inchide si se face refetch

### SkoolCategoryFilter.tsx

- Array de categorii hardcodate:
  ```typescript
  const categories = [
    { id: 'all', label: 'All', labelRo: 'Toate', icon: null },
    { id: 'general', label: 'General Discussion', labelRo: 'Discuție Generală', icon: '💬' },
    { id: 'wins', label: 'Wins & Victories', labelRo: 'Victorii', icon: '🏆' },
    { id: 'support', label: 'Support Needed', labelRo: 'Ajutor', icon: '🆘' },
  ];
  ```
- Chip-uri pill cu `border-radius: full`, activ = background dark
- Deocamdata filtreaza doar vizual (All arata totul)

### SkoolGroupSidebar.tsx

- Card cu imagine placeholder gradient
- Titlu "Warrior OS Community"
- Descriere
- Link-uri rapide folosind `useNavigate`
- Stats: numar total membri din `leaderboard_profiles`, "Online" count hardcodat sau estimat

### CommunityTab.tsx - Restructurare

```typescript
export const CommunityTab = () => {
  const { posts, loading, createPost, toggleLike } = useBrotherhood();
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="flex gap-6">
      {/* Main Feed */}
      <div className="flex-1 max-w-2xl space-y-4">
        <SkoolWritePost onPost={createPost} />
        <SkoolCategoryFilter active={activeCategory} onChange={setActiveCategory} />
        {posts.map(post => (
          <SkoolPostCard 
            key={post.id} 
            post={post} 
            onLike={toggleLike}
          />
        ))}
      </div>

      {/* Group Info Sidebar - hidden on mobile */}
      <div className="hidden lg:block w-80 shrink-0">
        <SkoolGroupSidebar />
      </div>
    </div>
  );
};
```

---

## Compatibilitate

- Folosim acelasi hook `useBrotherhood()` cu `WallPost` type - NU schimbam logica de backend
- Postarea existenta `is_pinned` se respecta si se afiseaza cu label "Pinned"
- `media_urls` se afiseaza ca thumbnail in dreapta postului
- Likes/comments functioneaza identic prin `toggleLike`
- Datele din `leaderboard_profiles` se folosesc pentru sidebar stats

## Mobile

- Pe mobil: sidebar-ul info grup dispare (`hidden lg:block`)
- Feed-ul ocupa 100% latime
- Postarea ramane full-width
- Filtrele au scroll orizontal daca sunt prea multe
