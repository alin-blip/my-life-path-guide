
# Plan: Fixare Emailuri Challenge - Domeniu warriorsos.com

## Problema Principală

Emailurile challenge **nu se trimit** sau **ajung în spam** din cauza utilizării unor adrese `from` care nu sunt de pe domeniul verificat în Resend (`warriorsos.com`).

## Funcții de Corectat

### 1. send-challenge-reminder/index.ts
**Linia 14** - Schimbă adresa `from`:
```typescript
// DE LA:
from: "Have It All <onboarding@resend.dev>",

// LA:
from: "WarriorOS <noreply@warriorsos.com>",
```

**Linia 75** - Actualizează URL-ul:
```typescript
// DE LA:
const baseUrl = Deno.env.get("SITE_URL") || "https://haveitall.lovable.app";

// LA:
const baseUrl = "https://warriorsos.com";
```

### 2. send-challenge-day7-upgrade/index.ts
**Liniile 58 și 136** - Schimbă adresa `from`:
```typescript
// DE LA:
from: "Warriors <noreply@mylifepathguide.com>",

// LA:
from: "WarriorOS <noreply@warriorsos.com>",
```

**Linia 170** - Actualizează URL-ul aplicației:
```typescript
// DE LA:
const appUrl = "https://my-life-path-guide.lovable.app";

// LA:
const appUrl = "https://warriorsos.com";
```

### 3. send-challenge-recovery/index.ts
**Linia 14** - Schimbă adresa `from`:
```typescript
// DE LA:
from: "MyLifePathGuide <noreply@my-life-path-guide.lovable.app>",

// LA:
from: "WarriorOS <noreply@warriorsos.com>",
```

**Actualizează toate URL-urile** din template-uri (linii 50, 69, 84, 97, 111, 125, 143):
```typescript
// DE LA:
"https://my-life-path-guide.lovable.app/challenge/..."

// LA:
"https://warriorsos.com/challenge/..."
```

### 4. AuthContext.tsx - Trimitere Email Welcome pentru OAuth

Adaugă invocarea emailului de bun venit pentru utilizatorii OAuth:
```typescript
// După salvarea lead-ului OAuth (linia ~90)
// Trimite welcome email pentru OAuth users
supabase.functions.invoke('send-challenge-welcome', {
  body: {
    email: session.user.email,
    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
    userId: session.user.id,
    language: 'ro' // detectează din metadata sau default
  }
}).catch(err => console.warn('[Challenge] Welcome email failed:', err));
```

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|-----------|
| `supabase/functions/send-challenge-reminder/index.ts` | from address + baseUrl |
| `supabase/functions/send-challenge-day7-upgrade/index.ts` | from address (2 locuri) + appUrl |
| `supabase/functions/send-challenge-recovery/index.ts` | from address + toate URL-urile |
| `src/context/AuthContext.tsx` | Adaugă send-challenge-welcome pentru OAuth |

---

## Rezultat Așteptat

După implementare:
- ✅ Toate emailurile challenge se trimit de pe `noreply@warriorsos.com`
- ✅ Emailurile ajung în inbox (nu spam) pentru că domeniul e verificat
- ✅ Utilizatorii OAuth primesc emailul de bun venit
- ✅ Toate link-urile din emailuri duc la `warriorsos.com`

---

## Timp Estimat
~15 minute implementare + redeploy funcții
