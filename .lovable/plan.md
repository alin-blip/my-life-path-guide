
# Plan: Finalizare Modificări UI - Challenge Freemium + Comentarii

## Ce Lipsește

Am modificat hook-urile și componentele de suport, dar **nu am aplicat modificările vizuale** în paginile principale:

| Fișier | Ce trebuie adăugat |
|--------|-------------------|
| `ChallengeDay.tsx` | Verificare acces Day 3+, Buton "Postează Declarația", ref pentru comentarii |
| `Day1VisionDeclaration.tsx` | Prop-uri noi + Buton "Distribuie declarația în comunitate" |
| `Challenge7ZileLanding.tsx` | Headline nou "2 Zile Gratuit", Badge-uri free/premium pe zile |

---

## Modificări de Implementat

### 1. `Day1VisionDeclaration.tsx` - Buton "Postează Declarația"

**Adăugare prop-uri noi:**
```typescript
interface Day1VisionDeclarationProps {
  // ... existing
  onPostToComments?: (declaration: string) => Promise<void>;
  declarationSaved?: boolean;
}
```

**Adăugare buton după salvare:**
- Apare vizibil doar după ce declarația a fost salvată
- Click -> postează declarația în comentarii
- Stil: border-amber-500, text-amber-600

### 2. `ChallengeDay.tsx` - Verificare Acces + Ref Comentarii

**Import nou:**
```typescript
import { ChallengeUpgradeGate } from '@/components/challenge/ChallengeUpgradeGate';
```

**State nou:**
```typescript
const [showUpgradeModal, setShowUpgradeModal] = useState(false);
const [declarationSaved, setDeclarationSaved] = useState(false);
const commentsRef = useRef<ChallengeCommentsRef>(null);
```

**Verificare acces la Day 3+:**
```typescript
useEffect(() => {
  if (dayNumber >= 3 && isAuthenticated) {
    if (!hasPremiumAccess) {
      setShowUpgradeModal(true);
    }
  }
}, [dayNumber, isAuthenticated, hasPremiumAccess]);
```

**Render Upgrade Modal:**
```jsx
{showUpgradeModal && (
  <ChallengeUpgradeGate 
    onClose={() => navigate('/challenge')} 
  />
)}
```

**Conectare declarație -> comentarii:**
```jsx
<Day1VisionDeclaration
  ...
  onPostToComments={async (declaration) => {
    const success = await commentsRef.current?.postComment(declaration);
    if (success) {
      toast.success('Declarația ta a fost distribuită! 🎉');
    }
  }}
  declarationSaved={declarationSaved}
/>

// După salvare:
onComplete={async (finalVisionData) => {
  ...
  setDeclarationSaved(true);
  ...
}}
```

### 3. `Challenge7ZileLanding.tsx` - Copy Nou Freemium

**Badge actualizat (linia 302-305):**
```jsx
<Badge className="mb-4 bg-primary/10 text-primary border-primary/30 px-4 py-1.5">
  <Gift className="h-4 w-4 mr-1.5 inline" />
  {language === 'en' 
    ? '2 DAYS FREE • 5 DAYS TRIAL' 
    : '2 ZILE GRATUIT • 5 ZILE TRIAL'}
</Badge>
```

**Headline actualizat (linia 307-310):**
```jsx
<h1 className="...">
  {language === 'en' 
    ? 'Start Your FREE 2-Day Challenge' 
    : 'Începe Challenge-ul GRATUIT de 2 Zile'}
</h1>
```

**Sub-headline actualizat (linia 313-316):**
```jsx
<p className="...">
  {language === 'en'
    ? 'After 2 days, unlock 5 extra days with FREE trial + 50% Early Bird discount!'
    : 'După 2 zile, deblochează 5 zile extra cu trial GRATUIT + Early Bird 50%!'}
</p>
```

**Preview zile - badge-uri diferențiate:**
În array-ul `challengeDays` (liniile 163-208), adăug proprietate `isFree`:
```typescript
challengeDays.map(day => ({
  ...day,
  isFree: day.day <= 2,
  badge: day.day <= 2 
    ? { text: 'GRATUIT', color: 'bg-green-500' }
    : { text: 'TRIAL 5 ZILE', color: 'bg-amber-500', icon: Crown }
}))
```

---

## Fișiere de Modificat

| Fișier | Schimbări |
|--------|-----------|
| `src/components/challenge/day1/Day1VisionDeclaration.tsx` | +2 props, +buton "Distribuie" |
| `src/pages/ChallengeDay.tsx` | +import ChallengeUpgradeGate, +state, +useEffect verificare, +render modal, +ref comments, +callback postare |
| `src/pages/Challenge7ZileLanding.tsx` | Badge nou, headline nou, sub-headline nou, badge-uri pe zile |

---

## Estimare Timp

| Task | Timp |
|------|------|
| Modificare `Day1VisionDeclaration.tsx` | 10 min |
| Modificare `ChallengeDay.tsx` (verificare + ref) | 15 min |
| Modificare `Challenge7ZileLanding.tsx` (copy + badge-uri) | 15 min |
| **Total** | **~40 min** |
