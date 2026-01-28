
# Plan Complet: Challenge Freemium + Îmbunătățiri Comentarii

## VIZIUNE GENERALĂ

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                           NOUL FLUX UTILIZATOR                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Landing Page] ──► [Signup] ──► [Day 1] ──► [Day 2]                        │
│        │                            │            │                           │
│        │                 ┌──────────┴──────────┐ │                          │
│        │                 │ Comentarii cu:      │ │                          │
│        │                 │ • Nume real         │ │                          │
│        │                 │ • Buton "Postează   │ │                          │
│        │                 │   Declarația"       │ │                          │
│        │                 └─────────────────────┘ │                          │
│        │                                         ▼                           │
│        │                         GRATUIT    ┌────────────────┐              │
│        │                                    │ UPGRADE GATE   │              │
│        │                                    │ • Basic €49    │              │
│        │                                    │ • Pro €0 (5d)  │              │
│        │                                    │ • Elite €297   │              │
│        │                                    │ Early Bird 50% │              │
│        │                                    └───────┬────────┘              │
│        │                                            ▼                        │
│        │                                    [Day 3] ──► [Day 7]             │
│        │                                         PREMIUM                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## PARTEA A: CHALLENGE FREEMIUM (2 Zile Gratuit + 5 Zile Trial)

### A1. Modificare `useChallengeProgress.tsx`

Actualizăm logica `isDayUnlocked` pentru a ține cont de modelul freemium:

```typescript
// Logica nouă pentru acces zile
const isDayUnlocked = (dayNumber: number) => {
  // Zilele 1-2 sunt GRATUIT pentru toți utilizatorii autentificați
  if (dayNumber <= 2) {
    return isAuthenticated;
  }
  
  // Zilele 3-7 necesită abonament activ SAU trial activ
  if (dayNumber >= 3 && dayNumber <= 7) {
    return subscribed || subscriptionStatus === 'trialing';
  }
  
  // Fallback: verifică progresul (ziua anterioară completată)
  if (dayNumber === 1) return true;
  return progress.some(d => d.day_number === dayNumber - 1 && d.completed);
};
```

### A2. Creare `ChallengeUpgradeGate.tsx`

Componenta care blochează accesul la Day 3+ și afișează opțiunile de abonament:

**Structură:**
- Card cu gradient amber/orange
- Headline: "Deblochează Zilele 3-7"
- 3 opțiuni de abonament (Basic/Pro/Elite)
- Badge "5 ZILE TRIAL GRATUIT"
- Early Bird countdown (50% reducere)
- Buton CTA pentru fiecare plan

### A3. Modificare `Challenge.tsx`

**Schimbări:**
1. **Separator vizual** între Ziua 2 și Ziua 3
2. **Badge-uri diferențiate:**
   - Zilele 1-2: Badge verde "GRATUIT"
   - Zilele 3-7: Badge amber "PREMIUM" sau "TRIAL" (dacă are trial activ)
3. **Card Upgrade** între Day 2 și Day 3 pentru utilizatorii fără abonament
4. **Early Bird countdown** vizibil în card

### A4. Modificare `ChallengeDay.tsx`

**Verificare acces la încărcare:**
```typescript
// La începutul componentei
useEffect(() => {
  if (dayNumber >= 3) {
    if (!subscribed && subscriptionStatus !== 'trialing') {
      // Afișează modal de upgrade
      setShowUpgradeModal(true);
    }
  }
}, [dayNumber, subscribed, subscriptionStatus]);
```

### A5. Actualizare `create-checkout/index.ts`

**Trial 5 zile pentru toate planurile:**

```typescript
case "basic":
  unitAmount = currency === "ron" ? 24900 : 4900;
  productName = "WarriorOS Basic (5-Day Trial)";
  tier = "basic";
  trialDays = 5;  // NOU: adăugat trial
  break;
  
case "pro":
  unitAmount = currency === "ron" ? 49000 : 9700;
  productName = "WarriorOS Pro (5-Day Trial)";
  tier = "pro";
  trialDays = 5;  // MODIFICAT: era 7
  break;
  
case "elite":
  unitAmount = currency === "ron" ? 149000 : 29700;
  productName = "WarriorOS Elite (5-Day Trial)";
  tier = "elite";
  trialDays = 5;  // NOU: adăugat trial
  break;
```

### A6. Actualizare `pricing.ts` și `MembershipUpsellCards.tsx`

**pricing.ts:**
- Adăugare `trialDays: 5` pentru planurile basic, pro, elite

