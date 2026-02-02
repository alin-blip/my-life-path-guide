
# Audit Complet Domino Door - Stare Lansare

## REZUMAT EXECUTIV

| Categorie | Status | Detalii |
|-----------|--------|---------|
| **Salvare per User** | ✅ FUNCȚIONAL | RLS activ pe toate tabelele, `auth.uid() = user_id` |
| **Drag & Drop Idei → Sarcini** | ✅ FUNCȚIONAL | Native drag implementat cu `application/json` |
| **Admin Impersonation** | ⚠️ PARȚIAL | Edge function există, dar NU schimbă sesiunea efectiv |
| **Callback-uri HotList** | ✅ IMPLEMENTAT | `onMoveToHit` și `onMoveToDo` conectate |
| **Securitate RLS** | ✅ ACTIV | Toate tabelele critice au RLS enabled |

---

## 1. SALVARE DATE PER USER

### ✅ RLS Policies Active

Toate tabelele critice au Row Level Security activat:

| Tabel | RLS | Policy |
|-------|-----|--------|
| `user_tasks` | ✅ ON | `auth.uid() = user_id` - Users can manage their own tasks |
| `ideas_bank` | ✅ ON | `auth.uid() = user_id` - SELECT/INSERT/UPDATE/DELETE per user |
| `weekly_planning` | ✅ ON | `auth.uid() = user_id` - Users manage their own planning |
| `user_preferences` | ✅ ON | RLS activ |
| `leaderboard_profiles` | ✅ ON | RLS activ |

### ✅ Date Izolate Corect

Din baza de date:
- **9 utilizatori unici** au task-uri în sistemul Door
- **user_id** este filtrat corect în toate query-urile
- Fiecare utilizator vede **DOAR** propriile task-uri și idei

### Exemplu query care izolează corect:
```sql
SELECT * FROM user_tasks WHERE user_id = auth.uid()
```

---

## 2. FUNCȚIONALITATE IDEI → SARCINI

### ✅ Drag & Drop Cross-Library

**Implementat corect în `HotList.tsx` (liniile 586-595):**

```tsx
onDragStart={(e) => {
  e.dataTransfer.setData('application/json', JSON.stringify({
    type: 'idea-bank-item',
    id: idea.id,
    text: idea.text,
    priority: idea.priority,
    category: idea.category
  }));
  e.dataTransfer.effectAllowed = 'copyMove';
}}
```

**Handler în `useDoorDrag.tsx` (liniile 139-173):**
- Detectează `type: 'idea-bank-item'` din dataTransfer
- Mapează prioritatea Eisenhower corect (4→urgent-important, 3→important, etc.)
- Adaugă în HIT sau DO list conform `activeList`

### ✅ Callback-uri Conectate

Hook-ul `useIdeaToTaskBridge` este implementat și conectat în:
- `WeeklyTab.tsx`
- `SimplifiedDoorContent.tsx`  
- `WeeklySection.tsx`

---

## 3. ADMIN PREVIEW CLIENT - ⚠️ INCOMPLET

### Ce există:

1. **Edge Function `admin-impersonate`** - verifică rol admin via `has_role()` RPC
2. **Tabel `admin_impersonation_log`** - loghează toate sesiunile
3. **Buton "View As User"** în CRM ContactProfile360

### Ce NU funcționează:

**Problema Majoră:** Edge function-ul `admin-impersonate` **NU schimbă efectiv sesiunea utilizatorului**. 

Codul actual (liniile 148-199 din ContactProfile360.tsx):

```tsx
const startViewAs = async () => {
  const { data, error } = await supabase.functions.invoke('admin-impersonate', {
    body: { targetUserId: contact.user_id }
  });
  
  // Doar salvează în localStorage - NU SCHIMBĂ AUTH!
  localStorage.setItem('admin_impersonation', JSON.stringify({
    adminId: user?.id,
    targetUserId: contact.user_id,
    ...
  }));
  
  // Deschide fereastră nouă, dar tot cu sesiunea ADMIN-ului
  window.open('/', '_blank');
};
```

**Rezultat:** Admin-ul deschide o fereastră nouă, dar vede tot cu propria sesiune, NU cu cea a clientului.

### Opțiuni de Fix:

**Opțiunea A - Token Impersonation (Recomandat pentru producție)**
- Edge function generează un JWT token pentru target user
- Frontend-ul folosește acest token pentru sesiunea impersonată
- Necesită `supabase.auth.admin.generateLink()` sau similar

**Opțiunea B - Read-Only Preview Mode**
- Admin-ul vede datele clientului într-un view dedicat
- NU schimbă sesiunea, doar afișează informațiile
- Mai simplu de implementat, mai sigur

---

## 4. STATISTICI ACTUALE

### Users cu activitate în Door:

| User ID | HIT Tasks | DO Tasks | Week-uri Active |
|---------|-----------|----------|-----------------|
| 74f5b904... (tu) | 65+ tasks | 7 tasks | 6 week-uri |
| 3132d53a... | 20 tasks | 0 | 1 week |
| 218ea8c3... | 0 | 9 (door) | 1 week |
| Alți 6 users | 1-2 tasks | 0 | 1 week |

### Ideas Bank:
- **4 idei totale** (1 utilizator)
- 3 noi, 1 arhivată
- Sistemul de clasificare Eisenhower funcțional

---

## 5. PROBLEME DE SECURITATE MINORE

### ⚠️ Warnings (nu critice):

1. **Extension in Public** - Extensie instalată în schema `public` 
   - Risc: Low
   - Fix: Mutare în schema separată

2. **Leaked Password Protection Disabled**
   - Risc: Medium
   - Fix: Activare în Supabase Auth Settings

### ✅ Ce e OK:
- Admin role-uri în tabel separat (`user_roles`)
- Funcție `has_role()` cu SECURITY DEFINER
- RLS activ pe toate tabelele sensibile

---

## 6. RECOMANDĂRI PENTRU LANSARE

### Critice (înainte de lansare):

1. **FIX Admin Impersonation** - Implementează Read-Only Preview Mode:
   - Creează un `AdminClientPreview.tsx` care încarcă datele clientului
   - Afișează task-uri, idei, progres într-un view dedicat
   - NU încercă să schimbe sesiunea

### Recomandate:

2. **Activează Leaked Password Protection** în Supabase Auth

3. **Curățare date vechi:**
```sql
DELETE FROM user_tasks 
WHERE week_key NOT LIKE 'door-week-%' 
  AND task_type IN ('hit', 'do', 'hot');
```

### Nice to have:

4. **Audit logging** - Loguri când admin-ul vizualizează date client
5. **Rate limiting** pe API-uri sensibile

---

## CONCLUZIE

**Sistemul Domino Door este FUNCȚIONAL pentru lansare** cu următoarele condiții:
- ✅ Salvarea per user funcționează corect
- ✅ Drag & Drop Idei → Sarcini implementat
- ⚠️ Admin Preview necesită un fix pentru a fi utilizabil

Dacă funcția de impersonation nu este critică la lansare, poți proceda. Altfel, implementează Read-Only Preview Mode care e mai sigur și mai simplu.
