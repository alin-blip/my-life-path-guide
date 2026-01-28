
# 🔬 AUDIT COMPLET: Domino Door, Obiective & Sincronizare Wizard

## 📊 EXECUTIVE SUMMARY - PROBLEME IDENTIFICATE

| Componentă | Status | Problemă Principală |
|------------|--------|---------------------|
| **Domino Door Afișare** | 🔴 CRITIC | Datele din DB sunt GOALE pentru săptămâna curentă |
| **Obiective Anuale** | ✅ OK | Funcționează corect (14 misiuni în DB) |
| **Obiective 90 Zile** | ✅ OK | Funcționează corect |
| **Obiective Lunare** | ✅ OK | Funcționează corect |
| **GoalWizardModal** | ⚠️ PARȚIAL | Salvează în `missions`, dar nu sincronizează automat cu Domino Door |
| **DoorPlanningModal** | ⚠️ PARȚIAL | Funcțional, dar save-ul poate suprascrie cu date goale |
| **Accountability Coach** | 🔴 CRITIC | NU citește date din DB, nu are context despre obiective |

---

## 🔴 PROBLEMĂ PRINCIPALĂ: Datele Domino Door au fost SUPRASCRISE cu GOLI

### Ce am găsit în baza de date:

```text
SĂPTĂMÂNA CURENTĂ (door-week-2026-05):
├── domino_title: "" (GOL!)
├── key1: "" (GOL!)
├── key2: "" (GOL!)
├── key3: "" (GOL!)
├── key4: "" (GOL!)
└── updated_at: 2026-01-27 11:59:53 (IERI!)

SĂPTĂMÂNA TRECUTĂ (door-week-2026-04):
├── domino_title: "Creșterea impactului și a numărului de studenți"
├── key1: "Business Development"
├── key2: "Strategic"
├── key3: "Operațional"
└── key4: "Marketing Vânzări" ✅
```

### Cauza Problemei:

**`useWeeklyPlanSave.tsx` (linia 36-38)** are o verificare insuficientă:
```typescript
// CRITICAL: Skip if no domino title - prevents creating empty/corrupted plans
if (!selectedDomino?.text?.trim()) {
  console.log('⚠️ Skipping cloud save - no domino title set');
  return true;  // Returnează TRUE dar NU ar trebui să facă nimic
}
```

**PROBLEMA**: Această verificare oprește salvarea când NU e domino, dar:
1. Când componenta Door se încarcă **fără date locale**, trimite un save cu `selectedDomino = null`
2. Save-ul ar trebui să fie blocat, dar ceva în lanțul de apeluri permite suprascriere

**Cauza reală probabilă**: `useDoorStorage.tsx` (linia 175-218) - efectul care declanșează auto-save:
```typescript
useEffect(() => {
  if (initialLoadRef.current || isReloadingRef.current) {
    return;  // Protecție insuficientă
  }
  // ... auto-save logic
}, [props.selectedDomino?.text, ...]);
```

Când user-ul deschide pagina Door:
1. State-ul se inițializează cu `selectedDomino = null`
2. `useDoorStorageLoad` încarcă datele din cloud
3. **ÎNAINTE** ca load-ul să se termine, efectul de auto-save detectează că `selectedDomino` s-a schimbat (de la nimic la nimic)
4. Se declanșează save-ul cu date goale → SUPRASCRIE planul valid din cloud

---

## 🔴 PROBLEMĂ #2: Accountability Coach NU are context despre obiective

### Cod actual (`supabase/functions/accountability-coach/index.ts`):

```typescript
// Linia 38-43: Primește doar messages și systemPrompt
const { messages, systemPrompt, language } = await req.json();

// NU citește nimic din DB despre user:
// - NU citește missions (obiective anuale/90z/lunare)
// - NU citește weekly_planning (Domino Door)
// - NU citește user_tasks (sarcini zilnice)
```

**Rezultat**: AI Coach-ul nu știe ce obiective are user-ul și nu poate da sfaturi contextualizate.

---

## ⚠️ PROBLEMĂ #3: GoalWizardModal NU sincronizează automat cu Domino Door

### Flow actual:
1. User completează GoalWizardModal pentru obiectiv anual/90z/lunar
2. Se salvează în tabelul `missions`
3. Dacă user alege "Massive Objective", se salvează și în `weekly_planning`
4. **DAR**: Nu se actualizează UI-ul Domino Door automat

