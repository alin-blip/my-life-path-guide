
# Plan: Integrare Fluid Business Wizard → Domino Door AI Planning

## Problema Curentă

Când finalizezi Business Wizard anual și selectezi "Obiectiv Masiv" (Domino Door):
1. ❌ Apare un formular static care cere introducerea manuală a 4 chei
2. ❌ După salvare, nu se deschide AI Planning-ul Domino Door
3. ❌ Utilizatorul trebuie să meargă manual pe pagina Door și să apese "AI Planning"

## Soluția Propusă

Un singur flux fluid: **Wizard → Salvare minimă → AI Planning pornește automat**

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXUL ACTUAL (FRAGMENTAT)                   │
├─────────────────────────────────────────────────────────────────┤
│ 1. Wizard: Anual → 90 zile → Lunar → Week 1 action              │
│ 2. Dialog: "Cum salvezi?" → Selectezi "Massive"                 │
│ 3. Formular static: Introduci manual 4 chei + zile (GREOI)      │
│ 4. Salvare → Toast "Gata!" → Modal se închide                   │
│ 5. BLOCARE: Utilizatorul nu știe că trebuie să meargă pe /door  │
└─────────────────────────────────────────────────────────────────┘

                              ↓ DEVINE ↓

┌─────────────────────────────────────────────────────────────────┐
│                    FLUXUL NOU (FLUID)                           │
├─────────────────────────────────────────────────────────────────┤
│ 1. Wizard: Anual → 90 zile → Lunar → Week 1 action              │
│ 2. Dialog: "Cum salvezi?" → Selectezi "Massive"                 │
│ 3. FĂRĂ formular static - direct salvare structură minimă       │
│ 4. → Se deschide DoorPlanningModal cu context din wizard        │
│ 5. AI ghidează: 4 chei + detalii + pași zilnici (O ÎNTREBARE)   │
│ 6. La final AI face save_planning → Totul gata în one-go!       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|-----------|
| `src/components/goal-wizard/GoalWizardModal.tsx` | Adaugă state pentru a deschide DoorPlanningModal după save masiv |
| `src/components/goal-wizard/ProjectSelectionDialog.tsx` | Elimină formularul static de chei pentru "massive" - doar salvează titlu |
| `src/components/door/DoorPlanningModal.tsx` | Acceptă context din wizard (domino title, week goal, category) |
| `supabase/functions/door-ai-planning/index.ts` | Adaugă mod `wizard` care știe context-ul deja |

---

## Detalii Tehnice

### 1. GoalWizardModal.tsx - Adaugă Stare AI Planning

```typescript
// State nou pentru a controla deschiderea AI Planning
const [showDoorAIPlanning, setShowDoorAIPlanning] = useState(false);
const [aiPlanningContext, setAIPlanningContext] = useState<{
  dominoTitle: string;
  weekGoal: string;
  category: string;
} | null>(null);

// În executeProjectSave, pentru saveType === 'massive':
// 1. NU mai cerem cheile în formular
// 2. Salvăm doar structura minimă (domino_title + category)
// 3. Setăm context și deschidem AI Planning

if (selection.saveType === 'massive') {
  // Salvează structură minimă
  await supabase.from('weekly_planning').upsert({
    user_id: userId,
    week_key: weekKey,
    category: category,
    domino_title: project.milestones.weekOne || project.name,
    week_goal: project.name,
    key_points: [] // Gol - AI-ul le va completa
  });
  
  // Pregătește context pentru AI Planning
  setAIPlanningContext({
    dominoTitle: project.milestones.weekOne || project.name,
    weekGoal: project.name,
    category: category
  });
  setShowDoorAIPlanning(true);
}

// La finalul componentei, randăm DoorPlanningModal:
{showDoorAIPlanning && aiPlanningContext && (
  <DoorPlanningModal
    isOpen={showDoorAIPlanning}
    onClose={() => {
      setShowDoorAIPlanning(false);
      onComplete?.();
      onClose();
    }}
    onPlanningComplete={() => {
      setShowDoorAIPlanning(false);
      onComplete?.();
      onClose();
    }}
    wizardContext={aiPlanningContext}
  />
)}
```

### 2. ProjectSelectionDialog.tsx - Simplificare UI

Pentru `saveType === 'massive'`:
- ❌ Elimină secțiunea expandabilă cu input-uri pentru 4 chei
- ✅ Afișează doar un mesaj explicativ: "AI-ul te va ghida să definești cheile pas cu pas"