**MembershipUpsellCards.tsx:**
- Actualizare text de la "7 zile trial" la "5 zile trial"
- Toate planurile vor afișa "5 zile trial gratuit"

### A7. Actualizare `Challenge7ZileLanding.tsx`

**Headline nou:**
```
"Începe Challenge-ul GRATUIT de 2 Zile"
```

**Sub-headline:**
```
"După 2 zile, deblochează 5 zile extra cu trial GRATUIT + Early Bird 50%"
```

**Badge actualizat:**
```
"2 ZILE GRATUIT • 5 ZILE TRIAL"
```

**Preview-ul zilelor:**
- Zilele 1-2: Badge verde "GRATUIT"
- Zilele 3-7: Badge amber "TRIAL 5 ZILE" cu Crown icon

---

## PARTEA B: ÎMBUNĂTĂȚIRI SISTEM COMENTARII

### B1. Modificare `useModuleComments.tsx` - Salvare `author_name`

În funcția `addComment`, salvăm numele real al utilizatorului:

```typescript
const addComment = useCallback(async (content: string, parentId?: string, videoUrl?: string) => {
  if (!user) {
    toast.error('Trebuie să fii autentificat pentru a lăsa un comentariu');
    return false;
  }

  // Extrage numele real din user metadata
  const authorName = user.user_metadata?.full_name 
    || user.user_metadata?.name
    || user.email?.split('@')[0] 
    || 'Utilizator';

  try {
    const { data, error } = await supabase
      .from('warriors_way_comments')
      .insert({
        user_id: user.id,
        module_id: moduleId,
        content: content.trim(),
        parent_id: parentId || null,
        video_url: videoUrl || null,
        author_name: authorName  // ← ADĂUGAT
      })
      .select()
      .single();
    // ...
  }
}, [user, moduleId]);
```

### B2. Modificare `ModuleComments.tsx` - Afișare Nume Real

**Actualizare `renderComment`:**
```typescript
// Folosim display_name care vine din DB (author_name)
<span className={cn("font-medium", isReply ? "text-xs" : "text-sm")}>
  {comment.display_name || `Warrior ${comment.user_id.substring(0, 6)}`}
</span>
```

**Actualizare `getInitials`:**
```typescript
const getInitials = (displayName?: string, userId?: string) => {
  if (displayName && displayName.length > 0) {
    const parts = displayName.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }
  return userId?.substring(0, 2).toUpperCase() || 'U';
};
```

### B3. Modificare `Day1VisionDeclaration.tsx` - Buton "Postează Declarația"

Adăugăm un buton nou care permite postarea declarației în comentarii:

```typescript
interface Day1VisionDeclarationProps {
  visionData: VisionData;
  onVisionChange: (data: VisionData) => void;
  onComplete: (finalData: VisionData) => void;
  onPostToComments?: (declaration: string) => Promise<void>;  // NOU
  userName?: string;
  declarationSaved?: boolean;  // NOU - pentru a ști dacă a fost salvată
}

// După butonul principal "Salvează Declarația și Continuă":
{declarationSaved && visionData.vision_declaration && (
  <Button
    variant="outline"
    onClick={() => onPostToComments?.(visionData.vision_declaration!)}
    className="w-full mt-3 border-amber-500/50 text-amber-600 hover:bg-amber-50"
  >
    <MessageCircle className="h-4 w-4 mr-2" />
    Distribuie declarația în comunitate
  </Button>
)}
```

### B4. Modificare `ChallengeComments.tsx` - Expunere Metodă `postComment`

```typescript
export interface ChallengeCommentsRef {
  postComment: (content: string) => Promise<boolean>;
}

export const ChallengeComments = forwardRef<ChallengeCommentsRef, ChallengeCommentsProps>(
  ({ dayNumber }, ref) => {
    const moduleId = `challenge-day-${dayNumber}`;
    const { addComment } = useModuleComments(moduleId);
    
    useImperativeHandle(ref, () => ({
      postComment: async (content: string) => {
        return await addComment(content);
      }
    }));
    
    return (
      <div className="mt-6">
        <ModuleComments moduleId={moduleId} />
      </div>
    );
  }
);

ChallengeComments.displayName = 'ChallengeComments';
```

### B5. Modificare `ChallengeDay.tsx` - Conectare Ref și Callback