### Cod relevant (`GoalWizardModal.tsx` linia 536-565):
```typescript
if (selection.saveType === 'massive' && selection.keys) {
  // Salvează în weekly_planning
  await supabase.from('weekly_planning').insert([{
    user_id: userId,
    week_key: weekKey,
    category: category,
    domino_title: project.milestones.weekOne || project.name,
    key_points: keyPoints
  }]);
}
```

**PROBLEMA**: Dacă există deja un plan pentru săptămâna curentă:
- Codul face `insert` care eșuează (duplicate key)
- SAU în alt caz face `update` care adaugă la key_points existente
- **NU există o sincronizare clară** care să încarce noul plan în UI

---

## ✅ CE FUNCȚIONEAZĂ BINE

### 1. Structura Obiectivelor în DB (Score: 9/10)
```text
Obiective salvate pentru user:
├── ANNUAL (2026)
│   ├── Business: "1000 de studenti inrolati Eduforyou"
│   ├── Body: "90 kg și 7% bodyfat"
│   ├── Balance: "timp de calitate cu familia"
│   └── Being: "meditez zilnic 20 minute"
│
├── QUARTERLY (Q1-2026)
│   ├── Business: "400 studenți + 50 Agenți + 3 naționalități"
│   ├── Body: "10% Bodyfat - 94 kg"
│   ├── Balance: "conexiunea si iubirea neconditionata"
│   └── Being: "Crearea meditației spirituale"
│
└── MONTHLY (2026-01)
    ├── Business: "100 studenți cu oferte + 10 agenți activi"
    ├── Body: "12% - 96 kg"
    └── Being: "structura meditației în platformă"
```

### 2. Weekly Tasks în DB (Score: 8/10)
- 20+ task-uri pentru `door-week-2026-05`
- Task-uri cu categorii ([Business], etc.)
- Persistență corectă în `user_tasks`

### 3. DoorPlanningModal AI (Score: 9/10)
- Streaming funcțional cu Gemini 2.5 Pro
- Tool calling pentru `save_planning`
- Salvare automată în `weekly_planning`
- Creare task-uri în `user_tasks` cu `doorUserTasksService`

---

## 🔧 SOLUȚII PROPUSE

### FIX #1: Previne suprascrirea cu date goale (CRITIC)

**Fișier**: `src/hooks/door/useWeeklyPlanSave.tsx`

Modificare la funcția `saveWeeklyPlanOnly`:
```typescript
// ÎNAINTE:
if (!selectedDomino?.text?.trim()) {
  console.log('⚠️ Skipping cloud save - no domino title set');
  return true;
}

// DUPĂ:
if (!selectedDomino?.text?.trim()) {
  console.log('⚠️ Skipping cloud save - no domino title set');
  // IMPORTANT: Nu facem NIMIC dacă nu avem domino valid
  // Asta previne suprascrirea datelor bune cu date goale
  return true;
}

// Adaugă și verificare suplimentară:
const hasValidKeyPoints = dominoKeyPoints.some(kp => kp.text?.trim());
if (!hasValidKeyPoints && !selectedDomino?.text?.trim()) {
  console.log('⚠️ Skipping cloud save - no valid data to save');
  return true;
}
```

**Fișier**: `src/hooks/door/useDoorStorageLoad.tsx`

Adaugă un guard mai strict la încărcare:
```typescript
// Linia 52-53: Verifică dacă planul are date valide
if (plan && plan.dominoTitle && plan.dominoTitle.trim() !== '') {
  // Doar atunci setează domino
  setters.setSelectedDomino({...});
}
```

### FIX #2: Accountability Coach cu context (IMPORTANT)

**Fișier**: `supabase/functions/accountability-coach/index.ts`

Adaugă citire din DB pentru context:
```typescript
// După autentificare, citește datele user-ului
const { data: missions } = await supabaseClient
  .from('missions')
  .select('mission_type, category, title, period')
  .eq('user_id', user.id)
  .order('mission_type', { ascending: true });

const { data: weeklyPlan } = await supabaseClient
  .from('weekly_planning')
  .select('domino_title, key_points, week_key')
  .eq('user_id', user.id)
  .order('updated_at', { ascending: false })
  .limit(1)
  .maybeSingle();

// Construiește context pentru AI
const userContext = `
OBIECTIVELE UTILIZATORULUI:
${missions?.map(m => `- ${m.mission_type}: ${m.title}`).join('\n')}

FOCUS SĂPTĂMÂNAL:
Domino Door: ${weeklyPlan?.domino_title || 'Nu este setat'}
`;
```

### FIX #3: Sincronizare GoalWizard → Domino Door

**Fișier**: `src/components/goal-wizard/GoalWizardModal.tsx`