```tsx
{selection.saveType === 'massive' && (
  <div className="border-t bg-muted/30 p-4">
    <div className="flex items-center gap-2 text-primary">
      <Sparkles className="w-4 h-4" />
      <p className="text-sm font-medium">
        {language === 'en' 
          ? 'AI will guide you step-by-step to define the 4 keys'
          : 'AI-ul te va ghida pas cu pas să definești cele 4 chei'}
      </p>
    </div>
    <p className="text-xs text-muted-foreground mt-2">
      {language === 'en'
        ? 'Each key will have objectives, steps, and daily assignments'
        : 'Fiecare cheie va avea obiective, pași și alocări pe zile'}
    </p>
  </div>
)}
```

### 3. DoorPlanningModal.tsx - Acceptă Context din Wizard

```typescript
interface DoorPlanningModalProps {
  // ... existing props
  wizardContext?: {
    dominoTitle: string;
    weekGoal: string;
    category: string;
  };
}

// Dacă wizardContext există, folosește-l pentru a seta domino title și skip welcome
useEffect(() => {
  if (wizardContext && draftLoaded && messages.length === 0) {
    // Start cu context pregătit
    startConversationWithContext(wizardContext);
  }
}, [wizardContext, draftLoaded]);

const startConversationWithContext = async (ctx: typeof wizardContext) => {
  const initialMessage = `Vreau să planific cheile pentru obiectivul masiv: "${ctx.dominoTitle}". Obiectivul săptămânii este: "${ctx.weekGoal}".`;
  // Trimite direct la AI cu modul 'wizard'
  await streamChat({
    mode: 'wizard', // Nou mod
    wizardContext: ctx,
    messages: [{ role: 'user', content: initialMessage }]
  });
};
```

### 4. door-ai-planning Edge Function - Mod Wizard

```typescript
// Adaugă nou mod 'wizard' care știe context-ul
interface PlanningRequest {
  mode: 'review' | 'new' | 'wizard';
  wizardContext?: {
    dominoTitle: string;
    weekGoal: string;
    category: string;
  };
  // ... existing
}

const WIZARD_SYSTEM_PROMPT = `Ești un coach de planificare săptămânală. Utilizatorul a venit din Goal Wizard cu un obiectiv masiv deja definit.

CONTEXT PRE-SETAT:
- Domino Door Title: [Va fi injectat]
- Obiectivul săptămânii: [Va fi injectat]

🎯 MISIUNEA TA: Ghidează utilizatorul să definească 4 CHEI pentru acest obiectiv.

📋 FLOW PENTRU FIECARE CHEIE (1→4):

Q1: "Care este Cheia [N] care te va duce spre [DOMINO TITLE]?" → așteaptă
Q2: "De ce e important acest lucru?" → așteaptă
Q3: "Ce rezultat pozitiv ai dacă reușești?" → așteaptă  
Q4: "Ce risc există dacă nu faci?" → așteaptă
Q5: "Care sunt 2-3 pași concreți?" → așteaptă
Q6: Pentru fiecare pas: "În ce zi?" + "HIT sau DO?" → așteaptă
Q7: "Cine e responsabil?" → așteaptă
Q8: "Care e deadline-ul?" → "✅ Cheia [N] completă!"

REGULI:
- O întrebare = un mesaj
- După 4 chei complete, folosește tool-ul "save_planning"
- Fii concis și empatic`;

// În handlerul principal:
if (mode === 'wizard' && wizardContext) {
  systemPrompt = WIZARD_SYSTEM_PROMPT
    .replace('[DOMINO TITLE]', wizardContext.dominoTitle)
    .replace('[WEEK GOAL]', wizardContext.weekGoal);
}
```

---

## Beneficii

| Înainte | După |
|---------|------|
| 3-4 dialoguri separate | 1 flux continuu |
| Introducere manuală a cheilor | AI ghidează conversațional |
| Utilizatorul se blochează | Totul e fluid, one-go |
| Fără pași zilnici alocați | AI alocă pași pe zile + hit/do |
| ~5-10 minute, abandonare frecventă | ~3-5 minute, engagement crescut |

---

## Pași de Implementare

1. **Modifică DoorPlanningModal** să accepte `wizardContext` prop
2. **Modifică ProjectSelectionDialog** să elimine form static pentru massive
3. **Modifică GoalWizardModal** să deschidă DoorPlanningModal pentru massive
4. **Actualizează door-ai-planning** cu modul `wizard`
5. **Test end-to-end**: Business Wizard Anual → Massive → AI Planning → Save

---

## Timp Estimat
~45 minute pentru implementare completă
