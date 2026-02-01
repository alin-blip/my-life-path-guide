
# Plan: Rezolvare Bug Salvare Plan Domino Door

## Problema Identificată

### Bug Principal: Parsare Streaming Tool Calls

În `DoorPlanningModal.tsx` (linia 565-567), codul încearcă să parseze `toolCall.function.arguments` imediat ce primește o porțiune din stream:

```typescript
// ❌ BUG: Încearcă să parseze fragmente parțiale ca JSON complet
if (toolCall?.function?.name === 'save_planning' && toolCall?.function?.arguments) {
  const planningData = JSON.parse(toolCall.function.arguments);  // CRASH!
  // ...
}
```

**Ce se întâmplă:**
1. AI-ul trimite `save_planning` cu datele planului (toate 4 cheile, pașii, etc.)
2. Datele sunt mari (planul tău complex) și vin în **fragmente multiple** prin streaming
3. Primul fragment (ex: `{"dominoTi`) nu este JSON valid → `JSON.parse` aruncă eroare
4. Catch block-ul prinde eroarea și o ignorează
5. **Niciodată nu se acumulează fragmentele** pentru a forma JSON-ul complet
6. Planul NU se salvează (sau se salvează doar ce a prins din prima/ultima bucată validă)

### De ce ai în baza de date doar 1 cheie:
Uneori, un fragment poate fi suficient de mic pentru a fi valid JSON parțial. Sistemul a reușit să salveze ce a prins, dar restul s-a pierdut.

### Modelul AI:
Folosești `google/gemini-2.5-flash` care este bun, dar problema este în parsare, nu în AI.

## Soluția Tehnică

### Trebuie să acumulăm argumentele tool call într-un buffer și să parsăm doar la final:

```typescript
// ÎNAINTE streaming loop
let toolCallArgumentsBuffer = '';
let toolCallName = '';

// ÎN loop, la fiecare chunk
if (toolCall?.function?.name) {
  toolCallName = toolCall.function.name;  // Capturăm numele
}
if (toolCall?.function?.arguments) {
  toolCallArgumentsBuffer += toolCall.function.arguments;  // ACUMULĂM
}

// La finish_reason === 'tool_calls' SAU după done, parsăm
if (toolCallName === 'save_planning' && toolCallArgumentsBuffer) {
  try {
    const planningData = JSON.parse(toolCallArgumentsBuffer);
    // ... salvare corectă
  } catch (e) {
    console.error('Invalid planning data:', e);
  }
}
```

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/components/door/DoorPlanningModal.tsx` | Adaug buffer pentru tool call arguments și parsez la final |
| `src/components/door/VoicePlanningModal.tsx` | Aceeași problemă - trebuie fix similar |

## Cod de Implementat

### În `DoorPlanningModal.tsx`:

1. **Adaug variabile de buffer** (linia ~540):
```typescript
let toolCallArgumentsBuffer = '';
let toolCallName = '';
let toolCallId = '';
```

2. **Modific logica de parsare** (linia 563-639):
- În loc să parsez imediat `toolCall.function.arguments`, le adaug la buffer
- Verific `finish_reason` pentru `'tool_calls'` sau `'stop'`
- Parsez și salvez doar când stream-ul s-a terminat

3. **Adaug salvare și după loop** (linia ~667):
```typescript
// După while loop - verifică dacă avem date nesalvate în buffer
if (toolCallName === 'save_planning' && toolCallArgumentsBuffer) {
  // ... parsare și salvare
}
```

## Schimbări Detaliate

### DoorPlanningModal.tsx - Secțiunea de streaming (~liniile 538-668)

**Pas 1**: Adaug variabile buffer înainte de loop
**Pas 2**: La `parsed.choices?.[0]?.delta?.tool_calls`, acumulez în loc să parsez
**Pas 3**: La `parsed.choices?.[0]?.finish_reason === 'tool_calls'` SAU după loop, parsez bufferul și salvez

## Verificare Model AI

Modelul `google/gemini-2.5-flash` este corect - este un model rapid și capabil. Problema nu era inteligența AI-ului, ci bug-ul de streaming în frontend.

## Beneficii După Fix

- ✅ Planuri complete cu toate 4 cheile se salvează corect
- ✅ Funcționează pe mobil și desktop
- ✅ Nu mai pierzi munca ta din conversația cu AI-ul
- ✅ Pașii sunt adăugați corect în HIT/DO lists

## Prioritate

**CRITICĂ** - Acest bug blochează funcționalitatea principală a platformei.