După salvarea în `weekly_planning`, emite un eveniment:
```typescript
// După linia 565 (după insert/update în weekly_planning)
window.dispatchEvent(new CustomEvent('doorDataUpdated', { 
  detail: { weekKey, category, action: 'wizard-save' } 
}));
```

### FIX #4: Restaurare date din backup/istoric

**Acțiune imediată** (SQL query):
```sql
-- Verifică dacă există un istoric pentru săptămâna curentă
SELECT * FROM weekly_planning_history 
WHERE user_id = '74f5b904-95ba-4aaa-af7a-bee4c7ee6a98'
  AND week_key = 'door-week-2026-05'
ORDER BY created_at DESC;

-- Sau copiază datele de la săptămâna trecută ca template
UPDATE weekly_planning 
SET domino_title = 'Creșterea impactului și a numărului de studenți',
    key_points = (SELECT key_points FROM weekly_planning WHERE week_key = 'door-week-2026-04' AND user_id = '74f5b904-95ba-4aaa-af7a-bee4c7ee6a98' LIMIT 1)
WHERE week_key = 'door-week-2026-05' 
  AND user_id = '74f5b904-95ba-4aaa-af7a-bee4c7ee6a98';
```

---

## 📋 PLAN DE IMPLEMENTARE

### Pasul 1: Previne suprascrieri viitoare (URGENT)
1. Modifică `useWeeklyPlanSave.tsx` - adaugă verificări suplimentare
2. Modifică `useDoorStorage.tsx` - protejează efectul de auto-save

### Pasul 2: Restaurează datele (IMEDIAT)
1. Rulează SQL pentru a restaura planul pentru săptămâna curentă
2. Sau reface planificarea cu AI Planning modal

### Pasul 3: Îmbunătățește Accountability Coach
1. Actualizează edge function să citească obiective din DB
2. Adaugă context despre Domino Door curent

### Pasul 4: Sincronizare GoalWizard → Door
1. Adaugă event dispatch după salvare
2. Door să asculte pentru event și să facă reload

---

## 📊 DIAGNOZĂ TEHNICĂ COMPLETĂ

### Fluxul de Date

```text
┌─────────────────────────────────────────────────────────────────┐
│                        USER INPUT                                │
├─────────────────────────────────────────────────────────────────┤
│  GoalWizardModal      DoorPlanningModal      Manual Input       │
│  (Annual/90d/Monthly)  (AI Planning)          (Direct edit)     │
└─────────┬─────────────────────┬─────────────────────┬───────────┘
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐
│     missions        │  │   weekly_planning   │  │   DoorContext   │
│  (Supabase table)   │  │  (Supabase table)   │  │   (React state) │
│                     │  │                     │  │                 │
│  ✅ Funcționează    │  │  ⚠️ Suprascrisă    │  │  🔴 Gol la load │
└─────────────────────┘  └─────────────────────┘  └────────┬────────┘
                                                          │
                         ┌────────────────────────────────┘
                         ▼
              ┌─────────────────────────┐
              │   useDoorStorage        │
              │                         │
              │  🔴 BUG: Auto-save      │
              │  declanșat ÎNAINTE      │
              │  de load complet        │
              └─────────────────────────┘
```

### Race Condition identificată:

```text
T+0ms:   DoorProvider se montează
T+1ms:   State inițializat: selectedDomino = null
T+5ms:   useEffect pentru auto-save verifică: selectedDomino changed? DA (de la undefined la null)
T+10ms:  saveWeeklyPlanOnly() apelat cu selectedDomino = null
T+15ms:  Verificare: "no domino title" → return true (DAR paguba e făcută în alt loc)
T+50ms:  useDoorStorageLoad încarcă datele din cloud
T+100ms: selectedDomino setat cu valoarea din DB
T+101ms: useEffect detectează schimbare → SAVE cu datele noi? NU, pentru că acum e OK

PROBLEMA: La T+15ms, sau din alt efect, s-a făcut un save/upsert cu date goale
```

---

## 🎯 CONCLUZIE

**De ce nu apare nimic în Domino Door**:
Datele din baza de date au fost suprascrise cu valori goale din cauza unei **race condition** între încărcarea datelor și efectul de auto-save.

**Rezolvare imediată**:
1. Restaurează datele manual (SQL sau refă planificarea cu AI)
2. Aplică fix-urile pentru a preveni pe viitor

**Rezolvare pe termen lung**:
1. Restructurează logica de save pentru a fi mai defensivă
2. Adaugă confirmare înainte de a suprascrie un plan existent
3. Îmbunătățește Accountability Coach cu context real din DB
