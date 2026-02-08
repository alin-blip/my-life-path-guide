
# Sistem Complet de Comunitati Skool-Style + Chat Functional + Welcome Message

## Rezumat

Trei functionalitati mari:

1. **Chat-ul Community functioneaza** - Da, postarea de mesaje merge prin `SkoolWritePost`. Dar lipseste: un **mesaj de intampinare** (welcome message) care sa apara automat tuturor celor care intra pe pagina Community, plus posibilitatea ta (admin) de a seta acest mesaj.

2. **Welcome Message setat de admin** - Adaugam un post "pinned" automat sau un banner de bun venit in Community, pe care adminul il poate edita.

3. **Membri pot crea propriile comunitati (Groups)** - Exact ca in Skool, unde membrii pot crea grupuri cu propriile feed-uri, membri, chat. Accesul la creare depinde de tier: ELITE poate crea nelimitat, PRO poate crea 1-2 grupuri.

---

## Ce exista deja

- Tabela `tribes` cu: name, description, avatar_url, cover_image_url, is_public, member_count, created_by
- Tabela `tribe_members` cu: tribe_id, user_id, role (owner/admin/moderator/member)
- Tabela `wall_posts` cu: tribe_id, content, media_urls, likes_count, comments_count, is_pinned
- Tabela `brotherhood_messages` pentru chat in timp real pe tribe
- Hook `useBrotherhood()` cu: createTribe, joinTribe, leaveTribe, createPost, toggleLike, sendMessage
- `subscriptionTier` disponibil in `AuthContext` (valori: trial, Free, basic, pro, elite)
- Componenta `BrotherhoodTribes` cu UI de creare tribe (dar nu are restrictii pe tier)

## Ce lipseste

- **Welcome message** configurabil de admin pentru Community
- **Pagina individuala de grup/tribe** (ca in Skool - fiecare grup are propriul feed, members, about)
- **Restrictie creare pe tier** (doar PRO si ELITE pot crea grupuri)
- **Discover Groups** - listare tuturor grupurilor publice disponibile
- **Tab "Groups"** in SkoolNavBar sau ca sectiune in Community

---

## Plan de Implementare

### Pasul 1: Welcome Message in Community

**Tabel nou: `community_settings`**
```sql
CREATE TABLE community_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
- Adminul seteaza `welcome_message` prin UI
- Se afiseaza ca un card special "pinned" in partea de sus a feed-ului Community
- Doar utilizatorii cu rol `admin` pot edita acest mesaj

**Componenta noua: `CommunityWelcomeBanner.tsx`**
- Card stilizat cu mesajul de bun venit
- Buton "Edit" vizibil doar pentru admini
- Dialog de editare cu textarea

### Pasul 2: Restrictie creare grupuri pe tier

**Modificari in `BrotherhoodTribes.tsx` si/sau noul `SkoolGroupsSection.tsx`:**
- Verificam `subscriptionTier` din `AuthContext`
- Daca `elite` → poate crea grupuri nelimitat
- Daca `pro` → poate crea maxim 2 grupuri
- Daca `basic` sau inferior → butonul "Create Group" este dezactivat cu mesaj de upgrade
- Afisam un tooltip sau badge "PRO" / "ELITE" langa butonul de creare

### Pasul 3: Pagina individuala de Group (Skool-style)

**Ruta noua: `/groups/:groupId`**

Fiecare grup (tribe) are propria pagina cu:
- **Header:** Cover image + avatar + nume + descriere + numar membri + buton Join/Leave
- **Tabs interne:** Feed | Chat | Members | About
- **Feed:** Postari specifice grupului (filtrate pe `tribe_id`)
- **Chat:** Mesaje in timp real (refolosim `BrotherhoodChat` adaptat)
- **Members:** Lista membrilor grupului
- **About:** Descriere, reguli, owner info

**Componente noi:**
| Fisier | Descriere |
|--------|-----------|
| `src/pages/GroupPage.tsx` | Pagina principala a unui grup |
| `src/components/groups/GroupHeader.tsx` | Header cu cover, avatar, info, join/leave |
| `src/components/groups/GroupFeed.tsx` | Feed de postari filtrat pe tribe_id |
| `src/components/groups/GroupChat.tsx` | Chat in timp real adaptat pentru grup |
| `src/components/groups/GroupMembers.tsx` | Lista membrilor cu roluri |
| `src/components/groups/GroupAbout.tsx` | Informatii despre grup |

### Pasul 4: Sectiune "Groups" in Community sau SkoolNavBar

Doua optiuni (implementam prima):

**Optiunea A:** Adaugam un tab "Groups" in SkoolNavBar
- SkoolNavBar devine: Community | Classroom | Groups | Calendar | Members | Leaderboards
- Tab-ul Groups afiseaza: My Groups + Discover Groups + Create Group button

**Fisiere noi:**
| Fisier | Descriere |
|--------|-----------|
| `src/components/programs/GroupsTab.tsx` | Tab principal cu My Groups + Discover + Create |
| `src/components/programs/SkoolGroupCard.tsx` | Card individual pentru un grup (cover, nume, membri, join) |
| `src/components/programs/CreateGroupDialog.tsx` | Dialog de creare grup cu validare tier |

### Pasul 5: Actualizare rute

**Fisier: `src/App.tsx`**
- Adaugam ruta `/groups/:groupId` catre `GroupPage.tsx`

---

## Structura Vizuala

### Groups Tab (in Programs)
```text
┌──────────────────────────────────────────────────────────────────┐
│  Community | Classroom | Groups | Calendar | Members | Leaders  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [+ Create Group] ← doar PRO/ELITE                              │
│                                                                  │
│  ── My Groups ──────────────────────────────────────────────     │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ [Cover Image]   │  │ [Cover Image]   │                       │
│  │ Morning Warriors │  │ Business RO     │                       │
│  │ 24 members      │  │ 156 members     │                       │
│  │ [Open]          │  │ [Open]          │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
│  ── Discover Groups ────────────────────────────────────────     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐    │
│  │ [Cover Image]   │  │ [Cover Image]   │  │ [Cover]      │    │
│  │ Fitness Warriors │  │ Mindset Masters │  │ Book Club    │    │
│  │ 89 members      │  │ 45 members      │  │ 12 members   │    │
│  │ [Join]          │  │ [Join]          │  │ [Join]       │    │
│  └─────────────────┘  └─────────────────┘  └──────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Group Page (individual)
```text
┌──────────────────────────────────────────────────────────────────┐
│  [← Back]                                         [Settings]    │
├──────────────────────────────────────────────────────────────────┤
│  [Cover Image ─────────────────────────────────────────────]     │
│  [Avatar] Morning Warriors                                       │
│  Comunitate pentru antreprenorii matinali    156 Members         │
│  [Leave Group]                                                   │
├──────────────────────────────────────────────────────────────────┤
│  Feed  │  Chat  │  Members  │  About                            │
├──────────────────────────────────────────────────────────────────┤
│  [Write something...]            │  [Group Info Sidebar]         │
│                                  │  Owner: John Doe              │
│  [Post 1...]                     │  Created: Jan 2026            │
│  [Post 2...]                     │  156 Members, 3 Online        │
│  [Post 3...]                     │                               │
└──────────────────────────────────────────────────────────────────┘
```

