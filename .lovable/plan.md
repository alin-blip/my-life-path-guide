
# Restructurare Acces pe Tier-uri: FREE vede, PRO deblocheaza, ELITE = totul

## Situatia actuala vs. Ce vrem

| Feature | Acum | Nou |
|---|---|---|
| Challenge | FREE | FREE (ramane) |
| Comunitate (feed) | BASIC | FREE |
| Mesaje | BASIC | FREE |
| Programs page (vizualizare) | BASIC | FREE (vezi card-urile, dar locked) |
| Personal Power, Ultimate YOU (continut) | BASIC (gratuit) | PRO (incluse gratuit in PRO) |
| Warrior Launch Accelerator | ELITE | ELITE (ramane) |

## Ce se schimba

### 1. ProtectedRoute.tsx - Adaugam rute in FREE tier

Adaugam `/programs`, `/messages`, si `/groups` in `FREE_TIER_ROUTES` pentru ca utilizatorii free sa poata vedea comunitatea, programele si mesajele.

Rute mutate in FREE:
- `/programs`
- `/messages`
- `/groups`

### 2. ProgramCard.tsx - Lock vizual pe programe pentru non-PRO

Programele Personal Power si Ultimate YOU vor afisa un badge "PRO" si un lacat vizual pentru utilizatorii care nu au PRO/ELITE. La click, in loc sa navigheze la curs, vor fi redirectionati la `/pricing`.

Modificari:
- Adaugam un nou tip de badge: `'PRO'`
- Card-ul primeste un prop `requiredTier` (optional)
- Daca user-ul nu are tier-ul necesar, card-ul afiseaza Lock icon si redirectioneaza la pricing

### 3. Programs.tsx - Marcam programele cu tier-ul necesar

Actualizare program cards:
- Challenge: ramane `isFree: true`, badge `FREE`
- Personal Power: `badge: 'PRO'`, `requiredTier: 'pro'` (nu mai e `isFree`)
- Ultimate YOU: `badge: 'PRO'`, `requiredTier: 'pro'` (nu mai e `isFree`)
- Warrior Accelerator: ramane `badge: 'PREMIUM'`, `requiredTier: 'elite'`

### 4. ProgramCard - Logica de navigare conditionata

La click pe un program locked:
- Daca user-ul nu are tier-ul necesar -> redirect la `/pricing` cu `reason` relevant
- Daca are -> navigare normala la curs

## Detalii tehnice

### ProgramCardProps - Proprietati noi

```typescript
interface ProgramCardProps {
  // ... existente
  requiredTier?: 'free' | 'basic' | 'pro' | 'elite';
  badge?: 'FREE' | 'PREMIUM' | 'NEW' | 'LIVE' | 'PRO'; // adaugam PRO
}
```

### ProgramCard.tsx - Logica de access check

Componenta va importa `useAuth` pentru a verifica `subscriptionTier` si va decide:
- Daca tier-ul user-ului >= requiredTier -> navigare normala
- Altfel -> `navigate('/pricing', { state: { reason: 'pro_required' } })`

Visual: card-urile locked vor avea un overlay subtil cu Lock icon si badge-ul tier-ului necesar.

### ProtectedRoute.tsx - FREE_TIER_ROUTES update

```text
FREE_TIER_ROUTES adauga:
  '/programs'
  '/messages'  
  '/groups'
```

### ProgramCard badge PRO styling

```text
case 'PRO':
  return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400';
```

## Fisiere modificate

| Fisier | Modificare |
|---|---|
| `src/components/ProtectedRoute.tsx` | Adaugam `/programs`, `/messages`, `/groups` in FREE_TIER_ROUTES |
| `src/components/programs/ProgramCard.tsx` | Adaugam `requiredTier` prop, badge `PRO`, logica lock/navigate |
| `src/pages/Programs.tsx` | Actualizare program data: Personal Power si Ultimate YOU devin `requiredTier: 'pro'` |
