
# Plan de Rezolvare: Task-urile Dispar la Schimbarea Zilei în Domino Door

## Problema Identificată

Am descoperit un bug de **dublă filtrare** în sistemul Domino Door care face ca task-urile să dispară când schimbi ziua selectată.

### Cauza Problemei

1. **Prima filtrare** - în `DoorContext.tsx` (liniile 193-194):
   ```typescript
   const filteredHitList = hitList.filter(item => normalizeDay(item.day) === normalizeDay(activeDay));
   ```
   Această filtrare se face înainte de a expune listele în context.

2. **A doua filtrare** - în `TaskList.tsx` (liniile 103-104):
   ```typescript
   const filteredHitList = hitList.filter(item => normalizeDay(item.day) === activeDay);
   ```
   TaskList primește lista deja filtrată și încearcă să o filtreze din nou.

3. **Rezultat**: Când schimbi ziua (de ex. de la M la T), context-ul returnează lista filtrată pe ziua veche, iar TaskList încearcă să o filtreze pe ziua nouă - nu găsește nimic și afișează lista goală.

## Soluția

Trebuie să eliminăm una dintre cele două filtrări. Cea mai curată soluție este să **expunem listele complete din DoorContext** și să lăsăm **TaskList să facă singur filtrarea**.

### Modificări Necesare

**Fișier 1: `src/context/DoorContext.tsx`**
- Expune `hitList` și `doList` nefiltrați în contextul value
- Păstrează `filteredHitList` și `filteredDoList` pentru componente care au nevoie de ele

**Fișier 2: `src/hooks/useDoorContent.tsx`**
- Similar cu DoorContext - expune listele complete, nu cele filtrate

**Fișier 3: `src/components/door/WeeklySection.tsx`**
- Transmite listele complete la TaskList (nu cele filtrate din context)

---

## Detalii Tehnice

### Schimbări în DoorContext.tsx

```text
ÎNAINTE (liniile 192-197):
  const filteredHitList = hitList.filter(...)
  const filteredDoList = doList.filter(...)
  
  // În value object:
  hitList: filteredHitList,
  doList: filteredDoList,

DUPĂ:
  const filteredHitList = hitList.filter(...)
  const filteredDoList = doList.filter(...)
  
  // În value object:
  hitList,          // Lista completă pentru TaskList
  doList,           // Lista completă pentru TaskList
  filteredHitList,  // Lista filtrată pentru alte componente (dacă e nevoie)
  filteredDoList,   // Lista filtrată pentru alte componente (dacă e nevoie)
```

### Schimbări în WeeklySection.tsx

Componenta TaskList va primi listele complete:
```text
<TaskList 
  hitList={hitList}  // Lista completă, TaskList va filtra
  doList={doList}    // Lista completă, TaskList va filtra
  ...
/>
```

### TaskList.tsx rămâne neschimbat

Filtrarea din TaskList (liniile 103-104) va funcționa corect deoarece va primi lista completă, nu una deja filtrată.

---

## Beneficii

1. **Fix imediat** - Task-urile nu vor mai dispărea la schimbarea zilei
2. **Logică clară** - O singură locație pentru filtrare (TaskList)
3. **Flexibilitate** - Alte componente pot accesa atât listele complete cât și cele filtrate
4. **Performanță** - Filtrarea se face doar unde e nevoie, nu de două ori

## Pași de Implementare

1. Modifică `DoorContext.tsx` pentru a expune listele complete
2. Actualizează tipul `DoorContextValue` pentru a include ambele seturi de liste
3. Modifică `useDoorContent.tsx` în mod similar (pentru consistență)
4. Testează schimbarea zilelor în UI pentru a confirma fix-ul