### Community Welcome Banner
```text
┌──────────────────────────────────────────────────────────────────┐
│  📌 Welcome Message                                    [Edit ✏️] │
│                                                                  │
│  "Bine ai venit in comunitatea Warrior OS! Aici ne ajutam       │
│   reciproc sa crestem. Reguli: 1) Fii respectuos 2) Share wins  │
│   3) Ask for help when needed."                                  │
│                                                                  │
│  — Admin · Last updated 2d ago                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Detalii Tehnice

### Migrare SQL

```sql
-- Community settings table for welcome message
CREATE TABLE public.community_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read community settings"
  ON public.community_settings FOR SELECT
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can manage community settings"
  ON public.community_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default welcome message
INSERT INTO public.community_settings (setting_key, setting_value)
VALUES ('welcome_message', 'Bine ai venit in comunitatea Warrior OS! 🎯 Aici ne ajutam reciproc sa crestem.');
```

### Verificare Tier pentru Creare Grup

```typescript
// In CreateGroupDialog.tsx
const { subscriptionTier } = useAuth();

const canCreateGroup = () => {
  if (subscriptionTier === 'elite') return true;
  if (subscriptionTier === 'pro') {
    // Check how many groups user already owns
    const ownedGroups = myTribes.filter(t => t.created_by === user?.id);
    return ownedGroups.length < 2;
  }
  return false;
};
```

### GroupPage.tsx - Ruta noua

Foloseste `ProgramsLayout` fara SkoolNavBar (showNavBar=false), cu propriile taburi interne (Feed/Chat/Members/About).

### SkoolNavBar - Actualizare

Adaugam tab-ul "Groups" intre Classroom si Calendar:
```typescript
const tabs = [
  { id: 'community', ... },
  { id: 'classroom', ... },
  { id: 'groups', labelEn: 'Groups', labelRo: 'Grupuri', icon: Users2 },
  { id: 'calendar', ... },
  { id: 'members', ... },
  { id: 'leaderboards', ... },
];
```

---

## Fisiere de creat (total: 9)

| Fisier | Descriere |
|--------|-----------|
| `src/components/programs/CommunityWelcomeBanner.tsx` | Banner welcome message editabil de admin |
| `src/components/programs/GroupsTab.tsx` | Tab principal cu My Groups + Discover |
| `src/components/programs/SkoolGroupCard.tsx` | Card individual grup |
| `src/components/programs/CreateGroupDialog.tsx` | Dialog creare grup cu validare tier |
| `src/pages/GroupPage.tsx` | Pagina individuala grup cu tabs |
| `src/components/groups/GroupHeader.tsx` | Header grup cu cover + info |
| `src/components/groups/GroupFeed.tsx` | Feed postari pe tribe_id |
| `src/components/groups/GroupChat.tsx` | Chat realtime pe tribe |
| `src/components/groups/GroupMembers.tsx` | Lista membri grup |

## Fisiere de modificat (total: 4)

| Fisier | Modificare |
|--------|------------|
| `src/components/programs/SkoolNavBar.tsx` | Adaugare tab "Groups" |
| `src/components/programs/CommunityTab.tsx` | Adaugare CommunityWelcomeBanner sus |
| `src/pages/Programs.tsx` | Adaugare case "groups" in renderTabContent |
| `src/App.tsx` | Adaugare ruta `/groups/:groupId` |

---

## Compatibilitate

- Tabelele `tribes`, `tribe_members`, `wall_posts`, `brotherhood_messages` sunt refolosite complet
- Hook-ul `useBrotherhood()` acopera deja toate operatiile CRUD necesare
- `subscriptionTier` din `AuthContext` permite verificarea tier-ului fara query-uri suplimentare
- Functia `has_role()` din DB permite verificarea rolului admin pentru welcome message
- Realtime pe `wall_posts` si `brotherhood_messages` deja configurat