```typescript
// În componenta ChallengeDay
const commentsRef = useRef<ChallengeCommentsRef>(null);
const [declarationSaved, setDeclarationSaved] = useState(false);
const [declarationPosted, setDeclarationPosted] = useState(false);

// Funcție pentru postare declarație în comentarii
const handlePostDeclarationToComments = async (declaration: string) => {
  if (!commentsRef.current) return;
  
  const success = await commentsRef.current.postComment(declaration);
  if (success) {
    setDeclarationPosted(true);
    toast.success('Declarația ta a fost distribuită în comunitate! 🎉');
  }
};

// În JSX pentru Day 1:
<Day1VisionDeclaration
  visionData={visionData}
  onVisionChange={setVisionData}
  onComplete={(finalData) => {
    setDeclarationSaved(true);
    handleVisionComplete(finalData);
  }}
  onPostToComments={handlePostDeclarationToComments}
  declarationSaved={declarationSaved}
  userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
/>

// Secțiunea de comentarii cu ref:
<ChallengeComments ref={commentsRef} dayNumber={dayNumber} />
```

---

## FIȘIERE DE CREAT

| Fișier | Descriere |
|--------|-----------|
| `src/components/challenge/ChallengeUpgradeGate.tsx` | Modal/Card care blochează Day 3+ și afișează opțiuni abonament + Early Bird countdown |

---

## FIȘIERE DE MODIFICAT

| Fișier | Schimbări |
|--------|-----------|
| `src/hooks/useChallengeProgress.tsx` | Logică nouă `isDayUnlocked` pentru freemium (1-2 free, 3-7 premium) |
| `src/pages/Challenge.tsx` | Separator vizual, badge-uri diferențiate, Card Upgrade între Day 2 și Day 3 |
| `src/pages/ChallengeDay.tsx` | Verificare acces Day 3+, ref pentru comentarii, callback postare declarație |
| `src/pages/Challenge7ZileLanding.tsx` | Headline nou, badge "2 ZILE GRATUIT • 5 ZILE TRIAL", preview zilelor actualizat |
| `src/hooks/useModuleComments.tsx` | Salvare `author_name` la insert |
| `src/components/warriors-way/ModuleComments.tsx` | Afișare `display_name` real, actualizare `getInitials` |
| `src/components/challenge/day1/Day1VisionDeclaration.tsx` | Buton "Distribuie declarația în comunitate" |
| `src/components/challenge/ChallengeComments.tsx` | Export ref cu metodă `postComment` |
| `supabase/functions/create-checkout/index.ts` | Trial 5 zile pentru toate planurile (basic, pro, elite) |
| `src/data/pricing.ts` | Adăugare `trialDays: 5` pentru planurile lunare |
| `src/components/membership/MembershipUpsellCards.tsx` | Actualizare text trial "5 zile" și hasTrial pentru toate planurile |

---

## ESTIMARE TIMP IMPLEMENTARE

| Task | Timp |
|------|------|
| **PARTEA A: FREEMIUM** | |
| Creare `ChallengeUpgradeGate.tsx` | 20 min |
| Modificare `useChallengeProgress.tsx` | 10 min |
| Modificare `Challenge.tsx` (separator + upgrade card) | 30 min |
| Modificare `ChallengeDay.tsx` (verificare acces) | 15 min |
| Modificare `Challenge7ZileLanding.tsx` (copy nou) | 15 min |
| Modificare `create-checkout/index.ts` | 10 min |
| Modificare `pricing.ts` + `MembershipUpsellCards.tsx` | 10 min |
| **PARTEA B: COMENTARII** | |
| Modificare `useModuleComments.tsx` (author_name) | 5 min |
| Modificare `ModuleComments.tsx` (afișare nume) | 10 min |
| Modificare `Day1VisionDeclaration.tsx` (buton postare) | 10 min |
| Modificare `ChallengeComments.tsx` (ref export) | 10 min |
| Modificare `ChallengeDay.tsx` (conectare ref) | 10 min |
| **Testare și Deploy** | |
| Testare flux complet | 15 min |
| Deploy Edge Function | 5 min |
| **TOTAL** | **~2.5 ore** |

---

## BENEFICII FINALE

### Freemium:
- Utilizatorii experimentează valoare în primele 2 zile gratuit
- Friction redusă - nu cer plată înainte de a demonstra valoare
- Early Bird 50% + countdown creează urgență
- Trial 5 zile permit completarea întregului challenge
- Conversie optimizată - upgrade gate apare la momentul optim

### Comentarii:
- Numele real al utilizatorilor vizibil (nu "Warrior abc123")
- Declarația Napoleon Hill poate fi distribuită în comunitate
- Creează social proof și engagement
- Stilul consistent cu Warrior Launch Accelerator
